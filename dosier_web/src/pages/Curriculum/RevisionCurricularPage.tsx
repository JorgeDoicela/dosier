import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { InteractiveSections } from './Revision/components/InteractiveSections';
import { FullscreenLoader } from '../../components/Common/FullscreenLoader';
import { useRevisionTecnica } from './Revision/hooks/useRevisionTecnica';
import { RevisionHeader } from './Revision/components/RevisionHeader';
import { FinalizeAuditModal } from './Revision/components/FinalizeAuditModal';
import { AdminRevisionHistoryPanel } from './Revision/components/AdminRevisionHistoryPanel';
import { useAuth } from '../../api/AuthContext';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER — Dominio Curricular: Revisión Disciplinar y Metodológica del PEA
 * ══════════════════════════════════════════════════════════════════════════════
 * Espacio de auditoría técnica del PEA con distribución integrada:
 * - 2/3 para el documento curricular
 * - 1/3 para el panel de observaciones estilo Word Office (sin selector de secciones)
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
    const normalizedStatus = (data.project?.status || '').replace(/\s+/g, '').toLowerCase();
    const isAuditActive = isAuthority && [
        'enviado',
        'enrevision',
        'observado',
        'encorrección',
        'encorreccion',
        'corregido',
        'revisadocoord',
        'revisadoacad'
    ].includes(normalizedStatus);
    const isReadonlyResult = !isAuditActive;

    const totalObservationsCount = useMemo(() => {
        return Object.values(commentsState.comments).reduce(
            (acc, list) => acc + (list ? list.length : 0),
            0
        );
    }, [commentsState.comments]);

    const pendingObservationsCount = useMemo(() => {
        return Object.values(commentsState.comments).reduce(
            (acc, list) => acc + (list ? list.filter(c => c.status === 'Pendiente').length : 0),
            0
        );
    }, [commentsState.comments]);

    if (data.loading || !data.project) {
        return <FullscreenLoader message="Cargando revisión curricular del PEA..." />;
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden font-sans">
            {/* Cabecera Ejecutiva Unificada */}
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
                isRightSidebarOpen={true}
                totalObservationsCount={totalObservationsCount}
                pendingObservationsCount={pendingObservationsCount}
                isVisible={layout.isHeaderVisible}
            />

            {/* Espacio de Trabajo Principal */}
            <div className="flex-1 flex overflow-hidden relative">
                {layout.viewMode === 'history' ? (
                    /* ── VISTA DE HISTORIAL Y DICTAMEN OFICIAL ── */
                    <div className="flex-1 h-full bg-white dark:bg-zinc-950 overflow-hidden pt-14">
                        <AdminRevisionHistoryPanel
                            projectUuid={projectUuid ?? ''}
                            pea={data.rawPea}
                            project={data.project}
                        />
                    </div>
                ) : (
                    /* ── ESPACIO DE TRABAJO PRINCIPAL: REVISIÓN INTERACTIVA O VISTA OFICIAL PDF ── */
                    <main className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-zinc-950 relative">
                        {layout.viewMode === 'interactive' ? (
                            <InteractiveSections
                                onScroll={layout.handleHeaderScroll}
                                activeSection={layout.activeSection}
                                setActiveSection={layout.setActiveSection}
                                activeCommentField={layout.activeCommentField}
                                project={data.project}
                                investigadores={data.investigadores}
                                docSnapshot={data.docSnapshot}
                                templateBlocks={data.templateBlocks}
                                isHoursOk={data.isHoursOk}
                                teachersWithExceedingHours={data.teachersWithExceedingHours}
                                getFieldCardClasses={getFieldCardClasses}
                                renderFieldStatusBadge={renderFieldStatusBadge}
                                setActiveCommentField={layout.setActiveCommentField}
                                setIsRightSidebarOpen={layout.setIsRightSidebarOpen}
                                getSafeArray={getSafeArray}
                                comments={commentsState.comments}
                                canAudit={isAuditActive}
                                readOnly={isReadonlyResult}
                                submitting={data.submitting}
                                isListening={commentsState.isListening}
                                onSaveComment={commentsState.saveCommentForSection}
                                onRemoveComment={commentsState.removeCommentLocal}
                                onStartListening={commentsState.handleStartListening}
                            />
                        ) : (
                            <div className="h-full flex flex-col bg-white dark:bg-zinc-950 pt-14">
                                {data.loadingPdf ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                        <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0070f3] rounded-full animate-spin" />
                                        <p className="text-xs text-slate-500">Cargando visualización oficial del PDF...</p>
                                    </div>
                                ) : data.pdfUrl ? (
                                    <object
                                        data={`${data.pdfUrl}#toolbar=1&navpanes=0`}
                                        type="application/pdf"
                                        className="w-full h-full border-none"
                                        aria-label="Previsualización Oficial del PEA"
                                    >
                                        <iframe
                                            src={`${data.pdfUrl}#toolbar=1&navpanes=0`}
                                            className="w-full h-full border-none"
                                            title="Previsualización Oficial del PEA"
                                        />
                                    </object>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
                                        <p className="text-xs">No se pudo cargar la vista previa del documento PDF.</p>
                                        <button
                                            onClick={() => layout.setViewMode('interactive')}
                                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-900 transition-colors"
                                        >
                                            Volver a la revisión interactiva
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                )}
            </div>

            {/* Modal de Dictamen / Finalización y Firma */}
            <FinalizeAuditModal
                isOpen={layout.isFinalizeModalOpen}
                onClose={() => layout.setIsFinalizeModalOpen(false)}
                generalFeedback={layout.generalFeedback}
                setGeneralFeedback={layout.setGeneralFeedback}
                submitting={data.submitting}
                onAprobar={(motivo, password, tipoFirma, certP12, passP12) =>
                    data.handleAprobar(motivo, password, tipoFirma, certP12, passP12)
                }
                onDevolver={(fechaLimite) => data.handleDevolver(layout.generalFeedback, fechaLimite)}
                pendingObservationsCount={pendingObservationsCount}
                projectTitle={data.project.title}
            />
        </div>,
        document.body
    );
};

export default RevisionCurricularPage;
