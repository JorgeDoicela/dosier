import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { View, SlotInfo } from 'react-big-calendar';
import { format, startOfWeek, addDays, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/AuthContext';
import { useConfirm } from '../../../api/ConfirmContext';
import { useNotifications } from '../../../api/NotificationsContext';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import {
    getEventos,
    getCarrerasUsuario,
    createEvento,
    createNormativo,
    updateEvento,
    updateNormativo,
    deleteEvento,
    deleteNormativo,
    buildPayload,
    resolveEventUrl,
    CATEGORIAS_CONFIG,
    type CalendarioCarrera,
} from '../../../services/calendarioService';
import type { CalendarEventExtended, Evento } from '../types/calendarioTypes';

export type EventoAlcance = 'personal' | 'carrera' | 'instituto';

export interface SlotMenuState {
    fechaInicio: string;
    fechaFin: string;
    x: number;
    y: number;
}

export const useCalendarioEvents = (fetchStickyNotesRefetch?: () => void) => {
    const { isAdmin, isVicerrector, isCoordAcad } = useAuth();
    const canPublishInstituto = isAdmin || isVicerrector || isCoordAcad;
    const [loading, setLoading] = useState(true);
    const [eventos, setEventos] = useState<CalendarEventExtended[]>([]);
    const [carrerasUsuario, setCarrerasUsuario] = useState<CalendarioCarrera[]>([]);
    const [selectedCarreraId, setSelectedCarreraId] = useState<number | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [view, setView] = useState<View>('month');

    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { showToast } = useNotifications();

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [slotMenuState, setSlotMenuState] = useState<SlotMenuState | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUuid, setEditingUuid] = useState<string | null>(null);

    const [formTitulo, setFormTitulo] = useState('');
    const [formDescripcion, setFormDescripcion] = useState('');
    const [formTipo, setFormTipo] = useState('Personal');
    const [formFechaInicio, setFormFechaInicio] = useState('');
    const [formFechaFin, setFormFechaFin] = useState('');
    const [formEsTodoElDia, setFormEsTodoElDia] = useState(true);
    const [formColorHex, setFormColorHex] = useState('#F59E0B');
    const [formEsPrivado, setFormEsPrivado] = useState(true);
    const [formPrioridad, setFormPrioridad] = useState('Media');
    const [formEstado, setFormEstado] = useState('Pendiente');
    const [formAlertaDias, setFormAlertaDias] = useState<number | ''>('');
    const [formRecurrenciaAnual, setFormRecurrenciaAnual] = useState(false);
    const [formEsNormativo, setFormEsNormativo] = useState(false);
    const [formRolesVisibles, setFormRolesVisibles] = useState<string>('');
    const [formAlcance, setFormAlcance] = useState<EventoAlcance>('personal');
    const [formIdCarrera, setFormIdCarrera] = useState<number | null>(null);

    const aplicarAlcanceDefaults = (alcance: EventoAlcance, carreraIdOverride?: number | null) => {
        setFormAlcance(alcance);
        if (alcance === 'instituto') {
            setFormEsPrivado(false);
            setFormEsNormativo(true);
            setFormIdCarrera(null);
            setFormTipo('Normativo');
            setFormColorHex('#1E3A8A');
            setFormAlertaDias(7);
        } else if (alcance === 'carrera') {
            setFormEsPrivado(false);
            setFormEsNormativo(false);
            const fallbackCarrera = carreraIdOverride ?? selectedCarreraId ?? carrerasUsuario[0]?.id_carrera ?? null;
            setFormIdCarrera(fallbackCarrera);
            setFormTipo('Reunion');
            setFormColorHex('#3B82F6');
            setFormAlertaDias(3);
        } else {
            setFormEsPrivado(true);
            setFormEsNormativo(false);
            setFormIdCarrera(null);
            setFormTipo('Personal');
            setFormColorHex('#F59E0B');
            setFormAlertaDias('');
        }
    };

    const resetForm = (alcanceInicial: EventoAlcance = 'personal') => {
        setFormTitulo('');
        setFormDescripcion('');
        setFormFechaInicio(format(new Date(), 'yyyy-MM-dd'));
        setFormFechaFin(format(new Date(), 'yyyy-MM-dd'));
        setFormEsTodoElDia(true);
        setFormPrioridad('Media');
        setFormEstado('Pendiente');
        setFormRecurrenciaAnual(false);
        setFormRolesVisibles('');
        setIsEditing(false);
        setEditingUuid(null);
        aplicarAlcanceDefaults(alcanceInicial);
    };

    const handleNewEventClick = (alcanceInicial: EventoAlcance = 'personal') => {
        setSlotMenuState(null);
        resetForm(alcanceInicial);
        setIsFormOpen(true);
    };

    const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
        const inicio = format(slotInfo.start, 'yyyy-MM-dd');
        const finRaw = format(slotInfo.end instanceof Date ? addDays(slotInfo.end, -1) : slotInfo.start, 'yyyy-MM-dd');
        const fin = finRaw < inicio ? inicio : finRaw;

        if (carrerasUsuario.length === 0 && !canPublishInstituto) {
            resetForm('personal');
            setFormFechaInicio(inicio);
            setFormFechaFin(fin);
            setIsFormOpen(true);
            return;
        }

        const box = slotInfo.box as { x?: number; y?: number; clientX?: number; clientY?: number } | undefined;
        const bounds = slotInfo.bounds as { left?: number; top?: number } | undefined;
        const rawX = box?.clientX ?? box?.x ?? bounds?.left ?? (window.innerWidth / 2 - 128);
        const rawY = box?.clientY ?? box?.y ?? bounds?.top ?? (window.innerHeight / 2 - 80);
        const x = Math.min(Math.max(12, rawX), Math.max(12, window.innerWidth - 272));
        const y = Math.min(Math.max(12, rawY), Math.max(12, window.innerHeight - 220));

        setSlotMenuState({ fechaInicio: inicio, fechaFin: fin, x, y });
    }, [carrerasUsuario, selectedCarreraId, canPublishInstituto]);

    const handleSelectSlotAlcance = (alcance: EventoAlcance) => {
        if (!slotMenuState) return;
        const { fechaInicio, fechaFin } = slotMenuState;
        setSlotMenuState(null);
        resetForm(alcance);
        setFormFechaInicio(fechaInicio);
        setFormFechaFin(fechaFin);
        setIsFormOpen(true);
    };

    const closeSlotMenu = useCallback(() => {
        setSlotMenuState(null);
    }, []);

    const handleEditEventClick = (ev: Evento) => {
        const isNorm = ev.categoria_global === 'Normativo' && !ev.id_carrera;
        const alcanceActual: EventoAlcance = ev.es_privado
            ? 'personal'
            : (ev.id_carrera ? 'carrera' : 'instituto');
        setFormTitulo(ev.titulo);
        setFormDescripcion(ev.descripcion || '');
        setFormTipo(ev.subcategoria || (isNorm ? 'Normativo' : 'Personal'));
        setFormFechaInicio(ev.fecha_inicio || '');
        setFormFechaFin(ev.fecha_fin || ev.fecha_inicio || '');
        setFormEsTodoElDia(ev.es_todo_el_dia);
        setFormColorHex(ev.color_hex || (isNorm ? '#1E3A8A' : '#F59E0B'));
        setFormEsPrivado(ev.es_privado);
        setFormPrioridad(ev.prioridad || 'Media');
        setFormEstado(ev.estado || 'Pendiente');
        setFormAlertaDias(ev.alerta_dias ?? '');
        setFormRecurrenciaAnual(ev.recurrencia_anual ?? false);
        setFormEsNormativo(alcanceActual === 'instituto');
        setFormAlcance(alcanceActual);
        setFormIdCarrera(ev.id_carrera ?? null);
        setFormRolesVisibles(ev.roles_visibles || '');
        setEditingUuid(ev.uuid);
        setIsEditing(true);
        setIsFormOpen(true);
        setSelectedEvent(null);
    };

    const getFormPayload = () => buildPayload({
        titulo: formTitulo,
        descripcion: formDescripcion,
        tipo: formTipo,
        fechaInicio: formFechaInicio,
        fechaFin: formFechaFin,
        esTodoElDia: formEsTodoElDia,
        colorHex: formColorHex,
        esPrivado: formAlcance === 'personal',
        prioridad: formPrioridad,
        estado: formEstado,
        alertaDias: formAlertaDias,
        recurrenciaAnual: formRecurrenciaAnual,
        rolesVisibles: formRolesVisibles || null,
        idCarrera: formAlcance === 'carrera' ? formIdCarrera : null,
    });

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitulo.trim()) return;
        if (formAlcance === 'carrera' && !formIdCarrera) {
            showToast({
                title: 'Selecciona una carrera',
                body: 'Debes indicar a qué carrera pertenece este evento.',
                type: 'warning',
            });
            return;
        }
        try {
            setLoading(true);
            if (canPublishInstituto && formAlcance === 'instituto') {
                if (isEditing && editingUuid) {
                    await updateNormativo(editingUuid, getFormPayload());
                } else {
                    await createNormativo(getFormPayload());
                }
            } else {
                if (isEditing && editingUuid) {
                    await updateEvento(editingUuid, getFormPayload());
                } else {
                    await createEvento(getFormPayload());
                }
            }
            setIsFormOpen(false);
            fetchEventos(currentDate, selectedCarreraId);
        } catch (error) {
            console.error('Error al guardar evento:', error);
            showToast({
                title: 'No se pudo guardar el evento',
                body: 'Verifica tus permisos o la conexión con el servidor.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (uuid: string) => {
        const isNorm = selectedEvent?.categoria_global === 'Normativo';
        const ok = await confirm({
            title: isNorm ? 'Eliminar Hito Institucional' : 'Eliminar Evento',
            message: isNorm
                ? '¿Está seguro de que desea eliminar este hito normativo institucional?'
                : '¿Está seguro de que desea eliminar este evento/tarea?',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            variant: 'destructive'
        });
        if (!ok) return;

        try {
            setLoading(true);
            if (isAdmin && isNorm) {
                await deleteNormativo(uuid);
            } else {
                await deleteEvento(uuid);
            }
            setSelectedEvent(null);
            fetchEventos(currentDate);
            if (fetchStickyNotesRefetch) fetchStickyNotesRefetch();
        } catch (error) {
            console.error('Error al eliminar evento:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickComplete = async (ev: Evento) => {
        const previousEstado = ev.estado || 'Pendiente';
        const basePayloadFields = {
            titulo: ev.titulo,
            descripcion: ev.descripcion,
            tipo: ev.subcategoria,
            fechaInicio: ev.fecha_inicio,
            fechaFin: ev.fecha_fin || '',
            esTodoElDia: ev.es_todo_el_dia,
            colorHex: ev.color_hex || '#F59E0B',
            esPrivado: ev.es_privado,
            prioridad: ev.prioridad,
            alertaDias: ev.alerta_dias ?? '',
            recurrenciaAnual: ev.recurrencia_anual ?? false,
            urlAccion: ev.url_accion,
        };
        const payload = buildPayload({
            ...basePayloadFields,
            estado: 'Completado',
        });
        try {
            setLoading(true);
            await updateEvento(ev.uuid, payload);
            setSelectedEvent(null);
            fetchEventos(currentDate);
            showToast({
                title: 'Evento completado',
                body: `"${ev.titulo}" fue marcado como completado.`,
                type: 'success',
                onUndo: async () => {
                    const revertPayload = buildPayload({
                        ...basePayloadFields,
                        estado: previousEstado,
                    });
                    await updateEvento(ev.uuid, revertPayload);
                    fetchEventos(currentDate);
                },
            });
        } catch (error) {
            console.error('Error al completar evento de usuario:', error);
            showToast({
                title: 'Error al completar evento',
                body: 'No se pudo actualizar el estado del evento.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
        const ev: Evento = event.resource;
        if (ev.categoria_global !== 'Personal') return;

        const nuevaInicio = format(start as Date, 'yyyy-MM-dd');
        const nuevaFin = format(end as Date, 'yyyy-MM-dd');

        const payload = buildPayload({
            titulo: ev.titulo,
            descripcion: ev.descripcion,
            tipo: ev.subcategoria,
            fechaInicio: nuevaInicio,
            fechaFin: nuevaFin,
            esTodoElDia: ev.es_todo_el_dia,
            colorHex: ev.color_hex || '#F59E0B',
            esPrivado: ev.es_privado,
            prioridad: ev.prioridad,
            estado: ev.estado,
            alertaDias: ev.alerta_dias ?? '',
            recurrenciaAnual: ev.recurrencia_anual ?? false,
            urlAccion: ev.url_accion,
        });

        try {
            await updateEvento(ev.uuid, payload);
            fetchEventos(currentDate);
        } catch (error) {
            console.error('Error al mover evento:', error);
        }
    }, [currentDate]);

    const handleEventResize = useCallback(async ({ event, start, end }: any) => {
        const ev: Evento = event.resource;
        if (ev.categoria_global !== 'Personal') return;

        const nuevaInicio = format(start as Date, 'yyyy-MM-dd');
        const nuevaFin = format(end as Date, 'yyyy-MM-dd');

        const payload = buildPayload({
            titulo: ev.titulo,
            descripcion: ev.descripcion,
            tipo: ev.subcategoria,
            fechaInicio: nuevaInicio,
            fechaFin: nuevaFin,
            esTodoElDia: ev.es_todo_el_dia,
            colorHex: ev.color_hex || '#F59E0B',
            esPrivado: ev.es_privado,
            prioridad: ev.prioridad,
            estado: ev.estado,
            alertaDias: ev.alerta_dias ?? '',
            recurrenciaAnual: ev.recurrencia_anual ?? false,
            urlAccion: ev.url_accion,
        });
        try {
            await updateEvento(ev.uuid, payload);
            fetchEventos(currentDate);
        } catch (error) {
            console.error('Error al redimensionar evento:', error);
        }
    }, [currentDate]);

    useEffect(() => {
        getCarrerasUsuario()
            .then(data => setCarrerasUsuario(data || []))
            .catch(() => setCarrerasUsuario([]));
    }, []);

    const fetchEventos = useCallback(async (date: Date, carreraId: number | null = selectedCarreraId) => {
        try {
            setLoading(true);
            const raw = await getEventos(date, carreraId);
            const parsed: CalendarEventExtended[] = raw
                .filter(ev => Boolean(ev.fecha_inicio || (ev as any).fechaInicio))
                .map((ev) => {
                    const fInicio = (ev.fecha_inicio || (ev as any).fechaInicio) as string;
                    const fFin = (ev.fecha_fin || (ev as any).fechaFin) as string | null;
                    const [yI, mI, dI] = fInicio.split('-').map(Number);
                    const start = new Date(yI, mI - 1, dI);
                    let end = start;
                    if (fFin) {
                        const [yF, mF, dF] = fFin.split('-').map(Number);
                        end = new Date(yF, mF - 1, dF);
                    }
                    const normalizedResource: Evento = {
                        ...ev,
                        categoria_global: ev.categoria_global || (ev as any).categoriaGlobal || 'Personal',
                        subcategoria: ev.subcategoria || (ev as any).subcategoria || 'General',
                        fecha_inicio: fInicio,
                        fecha_fin: fFin,
                        es_todo_el_dia: ev.es_todo_el_dia ?? (ev as any).esTodoElDia ?? true,
                        color_hex: ev.color_hex || (ev as any).colorHex || null,
                        url_accion: ev.url_accion || (ev as any).urlAccion || null,
                    };
                    return {
                        title: ev.titulo,
                        start,
                        end,
                        allDay: normalizedResource.es_todo_el_dia,
                        resource: normalizedResource
                    };
                });
            setEventos(parsed);
        } catch (error) {
            console.error('Error al cargar eventos del calendario:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCarreraId]);

    useEffect(() => {
        fetchEventos(currentDate, selectedCarreraId);
    }, [currentDate, selectedCarreraId, fetchEventos]);

    useRealtimeSync({
        onSync: () => fetchEventos(currentDate, selectedCarreraId),
        events: ['dosier-projects-changed'],
        intervalMs: 0,
    });

    const handleNavigate = (newDate: Date) => setCurrentDate(newDate);
    const handleSelectEvent = (event: CalendarEventExtended) => setSelectedEvent(event.resource);

    const handleGoToEventAction = (ev: Evento) => {
        setSelectedEvent(null);
        const targetUrl = resolveEventUrl(ev, isAdmin);
        if (targetUrl) {
            if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                window.open(targetUrl, '_blank');
            } else {
                navigate(targetUrl);
            }
        }
    };

    const eventCountsByDate = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const ev of eventos) {
            const dateStr = ev.resource?.fecha_inicio;
            if (dateStr) {
                counts[dateStr] = (counts[dateStr] || 0) + 1;
            }
        }
        return counts;
    }, [eventos]);

    const eventStyleGetter = (event: CalendarEventExtended) => {
        const ev = event.resource;
        const isCompleted = ev.estado === 'Completado';
        const color = ev.color_hex || CATEGORIAS_CONFIG[ev.categoria_global]?.color || '#6B7280';
        const dateStr = ev.fecha_inicio;
        const countOnDay = (dateStr && eventCountsByDate[dateStr]) || 1;
        const isSpacious = countOnDay <= 2;

        return {
            className: isSpacious ? 'rbc-event-spacious' : 'rbc-event-compact',
            style: {
                backgroundColor: isCompleted ? 'transparent' : color,
                borderRadius: isSpacious ? '8px' : '6px',
                opacity: 1,
                color: isCompleted ? color : '#ffffff',
                border: isCompleted ? `1.5px solid ${color}` : '0px',
                display: 'block',
                fontSize: isSpacious ? '12.5px' : '11.5px',
                padding: isSpacious ? '6px 10px' : '2.5px 7px',
                minHeight: isSpacious ? '32px' : '22px',
                fontWeight: isSpacious ? '600' : '500',
                transition: 'all 0.15s ease',
                textDecoration: isCompleted ? 'line-through' : 'none',
                boxShadow: isSpacious ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
            }
        };
    };

    const filteredEventos = eventos;

    const hoy = startOfDay(new Date());
    const proximosEventos = [...eventos]
        .filter(ev => isAfter(ev.start as Date, hoy) || format(ev.start as Date, 'yyyy-MM-dd') === format(hoy, 'yyyy-MM-dd'))
        .sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime())
        .slice(0, 7);

    const isDraggable = (event: object) => {
        return (event as CalendarEventExtended).resource?.categoria_global === 'Personal';
    };

    const handleNavigateClick = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        let newDate = new Date(currentDate);
        if (action === 'TODAY') {
            newDate = new Date();
        } else {
            const multiplier = action === 'PREV' ? -1 : 1;
            if (view === 'month') {
                newDate.setMonth(newDate.getMonth() + multiplier);
            } else if (view === 'week') {
                newDate.setDate(newDate.getDate() + (7 * multiplier));
            } else if (view === 'day') {
                newDate.setDate(newDate.getDate() + multiplier);
            } else if (view === 'agenda') {
                newDate.setMonth(newDate.getMonth() + multiplier);
            }
        }
        setCurrentDate(newDate);
    };

    const getLabelFecha = () => {
        if (view === 'month') {
            return format(currentDate, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase());
        }
        if (view === 'day') {
            return format(currentDate, "d 'de' MMMM", { locale: es });
        }
        if (view === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = addDays(start, 6);
            return `${format(start, 'd MMM')} - ${format(end, 'd MMM')}`;
        }
        return format(currentDate, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase());
    };

    return {
        loading,
        setLoading,
        eventos,
        setEventos,
        currentDate,
        setCurrentDate,
        view,
        setView,
        filteredEventos,
        proximosEventos,
        selectedEvent,
        setSelectedEvent,
        isFormOpen,
        setIsFormOpen,
        isEditing,
        editingUuid,
        formTitulo,
        setFormTitulo,
        formDescripcion,
        setFormDescripcion,
        formTipo,
        setFormTipo,
        formFechaInicio,
        setFormFechaInicio,
        formFechaFin,
        setFormFechaFin,
        formEsTodoElDia,
        setFormEsTodoElDia,
        formColorHex,
        setFormColorHex,
        formEsPrivado,
        setFormEsPrivado,
        formPrioridad,
        setFormPrioridad,
        formEstado,
        setFormEstado,
        formAlertaDias,
        setFormAlertaDias,
        formRecurrenciaAnual,
        setFormRecurrenciaAnual,
        formEsNormativo,
        setFormEsNormativo,
        formRolesVisibles,
        setFormRolesVisibles,
        formAlcance,
        setFormAlcance,
        aplicarAlcanceDefaults,
        formIdCarrera,
        setFormIdCarrera,
        carrerasUsuario,
        selectedCarreraId,
        setSelectedCarreraId,
        canPublishInstituto,
        slotMenuState,
        closeSlotMenu,
        handleSelectSlotAlcance,
        resetForm,
        handleNewEventClick,
        handleSelectSlot,
        handleEditEventClick,
        handleSaveEvent,
        handleDeleteEvent,
        handleQuickComplete,
        handleEventDrop,
        handleEventResize,
        fetchEventos,
        handleNavigate,
        handleSelectEvent,
        handleGoToEventAction,
        eventStyleGetter,
        isDraggable,
        handleNavigateClick,
        getLabelFecha,
    };
};
