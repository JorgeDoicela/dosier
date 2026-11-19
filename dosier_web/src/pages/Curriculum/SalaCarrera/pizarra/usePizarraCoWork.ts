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

    // Referencia al mapa distribuido Yjs
    const yElementsMapRef = useRef<Y.Map<PizarraElement> | null>(null);
    const hasLoadedFromDbRef = useRef<boolean>(false);
    const debounceSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Sincronización de Elementos del Y.Map
    useEffect(() => {
        if (!ydoc) {
            setElements([]);
            return;
        }

        const yMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');
        yElementsMapRef.current = yMap;

        const syncFromYjs = () => {
            const rawArray: PizarraElement[] = [];
            yMap.forEach((val) => {
                if (val && typeof val === 'object' && val.id) {
                    rawArray.push(val);
                }
            });
            // Ordenar por Z-index ascendente
            rawArray.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
            setElements(rawArray);
        };

        // Carga inicial desde memoria local Yjs
        syncFromYjs();

        // Suscripción a cambios concurrentes
        const observer = () => {
            syncFromYjs();
        };

        yMap.observe(observer);

        return () => {
            yMap.unobserve(observer);
        };
    }, [ydoc]);

    // 2. Hidratación inicial desde Base de Datos (doc_cowork_documentos) por Carrera y Período
    useEffect(() => {
        if (!idCarrera || !periodo || !ydoc) return;

        let isMounted = true;
        hasLoadedFromDbRef.current = false;

        const cargarPizarraPersistida = async () => {
            try {
                const res = await salaCarreraService.getPizarra(idCarrera, periodo);
                if (!isMounted || !ydoc) return;

                const yMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');

                // Si viene snapshot binario de Yjs, aplicarlo primero si el mapa local está vacío
                const b64 = res.yjs_state_base64 || res.yjsStateBase64;
                if (b64 && yMap.size === 0) {
                    try {
                        const updateBytes = base64ToUint8Array(b64);
                        Y.applyUpdate(ydoc, updateBytes);
                    } catch (e) {
                        console.warn('No se pudo aplicar snapshot binario Yjs, intentando JSON:', e);
                    }
                }

                // Si el mapa sigue vacío tras intentar el snapshot binario, hidratar desde el array JSON
                const jsonStr = res.elements_json || res.elementsJson;
                if (jsonStr && yMap.size === 0) {
                    try {
                        const parsed = JSON.parse(jsonStr) as PizarraElement[];
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            ydoc.transact(() => {
                                parsed.forEach((elem) => {
                                    if (elem && elem.id) {
                                        yMap.set(elem.id, elem);
                                    }
                                });
                            });
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
    }, [idCarrera, periodo, ydoc]);

    // 3. Función atómica para guardar en la BD
    const saveToDatabase = useCallback(async () => {
        if (!idCarrera || !periodo || !ydoc) return;

        const yMap = ydoc.getMap<PizarraElement>('pizarra_canvas_elements');
        const currentElements: PizarraElement[] = [];
        yMap.forEach((val) => {
            if (val && typeof val === 'object' && val.id) {
                currentElements.push(val);
            }
        });

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
            setSaveStatus('saved');
            setLastSavedAt(new Date(saved.actualizado_en || saved.actualizadoEn || Date.now()));
        } catch (err) {
            console.error('Error al guardar la pizarra en la base de datos:', err);
            setSaveStatus('error');
        }
    }, [idCarrera, periodo, ydoc]);

    // 4. Autoguardado con Debounce (2.5 segundos de inactividad)
    useEffect(() => {
        // Solo autoguardar si ya se completó la hidratación inicial
        if (!hasLoadedFromDbRef.current || !idCarrera || !periodo) return;

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

    // 7. Operaciones CRUD en Yjs (atómicas con Y.transact)
    const addElement = useCallback((newElem: Omit<PizarraElement, 'id' | 'updatedAt' | 'zIndex'>) => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        const id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const highestZ = elements.reduce((max, e) => Math.max(max, e.zIndex || 0), 0);

        const element: PizarraElement = {
            ...newElem,
            id,
            zIndex: highestZ + 1,
            updatedAt: Date.now(),
        };

        ydoc.transact(() => {
            yMap.set(id, element);
        });

        return id;
    }, [ydoc, elements]);

    const updateElement = useCallback((id: string, patch: Partial<PizarraElement>) => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        const existing = yMap.get(id);
        if (!existing) return;

        const updated: PizarraElement = {
            ...existing,
            ...patch,
            updatedAt: Date.now(),
        };

        ydoc.transact(() => {
            yMap.set(id, updated);
        });
    }, [ydoc]);

    const deleteElement = useCallback((id: string) => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        ydoc.transact(() => {
            yMap.delete(id);
        });
    }, [ydoc]);

    const bringToFront = useCallback((id: string) => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        const existing = yMap.get(id);
        if (!existing) return;

        const highestZ = elements.reduce((max, e) => Math.max(max, e.zIndex || 0), 0);
        if (existing.zIndex >= highestZ) return;

        ydoc.transact(() => {
            yMap.set(id, {
                ...existing,
                zIndex: highestZ + 1,
                updatedAt: Date.now(),
            });
        });
    }, [ydoc, elements]);

    const clearCanvas = useCallback(() => {
        const yMap = yElementsMapRef.current;
        if (!yMap || !ydoc) return;

        ydoc.transact(() => {
            yMap.clear();
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
