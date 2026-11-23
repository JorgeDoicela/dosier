import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { CoWorkHandle } from '../../../core/cowork/types';
import { usePizarraCoWork } from './usePizarraCoWork';
import { PizarraToolbar } from './components/PizarraToolbar';
import { PizarraStickyNote } from './components/PizarraStickyNote';
import { PizarraCardAcuerdo } from './components/PizarraCardAcuerdo';
import { PizarraRemoteCursor } from './components/PizarraRemoteCursor';
import type { PizarraColor, ViewportTransform, PizarraElement } from './types';
import type { PeriodoAcademicoDto } from '../../../../services/docenteAsignaturasService';

export interface SalaPizarraCanvasProps {
    cowork: CoWorkHandle;
    userName: string;
    userColor: string;
    userRole?: string;
    userInitials?: string;
    idCarrera: number;
    carreraNombre: string;
    periodoActual: string;
    periodosDisponibles?: PeriodoAcademicoDto[];
    onCambiarPeriodo?: (nuevoPeriodo: string) => void;
}

export const SalaPizarraCanvas: React.FC<SalaPizarraCanvasProps> = ({
    cowork,
    userName,
    userColor,
    userRole,
    userInitials,
    idCarrera,
    carreraNombre,
    periodoActual,
    periodosDisponibles = [],
    onCambiarPeriodo,
}) => {
    // 1. Hook de sincronización en tiempo real sobre CoWork Yjs con persistencia por carrera
    const {
        elements,
        remoteCursors,
        updateMyCursor,
        addElement,
        updateElement,
        deleteElement,
        bringToFront,
        clearCanvas,
        isConnected,
        saveStatus,
        saveNow,
    } = usePizarraCoWork({
        cowork,
        userName,
        userColor,
        userRole,
        userInitials,
        idCarrera,
        periodo: periodoActual,
    });

    // 2. Estado del viewport (Pan y Zoom)
    const [viewport, setViewport] = useState<ViewportTransform>({
        x: 0,
        y: 0,
        zoom: 1,
    });

    // Lista unificada de colaboradores en tiempo real (Local + Remotos vía Awareness)
    const activeUsersList = useMemo(() => {
        const list: { id: string | number; name: string; color: string; initials: string }[] = [];
        list.push({
            id: 'local',
            name: userName || 'Docente',
            color: userColor || '#0070f3',
            initials: userInitials || (userName ? userName.substring(0, 2).toUpperCase() : 'DO'),
        });
        remoteCursors.forEach((c, clientId) => {
            list.push({
                id: clientId,
                name: c.name || 'Docente',
                color: c.color || '#10b981',
                initials: c.initials || (c.name ? c.name.substring(0, 2).toUpperCase() : 'DO'),
            });
        });
        return list;
    }, [userName, userColor, userInitials, remoteCursors]);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const panStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
        clientX: 0,
        clientY: 0,
        startX: 0,
        startY: 0,
    });

    // 3. Conversión de coordenadas de pantalla a coordenadas del mundo virtual
    const screenToWorld = useCallback(
        (screenX: number, screenY: number): { x: number; y: number } => {
            if (!canvasRef.current) return { x: 0, y: 0 };
            const rect = canvasRef.current.getBoundingClientRect();
            const relX = screenX - rect.left;
            const relY = screenY - rect.top;
            return {
                x: Math.round((relX - viewport.x) / viewport.zoom),
                y: Math.round((relY - viewport.y) / viewport.zoom),
            };
        },
        [viewport]
    );

    // 4. Manejo de Zoom con rueda del ratón centrado en el puntero (no pasivo para admitir preventDefault)
    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;

        const onWheelListener = (e: WheelEvent) => {
            e.preventDefault();

            const rect = el.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
                setViewport((prev) => {
                    const newZoom = Math.min(Math.max(prev.zoom * zoomFactor, 0.3), 2.5);
                    const newX = mouseX - (mouseX - prev.x) * (newZoom / prev.zoom);
                    const newY = mouseY - (mouseY - prev.y) * (newZoom / prev.zoom);
                    return { x: Math.round(newX), y: Math.round(newY), zoom: newZoom };
                });
            } else {
                setViewport((prev) => ({
                    ...prev,
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY,
                }));
            }
        };

        el.addEventListener('wheel', onWheelListener, { passive: false });
        return () => {
            el.removeEventListener('wheel', onWheelListener);
        };
    }, []);

    // 5. Iniciar arrastre del fondo del lienzo (Panning)
    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        // Si hace clic con botón central (1) o botón izquierdo (0) en el lienzo vacío o con espacio presionado
        if (e.button === 1 || e.button === 0 || isSpacePressed) {
            setSelectedId(null);
            setIsPanning(true);
            panStartRef.current = {
                clientX: e.clientX,
                clientY: e.clientY,
                startX: viewport.x,
                startY: viewport.y,
            };
        }
    };

    // 6. Seguimiento del ratón para transmitir cursor al Awareness y realizar Pan
    const handleMouseMove = (e: React.MouseEvent) => {
        // Transmitir posición del cursor a los demás colegas
        const worldCoords = screenToWorld(e.clientX, e.clientY);
        updateMyCursor(worldCoords.x, worldCoords.y, selectedId);

        if (isPanning) {
            const dx = e.clientX - panStartRef.current.clientX;
            const dy = e.clientY - panStartRef.current.clientY;
            setViewport((prev) => ({
                ...prev,
                x: panStartRef.current.startX + dx,
                y: panStartRef.current.startY + dy,
            }));
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    // 7. Atajos de teclado (Espacio para pan, Delete/Backspace para eliminar elemento seleccionado)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') {
                return;
            }

            if (e.code === 'Space' && !e.repeat) {
                setIsSpacePressed(true);
            }

            if ((e.code === 'Delete' || e.code === 'Backspace') && selectedId) {
                deleteElement(selectedId);
                setSelectedId(null);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectedId, deleteElement]);

    // 8. Acciones de creación
    const handleAddSticky = (color: PizarraColor = 'yellow') => {
        // Colocar cerca del centro visible de la pantalla
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const center = screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);

        // Añadir jitter aleatorio para que no caigan superpuestas
        const offsetX = (Math.random() - 0.5) * 80;
        const offsetY = (Math.random() - 0.5) * 80;

        const newId = addElement({
            type: 'sticky',
            x: Math.round(center.x - 140 + offsetX),
            y: Math.round(center.y - 100 + offsetY),
            width: 280,
            height: 200,
            content: '',
            color,
            authorName: userName,
            authorColor: userColor,
            authorInitials: userInitials || 'DO',
        });

        if (newId) setSelectedId(newId);
    };

    const handleAddAcuerdo = () => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const center = screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);

        const newId = addElement({
            type: 'card',
            x: Math.round(center.x - 160),
            y: Math.round(center.y - 105),
            width: 320,
            height: 210,
            title: '',
            content: '',
            category: 'General',
            color: 'slate',
            authorName: userName,
            authorColor: userColor,
            authorInitials: userInitials || 'DO',
        });

        if (newId) setSelectedId(newId);
    };

    const handleAddText = () => {
        handleAddSticky('slate');
    };

    const handleDuplicate = (elem: PizarraElement) => {
        const newId = addElement({
            type: elem.type,
            x: elem.x + 30,
            y: elem.y + 30,
            width: elem.width,
            height: elem.height,
            title: elem.title,
            content: elem.content,
            category: elem.category,
            color: elem.color,
            authorName: userName,
            authorColor: userColor,
            authorInitials: userInitials || 'DO',
        });
        if (newId) setSelectedId(newId);
    };

    // 9. Controles de Zoom
    const handleZoomIn = () => {
        setViewport((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 2.5) }));
    };

    const handleZoomOut = () => {
        setViewport((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.3) }));
    };

    const handleResetZoom = () => {
        setViewport({ x: 0, y: 0, zoom: 1 });
    };

    return (
        <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`relative w-full h-full overflow-hidden bg-bg-deep select-none ${isPanning || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                }`}
        >
            {/* Barra de Herramientas Flotante */}
            <PizarraToolbar
                zoom={viewport.zoom}
                isConnected={isConnected}
                activeUsers={activeUsersList}
                saveStatus={saveStatus}
                onSaveNow={saveNow}
                onAddSticky={handleAddSticky}
                onAddAcuerdo={handleAddAcuerdo}
                onAddText={handleAddText}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                periodoActual={periodoActual}
                periodosDisponibles={periodosDisponibles}
                onCambiarPeriodo={onCambiarPeriodo}
            />

            {/* Rejilla de Fondo Técnica (Dot Grid) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
                style={{
                    backgroundImage: `radial-gradient(var(--color-border-thin, #94a3b8) 1px, transparent 1px)`,
                    backgroundSize: `${24 * viewport.zoom}px ${24 * viewport.zoom}px`,
                    backgroundPosition: `${viewport.x}px ${viewport.y}px`,
                }}
            />

            {/* Capa de Transformación del Mundo (World Layer) */}
            <div
                className="absolute inset-0 origin-top-left pointer-events-none"
                style={{
                    transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
                }}
            >
                {/* Elementos Activos (Habilitan pointer-events en sus hijos) */}
                <div className="relative w-full h-full pointer-events-auto">
                    {elements.map((elem) => {
                        const isSelected = selectedId === elem.id;

                        if (elem.type === 'card') {
                            return (
                                <PizarraCardAcuerdo
                                    key={elem.id}
                                    element={elem}
                                    isSelected={isSelected}
                                    zoom={viewport.zoom}
                                    onSelect={() => setSelectedId(elem.id)}
                                    onUpdate={(patch) => updateElement(elem.id, patch)}
                                    onDelete={() => deleteElement(elem.id)}
                                    onDuplicate={() => handleDuplicate(elem)}
                                    onBringToFront={() => bringToFront(elem.id)}
                                />
                            );
                        }

                        return (
                            <PizarraStickyNote
                                key={elem.id}
                                element={elem}
                                isSelected={isSelected}
                                zoom={viewport.zoom}
                                onSelect={() => setSelectedId(elem.id)}
                                onUpdate={(patch) => updateElement(elem.id, patch)}
                                onDelete={() => deleteElement(elem.id)}
                                onDuplicate={() => handleDuplicate(elem)}
                                onBringToFront={() => bringToFront(elem.id)}
                            />
                        );
                    })}

                    {/* Cursores Remotos en Tiempo Real */}
                    {Array.from(remoteCursors.entries()).map(([clientId, cursor]) => (
                        <PizarraRemoteCursor key={clientId} cursor={cursor} />
                    ))}
                </div>
            </div>

            {/* Indicador Sutil cuando la Pizarra está vacía (Limpio, sin cajas ni bordes pesados) */}
            {elements.length === 0 && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                    <p className="text-xs text-text-dim/50 font-medium select-none tracking-wide text-center">
                        Lienzo en blanco para {carreraNombre}
                    </p>
                    <p className="text-[11px] text-text-dim/40 mt-1 select-none">
                        Haz clic en Nota o Acuerdo en la barra superior para comenzar
                    </p>
                </div>
            )}

            {/* Atajos de teclado en una sola línea discreta, sin marcos ni recuadros */}
            <div className="absolute bottom-3 left-4 pointer-events-none select-none text-[10px] text-text-dim/40 font-mono hidden sm:block">
                Rueda: Desplazar · Ctrl + Rueda: Zoom · Supr: Eliminar
            </div>
        </div>
    );
};

export default SalaPizarraCanvas;

