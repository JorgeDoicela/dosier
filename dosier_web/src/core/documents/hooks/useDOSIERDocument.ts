import { useState, useEffect, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { coworkLog } from '../../cowork/utils/log';

/**
 * Shallow-equal check: O(1) for primitives, falls back to JSON only for objects.
 */
function isEqualValue(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a == b;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    return JSON.stringify(a) === JSON.stringify(b);
}

function deduplicateYArray(yarray: Y.Array<any>, ydoc: Y.Doc, listName: string) {
    const arr = yarray.toArray();
    const seenIds = new Set<string>();
    const indicesToDelete: number[] = [];
    
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item && typeof item === 'object') {
            const itemId = item.id || item.uuid || item.Uuid;
            if (itemId) {
                if (seenIds.has(itemId)) {
                    indicesToDelete.push(i);
                } else {
                    seenIds.add(itemId);
                }
            }
        }
    }
    
    if (indicesToDelete.length > 0) {
        console.warn(`[DOSIER] Found ${indicesToDelete.length} duplicates in Y.Array '${listName}'.`);
        ydoc.transact(() => {
            for (let i = indicesToDelete.length - 1; i >= 0; i--) {
                yarray.delete(indicesToDelete[i], 1);
            }
        }, 'deduplication-cleanup');
    }
}

function generateRandomId(): string {
    if (typeof window !== 'undefined' && window.crypto) {
        if (typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID().replace(/-/g, '').substring(0, 10);
        }
        if (typeof window.crypto.getRandomValues === 'function') {
            const buffer = new Uint8Array(5);
            window.crypto.getRandomValues(buffer);
            return Array.from(buffer)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
    }
    let result = '';
    while (result.length < 10) {
        result += Math.random().toString(36).substring(2);
    }
    return result.substring(0, 10);
}

export function useDOSIERDocument<T extends Record<string, any>>(
    initialData: T,
    ydoc: Y.Doc | null,
    options: {
        lists?: string[];
        richTexts?: string[];
        nonCollaborative?: string[];
        isHistoryLoaded?: boolean;
    } = {}
) {
    const [localChangeCount, setLocalChangeCount] = useState(0);
    const [remoteChangeCount, setRemoteChangeCount] = useState(0);

    const initialDataRef = useRef(initialData);
    initialDataRef.current = initialData;

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const [formData, setFormData] = useState<T>(() => {
        const enriched: any = { ...initialData };
        options.lists?.forEach(listName => {
            if (Array.isArray(enriched[listName])) {
                enriched[listName] = enriched[listName].map((item: any, idx: number) => {
                    if (item && typeof item === 'object') {
                        const newItem = { ...item };
                        if (!newItem.id) {
                            newItem.id = `db_${idx}`;
                        }
                        if (listName === 'Cronograma' && !newItem.Semanas) {
                            newItem.Semanas = Array(12).fill(false);
                        }
                        return newItem;
                    }
                    return item;
                });
            }
        });
        return enriched;
    });

    const updateField = useCallback((name: string, value: any, meta?: { source?: 'local' | 'remote' | 'system' }) => {
        const source = meta?.source ?? 'local';
        const currentOptions = optionsRef.current;

        setFormData(prev => {
            const resolvedValue = typeof value === 'function' ? value(prev[name]) : value;
            if (isEqualValue(prev[name], resolvedValue)) return prev;

            const isList = currentOptions.lists?.includes(name) || name.startsWith('MultiSec_') || (ydoc && ydoc.share.get(name) instanceof Y.Array);

            const isRichText = currentOptions.richTexts?.some(rt => rt.toLowerCase() === name.toLowerCase()) || /^field_\d+/i.test(name) || name.endsWith('Izquierda') || name.endsWith('Derecha');

            if (source !== 'remote' &&
                ydoc &&
                !isList &&
                !isRichText &&
                !currentOptions.nonCollaborative?.includes(name) &&
                name.toLowerCase() !== 'uuid' &&
                name.toLowerCase() !== 'entityuuid') {
                // Evitar conflicto de constructor en Yjs: Si la clave ya está registrada como un XmlFragment o Array,
                // la respetamos y no intentamos interactuar con ella como texto plano (Y.Text).
                const sharedType = ydoc.share.get(name);
                if (sharedType instanceof Y.XmlFragment || sharedType instanceof Y.Array) {
                    return;
                }
                if (sharedType && !(sharedType instanceof Y.Text)) {
                    console.warn(`[useDOSIERDocument] Conflicto de constructor detectado para '${name}'. Tipo actual: ${sharedType.constructor.name}. Recreando como Y.Text.`);
                    ydoc.share.delete(name);
                }
                const ytext = ydoc.getText(name);
                const stringVal = typeof resolvedValue === 'object' && resolvedValue !== null ? JSON.stringify(resolvedValue) : String(resolvedValue);
                if (ytext.toString() !== stringVal) {
                    ydoc.transact(() => {
                        ytext.delete(0, ytext.length);
                        ytext.insert(0, stringVal);
                    }, 'local-hook');
                }
            }

            return { ...prev, [name]: resolvedValue };
        });

        if (source !== 'remote' && source !== 'system') {
            setLocalChangeCount(c => c + 1);
        }
    }, [ydoc]);

    const ensureYArray = (listName: string): Y.Array<any> | null => {
        if (!ydoc || !listName || listName.includes('[') || listName.includes('.')) return null;
        const sharedType = ydoc.share.get(listName);
        if (sharedType && !(sharedType instanceof Y.Array)) {
            console.warn(`[useDOSIERDocument] Limpiando tipo en conflicto para lista '${listName}' (tipo previo: ${sharedType.constructor.name}).`);
            ydoc.share.delete(listName);
        }
        return ydoc.getArray(listName);
    };

    const addItem = useCallback((listName: string, template: any) => {
        const enrichedTemplate = {
            ...template,
            id: template.id || `rand_${generateRandomId()}`
        };
        const yarray = ensureYArray(listName);
        if (ydoc && yarray) {
            ydoc.transact(() => {
                yarray.push([enrichedTemplate]);
            }, 'local-hook');
        }
        setFormData(prev => ({
            ...prev,
            [listName]: [...(prev as any)[listName], enrichedTemplate]
        }));
        setLocalChangeCount(c => c + 1);
    }, [ydoc]);

    const removeItem = useCallback((listName: string, index: number) => {
        const yarray = ensureYArray(listName);
        if (ydoc && yarray) {
            if (index >= 0 && index < yarray.length) {
                ydoc.transact(() => {
                    yarray.delete(index, 1);
                }, 'local-hook');
            }
        }
        setFormData(prev => ({
            ...prev,
            [listName]: (prev as any)[listName].filter((_: any, i: number) => i !== index)
        }));
        setLocalChangeCount(c => c + 1);
    }, [ydoc]);

    const updateItem = useCallback((listName: string, index: number, field: string, value: any) => {
        const yarray = ensureYArray(listName);
        if (ydoc && yarray) {
            while (yarray.length <= index) {
                yarray.push([{}]);
            }
            const currentItem = yarray.get(index) as any;
            if (currentItem) {
                if (currentItem[field] === value) return;
                const updatedItem = { ...currentItem, [field]: value };
                if (isEqualValue(currentItem, updatedItem)) return;
                ydoc.transact(() => {
                    yarray.delete(index, 1);
                    yarray.insert(index, [updatedItem]);
                }, 'local-hook');
            }
        }
        setFormData(prev => {
            const rawList = (prev as any)[listName];
            const newList = Array.isArray(rawList) ? [...rawList] : [];
            while (newList.length <= index) {
                newList.push({});
            }
            newList[index] = { ...newList[index], [field]: value };
            return { ...prev, [listName]: newList };
        });
        setLocalChangeCount(c => c + 1);
    }, [ydoc]);

    const reorderItem = useCallback((listName: string, fromIndex: number, toIndex: number) => {
        const yarray = ensureYArray(listName);
        if (ydoc && yarray) {
            if (fromIndex >= 0 && fromIndex < yarray.length && toIndex >= 0 && toIndex < yarray.length) {
                const item = yarray.get(fromIndex);
                ydoc.transact(() => {
                    yarray.delete(fromIndex, 1);
                    yarray.insert(toIndex, [item]);
                }, 'local-hook');
            }
        }
        setFormData(prev => {
            const list = [...(prev as any)[listName]];
            const [item] = list.splice(fromIndex, 1);
            list.splice(toIndex, 0, item);
            return {
                ...prev,
                [listName]: list.map((x: any, idx: number) => ({
                    ...x,
                    Numero: idx + 1
                }))
            };
        });
        setLocalChangeCount(c => c + 1);
    }, [ydoc]);

    /**
     * Hidrata atómicamente múltiples campos (listas Y.Array, textos Y.Text y bloques rich-text Y.XmlFragment)
     * provenientes del Asistente IA o del Importador Documental sin requerir recarga de página.
     */
    const applyStructuredDraft = useCallback((patch: Record<string, any>) => {
        if (!patch || typeof patch !== 'object') return;
        const currentOptions = optionsRef.current;
        const richTextHydrations: Array<{ field: string; html: string }> = [];

        if (ydoc) {
            ydoc.transact(() => {
                Object.entries(patch).forEach(([key, val]) => {
                    if (val === undefined) return;

                    const isList = Array.isArray(val) && (
                        currentOptions.lists?.includes(key) ||
                        key.startsWith('MultiSec_') ||
                        ydoc.share.get(key) instanceof Y.Array
                    );

                    const isRichText = currentOptions.richTexts?.some(rt => rt.toLowerCase() === key.toLowerCase()) ||
                        /^field_\d+/i.test(key) ||
                        key.endsWith('Izquierda') ||
                        key.endsWith('Derecha');

                    if (isList) {
                        const enrichedList = (val as any[]).map((item: any, idx: number) => {
                            if (item && typeof item === 'object') {
                                return {
                                    ...item,
                                    id: item.id || `ai_${generateRandomId()}_${idx}`
                                };
                            }
                            return item;
                        });
                        const yarray = ensureYArray(key);
                        if (yarray) {
                            if (yarray.length > 0) {
                                yarray.delete(0, yarray.length);
                            }
                            if (enrichedList.length > 0) {
                                yarray.push(enrichedList);
                            }
                        }
                        // Sincronizar también campos indexados tipo CoWorkField (ej: Prerrequisitos[0].Asignatura)
                        enrichedList.forEach((item: any, idx: number) => {
                            if (item && typeof item === 'object') {
                                if (key === 'Prerrequisitos') {
                                    const asigVal = item.Asignatura || item.asignatura || item.NombreAsignatura || item.nombre_asignatura || '';
                                    const obsVal = item.Observacion || item.observacion || item.Observaciones || item.observaciones || '';
                                    item.Asignatura = asigVal;
                                    item.Observacion = obsVal;
                                }
                                Object.entries(item).forEach(([propKey, propVal]) => {
                                    if (propKey === 'id' || /^\d+$/.test(propKey)) return;
                                    const indexedName = `${key}[${idx}].${propKey}`;
                                    const existingType = ydoc.share.get(indexedName);
                                    if (!existingType || existingType instanceof Y.Text) {
                                        const ytext = ydoc.getText(indexedName);
                                        const strVal = String(propVal ?? '');
                                        ytext.delete(0, ytext.length);
                                        if (strVal) {
                                            ytext.insert(0, strVal);
                                        }
                                    }
                                });
                            }
                        });
                    } else if (isRichText) {
                        const sharedType = ydoc.share.get(key);
                        if (sharedType && !(sharedType instanceof Y.XmlFragment)) {
                            ydoc.share.delete(key);
                        }
                        const xmlFrag = ydoc.getXmlFragment(key);
                        if (xmlFrag.length > 0) {
                            xmlFrag.delete(0, xmlFrag.length);
                        }
                        richTextHydrations.push({ field: key, html: String(val ?? '') });
                    } else if (
                        !currentOptions.nonCollaborative?.includes(key) &&
                        key.toLowerCase() !== 'uuid' &&
                        key.toLowerCase() !== 'entityuuid'
                    ) {
                        const sharedType = ydoc.share.get(key);
                        if (!(sharedType instanceof Y.XmlFragment) && !(sharedType instanceof Y.Array)) {
                            const ytext = ydoc.getText(key);
                            const strVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
                            ytext.delete(0, ytext.length);
                            if (strVal) {
                                ytext.insert(0, strVal);
                            }
                        }
                    }
                });
            }, 'ai-hydration');
        } else {
            Object.entries(patch).forEach(([key, val]) => {
                const isRichText = currentOptions.richTexts?.some(rt => rt.toLowerCase() === key.toLowerCase());
                if (isRichText && typeof val === 'string') {
                    richTextHydrations.push({ field: key, html: val });
                }
            });
        }

        setFormData(prev => ({
            ...prev,
            ...patch
        }));

        if (typeof window !== 'undefined' && richTextHydrations.length > 0) {
            richTextHydrations.forEach(({ field, html }) => {
                window.dispatchEvent(new CustomEvent('dosier:hydrate-richtext', {
                    detail: { field, html }
                }));
            });
        }

        setLocalChangeCount(c => c + 1);
    }, [ydoc]);

    const listsKey = (options.lists || []).join(',');
    const richTextsKey = (options.richTexts || []).join(',');
    const nonCollabKey = (options.nonCollaborative || []).join(',');
    const isHistoryLoaded = !!options.isHistoryLoaded;

    useEffect(() => {
        if (!ydoc) return;

        const cleanups: (() => void)[] = [];
        const currentInitialData = initialDataRef.current;
        const currentOptions = optionsRef.current;

        // Aseguramos observar BlockedSections para sincronizar el bloqueo de secciones en tiempo real.
        const keysToObserve = new Set(Object.keys(currentInitialData));
        keysToObserve.add('BlockedSections');

        const isListNameKey = (k: string) => {
            if (!k || k.includes('[') || k.includes('.')) return false;
            if (currentOptions.lists?.includes(k)) return true;
            if (k.startsWith('MultiSec_')) return true;
            const shared = ydoc.share.get(k);
            if (shared instanceof Y.Array) return true;
            return false;
        };

        const listsToObserve = new Set<string>(currentOptions.lists || []);

        Object.keys(currentInitialData).forEach(k => {
            if (isListNameKey(k)) {
                listsToObserve.add(k);
            }
        });

        ydoc.share.forEach((sharedType, k) => {
            if (sharedType instanceof Y.Array || (k.startsWith('MultiSec_') && !k.includes('['))) {
                listsToObserve.add(k);
            }
        });

        keysToObserve.forEach(key => {
            if (listsToObserve.has(key)) return;
            const isRichText = options.richTexts?.some(rt => rt.toLowerCase() === key.toLowerCase()) || /^field_\d+/i.test(key) || key.endsWith('Izquierda') || key.endsWith('Derecha');
            if (isRichText) return;
            if (options.nonCollaborative?.includes(key)) return;
            if (key.toLowerCase() === 'uuid' || key.toLowerCase() === 'entityuuid') return;

            // Evitar conflicto de constructor en Yjs: Si la clave ya está registrada como un XmlFragment (texto enriquecido),
            // la respetamos y no intentamos observarla o inicializarla como texto plano (Y.Text).
            const sharedType = ydoc.share.get(key);
            if (sharedType instanceof Y.XmlFragment || sharedType instanceof Y.Array) {
                return;
            }
            if (sharedType && !(sharedType instanceof Y.Text)) {
                console.warn(`[useDOSIERDocument] Conflicto de constructor detectado para '${key}'. Tipo actual: ${sharedType.constructor.name}. Recreando como Y.Text.`);
                ydoc.share.delete(key);
            }
            const ytext = ydoc.getText(key);
            const observer = (event: Y.YTextEvent) => {
                if (event.transaction.origin === 'remote') {
                    const rawValue = ytext.toString();
                    let parsedValue: any = rawValue;

                    if (rawValue === 'true') parsedValue = true;
                    else if (rawValue === 'false') parsedValue = false;
                    else if (rawValue.startsWith('{') || rawValue.startsWith('[')) {
                        try {
                            parsedValue = JSON.parse(rawValue);
                        } catch (e) {}
                    }
                    else if (!isNaN(Number(rawValue)) && rawValue !== '') parsedValue = Number(rawValue);

                    setFormData(prev => {
                        if (isEqualValue(prev[key], parsedValue)) return prev;
                        return { ...prev, [key]: parsedValue };
                    });
                    setRemoteChangeCount(c => c + 1);
                }
            };
            ytext.observe(observer);
            cleanups.push(() => ytext.unobserve(observer));

            const currentYVal = ytext.toString();
            if (currentYVal && currentYVal !== 'undefined') {
                let parsedInitial: any = currentYVal;
                if (currentYVal === 'true') parsedInitial = true;
                else if (currentYVal === 'false') parsedInitial = false;
                else if (currentYVal.startsWith('{') || currentYVal.startsWith('[')) {
                    try {
                        parsedInitial = JSON.parse(currentYVal);
                    } catch (e) {}
                }
                else if (!isNaN(Number(currentYVal)) && currentYVal !== '') parsedInitial = Number(currentYVal);
                setFormData(prev => {
                    if (isEqualValue(prev[key], parsedInitial)) return prev;
                    return { ...prev, [key]: parsedInitial };
                });
            }
        });

        const activeListObservers = new Set<string>();

        const observeList = (listName: string) => {
            if (!listName || listName.includes('[') || listName.includes('.')) return;
            if (activeListObservers.has(listName)) return;
            activeListObservers.add(listName);

            const yarray = ensureYArray(listName);
            if (!yarray) return;

            const observer = (event: any) => {
                if (event.transaction.origin === 'remote') {
                    const rawArray = yarray.toArray();
                    const enriched = rawArray.map((item: any, idx) => {
                        if (item && typeof item === 'object' && !item.id) {
                            return { ...item, id: `db_${idx}` };
                        }
                        return item;
                    });
                    
                    const seen = new Set();
                    const uniqueEnriched = enriched.filter((item: any) => {
                        const id = item?.id || item?.uuid || item?.Uuid;
                        if (id) {
                            if (seen.has(id)) return false;
                            seen.add(id);
                        }
                        return true;
                    });

                    setFormData(prev => {
                        if (isEqualValue(prev[listName], uniqueEnriched)) return prev;
                        return { ...prev, [listName]: uniqueEnriched };
                    });
                    setRemoteChangeCount(c => c + 1);
                }
            };
            yarray.observe(observer);
            cleanups.push(() => {
                yarray.unobserve(observer);
                activeListObservers.delete(listName);
            });

            deduplicateYArray(yarray, ydoc, listName);
        };

        listsToObserve.forEach(listName => observeList(listName));

        // Escuchar actualizaciones remotas de Y.Doc para detectar nuevas listas registradas dinámicamente
        const handleRemoteYdocUpdate = (_update: Uint8Array, origin: any) => {
            if (origin === 'remote') {
                ydoc.share.forEach((sharedType, key) => {
                    if ((sharedType instanceof Y.Array || (key.startsWith('MultiSec_') && !key.includes('['))) && !activeListObservers.has(key)) {
                        observeList(key);
                        const currentArr = (sharedType as Y.Array<any>).toArray();
                        if (currentArr.length > 0) {
                            setFormData(prev => {
                                if (isEqualValue(prev[key], currentArr)) return prev;
                                return { ...prev, [key]: currentArr };
                            });
                        }
                    }
                });
            }
        };
        ydoc.on('update', handleRemoteYdocUpdate);
        cleanups.push(() => ydoc.off('update', handleRemoteYdocUpdate));

        listsToObserve.forEach(listName => {
            const yarray = ydoc.getArray(listName);
            const currentArray = yarray.toArray() as any[];
            const dbInvestigadores = currentInitialData.investigadores || currentInitialData.Investigadores;
            if (listName === 'Investigadores' && isHistoryLoaded && Array.isArray(dbInvestigadores)) {
                const targetArray = dbInvestigadores.map((dbInv: any, idx: number) => {
                    const dbCedula = dbInv.Cedula || dbInv.cedula;
                    const yjsInv = currentArray.find((yInv: any) => {
                        const yCedula = yInv?.Cedula || yInv?.cedula;
                        return yCedula && dbCedula && 
                               yCedula.trim().toLowerCase() === dbCedula.trim().toLowerCase();
                    });
                    return {
                        Nombre: dbInv.Nombre || dbInv.nombre || '',
                        Cedula: dbCedula || '',
                        Email: dbInv.Email || dbInv.email || '',
                        NivelAcademico: dbInv.NivelAcademico || dbInv.nivelAcademico || '',
                        Rol: dbInv.Rol || dbInv.rol || '',
                        id: dbInv.id || yjsInv?.id || `db_${idx}`,
                        Telefono: dbInv.Telefono || dbInv.telefono || '',
                        HorasSemanales: dbInv.HorasSemanales !== undefined ? dbInv.HorasSemanales : (dbInv.horasSemanales !== undefined ? dbInv.horasSemanales : null),
                        Carrera: dbInv.Carrera || dbInv.carrera || '',
                        CarrerasDisponibles: dbInv.CarrerasDisponibles || dbInv.carrerasDisponibles || ''
                    };
                });

                const areEqual = (arrA: any[], arrB: any[]) => {
                    if (arrA.length !== arrB.length) return false;
                    for (let i = 0; i < arrA.length; i++) {
                        const a = arrA[i] || {};
                        const b = arrB[i] || {};
                        const aCarrera = a.Carrera || a.carrera || '';
                        const bCarrera = b.Carrera || b.carrera || '';
                        const aDisponibles = a.CarrerasDisponibles || a.carrerasDisponibles || '';
                        const bDisponibles = b.CarrerasDisponibles || b.carrerasDisponibles || '';
                        if (
                            (a.Nombre || a.nombre || '') !== (b.Nombre || b.nombre || '') ||
                            (a.Cedula || a.cedula || '') !== (b.Cedula || b.cedula || '') ||
                            (a.Email || a.email || '') !== (b.Email || b.email || '') ||
                            (a.NivelAcademico || a.nivelAcademico || '') !== (b.NivelAcademico || b.nivelAcademico || '') ||
                            (a.Rol || a.rol || '') !== (b.Rol || b.rol || '') ||
                            (a.id ?? '') !== (b.id ?? '') ||
                            (a.Telefono || a.telefono || '') !== (b.Telefono || b.telefono || '') ||
                            (a.HorasSemanales !== undefined ? a.HorasSemanales : (a.horasSemanales !== undefined ? a.horasSemanales : null)) !== 
                            (b.HorasSemanales !== undefined ? b.HorasSemanales : (b.horasSemanales !== undefined ? b.horasSemanales : null)) ||
                            aCarrera !== bCarrera ||
                            aDisponibles !== bDisponibles
                        ) {
                            return false;
                        }
                    }
                    return true;
                };

                if (!areEqual(currentArray, targetArray)) {
                    coworkLog(`[DOSIER] Force-updating Yjs list 'Investigadores' to match DB truth. DB count: ${targetArray.length}, Yjs count: ${currentArray.length}`);
                    ydoc.transact(() => {
                        yarray.delete(0, yarray.length);
                        if (targetArray.length > 0) {
                            yarray.push(targetArray);
                        }
                    }, 'local-hook-force-sync');

                    setFormData(prev => {
                        if (isEqualValue(prev[listName], targetArray)) return prev;
                        return { ...prev, [listName]: targetArray };
                    });
                } else {
                    setFormData(prev => {
                        if (isEqualValue(prev[listName], targetArray)) return prev;
                        return { ...prev, [listName]: targetArray };
                    });
                }
            } else if (currentArray.length > 0) {
                const enriched = currentArray.map((item: any, idx) => {
                    if (item && typeof item === 'object' && !item.id) {
                        return { ...item, id: `db_${idx}` };
                    }
                    return item;
                });
                
                const seen = new Set();
                const uniqueEnriched = enriched.filter((item: any) => {
                    const id = item?.id || item?.uuid || item?.Uuid;
                    if (id) {
                        if (seen.has(id)) return false;
                        seen.add(id);
                    }
                    return true;
                });

                setFormData(prev => {
                    if (isEqualValue(prev[listName], uniqueEnriched)) return prev;
                    return { ...prev, [listName]: uniqueEnriched };
                });
            } else if (isHistoryLoaded && Array.isArray(currentInitialData[listName]) && currentInitialData[listName].length > 0) {
                const enriched = currentInitialData[listName].map((item: any, idx: number) => {
                    if (item && typeof item === 'object') {
                        const newItem = { ...item };
                        if (!newItem.id) {
                            newItem.id = `db_${idx}`;
                        }
                        if (listName === 'Cronograma' && !newItem.Semanas) {
                            newItem.Semanas = Array(12).fill(false);
                        }
                        return newItem;
                    }
                    return item;
                });
                coworkLog(`[DOSIER] Initializing Yjs list '${listName}' from DB`);
                ydoc.transact(() => {
                    yarray.push(enriched);
                }, 'local-hook');
            }
        });

        return () => cleanups.forEach(c => c());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ydoc, listsKey, richTextsKey, nonCollabKey, isHistoryLoaded]);

    // Sincronizar initialData en formData cuando initialData cambie (ej: al terminar la carga de la API)
    useEffect(() => {
        if (!initialData) return;
        setFormData(prev => {
            let changed = false;
            const updated: any = { ...prev };
            Object.keys(initialData).forEach(key => {
                if (prev[key] === undefined || prev[key] === null || prev[key] === '') {
                    if (initialData[key] !== undefined && initialData[key] !== null && initialData[key] !== '') {
                        updated[key] = initialData[key];
                        changed = true;
                    }
                }
            });
            return changed ? updated : prev;
        });
    }, [initialData]);

    return {
        formData,
        setFormData,
        localChangeCount,
        remoteChangeCount,
        addItem,
        removeItem,
        updateItem,
        updateField,
        reorderItem,
        applyStructuredDraft
    };
}
