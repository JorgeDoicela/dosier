import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, RotateCcw, ChevronDown } from 'lucide-react';
import { COLORES_OPCIONES, type CalendarioCarrera } from '../../../services/calendarioService';
import type { EventoAlcance } from '../hooks/useCalendarioEvents';
import './EventoDrawers.css';

interface EventoFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    handleSaveEvent: (e: React.FormEvent) => void;
    formTitulo: string;
    setFormTitulo: (v: string) => void;
    formDescripcion: string;
    setFormDescripcion: (v: string) => void;
    formTipo: string;
    setFormTipo: (v: string) => void;
    formColorHex: string;
    setFormColorHex: (v: string) => void;
    formFechaInicio: string;
    setFormFechaInicio: (v: string) => void;
    formFechaFin: string;
    setFormFechaFin: (v: string) => void;
    formPrioridad: string;
    setFormPrioridad: (v: string) => void;
    formEstado: string;
    setFormEstado: (v: string) => void;
    formAlertaDias: number | '';
    setFormAlertaDias: (v: number | '') => void;
    formRecurrenciaAnual: boolean;
    setFormRecurrenciaAnual: (v: boolean) => void;
    formEsPrivado: boolean;
    setFormEsPrivado: (v: boolean) => void;
    formEsNormativo?: boolean;
    setFormEsNormativo?: (v: boolean) => void;
    formRolesVisibles?: string;
    setFormRolesVisibles?: (v: string) => void;
    formAlcance: EventoAlcance;
    aplicarAlcanceDefaults: (alcance: EventoAlcance) => void;
    formIdCarrera: number | null;
    setFormIdCarrera: (id: number | null) => void;
    carrerasUsuario: CalendarioCarrera[];
    canPublishInstituto: boolean;
}

export const EventoFormDrawer: React.FC<EventoFormDrawerProps> = ({
    isOpen,
    onClose,
    isEditing,
    handleSaveEvent,
    formTitulo,
    setFormTitulo,
    formDescripcion,
    setFormDescripcion,
    formTipo,
    setFormTipo,
    formColorHex,
    setFormColorHex,
    formFechaInicio,
    setFormFechaInicio,
    formFechaFin,
    setFormFechaFin,
    formPrioridad,
    setFormPrioridad,
    formEstado,
    setFormEstado,
    formAlertaDias,
    setFormAlertaDias,
    formRecurrenciaAnual,
    setFormRecurrenciaAnual,
    formAlcance,
    aplicarAlcanceDefaults,
    formIdCarrera,
    setFormIdCarrera,
    carrerasUsuario,
    canPublishInstituto,
}) => {
    const [showOpciones, setShowOpciones] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowOpciones(isEditing);
        }
    }, [isOpen, isEditing]);

    if (!isOpen) return null;

    const alcanceConfig =
        formAlcance === 'instituto'
            ? { label: 'Todo el instituto', dotClass: 'bg-emerald-600', desc: 'Visible para todo el ISTPET' }
            : formAlcance === 'carrera'
                ? {
                    label: 'Toda la carrera',
                    dotClass: 'bg-[#0070f3]',
                    desc: carrerasUsuario.length === 1
                        ? carrerasUsuario[0].nombre
                        : 'Visible para docentes y coordinación',
                }
                : { label: 'Personal', dotClass: 'bg-amber-500', desc: 'Visible únicamente en tu agenda personal' };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={onClose}
            />

            <form
                onSubmit={handleSaveEvent}
                className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main font-sans">
                            {isEditing ? 'Editar evento' : 'Nuevo evento'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${alcanceConfig.dotClass}`} />
                            <span className="font-semibold text-slate-700 dark:text-zinc-200">{alcanceConfig.label}</span>
                            <span aria-hidden="true">·</span>
                            <span>{alcanceConfig.desc}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-text-dim hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-white dark:bg-zinc-950">
                    {formAlcance === 'carrera' && carrerasUsuario.length > 1 && (
                        <div>
                            <label className="section-label mb-1.5 block">Carrera *</label>
                            <select
                                value={formIdCarrera ?? ''}
                                onChange={(e) => setFormIdCarrera(e.target.value ? Number(e.target.value) : null)}
                                required
                                className="input-vercel text-xs bg-white dark:bg-zinc-950"
                            >
                                <option value="">Selecciona una carrera...</option>
                                {carrerasUsuario.map((c) => (
                                    <option key={c.id_carrera} value={c.id_carrera}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Título */}
                    <div className="space-y-1">
                        <label className="section-label mb-1.5 block">Título *</label>
                        <input
                            type="text"
                            required
                            placeholder={
                                formAlcance === 'instituto'
                                    ? 'Ej: Plazo de Cierre CACES / Legalización de PEAs'
                                    : formAlcance === 'carrera'
                                        ? 'Ej: Reunión de Coordinación / Entrega de PEAs de Carrera'
                                        : 'Ej: Revisar unidades del PEA - Programación Web'
                            }
                            value={formTitulo}
                            onChange={(e) => setFormTitulo(e.target.value)}
                            className="input-vercel text-sm"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1">
                        <label className="section-label mb-1.5 block">Descripción o Detalles</label>
                        <textarea
                            rows={3}
                            placeholder="Ingresa notas o detalles sobre el evento curricular..."
                            value={formDescripcion}
                            onChange={(e) => setFormDescripcion(e.target.value)}
                            className="input-vercel text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Fecha Inicio */}
                        <div className="space-y-1">
                            <label className="section-label mb-1.5 block">Fecha de Inicio *</label>
                            <input
                                type="date"
                                required
                                value={formFechaInicio || ''}
                                onChange={(e) => setFormFechaInicio(e.target.value)}
                                className="input-vercel text-sm"
                            />
                        </div>

                        {/* Fecha Fin */}
                        <div className="space-y-1">
                            <label className="section-label mb-1.5 block">Fecha de Fin (opcional)</label>
                            <input
                                type="date"
                                value={formFechaFin || ''}
                                onChange={(e) => setFormFechaFin(e.target.value)}
                                className="input-vercel text-sm"
                            />
                        </div>
                    </div>

                    {/* Opciones adicionales colapsables para mantener el flujo simple */}
                    <div className="border-t border-slate-200 dark:border-zinc-800 pt-3">
                        <button
                            type="button"
                            onClick={() => setShowOpciones((prev) => !prev)}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                        >
                            <ChevronDown size={14} className={`transition-transform ${showOpciones ? 'rotate-180' : ''}`} />
                            <span>Opciones adicionales (categoría, color, recordatorio)</span>
                        </button>

                        {showOpciones && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {/* Tipo */}
                                <div className="space-y-1">
                                    <label className="section-label mb-1.5 block">Categoría / Tipo</label>
                                    <select
                                        value={formTipo}
                                        onChange={(e) => setFormTipo(e.target.value)}
                                        className="input-vercel text-sm"
                                    >
                                        <option value="Personal">Personal / Nota Rápida</option>
                                        <option value="Tarea">Tarea Curricular / PEA</option>
                                        <option value="Reunion">Reunión de Área / Carrera</option>
                                        <option value="Hito">Fecha Límite / Entrega</option>
                                        {canPublishInstituto && <option value="Normativo">Normativo / Institucional</option>}
                                    </select>
                                </div>

                                {/* Color */}
                                <div className="space-y-1">
                                    <label className="section-label mb-1.5 block">Etiqueta Visual (Color)</label>
                                    <select
                                        value={formColorHex}
                                        onChange={(e) => setFormColorHex(e.target.value)}
                                        className="input-vercel text-sm"
                                    >
                                        {COLORES_OPCIONES.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Prioridad */}
                                <div className="space-y-1">
                                    <label className="section-label mb-1.5 block">Prioridad</label>
                                    <select
                                        value={formPrioridad}
                                        onChange={(e) => setFormPrioridad(e.target.value)}
                                        className="input-vercel text-sm"
                                    >
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                    </select>
                                </div>

                                {/* Estado */}
                                <div className="space-y-1">
                                    <label className="section-label mb-1.5 block">Estado</label>
                                    <select
                                        value={formEstado}
                                        onChange={(e) => setFormEstado(e.target.value)}
                                        className="input-vercel text-sm"
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="EnProgreso">En Progreso</option>
                                        <option value="Completado">Completado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>

                                {/* Alerta días */}
                                <div className="space-y-1">
                                    <label className="section-label mb-1.5 block flex items-center gap-1.5">
                                        <Bell size={10} /> Recordatorio (días antes)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={90}
                                        placeholder="Ej: 3 (vacío = sin alerta)"
                                        value={formAlertaDias}
                                        onChange={(e) => setFormAlertaDias(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="input-vercel text-sm"
                                    />
                                </div>

                                {/* Recurrencia anual */}
                                <div className="space-y-1 flex flex-col justify-end">
                                    <label className="section-label mb-1.5 block flex items-center gap-1.5">
                                        <RotateCcw size={10} /> Repetición
                                    </label>
                                    <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="recurrencia_anual"
                                            checked={formRecurrenciaAnual}
                                            onChange={(e) => setFormRecurrenciaAnual(e.target.checked)}
                                            className="w-4 h-4 accent-[#0070f3] cursor-pointer"
                                        />
                                        <label htmlFor="recurrencia_anual" className="text-sm text-text-main cursor-pointer select-none">
                                            Se repite cada año
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-vercel-secondary flex-1 py-2.5 text-xs font-semibold cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-[#0070f3] hover:bg-[#0060df] text-white rounded-lg shadow-sm flex-1 py-2.5 text-xs font-semibold cursor-pointer transition-colors"
                    >
                        {isEditing ? 'Actualizar Evento' : 'Guardar Evento'}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
};
