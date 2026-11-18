/**
 * @file RenderInformeAcompConclusiones.tsx
 * @description 5. CONCLUSIONES Y RECOMENDACIONES del Informe de Acompañamiento Académico 2026.
 * Renderizador interactivo fiel al formato oficial institucional ISTPET.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ConclusionRecomendacionItem } from '../../../types';

export interface RenderInformeAcompConclusionesProps {
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}

const DEFAULT_ITEMS: ConclusionRecomendacionItem[] = [
    {
        id: '1',
        punto: '1. Sobre la coordinación y datos informativos',
        conclusion: '',
        recomendacion: ''
    },
    {
        id: '2',
        punto: '2. Sobre la nómina de docentes tutores y medios de verificación',
        conclusion: '',
        recomendacion: ''
    },
    {
        id: '3',
        punto: '3. Sobre los docentes que aportan a la carrera y acciones de mejora',
        conclusion: '',
        recomendacion: ''
    },
    {
        id: '4',
        punto: '4. Sobre la gestión académica, reuniones, rendimiento estudiantil y EVA',
        conclusion: '',
        recomendacion: ''
    }
];

export const RenderInformeAcompConclusiones: React.FC<RenderInformeAcompConclusionesProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.sectionTitle || title || '5.  Conclusiones y Recomendaciones';
    const bannerText = c.bannerText || 'CONCLUSIÓN Y RECOMENDACIÓN POR CADA UNO DE LOS PUNTOS TRATADOS.';

    const [items, setItems] = useState<ConclusionRecomendacionItem[]>(() => {
        if (Array.isArray(c.items) && c.items.length > 0) {
            return c.items;
        }
        return DEFAULT_ITEMS;
    });

    useEffect(() => {
        if (Array.isArray(c.items) && c.items.length > 0) {
            setItems(c.items);
        }
    }, [c.items]);

    const updateItemsAndNotify = (newItems: ConclusionRecomendacionItem[]) => {
        setItems(newItems);
        if (blockId && onUpdateConfig) {
            onUpdateConfig(blockId, 'items', newItems);
        }
    };

    const handleItemChange = (id: string, field: keyof ConclusionRecomendacionItem, value: string) => {
        const next = items.map((it) => (it.id === id ? { ...it, [field]: value } : it));
        updateItemsAndNotify(next);
    };

    const handleAddItem = () => {
        const newId = String(Date.now());
        const newItem: ConclusionRecomendacionItem = {
            id: newId,
            punto: `${items.length + 1}. Punto tratado`,
            conclusion: '',
            recomendacion: ''
        };
        updateItemsAndNotify([...items, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length <= 1) return;
        const next = items.filter((it) => it.id !== id);
        updateItemsAndNotify(next);
    };

    return (
        <div className="w-full bg-white text-slate-900 font-sans text-xs space-y-3">
            {/* Cabecera */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-black tracking-tight">
                    {sectionTitle}
                </h2>
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0070f3] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Punto
                </button>
            </div>

            {/* Banner oficial en amarillo según formato normativo */}
            <div>
                <span className="inline-block bg-[#ffff00] text-black font-bold text-xs uppercase px-2 py-0.5 border border-yellow-400">
                    {bannerText}
                </span>
            </div>

            {/* Lista estructurada de conclusiones y recomendaciones por punto */}
            <div className="space-y-4 pt-1">
                {items.map((it, idx) => (
                    <div key={it.id} className="border border-black p-3 bg-white space-y-2 relative group">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                            <input
                                type="text"
                                value={it.punto}
                                onChange={(e) => handleItemChange(it.id, 'punto', e.target.value)}
                                placeholder="Título del punto tratado..."
                                className="font-bold text-xs text-black bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded px-1 w-full"
                            />
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(it.id)}
                                    title="Eliminar este punto"
                                    className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors ml-2"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Conclusión */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                Conclusión:
                            </label>
                            <textarea
                                rows={2}
                                value={it.conclusion}
                                onChange={(e) => handleItemChange(it.id, 'conclusion', e.target.value)}
                                placeholder="Redacte la conclusión respecto a este punto analizado..."
                                className="w-full p-2 text-xs border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 resize-none bg-slate-50/30"
                            />
                        </div>

                        {/* Recomendación */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Recomendación:
                            </label>
                            <textarea
                                rows={2}
                                value={it.recomendacion}
                                onChange={(e) => handleItemChange(it.id, 'recomendacion', e.target.value)}
                                placeholder="Redacte la recomendación operativa o pedagógica sugerida..."
                                className="w-full p-2 text-xs border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 resize-none bg-slate-50/30"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
