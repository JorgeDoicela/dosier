import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { GeistSelect } from '../../../Common/GeistSelect';
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
    cowork?: CoWorkHandle;
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
    const colUnidadLabel = c.colUnidadLabel || 'Unidad';
    const colPracticaLabel = c.colPracticaLabel || 'Nombre de la práctica y caracterización de la actividad';

    // ── Opciones inteligentes de Unidades tomadas del PEA oficial ────────────
    const availableUnits = useMemo(() => {
        const rawUnidades: any[] = Array.isArray(formData?.Unidades)
            ? formData.Unidades
            : (Array.isArray(formData?.unidades) ? formData.unidades : []);

        if (rawUnidades.length > 0) {
            return rawUnidades.map((u, idx) => {
                const num = u.num || u.numero || idx + 1;
                const label = `Unidad ${num}`;
                const title = (u.titulo || u.Titulo || '').trim();
                return {
                    value: label,
                    display: title ? `${label} - ${title}` : label,
                    num
                };
            });
        }

        return [1, 2, 3, 4].map(num => ({
            value: `Unidad ${num}`,
            display: `Unidad ${num}`,
            num
        }));
    }, [formData?.Unidades, formData?.unidades]);

    const rawPracticas: any[] = Array.isArray(formData?.ActividadesPracticas) ? formData.ActividadesPracticas : [];

    const practicas: PracticaItem[] = rawPracticas.length > 0 ? rawPracticas.map((p, idx) => ({
        unidad: p.unidad || p.Unidad || p['0'] || availableUnits[0]?.value || `Unidad ${idx + 1}`,
        nombre: p.nombre_caracterizacion || p.NombreCaracterizacion || p.nombre || p.Nombre || p.descripcion || p['1'] || '',
        horas: p.horas ?? p.Horas,
        escenario: p.escenario || p.Escenario,
        producto: p.producto || p.Producto
    })) : [
        {
            unidad: availableUnits[0]?.value || 'Unidad 1',
            nombre: ''
        }
    ];

    // ── Sugerencia inteligente de Unidad basada en cobertura curricular ───────
    const getNextSmartUnit = (currentList: PracticaItem[]): string => {
        if (availableUnits.length === 0) return 'Unidad 1';

        // 1. Contar prácticas asignadas a cada unidad oficial de la asignatura
        const countMap = new Map<string, number>();
        availableUnits.forEach(u => countMap.set(u.value.toLowerCase(), 0));

        currentList.forEach(p => {
            const rawVal = (p.unidad || '').toLowerCase().trim();
            for (const u of availableUnits) {
                if (rawVal === u.value.toLowerCase() || rawVal === `unidad ${u.num}`) {
                    countMap.set(u.value.toLowerCase(), (countMap.get(u.value.toLowerCase()) || 0) + 1);
                    break;
                }
            }
        });

        // 2. Primera prioridad: Si hay unidades oficiales sin práctica, sugerir la siguiente en orden
        const uncovered = availableUnits.find(u => (countMap.get(u.value.toLowerCase()) || 0) === 0);
        if (uncovered) {
            return uncovered.value;
        }

        // 3. Segunda prioridad: Si todas ya tienen prácticas, seguir la secuencia cíclica desde la última
        if (currentList.length > 0) {
            const lastRaw = (currentList[currentList.length - 1]?.unidad || '').toLowerCase().trim();
            const lastIndex = availableUnits.findIndex(
                u => lastRaw === u.value.toLowerCase() || lastRaw === `unidad ${u.num}`
            );
            if (lastIndex !== -1) {
                const nextIndex = (lastIndex + 1) % availableUnits.length;
                return availableUnits[nextIndex].value;
            }
        }

        return availableUnits[0].value;
    };

    const handleAddPractica = () => {
        if (readOnly) return;

        const suggestedUnit = getNextSmartUnit(practicas);

        const newItem: PracticaItem = {
            unidad: suggestedUnit,
            nombre: ''
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
        <div className="w-full space-y-4 sm:space-y-5 animate-fade-in font-sans">
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    h) Actividades Prácticas
                </h4>
            </div>

            {/* TABLA OFICIAL INSTITUCIONAL: UNIDAD Y CARACTERIZACIÓN */}
            <div className="overflow-x-auto rounded-xl border border-border-thin bg-surface shadow-2xs">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-bg-deep text-text-dim text-xs uppercase tracking-wider font-bold border-b border-border-thin">
                            <th className="p-3.5 sm:p-4 w-[28%] sm:w-[26%] border-r border-border-thin">
                                {colUnidadLabel}
                            </th>
                            <th className="p-3.5 sm:p-4">
                                {colPracticaLabel}
                            </th>
                            {!readOnly && (
                                <th className="p-3.5 sm:p-4 w-[60px] text-center border-l border-border-thin">
                                    Acción
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-thin bg-surface">
                        {practicas.map((item, idx) => (
                            <tr key={idx} className="hover:bg-bg-deep/30 transition-colors">
                                <td className="p-3 border-r border-border-thin align-top">
                                    <GeistSelect
                                        value={item.unidad || availableUnits[0]?.value || 'Unidad 1'}
                                        options={(() => {
                                            const base = availableUnits.map(u => ({ value: u.value, label: u.display }));
                                            if (item.unidad && !base.some(b => String(b.value).toLowerCase() === item.unidad.toLowerCase())) {
                                                return [{ value: item.unidad, label: item.unidad }, ...base];
                                            }
                                            return base;
                                        })()}
                                        onChange={(val) => handleUpdatePractica(idx, 'unidad', String(val))}
                                        disabled={readOnly}
                                        className="w-full text-xs sm:text-sm font-semibold"
                                    />
                                </td>
                                <td className="p-3 align-top">
                                    <textarea
                                        value={item.nombre}
                                        onChange={(e) => handleUpdatePractica(idx, 'nombre', e.target.value)}
                                        disabled={readOnly}
                                        rows={Math.max(2, (item.nombre || '').split('\n').length)}
                                        placeholder="Nombre de la práctica y caracterización de la actividad..."
                                        className="w-full bg-surface border border-border-thin rounded-xl p-3 text-xs sm:text-sm text-text-main outline-none focus:border-text-main resize-none transition-colors leading-relaxed placeholder:text-text-dim/40"
                                    />
                                </td>
                                {!readOnly && (
                                    <td className="p-3 text-center align-top border-l border-border-thin">
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

            {/* BOTÓN AL PIE DE LA TABLA: FLUJO SECUENCIAL Y NATURAL */}
            {!readOnly && (
                <button
                    type="button"
                    onClick={handleAddPractica}
                    className="w-full py-3 px-4 rounded-xl bg-surface hover:bg-bg-deep border border-dashed border-border-thin hover:border-[#0070f3] flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-text-main transition-all cursor-pointer shadow-2xs"
                >
                    <Plus size={16} className="text-[#0070f3]" />
                    <span>Añadir Práctica</span>
                </button>
            )}
        </div>
    );
};
