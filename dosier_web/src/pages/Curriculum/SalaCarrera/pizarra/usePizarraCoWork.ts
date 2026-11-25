import { useState, useEffect, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import type { PizarraElement, PizarraCursorData } from './types';
import salaCarreraService from '../../../../services/salaCarreraService';

interface UsePizarraCoWorkProps {
    cowork: CoWorkHandle;
    userName: string;
    userColor: string;
    userRole?: string;
    userInitials?: string;
    idCarrera?: number;
    periodo?: string;
}

export type PizarraSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export function usePizarraCoWork({
    cowork,
    userName,
    userColor,
    userRole,
    userInitials,
    idCarrera,
    periodo,
}: UsePizarraCoWorkProps) {
    const { ydoc, awareness } = cowork;
    const [elements, setElements] = useState<PizarraElement[]>([]);
    const [remoteCursors, setRemoteCursors] = useState<Map<number, PizarraCursorData>>(new Map());
    const [saveStatus, setSaveStatus] = useState<PizarraSaveStatus>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

    // Referencia al mapa distribuido Yjs (Y.Map anidado por elemento para CRDT sin colisiones)
    const yElementsMapRef = useRef<Y.Map<Y.Map<unknown>> | null>(null);
    const hasLoadedFromDbRef = useRef<boolean>(false);
    const hasLocalChangesRef = useRef<boolean>(false);
    const debounceSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyTextDiff = useCallback((yText: Y.Text, newValue: string) => {
        const oldValue = yText.toString();
        if (oldValue === newValue) return;

        let start = 0;
        while (start < oldValue.length && start < newValue.length && oldValue[start] === newValue[start]) {
            start++;
        }

        let oldEnd = oldValue.length;
        let newEnd = newValue.length;
        while (oldEnd > start && newEnd > start && oldValue[oldEnd - 1] === newValue[newEnd - 1]) {
            oldEnd--;
            newEnd--;
        }

        const deleteLen = oldEnd - start;
        const insertStr = newValue.slice(start, newEnd);
        if (deleteLen > 0) yText.delete(start, deleteLen);
        if (insertStr.length > 0) yText.insert(start, insertStr);
    }, []);

    const createYElement = useCallback((elem: PizarraElement): Y.Map<unknown> => {
        const yEl = new Y.Map<unknown>();
        yEl.set('id', elem.id);
        yEl.set('type', elem.type);
        yEl.set('x', elem.x);
        yEl.set('y', elem.y);
        yEl.set('width', elem.width);
        yEl.set('height', elem.height);
        yEl.set('color', elem.color);
        yEl.set('authorName', elem.authorName);
        yEl.set('authorColor', elem.authorColor);
        yEl.set('authorInitials', elem.authorInitials);
        yEl.set('updatedAt', elem.updatedAt);
        yEl.set('zIndex', elem.zIndex);
        if (elem.category !== undefined) yEl.set('category', elem.category);
        yEl.set('titleText', new Y.Text(elem.title || ''));
        yEl.set('contentText', new Y.Text(elem.content || ''));
        return yEl;
    }, []);

    const yMapToElement = useCallback((id: string, yEl: Y.Map<unknown>): PizarraElement | null => {
        const type = yEl.get('type') as PizarraElement['type'] | undefined;
        if (!type) return null;

        const titleYText = yEl.get('titleText');
        const contentYText = yEl.get('contentText');

        return {
            id: (yEl.get('id') as string) || id,
            type,
            x: Number(yEl.get('x') ?? 0),
            y: Number(yEl.get('y') ?? 0),
            width: Number(yEl.get('width') ?? 280),
            height: Number(yEl.get('height') ?? 200),
            title: titleYText instanceof Y.Text ? titleYText.toString() : (yEl.get('title') as string | undefined),
            content: contentYText instanceof Y.Text ? contentYText.toString() : String(yEl.get('content') ?? ''),
            color: (yEl.get('color') as PizarraElement['color']) || 'yellow',
            authorName: String(yEl.get('authorName') ?? 'Docente'),
            authorColor: String(yEl.get('authorColor') ?? '#0070f3'),
            authorInitials: String(yEl.get('authorInitials') ?? 'DO'),
            updatedAt: Number(yEl.get('updatedAt') ?? 0),
            zIndex: Number(yEl.get('zIndex') ?? 1),
            category: yEl.get('category') as string | undefined,
        };
    }, []);

    const readElementsFromYjs = useCallback((yMap: Y.Map<Y.Map<unknown>>, yLegacyMap?: Y.Map<PizarraElement>): PizarraElement[] => {
        const rawArray: PizarraElement[] = [];
        yMap.forEach((yEl, id) => {
            if (yEl instanceof Y.Map) {
                const parsed = yMapToElement(id, yEl);
                if (parsed) rawArray.push(parsed);
            }
        });

        // Compatibilidad retroactiva si existen datos en el mapa legacy plano
        if (rawArray.length === 0 && yLegacyMap && yLegacyMap.size > 0) {
            yLegacyMap.forEach((val) => {
                if (val && typeof val === 'object' && val.id) {
                    rawArray.push(val);
                }
            });
        }

        rawArray.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        return rawArray;
    }, [yMapToElement]);

    // 1. Sincronización profunda de Elementos del Y.Map y sus Y.Text anidados
    useEffect(() => {
        if (!ydoc) {
            setElements([]);
            return;
        }

        const yMap = ydoc.getMap<Y.Map<unknown>>('pizarra_elements_v2');
        const yLegacyMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');
        yElementsMapRef.current = yMap;

        const syncFromYjs = () => {
            setElements(readElementsFromYjs(yMap, yLegacyMap));
        };

        // Carga inicial desde memoria local Yjs
        syncFromYjs();

        // Suscripción profunda a cambios concurrentes (propiedades y Y.Text)
        const deepObserver = () => {
            syncFromYjs();
        };
        const updateListener = (_update: Uint8Array, origin: unknown) => {
            if (origin !== 'remote') {
                hasLocalChangesRef.current = true;
            }
        };

        yMap.observeDeep(deepObserver);
        yLegacyMap.observe(deepObserver);
        ydoc.on('update', updateListener);

        return () => {
            yMap.unobserveDeep(deepObserver);
            yLegacyMap.unobserve(deepObserver);
            ydoc.off('update', updateListener);
        };
    }, [ydoc, readElementsFromYjs]);

    // 2. Hidratación inicial desde Base de Datos (doc_cowork_documentos) por Carrera y Período
    useEffect(() => {
        if (!idCarrera || !periodo || !ydoc) return;

        let isMounted = true;
        hasLoadedFromDbRef.current = false;
        hasLocalChangesRef.current = false;

        const cargarPizarraPersistida = async () => {
            try {
                const res = await salaCarreraService.getPizarra(idCarrera, periodo);
                if (!isMounted || !ydoc) return;

                const yMap = ydoc.getMap<Y.Map<unknown>>('pizarra_elements_v2');
                const yLegacyMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');

                // Aplicar snapshot binario con origin 'remote' para no re-transmitir historial por SignalR
                const b64 = res.yjs_state_base64 || res.yjsStateBase64;
                if (b64 && yMap.size === 0 && yLegacyMap.size === 0) {
                    try {
                        const updateBytes = base64ToUint8Array(b64);
                        Y.applyUpdate(ydoc, updateBytes, 'remote');
                    } catch (e) {
                        console.warn('No se pudo aplicar snapshot binario Yjs, intentando JSON:', e);
                    }
                }

                // Si el mapa v2 sigue vacío pero el legacy tiene elementos, migrar en memoria con origin 'remote'
                if (yMap.size === 0 && yLegacyMap.size > 0) {
                    ydoc.transact(() => {
                        yLegacyMap.forEach((elem) => {
                            if (elem && elem.id && !yMap.has(elem.id)) {
                                yMap.set(elem.id, createYElement(elem));
                            }
                        });
                    }, 'remote');
                }

                // Si sigue vacío tras snapshot binario, hidratar desde el array JSON con origin 'remote'
                const jsonStr = res.elements_json || res.elementsJson;
                if (jsonStr && yMap.size === 0) {
                    try {
                        const parsed = JSON.parse(jsonStr) as PizarraElement[];
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            ydoc.transact(() => {
                                parsed.forEach((elem) => {
                                    if (elem && elem.id) {
                                        yMap.set(elem.id, createYElement(elem));
                                    }
                                });
                            }, 'remote');
                        }
                    } catch (e) {
                        console.error('Error al deserializar elements_json de la pizarra:', e);
                    }
                }

                if (res.actualizado_en || res.actualizadoEn) {
                    setLastSavedAt(new Date(res.actualizado_en || res.actualizadoEn || Date.now()));
                    setSaveStatus('saved');
                }
            } catch (err) {
                console.warn('No se pudo cargar la pizarra persistida de la carrera:', err);
            } finally {
                if (isMounted) {
                    hasLoadedFromDbRef.current = true;
                }
            }
        };

        cargarPizarraPersistida();

        return () => {
            isMounted = false;
        };
    }, [idCarrera, periodo, ydoc, createYElement]);

    // 3. Función atómica para guardar en la BD
    const saveToDatabase = useCallback(async () => {
        if (!idCarrera || !periodo || !ydoc) return;

        const yMap = ydoc.getMap<Y.Map<unknown>>('pizarra_elements_v2');
        const yLegacyMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');
        const currentElements = readElementsFromYjs(yMap, yLegacyMap);

        // Generar snapshot de Yjs y JSON estructurado
        let yjsStateBase64: string | undefined;
        try {
            const stateUpdate = Y.encodeStateAsUpdate(ydoc);
            yjsStateBase64 = uint8ArrayToBase64(stateUpdate);
        } catch (e) {
            console.warn('No se pudo codificar stateUpdate de Yjs:', e);
        }

        const elementsJson = JSON.stringify(currentElements);

        setSaveStatus('saving');
        try {
            const saved = await salaCarreraService.guardarPizarra(idCarrera, periodo, {
                elementsJson,
                yjsStateBase64,
            });
            hasLocalChangesRef.current = false;
            setSaveStatus('saved');
            setLastSavedAt(new Date(saved.actualizado_en || saved.actualizadoEn || Date.now()));
        } catch (err) {
            console.error('Error al guardar la pizarra en la base de datos:', err);
            setSaveStatus('error');
        }
    }, [idCarrera, periodo, ydoc, readElementsFromYjs]);

    // 4. Autoguardado con Debounce (2.5 segundos de inactividad solo ante cambios locales)
    useEffect(() => {
        if (!hasLoadedFromDbRef.current || !hasLocalChangesRef.current || !idCarrera || !periodo) return;

        if (debounceSaveTimerRef.current) {
            clearTimeout(debounceSaveTimerRef.current);
        }

        debounceSaveTimerRef.current = setTimeout(() => {
            saveToDatabase();
        }, 2500);

        return () => {
            if (debounceSaveTimerRef.current) {
                clearTimeout(debounceSaveTimerRef.current);
            }
        };
    }, [elements, idCarrera, periodo, saveToDatabase]);

    // 5. Sincronización de Cursores Remotos vía Awareness
    useEffect(() => {
        if (!awareness) return;

        const handleAwarenessChange = () => {
            const states = awareness.getStates();
            const localClientId = awareness.clientID;
            const newCursors = new Map<number, PizarraCursorData>();

            states.forEach((state, clientId) => {
                if (clientId === localClientId) return;
                const pCursor = state?.pizarraCursor as PizarraCursorData | undefined;
                if (pCursor && typeof pCursor.x === 'number' && typeof pCursor.y === 'number') {
                    // Ignorar cursores inactivos por más de 15 segundos
                    if (Date.now() - (pCursor.lastActive || 0) < 15000) {
                        newCursors.set(clientId, pCursor);
                    }
                }
            });

            setRemoteCursors(newCursors);
        };

        awareness.on('change', handleAwarenessChange);
        handleAwarenessChange();

        return () => {
            awareness.off('change', handleAwarenessChange);
        };
    }, [awareness]);

    // 6. Emitir mi cursor local (con throttling)
    const lastBroadcastRef = useRef<number>(0);
    const updateMyCursor = useCallback((x: number, y: number, selectedId?: string | null) => {
        if (!awareness) return;
        const now = Date.now();
        // Emitir a máximo 30 FPS (cada ~33ms) para optimizar ancho de banda
        if (now - lastBroadcastRef.current < 33) return;
        lastBroadcastRef.current = now;

        const cursorPayload: PizarraCursorData = {
            x,
            y,
            userName: userName || 'Docente',
            userColor: userColor || '#0070f3',
            userRole,
            userInitials: userInitials || 'DO',
            selectedId,
            lastActive: now,
        };

        awareness.setLocalStateField('pizarraCursor', cursorPayload);
    }, [awareness, userName, userColor, userRole, userInitials]);

    // 7. Operaciones CRUD en Yjs (atómicas por campo con Y.Map + Y.Text)
    const getHighestZIndex = useCallback((yMap: Y.Map<Y.Map<unknown>>): number => {
        let highestZ = 0;
        yMap.forEach((yEl) => {
            if (yEl instanceof Y.Map) {
                const z = Number(yEl.get('zIndex') ?? 0);
                if (z > highestZ) highestZ = z;
            }
        });
        return highestZ;
    }, []);

    const addElement = useCallback((newElem: Omit<PizarraElement, 'id' | 'updatedAt' | 'zIndex'>) => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        const id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const highestZ = getHighestZIndex(yMap);

        const element: PizarraElement = {
            ...newElem,
            id,
            zIndex: highestZ + 1,
            updatedAt: Date.now(),
        };

        ydoc.transact(() => {
            yMap.set(id, createYElement(element));
        });

        return id;
    }, [ydoc, getHighestZIndex, createYElement]);

    const updateElement = useCallback((id: string, patch: Partial<PizarraElement>) => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        let yEl = yMap.get(id);
        if (!yEl) {
            const yLegacyMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');
            const legacyElem = yLegacyMap.get(id);
            if (!legacyElem) return;
            yEl = createYElement(legacyElem);
            ydoc.transact(() => {
                yMap.set(id, yEl!);
            });
        }

        ydoc.transact(() => {
            if (patch.title !== undefined) {
                let titleText = yEl!.get('titleText');
                if (!(titleText instanceof Y.Text)) {
                    titleText = new Y.Text(String(yEl!.get('title') ?? ''));
                    yEl!.set('titleText', titleText);
                }
                applyTextDiff(titleText, patch.title);
            }

            if (patch.content !== undefined) {
                let contentText = yEl!.get('contentText');
                if (!(contentText instanceof Y.Text)) {
                    contentText = new Y.Text(String(yEl!.get('content') ?? ''));
                    yEl!.set('contentText', contentText);
                }
                applyTextDiff(contentText, patch.content);
            }

            const scalarKeys: (keyof PizarraElement)[] = [
                'x', 'y', 'width', 'height', 'color', 'category', 'zIndex',
                'authorName', 'authorColor', 'authorInitials'
            ];
            for (const key of scalarKeys) {
                if (patch[key] !== undefined && yEl!.get(key) !== patch[key]) {
                    yEl!.set(key, patch[key]);
                }
            }
            yEl!.set('updatedAt', Date.now());
        });
    }, [ydoc, applyTextDiff, createYElement]);

    const deleteElement = useCallback((id: string) => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        const yLegacyMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');
        ydoc.transact(() => {
            yMap.delete(id);
            if (yLegacyMap.has(id)) {
                yLegacyMap.delete(id);
            }
        });
    }, [ydoc]);

    const bringToFront = useCallback((id: string) => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        const yEl = yMap.get(id);
        if (!yEl) return;

        const currentZ = Number(yEl.get('zIndex') ?? 0);
        const highestZ = getHighestZIndex(yMap);
        if (currentZ >= highestZ) return;

        ydoc.transact(() => {
            yEl.set('zIndex', highestZ + 1);
            yEl.set('updatedAt', Date.now());
        });
    }, [ydoc, getHighestZIndex]);

    const clearCanvas = useCallback(() => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        const yLegacyMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');
        ydoc.transact(() => {
            yMap.clear();
            yLegacyMap.clear();
        });
    }, [ydoc]);

    return {
        elements,
        remoteCursors,
        updateMyCursor,
        addElement,
        updateElement,
        deleteElement,
        bringToFront,
        clearCanvas,
        isConnected: cowork.session.isConnected,
        saveStatus,
        lastSavedAt,
        saveNow: saveToDatabase,
    };
}
