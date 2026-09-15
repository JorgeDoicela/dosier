import React from 'react';
import { CheckSquare, Plus, Trash2, Info, FlaskConical } from 'lucide-react';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

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
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

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
        <div className="w-full space-y-6 animate-fade-in font-sans">
            {/* ENCABEZADO DE SECCIÓN */}
            <div
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between shadow-xs"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    Componente Práctico-Experimental (APE)
                </span>
            </div>

            {/* TABLA DE ACTIVIDADES PRÁCTICAS */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-brand" />
                        <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                            Registro de Prácticas, Talleres y Laboratorios ({practicas.length})
                        </span>
                    </div>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleAddPractica}
                            className="btn-vercel-secondary text-xs px-3 py-1 flex items-center gap-1.5"
                        >
                            <Plus size={13} />
                            <span>Añadir Práctica</span>
                        </button>
                    )}
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2.5 p-3 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim items-start">
                        <Info size={15} className="text-brand shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Las actividades prácticas deben tributar al total de <strong>Horas de Aprendizaje Práctico-Experimental (APE)</strong> asignadas a la asignatura en la Sección A.
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border-thin">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-bg-deep text-text-dim text-[10px] uppercase tracking-wider font-bold border-b border-border-thin">
                                    <th className="p-3 w-[15%] border-r border-border-thin">Unidad</th>
                                    <th className="p-3 w-[35%] border-r border-border-thin">Nombre y Caracterización de la Actividad</th>
                                    <th className="p-3 w-[10%] text-center border-r border-border-thin">Horas</th>
                                    <th className="p-3 w-[20%] border-r border-border-thin">Escenario / Entorno</th>
                                    <th className="p-3 w-[15%] border-r border-border-thin">Producto / Entregable</th>
                                    {!readOnly && <th className="p-3 w-[5%] text-center">Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-thin bg-surface">
                                {practicas.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-bg-deep/30 transition-colors">
                                        <td className="p-2.5 border-r border-border-thin">
                                            <input
                                                type="text"
                                                value={item.unidad}
                                                onChange={(e) => handleUpdatePractica(idx, 'unidad', e.target.value)}
                                                disabled={readOnly}
                                                placeholder="Ej. Unidad 1"
                                                className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-main outline-none focus:border-brand"
                                            />
                                        </td>
                                        <td className="p-2.5 border-r border-border-thin">
                                            <textarea
                                                value={item.nombre}
                                                onChange={(e) => handleUpdatePractica(idx, 'nombre', e.target.value)}
                                                disabled={readOnly}
                                                rows={2}
                                                placeholder="Nombre de la práctica y objetivo operativo..."
                                                className="w-full bg-bg-deep border border-border-thin rounded-lg p-2 text-xs text-text-main outline-none focus:border-brand resize-none"
                                            />
                                        </td>
                                        <td className="p-2.5 border-r border-border-thin text-center">
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.horas}
                                                onChange={(e) => handleUpdatePractica(idx, 'horas', Math.max(1, parseInt(e.target.value) || 1))}
                                                disabled={readOnly}
                                                className="w-16 mx-auto text-center bg-bg-deep border border-border-thin rounded-lg py-1.5 text-xs font-bold text-text-main outline-none focus:border-brand"
                                            />
                                        </td>
                                        <td className="p-2.5 border-r border-border-thin">
                                            <input
                                                type="text"
                                                value={item.escenario}
                                                onChange={(e) => handleUpdatePractica(idx, 'escenario', e.target.value)}
                                                disabled={readOnly}
                                                placeholder="Laboratorio / Aula / Virtual"
                                                className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs text-text-main outline-none focus:border-brand"
                                            />
                                        </td>
                                        <td className="p-2.5 border-r border-border-thin">
                                            <input
                                                type="text"
                                                value={item.producto}
                                                onChange={(e) => handleUpdatePractica(idx, 'producto', e.target.value)}
                                                disabled={readOnly}
                                                placeholder="Informe / Código / Maqueta"
                                                className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs text-text-main outline-none focus:border-brand"
                                            />
                                        </td>
                                        {!readOnly && (
                                            <td className="p-2.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePractica(idx)}
                                                    className="p-1.5 rounded-lg text-text-dim hover:text-error hover:bg-error/10 transition-colors"
                                                    title="Eliminar práctica"
                                                >
                                                    <Trash2 size={14} />
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
        </div>
    );
};
