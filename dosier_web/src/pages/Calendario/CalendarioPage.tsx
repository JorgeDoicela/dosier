import React, { useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './CalendarioPage.css';
import { PageHeader } from '../../components/Common/PageHeader';

import { CalendarioSidebar } from './components/CalendarioSidebar';
import { CalendarioHeader } from './components/CalendarioHeader';
import { CalendarView } from './components/CalendarView';
import { KanbanView } from './components/KanbanView';
import { InboxView } from './components/InboxView';
import { EventoFormDrawer } from './components/EventoFormDrawer';
import { EventoDetailDrawer } from './components/EventoDetailDrawer';
import { PlanificacionPopover } from './components/PlanificacionPopover';
import { EventoAlcanceMenu } from './components/EventoAlcanceMenu';

import { useCalendarioEvents } from './hooks/useCalendarioEvents';
import { useStickyNotes } from './hooks/useStickyNotes';
import { useKanbanOrchestration } from './hooks/useKanbanOrchestration';

export const CalendarioPage: React.FC = () => {
    // 1. Hook de Notas Adhesivas (Inbox)
    const {
        stickyNotes,
        setStickyNotes,
        fetchStickyNotes,
        searchQuery,
        setSearchQuery,
        selectedFilterContext,
        setSelectedFilterContext,
        selectedFilterColor,
        setSelectedFilterColor,
        draggedNoteIndex,
        draggedNote,
        draggedSize,
        dragPreviewRef,
        handleInboxPointerDown,
        handleInboxPointerMove,
        handleInboxPointerUp,
        handleGlobalDragEnd: handleGlobalDragEndFromNotes,
        handleDeleteStickyNote,
        handleQuickPriorityChange,
        handleQuickColorChange,
    } = useStickyNotes();

    // 3. Hook de Eventos de Calendario
    const {
        loading,
        eventos,
        setEventos,
        currentDate,
        view,
        setView,
        filteredEventos,
        proximosEventos,
        selectedEvent,
        setSelectedEvent,
        isFormOpen,
        setIsFormOpen,
        isEditing,
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
        formEsNormativo,
        setFormEsNormativo,
        formRolesVisibles,
        setFormRolesVisibles,
        formAlcance,
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
    } = useCalendarioEvents(fetchStickyNotes);

    // 4. Hook de Orquestación Kanban y Asignación
    const {
        viewMode,
        setViewMode,
        draggingUuid,
        dragOverColumn,
        setDragOverColumn,
        planificando,
        setPlanificando,
        draggingType,
        setDraggingUuid,
        setDraggingType,
        handleNoteDragStart,
        handleDragStart,
        handleGlobalDragEnd,
        handleDragOver,
        handleDrop,
        handleConfirmPlanificacion,
        handleDevolverAInbox,
        handleDropNoteOnCalendar,
        dragFromOutsideItem,
    } = useKanbanOrchestration({
        eventos,
        setEventos,
        stickyNotes,
        setStickyNotes,
        fetchStickyNotes,
        fetchEventos,
        currentDate,
        handleGlobalDragEndFromNotes,
    });

    const slotMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!slotMenuState) return;
        const handleOutside = (e: MouseEvent) => {
            if (slotMenuRef.current && !slotMenuRef.current.contains(e.target as Node)) {
                closeSlotMenu();
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeSlotMenu();
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [slotMenuState, closeSlotMenu]);

    return (
        <main className="flex-1 bg-[#f8fafc] dark:bg-[#0b0d11] p-6 md:p-8 flex flex-col h-[calc(100vh-56px)] overflow-hidden font-sans gap-6">
            <PageHeader
                kicker="Planificación y Seguimiento Curricular"
                icon={Calendar}
                title="Calendario de Actividades e Hitos PEA"
                description="Planificación docente, plazos normativos CACES y seguimiento del ciclo de vida curricular del PEA por rol."
                className="mb-0"
            />

            {/* Contenedor principal */}
            <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
                <CalendarioSidebar
                    viewMode={viewMode}
                    stickyNotes={stickyNotes}
                    draggingUuid={draggingUuid}
                    draggingType={draggingType}
                    onDropEventToInbox={handleDevolverAInbox}
                    handleNoteDragStart={handleNoteDragStart}
                    handleGlobalDragEnd={handleGlobalDragEnd}
                    handleEditEventClick={handleEditEventClick}
                    handleDeleteStickyNote={(uuid) => handleDeleteStickyNote(uuid)}
                    proximosEventos={proximosEventos}
                    setSelectedEvent={setSelectedEvent}
                    handleDevolverAInbox={handleDevolverAInbox}
                />

                <div className={`calendario-main ${loading ? 'calendario-loading' : ''}`}>
                    <CalendarioHeader
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        view={view}
                        setView={setView}
                        handleNavigateClick={handleNavigateClick}
                        getLabelFecha={getLabelFecha}
                        handleNewEventClick={handleNewEventClick}
                        carrerasUsuario={carrerasUsuario}
                        selectedCarreraId={selectedCarreraId}
                        setSelectedCarreraId={setSelectedCarreraId}
                        canPublishInstituto={canPublishInstituto}
                    />

                    {viewMode === 'calendar' ? (
                        <CalendarView
                            view={view}
                            setView={setView}
                            currentDate={currentDate}
                            filteredEventos={filteredEventos}
                            handleSelectEvent={handleSelectEvent}
                            handleSelectSlot={handleSelectSlot}
                            handleNavigate={handleNavigate}
                            eventStyleGetter={eventStyleGetter}
                            handleEventDrop={handleEventDrop}
                            handleEventResize={handleEventResize}
                            isDraggable={isDraggable}
                            onDropFromOutside={handleDropNoteOnCalendar}
                            dragFromOutsideItem={dragFromOutsideItem}
                            selectedSlotRange={slotMenuState ? { fechaInicio: slotMenuState.fechaInicio, fechaFin: slotMenuState.fechaFin } : null}
                            onCalendarEventDragStart={(uuid) => {
                                setDraggingUuid(uuid);
                                setDraggingType('kanban');
                                document.body.classList.add('body-dragging-active');
                            }}
                        />
                    ) : viewMode === 'kanban' ? (
                        <KanbanView
                            filteredEventos={filteredEventos}
                            dragOverColumn={dragOverColumn}
                            draggingUuid={draggingUuid}
                            handleDragOver={handleDragOver}
                            setDragOverColumn={setDragOverColumn}
                            handleDrop={handleDrop}
                            handleDragStart={handleDragStart}
                            handleGlobalDragEnd={handleGlobalDragEnd}
                            setSelectedEvent={setSelectedEvent}
                            handleQuickComplete={handleQuickComplete}
                            handleDevolverAInbox={handleDevolverAInbox}
                            handleEditEventClick={handleEditEventClick}
                            handleDeleteEvent={handleDeleteEvent}
                            handleGoToEventAction={handleGoToEventAction}
                        />
                    ) : (
                        <InboxView
                            stickyNotes={stickyNotes}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedFilterContext={selectedFilterContext}
                            setSelectedFilterContext={setSelectedFilterContext}
                            selectedFilterColor={selectedFilterColor}
                            setSelectedFilterColor={setSelectedFilterColor}
                            draggedNoteIndex={draggedNoteIndex}
                            draggedNote={draggedNote}
                            draggedSize={draggedSize}
                            dragPreviewRef={dragPreviewRef}
                            handleInboxPointerDown={handleInboxPointerDown}
                            handleInboxPointerMove={handleInboxPointerMove}
                            handleInboxPointerUp={handleInboxPointerUp}
                            setPlanificando={setPlanificando}
                            handleEditEventClick={handleEditEventClick}
                            handleDeleteStickyNote={(uuid) => handleDeleteStickyNote(uuid)}
                            handleQuickPriorityChange={handleQuickPriorityChange}
                            handleQuickColorChange={handleQuickColorChange}
                        />
                    )}
                </div>
            </div>

            {/* Event Detail Drawer */}
            <EventoDetailDrawer
                selectedEvent={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                handleQuickComplete={handleQuickComplete}
                handleEditEventClick={handleEditEventClick}
                handleDeleteEvent={handleDeleteEvent}
                handleGoToEventAction={handleGoToEventAction}
                handleDevolverAInbox={handleDevolverAInbox}
            />

            {/* Event Form Drawer */}
            <EventoFormDrawer
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                isEditing={isEditing}
                handleSaveEvent={handleSaveEvent}
                formTitulo={formTitulo}
                setFormTitulo={setFormTitulo}
                formDescripcion={formDescripcion}
                setFormDescripcion={setFormDescripcion}
                formTipo={formTipo}
                setFormTipo={setFormTipo}
                formColorHex={formColorHex}
                setFormColorHex={setFormColorHex}
                formFechaInicio={formFechaInicio}
                setFormFechaInicio={setFormFechaInicio}
                formFechaFin={formFechaFin}
                setFormFechaFin={setFormFechaFin}
                formPrioridad={formPrioridad}
                setFormPrioridad={setFormPrioridad}
                formEstado={formEstado}
                setFormEstado={setFormEstado}
                formAlertaDias={formAlertaDias}
                setFormAlertaDias={setFormAlertaDias}
                formRecurrenciaAnual={formRecurrenciaAnual}
                setFormRecurrenciaAnual={setFormRecurrenciaAnual}
                formEsPrivado={formEsPrivado}
                setFormEsPrivado={setFormEsPrivado}
                formEsNormativo={formEsNormativo}
                setFormEsNormativo={setFormEsNormativo}
                formRolesVisibles={formRolesVisibles}
                setFormRolesVisibles={setFormRolesVisibles}
                formAlcance={formAlcance}
                aplicarAlcanceDefaults={aplicarAlcanceDefaults}
                formIdCarrera={formIdCarrera}
                setFormIdCarrera={setFormIdCarrera}
                carrerasUsuario={carrerasUsuario}
                canPublishInstituto={canPublishInstituto}
            />

            {/* Popover de Planificación */}
            <PlanificacionPopover
                planificando={planificando}
                onClose={() => setPlanificando(null)}
                handleConfirmPlanificacion={handleConfirmPlanificacion}
            />

            {/* Menú contextual de alcance al presionar un día del calendario */}
            {slotMenuState && (
                <div
                    ref={slotMenuRef}
                    style={{ position: 'fixed', top: slotMenuState.y, left: slotMenuState.x, zIndex: 60 }}
                >
                    <EventoAlcanceMenu
                        showCarrera={carrerasUsuario.length > 0}
                        canPublishInstituto={canPublishInstituto}
                        onSelect={handleSelectSlotAlcance}
                    />
                </div>
            )}
        </main>
    );
};
