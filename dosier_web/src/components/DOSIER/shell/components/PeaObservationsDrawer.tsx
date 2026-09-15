import React, { useState, useEffect } from 'react';
import {
    X,
    MessageSquare,
    CheckCircle2,
    Send,
    UserCheck,
    Shield,
    Loader2,
    CornerDownRight
} from 'lucide-react';

import {
    getObservacionesPea,
    agregarObservacionPea,
    subsanarObservacionPea,
    type PeaObservacionDto
} from '../../../../services/peaService';
import { useNotifications } from '../../../../api/NotificationsContext';
import { useAuth } from '../../../../api/AuthContext';

export interface PeaObservationsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    peaId: number;
    activeSectionKey?: string;
    onObservationChanged?: () => void;
}

const SECCIONES_PEA = [
    { key: 'General', label: 'a) Datos Generales y Carga Horaria' },
    { key: 'Caracterizacion', label: 'b-c) Objetivo y Prerrequisitos' },
    { key: 'Competencias', label: 'd-e) Resultados de Aprendizaje (RDA)' },
    { key: 'Contenidos', label: 'f) Contenidos de Enseñanza y Horas' },
    { key: 'Metodologia', label: 'g) Metodología y Recursos' },
    { key: 'Practicas', label: 'h) Actividades Prácticas (APE)' },
    { key: 'Evaluacion', label: 'i) Matriz de Evaluación' },
    { key: 'Bibliografia', label: 'j) Bibliografía APA 7ma' },
    { key: 'Firmas', label: 'k) Firmas de Responsabilidad' }
];

export const PeaObservationsDrawer: React.FC<PeaObservationsDrawerProps> = ({
    isOpen,
    onClose,
    peaId,
    activeSectionKey = 'General',
    onObservationChanged
}) => {
    const { addToast } = useNotifications();
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector, isDocente } = useAuth();

    const [observaciones, setObservaciones] = useState<PeaObservacionDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>(activeSectionKey);
    const [nuevoTexto, setNuevoTexto] = useState<string>('');
    const [enviando, setEnviando] = useState<boolean>(false);

    // Estado para respuesta docente a una observación
    const [subsanandoId, setSubsanandoId] = useState<number | null>(null);
    const [respuestaDocente, setRespuestaDocente] = useState<string>('');
    const [guardandoSubsanacion, setGuardandoSubsanacion] = useState<boolean>(false);

    const puedeFormularObservacion = isAdmin || isCoordCarrera || isCoordAcad || isVicerrector;

    const cargarObservaciones = async () => {
        if (!peaId || peaId <= 0) return;
        setLoading(true);
        try {
            const data = await getObservacionesPea(peaId);
            setObservaciones(data);
        } catch (err) {
            console.error('[DOSIER] Error al cargar observaciones:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && peaId > 0) {
            cargarObservaciones();
        }
    }, [isOpen, peaId]);

    const handleCrearObservacion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoTexto.trim() || !peaId) return;

        setEnviando(true);
        try {
            const rolObservador = isVicerrector ? 'Vicerrector' :
                                  isCoordAcad ? 'CoordinadorAcademico' :
                                  isCoordCarrera ? 'CoordinadorCarrera' : 'Administrador';

            await agregarObservacionPea(peaId, {
                rolObservador,
                seccionAfectada: seccionSeleccionada,
                texto: nuevoTexto.trim()
            });

            addToast('Observación Registrada', 'La observación ha sido vinculada al PEA y el documento pasó a estado Observado.', 'success');
            setNuevoTexto('');
            await cargarObservaciones();
            onObservationChanged?.();
        } catch (err: any) {
            console.error('[DOSIER] Error al registrar observación:', err);
            addToast('Error', err.response?.data?.message || 'No se pudo registrar la observación.', 'error');
        } finally {
            setEnviando(false);
        }
    };

    const handleSubsanar = async (idObservacion: number) => {
        if (!respuestaDocente.trim()) {
            addToast('Requerido', 'Por favor describa las modificaciones o justificación pedagógica realizada.', 'warning');
            return;
        }

        setGuardandoSubsanacion(true);
        try {
            await subsanarObservacionPea(idObservacion, respuestaDocente.trim());
            addToast('Observación Subsanada', 'El requerimiento fue marcado como subsanado exitosamente.', 'success');
            setSubsanandoId(null);
            setRespuestaDocente('');
            await cargarObservaciones();
            onObservationChanged?.();
        } catch (err: any) {
            console.error('[DOSIER] Error al subsanar observación:', err);
            addToast('Error', err.response?.data?.message || 'No se pudo guardar la subsanación.', 'error');
        } finally {
            setGuardandoSubsanacion(false);
        }
    };

    if (!isOpen) return null;

    const pendientes = observaciones.filter(o => o.estado === 'Pendiente');
    const subsanadas = observaciones.filter(o => o.estado === 'Subsanada');

    return (
        <div className="fixed inset-0 z-[200] flex justify-end animate-fade-in">
            {/* Backdrop sólido con opacidad institucional (estándar modal) */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/50 transition-opacity"
            />

            {/* Panel lateral deslizable con fondo 100% SÓLIDO */}
            <aside className="relative w-full max-w-lg bg-surface dark:bg-zinc-950 border-l border-border-thin shadow-2xl h-full flex flex-col z-10 animate-slide-left">
                {/* ── Header del Drawer ── */}
                <div className="p-4 border-b border-border-thin flex items-center justify-between bg-surface dark:bg-zinc-950">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <MessageSquare size={16} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-tight text-text-main">
                                Observaciones Curriculares
                            </h3>
                            <p className="text-[10px] text-text-dim">
                                {pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'} • {subsanadas.length} subsanada{subsanadas.length === 1 ? '' : 's'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-text-dim hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                        title="Cerrar panel"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── Contenido de Observaciones (Scrollable) ── */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="py-12 text-center text-xs text-text-dim flex flex-col items-center gap-2">
                            <Loader2 size={20} className="animate-spin text-brand" />
                            <span>Consultando registro de observaciones...</span>
                        </div>
                    ) : observaciones.length === 0 ? (
                        <div className="py-12 text-center text-xs text-text-dim border border-dashed border-border-thin rounded-xl p-6 space-y-1">
                            <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                            <p className="font-semibold text-text-main">Sin observaciones registradas</p>
                            <p className="text-[11px]">El Programa de Estudio no tiene requerimientos ni observaciones pendientes.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {observaciones.map(obs => {
                                const esPendiente = obs.estado === 'Pendiente';
                                const estaEditandoRespuesta = subsanandoId === obs.idObservacion;

                                return (
                                    <div
                                        key={obs.idObservacion || obs.uuid}
                                        className={`p-3.5 rounded-xl border transition-colors ${
                                            esPendiente
                                                ? 'bg-amber-500/5 border-amber-500/30'
                                                : 'bg-emerald-500/5 border-emerald-500/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                                            <span className="font-semibold text-text-main flex items-center gap-1.5">
                                                <UserCheck size={12} className="text-text-dim" />
                                                {obs.nombreObservador || obs.rolObservador || 'Comisión Revisora'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                                                esPendiente
                                                    ? 'badge-vercel-warning'
                                                    : 'badge-vercel-success'
                                            }`}>
                                                {obs.estado}
                                            </span>
                                        </div>

                                        <div className="text-[10.5px] text-text-dim mb-2 font-mono">
                                            Sección: <strong className="text-text-main">{obs.seccionAfectada}</strong>
                                        </div>

                                        <p className="text-xs text-text-main leading-relaxed bg-surface/80 p-2.5 rounded-lg border border-border-thin">
                                            {obs.textoObservacion}
                                        </p>

                                        {/* Respuesta Docente ya registrada */}
                                        {obs.respuestaDocente && (
                                            <div className="mt-2.5 pt-2 border-t border-border-thin text-xs space-y-1">
                                                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                    <CornerDownRight size={11} />
                                                    <span>Subsanación Registrada por Docente:</span>
                                                </div>
                                                <p className="text-[11px] text-text-main/90 italic pl-3 border-l-2 border-emerald-500">
                                                    "{obs.respuestaDocente}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Acción de subsanar para docente */}
                                        {esPendiente && (isDocente || isAdmin) && (
                                            <div className="mt-3 pt-2 border-t border-border-thin">
                                                {estaEditandoRespuesta ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={respuestaDocente}
                                                            onChange={e => setRespuestaDocente(e.target.value)}
                                                            placeholder="Describa el ajuste pedagógico o la justificación realizada..."
                                                            rows={2}
                                                            className="input-vercel !p-2 !text-xs w-full resize-none"
                                                        />
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSubsanandoId(null);
                                                                    setRespuestaDocente('');
                                                                }}
                                                                className="btn-vercel-secondary !py-1 !px-2.5 !text-[11px]"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={guardandoSubsanacion || !respuestaDocente.trim()}
                                                                onClick={() => handleSubsanar(obs.idObservacion)}
                                                                className="btn-vercel-primary !py-1 !px-3 !text-[11px] flex items-center gap-1"
                                                            >
                                                                {guardandoSubsanacion ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                                                                <span>Confirmar Subsanación</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSubsanandoId(obs.idObservacion);
                                                            setRespuestaDocente('');
                                                        }}
                                                        className="text-[11px] font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Send size={11} />
                                                        <span>Subsanar este requerimiento</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Formulario de Nueva Observación (Solo Autoridades) ── */}
                {puedeFormularObservacion && (
                    <form onSubmit={handleCrearObservacion} className="p-4 border-t border-border-thin bg-surface dark:bg-zinc-950 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-text-main flex items-center gap-1">
                                <Shield size={12} className="text-brand" />
                                Formular Nueva Observación
                            </span>
                            <select
                                value={seccionSeleccionada}
                                onChange={e => setSeccionSeleccionada(e.target.value)}
                                className="input-vercel !py-1 !px-2 !text-[10.5px] max-w-[200px]"
                            >
                                {SECCIONES_PEA.map(sec => (
                                    <option key={sec.key} value={sec.key}>{sec.label}</option>
                                ))}
                            </select>
                        </div>

                        <textarea
                            value={nuevoTexto}
                            onChange={e => setNuevoTexto(e.target.value)}
                            placeholder="Describa el requerimiento disciplinar o metodológico que el docente debe corregir..."
                            rows={3}
                            className="input-vercel !p-2.5 !text-xs w-full resize-none"
                            required
                        />

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={enviando || !nuevoTexto.trim()}
                                className="btn-vercel-primary h-8 px-3.5 flex items-center gap-1.5 text-xs rounded-lg font-semibold cursor-pointer"
                            >
                                {enviando ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                <span>Registrar y Devolver PEA</span>
                            </button>
                        </div>
                    </form>
                )}
            </aside>
        </div>
    );
};
