import React from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare } from 'lucide-react';
import { ObservationsSidebar } from './Revision/components/ObservationsSidebar';
import { InteractiveSections } from './Revision/components/InteractiveSections';
import { FullscreenLoader } from '../../components/Common/FullscreenLoader';
import { useRevisionTecnica } from './Revision/hooks/useRevisionTecnica';
import { RevisionHeader } from './Revision/components/RevisionHeader';
import { SectionsSidebar } from './Revision/components/SectionsSidebar';
import { FloatingSidebarButtons } from './Revision/components/FloatingSidebarButtons';
import { FinalizeAuditModal } from './Revision/components/FinalizeAuditModal';
import { AdminRevisionHistoryPanel } from './Revision/components/AdminRevisionHistoryPanel';
import { useAuth } from '../../api/AuthContext';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER — Dominio Curricular: Revisión Disciplinar y Metodológica del PEA
 * ══════════════════════════════════════════════════════════════════════════════
 * Espacio interactivo de auditoría técnica y revisión de observaciones de las 11
 * secciones normativas del PEA antes de la emisión de avales institucionales.
 */
export const RevisionCurricularPage: React.FC = () => {
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const {
        projectUuid,
        layout,
        commentsState,
        data,
        getSafeArray,
        getFieldCardClasses,
        renderFieldStatusBadge,
        handleNavigateBack
    } = useRevisionTecnica();

    const isAuthority = isAdmin || isCoordCarrera || isCoordAcad || isVicerrector;
    const isAuditActive = isAuthority &&
        (data.project?.status === 'Enviado' || data.project?.status === 'EnRevision' || data.project?.status === 'En Corrección' || data.project?.status === 'Observado');
    const isReadonlyResult = !isAuditActive;

    if (data.loading || !data.project) {
        return <FullscreenLoader message="Cargando revisión curricular del PEA..." />;
    }

    const renderCommentButton = (fieldKey: string, _fieldName: string) => {
        const hasComment = commentsState.comments[fieldKey] && commentsState.comments[fieldKey].length > 0;
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    layout.setActiveCommentField(fieldKey);
                    layout.setIsRightSidebarOpen(true);
                }}
                className={`flex items-center gap-1 p-1 rounded-lg border transition-all active:scale-95 shrink-0 cursor-pointer ${hasComment
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10'
                    : 'border-transparent text-text-dim/40 hover:text-text-main hover:bg-surface-hover'
                    }`}
                title={hasComment ? 'Ver observación registrada' : 'Agregar observación contextual'}
            >
                <MessageSquare size={13} className={hasComment ? 'fill-amber-500/5 text-amber-500' : ''} />
                {hasComment && (
                    <span className="text-[8px] font-mono font-bold leading-none bg-amber-500 text-bg-deep px-1 py-0.5 rounded-full">
                        !
                    </span>
                )}
            </button>
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-bg-deep overflow-hidden selection:bg-text-main selection:text-bg-deep transition-colors duration-300 font-sans">
            {/* Header de la Página */}
            <RevisionHeader
                projectTitle={data.project.title}
                projectUuid={projectUuid}
                projectStatus={data.project.status}
                viewMode={layout.viewMode}
                setViewMode={layout.setViewMode}
                onNavigateBack={handleNavigateBack}
                onOpenFinalizeModal={() => layout.setIsFinalizeModalOpen(true)}
                isReadonly={isReadonlyResult}
                pdfUrl={data.pdfUrl}
            />

            {/* Layout Principal */}
            <div className="flex-1 flex overflow-hidden relative">
                {layout.viewMode === 'history' ? (
                    /* ── VISTA DE HISTORIAL Y DICTAMEN OFICIAL ── */
                    <div className="flex-1 h-full bg-bg-deep overflow-hidden">
                        <AdminRevisionHistoryPanel projectUuid={projectUuid ?? ''} />
                    </div>
                ) : (
                    /* ── VISTA DE DOCUMENTO (INTERACTIVA O PDF) CON PANELES LATERALES ── */
                    <div className="flex-1 h-full bg-bg-deep flex overflow-hidden relative">
                        {/* Panel Izquierdo: Secciones (en modo interactivo) */}
                        {layout.viewMode === 'interactive' && (
                            <SectionsSidebar
                                isOpen={layout.isLeftSidebarOpen}
                                width={layout.leftSidebarWidth}
                                isDraggingLeft={layout.isDraggingLeft}
                                leftSidebarRef={layout.leftSidebarRef}
                                activeSection={layout.activeSection}
                                setActiveSection={layout.setActiveSection}
                                onClose={() => layout.setIsLeftSidebarOpen(false)}
                                startDraggingLeft={layout.startDraggingLeft}
                                comments={commentsState.comments}
                                templateBlocks={data.templateBlocks}
                            />
                        )}

                        {/* Botón flotante para reabrir Panel Izquierdo */}
                        <FloatingSidebarButtons
                            isLeftSidebarOpen={layout.isLeftSidebarOpen}
                            isRightSidebarOpen={layout.isRightSidebarOpen}
                            viewMode={layout.viewMode}
                            onOpenLeft={() => layout.setIsLeftSidebarOpen(true)}
                            onOpenRight={() => layout.setIsRightSidebarOpen(true)}
                        />

                        {/* Contenido Central: Vista Interactiva o Visor PDF */}
                        <main className="flex-1 h-full overflow-y-auto bg-bg-deep relative">
                            {layout.viewMode === 'interactive' ? (
                                <InteractiveSections
                                    activeSection={layout.activeSection}
                                    project={data.project}
                                    investigadores={data.investigadores}
                                    docSnapshot={data.docSnapshot}
                                    templateBlocks={data.templateBlocks}
                                    isLeftSidebarOpen={layout.isLeftSidebarOpen}
                                    setIsLeftSidebarOpen={layout.setIsLeftSidebarOpen}
                                    isHoursOk={data.isHoursOk}
                                    teachersWithExceedingHours={data.teachersWithExceedingHours}
                                    getFieldCardClasses={getFieldCardClasses}
                                    renderFieldStatusBadge={renderFieldStatusBadge}
                                    renderCommentButton={renderCommentButton}
                                    setActiveCommentField={layout.setActiveCommentField}
                                    setIsRightSidebarOpen={layout.setIsRightSidebarOpen}
                                    getSafeArray={getSafeArray}
                                />
                            ) : (
                                <div className="h-full flex flex-col bg-bg-deep">
                                    {data.loadingPdf ? (
                                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                            <div className="w-6 h-6 border-2 border-text-dim border-t-text-main rounded-full animate-spin" />
                                            <p className="text-xs text-text-dim">Cargando visualización del documento...</p>
                                        </div>
                                    ) : data.pdfUrl ? (
                                        <iframe
                                            src={`${data.pdfUrl}#toolbar=1&navpanes=0`}
                                            className="w-full h-full border-none"
                                            title="Previsualización del Documento"
                                        />
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-dim">
                                            <p className="text-sm">No se pudo cargar la vista previa del documento.</p>
                                            <button
                                                onClick={() => layout.setViewMode('interactive')}
                                                className="btn-vercel-secondary text-xs px-3 py-1.5 rounded-lg"
                                            >
                                                Volver a la vista interactiva
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </main>

                        {/* Panel Derecho: Observaciones */}
                        <ObservationsSidebar
                            isOpen={layout.isRightSidebarOpen}
                            width={layout.rightSidebarWidth}
                            isDraggingRight={layout.isDraggingRight}
                            rightSidebarRef={layout.rightSidebarRef}
                            activeCommentField={layout.activeCommentField}
                            comments={commentsState.comments}
                            contextualInput={commentsState.contextualInput}
                            isReadonly={isReadonlyResult}
                            onClose={() => layout.setIsRightSidebarOpen(false)}
                            startDraggingRight={layout.startDraggingRight}
                            setActiveCommentField={layout.setActiveCommentField}
                            setContextualInput={commentsState.setContextualInput}
                            handleAddContextualComment={commentsState.handleAddContextualComment}
                            handleDeleteComment={commentsState.handleDeleteComment}
                        />
                    </div>
                )}
            </div>

            {/* Modal de Dictamen / Finalización */}
            <FinalizeAuditModal
                isOpen={layout.isFinalizeModalOpen}
                totalCommentsCount={commentsState.totalCommentsCount}
                submitting={data.submitting}
                auditVerdict={layout.auditVerdict}
                auditNotes={layout.auditNotes}
                setAuditVerdict={layout.setAuditVerdict}
                setAuditNotes={layout.setAuditNotes}
                onClose={() => layout.setIsFinalizeModalOpen(false)}
                onFinalize={data.handleFinalizeAudit}
            />
        </div>,
        document.body
    );
};

export default RevisionCurricularPage;
