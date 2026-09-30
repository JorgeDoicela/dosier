import React from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../api/AuthContext';
import { COLORES_OPCIONES } from '../../../services/calendarioService';
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
    formEsPrivado,
    setFormEsPrivado,
    formEsNormativo = false,
    setFormEsNormativo,
    formRolesVisibles = '',
    setFormRolesVisibles,
}) => {
    const { isAdmin } = useAuth();
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
            <div
                className="absolute inset-0 bg-black/60 cursor-pointer"
                onClick={onClose}
            />

            <form
                onSubmit={handleSaveEvent}
                className="relative w-full max-w-2xl h-full bg-white dark:bg-zinc-950 border-l border-slate-200/90 dark:border-zinc-800 flex flex-col z-10 animate-slide-in-right"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main font-sans">
                            {isEditing
                                ? (formEsNormativo ? 'Editar Hito Institucional' : 'Editar Tarea o Evento')
                                : (formEsNormativo ? 'Nuevo Hito Normativo Institucional' : 'Nueva Tarea / Evento de Agenda')}
                        </h2>
                        {formEsNormativo && (
                            <p className="text-xs text-[#0070f3] dark:text-blue-400 font-medium mt-0.5">
                                Publicación oficial para seguimiento y acreditación CACES
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-text-dim hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white dark:bg-zinc-950">
                    {/* Selector de Ámbito para Administradores */}
                    {isAdmin && setFormEsNormativo && (
                        <div className="border border-slate-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900">
                            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-2">
                                Ámbito de Publicación
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormEsNormativo(false);
                                        setFormEsPrivado(true);
                                        if (formTipo === 'Normativo') setFormTipo('Personal');
                                    }}
                                    className={`py-2 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                                        !formEsNormativo
                                            ? 'bg-white dark:bg-zinc-950 text-[#0070f3] dark:text-blue-400 border-slate-300 dark:border-zinc-700 font-semibold shadow-2xs'
                                            : 'bg-transparent text-slate-600 dark:text-zinc-400 border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    Personal (Mi Agenda)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormEsNormativo(true);
                                        setFormEsPrivado(false);
                                        setFormTipo('Normativo');
                                    }}
                                    className={`py-2 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                                        formEsNormativo
                                            ? 'bg-[#0070f3] text-white border-[#0070f3] font-semibold shadow-2xs'
                                            : 'bg-transparent text-slate-600 dark:text-zinc-400 border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    Institucional / Normativo (CACES)
                                </button>
                            </div>

                            {formEsNormativo && setFormRolesVisibles && (
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-1.5">
                                    <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 block">
                                        Roles Destinatarios Visibles
                                    </label>
                                    <select
                                        value={formRolesVisibles || 'TODOS'}
                                        onChange={(e) => setFormRolesVisibles(e.target.value === 'TODOS' ? '' : e.target.value)}
                                        className="input-vercel text-xs"
                                    >
                                        <option value="TODOS">Todos los Roles Institucionales</option>
                                        <option value="DOSIER_DOCENTE">Solo Docentes (DOSIER_DOCENTE)</option>
                                        <option value="DOSIER_COORD_CARRERA">Coordinadores de Carrera (DOSIER_COORD_CARRERA)</option>
                                        <option value="DOSIER_COORD_ACAD">Coordinación Académica (DOSIER_COORD_ACAD)</option>
                                        <option value="DOSIER_VICERRECTOR">Vicerrectorado Académico (DOSIER_VICERRECTOR)</option>
                                        <option value="DOSIER_DOCENTE,DOSIER_COORD_CARRERA">Docentes y Coordinadores de Carrera</option>
                                        <option value="DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR">Equipo Colegiado / Autoridades</option>
                                    </select>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                        Este hito se publicará en el calendario institucional de los roles seleccionados y se sincronizará con sus suscripciones iCal.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Título */}
                    <div className="space-y-1">
                        <label className="section-label mb-1.5 block">Título *</label>
                        <input
                            type="text"
                            required
                            placeholder={formEsNormativo ? "Ej: Plazo de Cierre CACES / Legalización de PEAs" : "Ej: Entrega de PEA - Programación Web"}
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
                                <option value="Reunion">Reunión de Área / Asignatura</option>
                                <option value="Hito">Fecha Límite / Entrega</option>
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
                            <label className="section-label mb-1.5 block">Fecha de Fin</label>
                            <input
                                type="date"
                                value={formFechaFin || ''}
                                onChange={(e) => setFormFechaFin(e.target.value)}
                                className="input-vercel text-sm"
                            />
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
                                placeholder="Ej: 3 (dejar vacío para no recordar)"
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
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-surface border border-border-thin rounded-lg">
                                <input
                                    type="checkbox"
                                    id="recurrencia_anual"
                                    checked={formRecurrenciaAnual}
                                    onChange={(e) => setFormRecurrenciaAnual(e.target.checked)}
                                    className="w-4 h-4 accent-brand cursor-pointer"
                                />
                                <label htmlFor="recurrencia_anual" className="text-sm text-text-main cursor-pointer select-none">
                                    Se repite cada año
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Es Privado */}
                    <div className="flex items-center gap-3 p-4 bg-surface border border-border-thin rounded-lg">
                        <input
                            type="checkbox"
                            id="es_privado"
                            checked={formEsPrivado}
                            onChange={(e) => setFormEsPrivado(e.target.checked)}
                            className="w-5 h-5 border border-border rounded accent-brand cursor-pointer"
                        />
                        <div className="flex flex-col">
                            <label htmlFor="es_privado" className="text-sm font-bold text-text-main cursor-pointer select-none">
                                Evento Privado / Personal
                            </label>
                            <span className="text-[11px] text-text-dim leading-snug">
                                Si está marcado, solo tú podrás ver este evento.
                            </span>
                        </div>
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
