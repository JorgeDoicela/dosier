import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Lock, Unlock, Shield, Award, Loader2, RefreshCw, X, Sparkles, FileUp } from 'lucide-react';
import type { CoWorkHandle } from '../../core/cowork/types';
import CollaborationSidebar from './CollaborationSidebar';
import { DocumentDataContext, DocumentMetadataContext, SectionLockContext } from '../../core/documents/context/DocumentDataContext';
import { useDOSIERBuilderShell } from './shell/hooks/useDOSIERBuilderShell';
import { BuilderHeader } from './shell/components/BuilderHeader';
import { BuilderNavigationSidebar } from './shell/components/BuilderNavigationSidebar';
import { BuilderFloatingTab } from './shell/components/BuilderFloatingTab';
import { BuilderSectionFooterNav } from './shell/components/BuilderSectionFooterNav';
import { OutputSection } from './shell/components/OutputSection';
import { PeaAiAssistantModal } from './shell/components/PeaAiAssistantModal';
import { PeaAiProposalModal } from './shell/components/PeaAiProposalModal';
import { PeaDocumentImportModal } from './shell/components/PeaDocumentImportModal';
import { extractPeaFromDocument } from '../../services/peaDocumentExtractorService';
import {
    generatePeaAiDraft,
    getPeaAiConfig,
    convertDraftToEditorFields,
    type PeaStructuredDraft
} from '../../services/peaAiService';
import { useNotifications } from '../../api/NotificationsContext';
import type { BuilderSection } from './shell/hooks/useBuilderLayout';

import { useAuth } from '../../api/AuthContext';

export type { BuilderSection };

export interface DOSIERBuilderShellProps {
    title: string;
    subtitle: string;
    templateCode: string;
    sections: BuilderSection[];
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    localChangeCount?: number;
    remoteChangeCount?: number;
    cowork: CoWorkHandle;
    onSave?: (data: any) => Promise<void>;
    onClose: () => void;
    readOnly?: boolean;
    readOnlyReason?: string;
    projectStatus?: string;
    entityUuid?: string;
    children: (activeTab: string, cowork: CoWorkHandle) => React.ReactNode;
    canSign?: boolean;
    onUpdateField?: (name: string, value: any) => void;
    onApplyStructuredDraft?: (patch: Record<string, any>) => void;
    signatureType?: string;
    documentUuid?: string;
    hasTemplateUpdate?: boolean;
    instanceVersion?: number;
    templateVersion?: number;
    onUpgradeTemplate?: () => Promise<void>;
    isUpgrading?: boolean;
}

const DOSIERBuilderShell: React.FC<DOSIERBuilderShellProps> = (props) => {
    const {
        title,
        subtitle,
        templateCode,
        sections,
        formData,
        cowork,
        readOnly = false,
        readOnlyReason,
        projectStatus,
        entityUuid,
        children,
        canSign = true,
        onUpdateField,
        onApplyStructuredDraft,
        signatureType = 'DOSIER',
        documentUuid,
        hasTemplateUpdate = false,
        instanceVersion,
        templateVersion,
        onUpgradeTemplate,
        isUpgrading = false
    } = props;

    const { isAdmin } = useAuth();
    const { addToast } = useNotifications();
    const resolvedPeaUuid = entityUuid || documentUuid || formData?.EntityUuid || formData?.Uuid || '';
    const { layout, autoSave, pdfAndSign, network } = useDOSIERBuilderShell(props);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(hasTemplateUpdate);
    const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
    const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
    const [aiConfigVersion, setAiConfigVersion] = useState<number>(0);
    const [aiGeneratedDraft, setAiGeneratedDraft] = useState<PeaStructuredDraft | null>(null);
    const [isAiProposalModalOpen, setIsAiProposalModalOpen] = useState<boolean>(false);
    const [importDocModalOpen, setImportDocModalOpen] = useState<boolean>(false);
    const [importInitialFile, setImportInitialFile] = useState<File | null>(null);
    const [importInitialInstructions, setImportInitialInstructions] = useState<string>('');
    const [importExtractedDraft, setImportExtractedDraft] = useState<PeaStructuredDraft | null>(null);
    const [importAutoExtract, setImportAutoExtract] = useState<boolean>(false);

    const handleTriggerDocExtraction = useCallback(async (file: File) => {
        if (!resolvedPeaUuid) {
            alert('Guarde primero el documento para habilitar la extracción.');
            return;
        }
        try {
            const rawHorasCD = Number(formData?.HorasContactoDocente ?? formData?.horas_contacto_docente ?? 0);
            const rawHorasAPE = Number(formData?.HorasPracticoExperimental ?? formData?.horas_practico_experimental ?? 0);
            const rawHorasTA = Number(formData?.HorasAutonomo ?? formData?.horas_autonomo ?? 0);
            const totalHoras = Number(formData?.TotalHorasAsignatura ?? formData?.total_horas_asignatura ?? (rawHorasCD + rawHorasAPE + rawHorasTA));

            const draft = await extractPeaFromDocument(resolvedPeaUuid, file, {
                currentHorasCD: rawHorasCD > 0 ? rawHorasCD : undefined,
                currentHorasAPE: rawHorasAPE > 0 ? rawHorasAPE : undefined,
                currentHorasTA: rawHorasTA > 0 ? rawHorasTA : undefined,
                currentTotalHoras: totalHoras > 0 ? totalHoras : undefined
            });

            setImportInitialFile(file);
            setImportExtractedDraft(draft);
            setImportDocModalOpen(true);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'No se pudo procesar el documento.';
            alert(typeof msg === 'string' ? msg : 'Error al extraer el documento.');
        }
    }, [resolvedPeaUuid, formData]);

    const handleTriggerAiGeneration = useCallback(async (
        targetSec: string | string[] = 'all',
        instructions: string = '',
        customModel?: string,
        history?: Array<{ role: 'user' | 'assistant'; content: string }>
    ) => {
        if (!resolvedPeaUuid) {
            addToast('Identificador requerido', 'Guarde primero el documento para habilitar la generación.', 'warning');
            return;
        }
        setIsGeneratingAi(true);
        try {
            const status = await getPeaAiConfig();
            if (!status.isReady) {
                addToast('API Key no configurada', 'Haga clic en "Configurar proveedor" para ingresar su credencial de IA.', 'warning');
                return;
            }

            const rawUnits: any[] = Array.isArray(formData?.Unidades) ? formData.Unidades : [];
            const currentUnidades = rawUnits.map((u, idx) => ({
                num: Number(u.num ?? u.Numero ?? idx + 1),
                titulo: String(u.titulo ?? u.Titulo ?? u.NombreUnidad ?? ''),
                contenidos: String(u.contenidos ?? u.Contenidos ?? ''),
                horasCD: Number(u.horasCD ?? u.HorasCD ?? 0),
                horasAPE: Number(u.horasAPE ?? u.HorasAPE ?? 0),
                horasTA: Number(u.horasTA ?? u.HorasTA ?? 0)
            })).filter(u => u.titulo || u.contenidos);

            // Snapshot completo del estado actual del PEA en el editor
            const cleanText = (val: any) => {
                if (typeof val !== 'string') return undefined;
                const trimmed = val.trim();
                const stripped = trimmed.replace(/<[^>]+>/g, '').trim();
                return stripped.length > 0 ? trimmed : undefined;
            };

            const currentObjetivo = cleanText(formData?.ObjetivoAsignatura ?? formData?.objetivo_asignatura);
            const currentRdaCarrera = cleanText(formData?.RdaCarrera ?? formData?.rda_carrera);
            const currentResultadosAprendizaje = cleanText(formData?.ResultadosAprendizaje ?? formData?.resultados_aprendizaje);
            const currentMetodologiaEnsenanza = cleanText(formData?.MetodologiaEnsenanza ?? formData?.metodologia_ensenanza);
            const currentRecursosDidacticos = cleanText(formData?.RecursosDidacticos ?? formData?.recursos_didacticos);
            const currentBibliografiaBasica = cleanText(formData?.BibliografiaBasica ?? formData?.bibliografia_basica);
            const currentBibliografiaConsulta = cleanText(formData?.BibliografiaConsulta ?? formData?.bibliografia_consulta);

            const rawPrereqs: any[] = Array.isArray(formData?.Prerrequisitos) ? formData.Prerrequisitos : [];
            const currentPrerrequisitos = rawPrereqs
                .map((p: any) => ({
                    asignatura: String(p.asignatura ?? p.nombre_asignatura ?? p.Asignatura ?? p[0] ?? '').trim(),
                    observacion: String(p.observacion ?? p.observaciones ?? p.Observacion ?? p[1] ?? '').trim()
                }))
                .filter(p => p.asignatura);

            const rawPracticas: any[] = Array.isArray(formData?.ActividadesPracticas) ? formData.ActividadesPracticas : [];
            const currentActividadesPracticas = rawPracticas
                .map((p: any, idx: number) => ({
                    unidad: Number(p.unidad ?? p.Unidad ?? idx + 1),
                    nombre: String(p.nombre ?? p.Nombre ?? p.nombre_practica ?? '').trim(),
                    horas: Number(p.horas ?? p.Horas ?? 0),
                    escenario: String(p.escenario ?? p.Escenario ?? '').trim(),
                    producto: String(p.producto ?? p.Producto ?? '').trim()
                }))
                .filter(p => p.nombre);

            const rawEvals: any[] = Array.isArray(formData?.Evaluaciones) ? formData.Evaluaciones : [];
            const currentEvaluaciones = rawEvals
                .map((e: any) => ({
                    nota: String(e.nota ?? e.Nota ?? '').trim(),
                    tipo: String(e.tipo ?? e.Tipo ?? '').trim(),
                    calificacion: Number(e.calificacion ?? e.Calificacion ?? 10)
                }))
                .filter(e => e.nota || e.tipo);

            const rawBibs: any[] = Array.isArray(formData?.Bibliografias) ? formData.Bibliografias : [];
            const currentBibliografias = rawBibs
                .map((b: any) => ({
                    tipoBibliografia: (b.tipoBibliografia ?? b.tipo_bibliografia ?? 'Basica') as 'Basica' | 'Consulta',
                    autor: String(b.autor ?? b.Autor ?? '').trim(),
                    tituloLibro: String(b.tituloLibro ?? b.titulo_libro ?? b.titulo ?? '').trim(),
                    editorialCiudad: String(b.editorialCiudad ?? b.editorial_ciudad ?? '').trim(),
                    citaCompletaApa: String(b.citaCompletaApa ?? b.cita_completa_apa ?? '').trim()
                }))
                .filter(b => b.citaCompletaApa || b.tituloLibro);

            const rawHorasCD = Number(formData?.HorasContactoDocente ?? formData?.horas_contacto_docente ?? 0);
            const rawHorasAPE = Number(formData?.HorasPracticoExperimental ?? formData?.horas_practico_experimental ?? 0);
            const rawHorasTA = Number(formData?.HorasAutonomo ?? formData?.horas_autonomo ?? 0);
            const totalHoras = Number(formData?.TotalHorasAsignatura ?? formData?.total_horas_asignatura ?? (rawHorasCD + rawHorasAPE + rawHorasTA));

            const isUnconfiguredSplit = rawHorasCD <= 0 && rawHorasAPE <= 0 && totalHoras > 0;
            const horasCD = isUnconfiguredSplit ? Math.floor(totalHoras / 3) : rawHorasCD;
            const horasAPE = isUnconfiguredSplit ? Math.floor(totalHoras / 3) : rawHorasAPE;
            const horasTA = isUnconfiguredSplit ? (totalHoras - horasCD - horasAPE) : rawHorasTA;

            const targetSectionStr = Array.isArray(targetSec) ? (targetSec.length === 9 || targetSec.includes('all') ? 'all' : targetSec.join(',')) : targetSec;
            const targetSectionsArr = Array.isArray(targetSec) ? targetSec : (targetSec === 'all' ? undefined : [targetSec]);

            const draft = await generatePeaAiDraft(resolvedPeaUuid, {
                targetSection: targetSectionStr,
                targetSections: targetSectionsArr,
                customInstructions: instructions.trim() || undefined,
                provider: status.activeProvider,
                model: customModel || status.activeModel,
                reasoningEffort: status.activeReasoningEffort || undefined,
                baseUrlOverride: status.activeBaseUrl || undefined,
                currentHorasCD: horasCD > 0 ? horasCD : undefined,
                currentHorasAPE: horasAPE > 0 ? horasAPE : undefined,
                currentHorasTA: horasTA > 0 ? horasTA : undefined,
                currentTotalHoras: totalHoras > 0 ? totalHoras : undefined,
                currentUnidades: currentUnidades.length > 0 ? currentUnidades : undefined,
                currentObjetivo,
                currentPrerrequisitos: currentPrerrequisitos.length > 0 ? currentPrerrequisitos : undefined,
                currentRdaCarrera,
                currentResultadosAprendizaje,
                currentMetodologiaEnsenanza,
                currentRecursosDidacticos,
                currentActividadesPracticas: currentActividadesPracticas.length > 0 ? currentActividadesPracticas : undefined,
                currentEvaluaciones: currentEvaluaciones.length > 0 ? currentEvaluaciones : undefined,
                currentBibliografias: currentBibliografias.length > 0 ? currentBibliografias : undefined,
                currentBibliografiaBasica,
                currentBibliografiaConsulta,
                conversationHistory: history && history.length > 0 ? history : undefined
            });

            setAiGeneratedDraft(draft);
            return draft;
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'No se pudo generar el borrador curricular.';
            addToast('Error en Generación IA', typeof msg === 'string' ? msg : 'Verifique su API Key y conexión.', 'error');
            throw err;
        } finally {
            setIsGeneratingAi(false);
        }
    }, [resolvedPeaUuid, formData, addToast]);

    const handleApplyAiProposal = useCallback((selectedSections: string[]) => {
        if (!aiGeneratedDraft || selectedSections.length === 0) return;
        const patch = convertDraftToEditorFields(aiGeneratedDraft, selectedSections);
        if (onApplyStructuredDraft) {
            onApplyStructuredDraft(patch);
        } else if (onUpdateField) {
            Object.entries(patch).forEach(([key, val]) => onUpdateField(key, val));
        }
        addToast(
            'Propuesta IA Aplicada',
            `Se han completado ${selectedSections.length} sección(es) en el editor.`,
            'success'
        );
        setIsAiProposalModalOpen(false);
        setAiGeneratedDraft(null);
    }, [aiGeneratedDraft, onApplyStructuredDraft, onUpdateField, addToast]);

    const handleOpenAiConfigModal = useCallback(() => {
        setAiModalOpen(true);
    }, []);

    const isAiSupportedSection = templateCode === 'PEA_OFICIAL' &&
        layout.activeTab !== 'pea_general_section' &&
        layout.activeTab !== 'pea_signatures_section' &&
        layout.activeTab !== 'output';

    const showRightSidebar = true;


    const shouldShowLockControl = useMemo(() => {
        // 1. Si la sección está bloqueada, siempre se muestra para informar su estado a cualquier usuario
        if (layout.isSectionBlocked) return true;
        // 2. El Administrador siempre tiene disponible el control institucional de bloqueo en cualquier documento
        if (isAdmin) return true;
        // 3. El Director del Proyecto tiene control si el proyecto cuenta con equipo
        if (layout.isDirectorOrAdmin) {
            const hasMultipleResearchers = Array.isArray(formData?.Investigadores) && formData.Investigadores.length > 1;
            return hasMultipleResearchers;
        }
        // 4. Miembros regulares no ven el control si la sección está abierta
        return false;
    }, [isAdmin, layout.isDirectorOrAdmin, layout.isSectionBlocked, formData?.Investigadores]);

    useEffect(() => {
        if (hasTemplateUpdate) {
            setShowUpdateModal(true);
        }
    }, [hasTemplateUpdate]);

    const allSectionIds = useMemo(() => sections.map(s => s.id), [sections]);
    const sectionItemPairs = useMemo(() => sections.map(s => ({ id: s.id, label: s.label })), [sections]);
    const handleCloseSidebar = useCallback(() => layout.setIsSidebarOpen(false), [layout.setIsSidebarOpen]);

    const contentScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentScrollRef.current) {
            contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [layout.activeTab]);

    return (
        <DocumentDataContext.Provider value={formData}>
            <DocumentMetadataContext.Provider value={{ readOnlyReason }}>
                <SectionLockContext.Provider value={{
                    formData,
                    readOnly,
                    isDirectorOrAdmin: layout.isDirectorOrAdmin,
                    onUpdateField
                }}>
                    <div className="fixed inset-0 z-[100] bg-bg-deep flex justify-center items-center p-0 md:p-0">
                        <div className="bg-surface w-full h-full flex flex-col shadow-xl overflow-hidden animate-fade-in">
                            {/* ── Header Universal ── */}
                            <BuilderHeader
                                title={title}
                                subtitle={subtitle}
                                readOnly={readOnly}
                                isSyncing={network.isSyncing}
                                isDirty={autoSave.isDirty}
                                lastSaved={autoSave.lastSaved}
                                isOnline={network.isOnline}
                                isSlowConnection={network.isSlowConnection}
                                users={network.users}
                                isDarkMode={layout.isDarkMode}
                                onClose={autoSave.handleClose}
                                onSave={autoSave.handleSave}
                                toggleTheme={layout.toggleTheme}
                            />

                            <div className="flex flex-1 overflow-hidden relative" ref={layout.bodyContainerRef}>
                                {/* Pestaña de reabrir Navegación (Izquierda) */}
                                {(!layout.isLeftSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 1024 && !layout.showMobileSections)) && (
                                    <BuilderFloatingTab
                                        position="left"
                                        topPercent={layout.navTopPercent}
                                        xOffset={layout.navXOffset}
                                        isDragging={layout.isDraggingNav}
                                        onMouseDown={layout.startDraggingNav}
                                        onTouchStart={layout.startDraggingNav}
                                    />
                                )}

                                {/* Pestaña de reabrir Actividad (Derecha) */}
                                {!layout.isSidebarOpen && showRightSidebar && (
                                    <BuilderFloatingTab
                                        position="right"
                                        topPercent={layout.chatTopPercent}
                                        xOffset={layout.chatXOffset}
                                        isDragging={layout.isDraggingChat}
                                        isOnline={network.isOnline}
                                        onMouseDown={layout.startDraggingChat}
                                        onTouchStart={layout.startDraggingChat}
                                    />
                                )}

                                {/* ── Sidebar de Navegación (Izquierda) ── */}
                                <BuilderNavigationSidebar
                                    sections={sections}
                                    activeTab={layout.activeTab}
                                    formData={formData}
                                    sectionStatuses={layout.sectionStatuses}
                                    isLeftSidebarOpen={layout.isLeftSidebarOpen}
                                    leftSidebarWidth={layout.leftSidebarWidth}
                                    showMobileSections={layout.showMobileSections}
                                    leftSidebarRef={layout.leftSidebarRef}
                                    setActiveTab={layout.setActiveTab}
                                    setIsLeftSidebarOpen={layout.setIsLeftSidebarOpen}
                                    setShowMobileSections={layout.setShowMobileSections}
                                />

                                {/* Drag Handle Left */}
                                {layout.isLeftSidebarOpen && !layout.showMobileSections && (
                                    <div
                                        onMouseDown={layout.startDraggingLeft}
                                        className="hidden lg:block w-[6px] -mx-[3px] bg-transparent hover:bg-border-hover/50 active:bg-text-dim cursor-col-resize select-none shrink-0 transition-colors duration-150 z-50 h-full relative"
                                    />
                                )}

                                {/* ── Área Principal: Editor & Visor PDF ── */}
                                <div className="flex-1 bg-bg-deep overflow-hidden flex">
                                    {layout.activeTab !== 'output' ? (
                                        <div ref={contentScrollRef} className="flex-1 pt-4 pb-8 px-3 sm:pt-6 sm:pb-12 sm:px-6 md:pt-8 md:pb-16 md:px-12 overflow-y-auto custom-scrollbar">
                                            <div className="w-full mx-auto max-w-[98%] sm:max-w-[94%] transition-all duration-300">
                                                <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-lg sm:text-2xl font-bold text-text-main tracking-tight uppercase">{layout.activeSectionLabel}</h3>
                                                        <div className="w-12 sm:w-20 h-1 md:h-1.5 bg-text-main mt-2 md:mt-3 rounded-full" />
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                                                        {/* Compact Section Lock Control — Gobernanza institucional y de equipo */}
                                                        {!readOnly && layout.activeTab !== 'output' && shouldShowLockControl && (
                                                            <div className="flex items-center gap-2 bg-surface border border-border-thin px-3 py-1.5 rounded-full animate-fade-in text-[9px] font-bold uppercase tracking-wider select-none">
                                                                {layout.isSectionBlocked ? (
                                                                    <>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Lock size={12} className="text-amber-500 animate-pulse" />
                                                                            <span className="text-amber-500">Sección Bloqueada</span>
                                                                        </div>
                                                                        {layout.isDirectorOrAdmin && (
                                                                            <button
                                                                                onClick={() => autoSave.handleToggleSectionLock(layout.activeTab)}
                                                                                className="ml-1.5 px-2 py-0.5 bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all rounded-md font-medium text-xs cursor-pointer shadow-2xs"
                                                                            >
                                                                                Desbloquear
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Unlock size={12} className="text-text-dim" />
                                                                            <span className="text-text-dim">Edición Abierta</span>
                                                                        </div>
                                                                        {layout.isDirectorOrAdmin && (
                                                                            <button
                                                                                onClick={() => autoSave.handleToggleSectionLock(layout.activeTab)}
                                                                                className="ml-1.5 px-2 py-0.5 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-all rounded-md font-medium text-xs cursor-pointer"
                                                                            >
                                                                                Bloquear
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {hasTemplateUpdate && !readOnly && onUpgradeTemplate && !showUpdateModal && (
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-2.5 mb-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <RefreshCw size={14} className="shrink-0 text-[#0070f3]" />
                                                            <span>Nueva versión de plantilla disponible ({templateVersion}). Sus datos se conservarán.</span>
                                                        </div>
                                                        <button
                                                            onClick={onUpgradeTemplate}
                                                            disabled={isUpgrading}
                                                            className="btn-vercel-primary text-xs shrink-0 py-1.5 px-3 cursor-pointer"
                                                        >
                                                            {isUpgrading ? 'Actualizando...' : 'Actualizar Formato'}
                                                        </button>
                                                    </div>
                                                )}

                                                {readOnly && (
                                                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 mb-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                                                        <Shield size={14} className="shrink-0" />
                                                        <span>
                                                            {readOnlyReason === 'state'
                                                                ? `Documento en modo solo lectura (Estado: ${projectStatus || 'En Revisión'}). No se admiten modificaciones.`
                                                                : readOnlyReason === 'review'
                                                                ? 'Documento en modo solo lectura para revisión académica.'
                                                                : 'Acceso en modo solo lectura sin permisos de edición.'}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Render de los componentes hijos del documento con el cowork handle */}
                                                {children(layout.activeTab, cowork)}

                                                {/* ── Navegación Inteligente al Pie de Sección ── */}
                                                <BuilderSectionFooterNav
                                                    sections={sections}
                                                    activeTab={layout.activeTab}
                                                    setActiveTab={layout.setActiveTab}
                                                    canSign={canSign}
                                                    readOnly={readOnly}
                                                    onNavigate={() => {
                                                        contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── Panel de Finalización y Firma ── */
                                        <OutputSection
                                            title={title}
                                            templateCode={templateCode}
                                            projectStatus={projectStatus}
                                            canSign={canSign}
                                            signatureType={signatureType}
                                            documentUuid={documentUuid}
                                            formData={formData}
                                            pdfUrl={pdfAndSign.pdfUrl}
                                            isGenerating={pdfAndSign.isGenerating}
                                            isDraftMode={pdfAndSign.isDraftMode}
                                            setIsDraftMode={pdfAndSign.setIsDraftMode}
                                            handleGeneratePdf={pdfAndSign.handleGeneratePdf}
                                            isSigning={pdfAndSign.isSigning}
                                            institutionalPassword={pdfAndSign.institutionalPassword}
                                            setInstitutionalPassword={pdfAndSign.setInstitutionalPassword}
                                            handleSignDosier={pdfAndSign.handleSignDosier}
                                            signatureCertFile={pdfAndSign.signatureCertFile}
                                            setSignatureCertFile={pdfAndSign.setSignatureCertFile}
                                            signaturePassword={pdfAndSign.signaturePassword}
                                            setSignaturePassword={pdfAndSign.setSignaturePassword}
                                            handleSign={pdfAndSign.handleSign}
                                            signatureRefreshTrigger={pdfAndSign.signatureRefreshTrigger}
                                            isSignedModalOpen={pdfAndSign.isSignedModalOpen}
                                            setIsSignedModalOpen={pdfAndSign.setIsSignedModalOpen}
                                            signedModalData={pdfAndSign.signedModalData}
                                        />
                                    )}
                                </div>

                                {/* Drag Handle Right */}
                                {layout.isSidebarOpen && showRightSidebar && (
                                    <div
                                        onMouseDown={layout.startDraggingRight}
                                        className="hidden lg:block w-[6px] -mx-[3px] bg-transparent hover:bg-border-hover/50 active:bg-text-dim cursor-col-resize select-none shrink-0 transition-colors duration-150 z-50 h-full relative"
                                    />
                                )}

                                {/* ── Collaboration Sidebar (Derecha) ── */}
                                {showRightSidebar && (
                                    <div
                                        ref={layout.rightSidebarRef}
                                        style={{
                                            '--right-sidebar-width': `${layout.rightSidebarWidth}px`,
                                            width: (typeof window !== 'undefined' && window.innerWidth < 1024)
                                                ? undefined
                                                : (layout.isSidebarOpen ? `${layout.rightSidebarWidth}px` : '0px'),
                                            transform: (typeof window !== 'undefined' && window.innerWidth < 1024)
                                                ? (layout.isSidebarOpen ? 'translateX(0)' : 'translateX(100%)')
                                                : undefined,
                                            transition: (typeof window !== 'undefined' && window.innerWidth < 1024)
                                                ? 'transform 300ms ease-in-out, visibility 300ms ease-in-out'
                                                : 'width 300ms ease-in-out',
                                            visibility: (typeof window !== 'undefined' && window.innerWidth < 1024)
                                                ? (layout.isSidebarOpen ? 'visible' : 'hidden')
                                                : 'visible'
                                        } as React.CSSProperties}
                                        className={`
                                            overflow-hidden flex shrink-0 bg-bg-deep shadow-2xl lg:shadow-none z-40
                                            ${typeof window !== 'undefined' && window.innerWidth < 1024
                                                ? 'absolute inset-y-0 right-0 top-0 bottom-0 z-[70] h-full border-l border-border-thin !w-[85vw] sm:!w-[320px]'
                                                : (layout.isSidebarOpen ? 'border-l border-border-thin lg:flex' : 'hidden lg:flex')
                                            }
                                        `}
                                    >
                                        <div className="h-full w-full lg:w-[var(--right-sidebar-width)] flex flex-col shrink-0">
                                            <CollaborationSidebar
                                                instanceUuid={cowork.session.documentId}
                                                sectionName={layout.activeTab}
                                                cowork={cowork}
                                                allSections={allSectionIds}
                                                sectionItems={sectionItemPairs}
                                                entityUuid={entityUuid}
                                                projectStatus={projectStatus}
                                                templateCode={templateCode}
                                                peaData={formData}
                                                onClose={handleCloseSidebar}
                                                sectionStatuses={layout.sectionStatuses}
                                                onSectionStatusChange={layout.setSectionStatus}
                                                onSelectSection={layout.setActiveTab}
                                                onOpenImportModal={templateCode === 'PEA_OFICIAL' && !readOnly ? () => {
                                                    setImportInitialFile(null);
                                                    setImportInitialInstructions('');
                                                    setImportAutoExtract(false);
                                                    setImportDocModalOpen(true);
                                                } : undefined}
                                                onTriggerDocExtraction={templateCode === 'PEA_OFICIAL' && !readOnly ? handleTriggerDocExtraction : undefined}
                                                onOpenAiModal={templateCode === 'PEA_OFICIAL' && !readOnly ? handleOpenAiConfigModal : undefined}
                                                onTriggerAiGeneration={templateCode === 'PEA_OFICIAL' && !readOnly ? handleTriggerAiGeneration : undefined}
                                                onOpenAiConfigModal={templateCode === 'PEA_OFICIAL' && !readOnly ? handleOpenAiConfigModal : undefined}
                                                onApplyStructuredDraft={templateCode === 'PEA_OFICIAL' && !readOnly ? (patch) => {
                                                    if (onApplyStructuredDraft) {
                                                        onApplyStructuredDraft(patch);
                                                    } else if (onUpdateField) {
                                                        Object.entries(patch).forEach(([key, val]) => onUpdateField(key, val));
                                                    }
                                                    addToast(
                                                        'Propuesta IA Aplicada',
                                                        'Se han transferido los cambios generados al editor.',
                                                        'success'
                                                    );
                                                } : undefined}
                                                isGeneratingAi={isGeneratingAi}
                                                aiConfigVersion={aiConfigVersion}
                                                instanceUuid={documentUuid}
                                                resolvedPeaUuid={resolvedPeaUuid}
                                                formData={formData}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Modal de Alerta Centrado: Nueva Versión de Plantilla ── */}
                    {hasTemplateUpdate && !readOnly && onUpgradeTemplate && showUpdateModal && (
                        <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center p-4 animate-fade-in">
                            <div className="bg-surface border border-border-thin rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl relative flex flex-col gap-6 animate-scale-in">
                                {/* Botón cerrar X */}
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    className="absolute top-4 right-4 text-text-dim hover:text-text-main p-1.5 rounded-lg hover:bg-border-thin/30 transition-all cursor-pointer"
                                    title="Cerrar (Mantener versión actual arriba)"
                                >
                                    <X size={18} />
                                </button>

                                {/* Encabezado */}
                                <div className="flex items-start gap-4">
                                    <Award size={28} className="text-[#0070f3] dark:text-blue-400 shrink-0" />
                                    <div className="space-y-1 pr-6">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0070f3] dark:text-blue-400">
                                            Actualización disponible
                                        </span>
                                        <h3 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight mt-1">
                                            Nueva versión de plantilla disponible
                                        </h3>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="text-sm text-text-dim leading-relaxed bg-bg-deep/50 p-4 rounded-xl border border-border-thin/50">
                                    El administrador ha actualizado el formato oficial de esta plantilla a la versión <strong className="text-text-main font-bold">{templateVersion}</strong>. Tu borrador actual utiliza la versión <strong className="text-text-main font-bold">{instanceVersion}</strong>. Puedes actualizar para aplicar las últimas secciones y formatos. Tus datos actuales se conservarán.
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpdateModal(false)}
                                        className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-text-dim hover:text-text-main hover:bg-border-thin/20 rounded-xl transition-all cursor-pointer"
                                    >
                                        Continuar con versión {instanceVersion}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await onUpgradeTemplate();
                                            setShowUpdateModal(false);
                                        }}
                                        disabled={isUpgrading}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-info hover:bg-info/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                    >
                                        {isUpgrading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin shrink-0" />
                                                <span>Actualizando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw size={16} className="shrink-0" />
                                                <span>Actualizar Formato</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* ── Modal de Previsualización de Propuesta IA ── */}
                    {templateCode === 'PEA_OFICIAL' && (
                        <PeaAiProposalModal
                            isOpen={isAiProposalModalOpen}
                            onClose={() => {
                                setIsAiProposalModalOpen(false);
                                setAiGeneratedDraft(null);
                            }}
                            draft={aiGeneratedDraft}
                            onApply={handleApplyAiProposal}
                        />
                    )}

                    {/* ── Modal de Configuración de API Key del Asistente Curricular IA ── */}
                    {templateCode === 'PEA_OFICIAL' && (
                        <PeaAiAssistantModal
                            isOpen={aiModalOpen}
                            onClose={() => setAiModalOpen(false)}
                            peaUuid={resolvedPeaUuid}
                            formData={formData}
                            isAdmin={isAdmin}
                            onConfigSaved={() => setAiConfigVersion(v => v + 1)}
                        />
                    )}

                    {/* ── Modal Independiente del Extractor e Importador de PEA (PDF / Word) ── */}
                    {templateCode === 'PEA_OFICIAL' && (
                        <PeaDocumentImportModal
                            isOpen={importDocModalOpen}
                            onClose={() => {
                                setImportDocModalOpen(false);
                                setImportAutoExtract(false);
                                setImportExtractedDraft(null);
                                setImportInitialFile(null);
                            }}
                            peaUuid={resolvedPeaUuid}
                            formData={formData}
                            initialFile={importInitialFile}
                            initialDraft={importExtractedDraft}
                            initialInstructions={importInitialInstructions}
                            autoExtractOnOpen={importAutoExtract}
                            onApplyDraft={(patch) => {
                                if (onApplyStructuredDraft) {
                                    onApplyStructuredDraft(patch);
                                } else if (onUpdateField) {
                                    Object.entries(patch).forEach(([key, val]) => onUpdateField(key, val));
                                }
                            }}
                        />
                    )}
                </SectionLockContext.Provider>
            </DocumentMetadataContext.Provider>
        </DocumentDataContext.Provider>
    );
};

export default React.memo(DOSIERBuilderShell);
