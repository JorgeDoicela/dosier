import React from 'react';
import { CheckSquare, Plus, Trash2, Info, FlaskConical } from 'lucide-react';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PracticaItem {
    unidad: string;
    nombre: string;
    horas?: number;
    escenario?: string;
    producto?: string;
}

interface PeaResourcesSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
    onAdd?: (list: string, template: any) => void;
    onRemove?: (list: string, index: number) => void;
    onUpdateItem?: (list: string, index: number, field: string, value: any) => void;
}

export const PeaResourcesSection: React.FC<PeaResourcesSectionProps> = ({
    formData,
    onUpdate,
    readOnly = false,
    config,
    onAdd,
    onRemove,
    onUpdateItem
}) => {
    const c = config || {};
    const displayTitle = c.title || 'h) ACTIVIDADES PRÁCTICAS Y EXPERIMENTALES';

    const rawPracticas: any[] = Array.isArray(formData?.ActividadesPracticas) ? formData.ActividadesPracticas : [];

    const practicas: PracticaItem[] = rawPracticas.length > 0 ? rawPracticas.map(p => ({
        unidad: p.unidad || p.Unidad || p['0'] || 'Unidad 1',
        nombre: p.nombre || p.Nombre || p.descripcion || p['1'] || '',
        horas: Number(p.horas ?? p.Horas ?? p['2'] ?? 4),
        escenario: p.escenario || p.Escenario || p['3'] || 'Laboratorio de Cómputo / Taller',
        producto: p.producto || p.Producto || p['4'] || 'Informe técnico y código fuente'
    })) : [
        {
            unidad: 'Unidad 1',
            nombre: 'Práctica 1: Configuración de entorno y primeros despliegues',
            horas: 4,
            escenario: 'Laboratorio de Computación / IDE Local',
            producto: 'Guía de práctica resuelta e informe de resultados'
        }
    ];

    const handleAddPractica = () => {
        if (readOnly) return;
        const newItem: PracticaItem = {
            unidad: `Unidad ${practicas.length + 1}`,
            nombre: '',
            horas: 4,
            escenario: 'Laboratorio / Taller Institucional',
            producto: 'Informe técnico de práctica'
        };

        if (onAdd) {
            onAdd('ActividadesPracticas', newItem);
        } else {
            const updated = [...practicas, newItem];
            onUpdate('ActividadesPracticas', updated);
        }
    };

    const handleRemovePractica = (idx: number) => {
        if (readOnly) return;
        if (onRemove) {
            onRemove('ActividadesPracticas', idx);
        } else {
            const updated = practicas.filter((_, i) => i !== idx);
            onUpdate('ActividadesPracticas', updated);
        }
    };

    const handleUpdatePractica = (idx: number, field: keyof PracticaItem, value: any) => {
        if (readOnly) return;
        if (onUpdateItem) {
            onUpdateItem('ActividadesPracticas', idx, field, value);
        } else {
            const updated = practicas.map((item, i) => i === idx ? { ...item, [field]: value } : item);
            onUpdate('ActividadesPracticas', updated);
        }
    };

    return (
        <div className="w-full space-y-6 sm:space-y-7 animate-fade-in font-sans">
            {/* Aviso APE */}
            <div className="flex gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim items-start">
                <Info size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    Las actividades prácticas deben tributar al total de <strong className="text-text-main font-semibold">Horas de Aprendizaje Práctico-Experimental (APE)</strong> asignadas a la asignatura en la Sección A.
                </p>
            </div>

            {/* TABLA DE ACTIVIDADES PRÁCTICAS */}
            <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-bold uppercase tracking-wide text-text-main">
                        Registro de Prácticas y Talleres ({practicas.length})
                    </span>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleAddPractica}
                            className="px-3.5 sm:px-4 py-2 bg-surface hover:bg-bg-deep border border-border-thin rounded-xl text-xs sm:text-sm font-semibold text-text-main transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                        >
                            <Plus size={16} className="text-[#0070f3]" />
                            <span>Añadir Práctica</span>
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-border-thin bg-surface shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-bg-deep text-text-dim text-xs uppercase tracking-wider font-bold border-b border-border-thin">
                                <th className="p-3.5 sm:p-4 w-[15%] border-r border-border-thin">Unidad</th>
                                <th className="p-3.5 sm:p-4 w-[35%] border-r border-border-thin">Nombre y Caracterización de la Actividad</th>
                                <th className="p-3.5 sm:p-4 w-[10%] text-center border-r border-border-thin">Horas</th>
                                <th className="p-3.5 sm:p-4 w-[20%] border-r border-border-thin">Escenario / Entorno</th>
                                <th className="p-3.5 sm:p-4 w-[15%] border-r border-border-thin">Producto / Entregable</th>
                                {!readOnly && <th className="p-3.5 sm:p-4 w-[5%] text-center">Acción</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-thin bg-surface">
                            {practicas.map((item, idx) => (
                                <tr key={idx} className="hover:bg-bg-deep/30 transition-colors">
                                    <td className="p-3 border-r border-border-thin">
                                        <input
                                            type="text"
                                            value={item.unidad}
                                            onChange={(e) => handleUpdatePractica(idx, 'unidad', e.target.value)}
                                            disabled={readOnly}
                                            placeholder="Ej. Unidad 1"
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-text-main outline-none focus:border-[#0070f3]"
                                        />
                                    </td>
                                    <td className="p-3 border-r border-border-thin">
                                        <textarea
                                            value={item.nombre}
                                            onChange={(e) => handleUpdatePractica(idx, 'nombre', e.target.value)}
                                            disabled={readOnly}
                                            rows={2}
                                            placeholder="Nombre de la práctica y objetivo operativo..."
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg p-2.5 text-xs sm:text-sm text-text-main outline-none focus:border-[#0070f3] resize-none"
                                        />
                                    </td>
                                    <td className="p-3 border-r border-border-thin text-center">
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.horas}
                                            onChange={(e) => handleUpdatePractica(idx, 'horas', Math.max(1, parseInt(e.target.value) || 1))}
                                            disabled={readOnly}
                                            className="w-20 mx-auto text-center bg-bg-deep border border-border-thin rounded-lg py-2 text-sm sm:text-base font-bold font-mono text-text-main outline-none focus:border-[#0070f3]"
                                        />
                                    </td>
                                    <td className="p-3 border-r border-border-thin">
                                        <input
                                            type="text"
                                            value={item.escenario}
                                            onChange={(e) => handleUpdatePractica(idx, 'escenario', e.target.value)}
                                            disabled={readOnly}
                                            placeholder="Laboratorio / Aula / Virtual"
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-2 text-xs sm:text-sm text-text-main outline-none focus:border-[#0070f3]"
                                        />
                                    </td>
                                    <td className="p-3 border-r border-border-thin">
                                        <input
                                            type="text"
                                            value={item.producto}
                                            onChange={(e) => handleUpdatePractica(idx, 'producto', e.target.value)}
                                            disabled={readOnly}
                                            placeholder="Informe / Código / Maqueta"
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-2 text-xs sm:text-sm text-text-main outline-none focus:border-[#0070f3]"
                                        />
                                    </td>
                                    {!readOnly && (
                                        <td className="p-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePractica(idx)}
                                                className="p-2 rounded-lg text-text-dim hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                                                title="Eliminar práctica"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
