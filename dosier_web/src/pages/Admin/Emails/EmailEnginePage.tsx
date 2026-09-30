import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Send, History, Layers, Loader2 } from 'lucide-react';
import { PageHeader } from '../../../components/Common/PageHeader';
import { useEmailEngineData } from './hooks/useEmailEngineData';
import { useEmailComposer } from './hooks/useEmailComposer';
import { useEmailTemplates } from './hooks/useEmailTemplates';
import { useEmailHistory } from './hooks/useEmailHistory';

import EmailComposerSection from './components/EmailComposerSection';
import EmailPreviewSection from './components/EmailPreviewSection';
import EmailTemplatesSection from './components/EmailTemplatesSection';
import EmailTemplateModal from './components/EmailTemplateModal';
import EmailHistorySection from './components/EmailHistorySection';
import EmailHistoryDrawer from './components/EmailHistoryDrawer';

const EmailEnginePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const getTabFromUrl = (): 'send' | 'templates' | 'history' => {
        const rawTab = (searchParams.get('tab') || '').toLowerCase();
        if (rawTab === 'historial' || rawTab === 'history' || searchParams.get('search') || searchParams.get('logId')) return 'history';
        if (rawTab === 'plantillas' || rawTab === 'templates') return 'templates';
        return 'send';
    };

    const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'history'>(getTabFromUrl);

    // Sincronizar estado cuando cambie la URL (ej. popstate o navegación externa)
    useEffect(() => {
        const tabFromUrl = getTabFromUrl();
        if (tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    const handleTabChange = (tab: 'send' | 'templates' | 'history') => {
        setActiveTab(tab);
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const tabParam = tab === 'history' ? 'historial' : tab === 'templates' ? 'plantillas' : 'redactar';
            next.set('tab', tabParam);
            if (tab !== 'history') {
                next.delete('search');
                next.delete('logId');
            }
            return next;
        }, { replace: true });
    };

    // 1. Data Orchestration Hook
    const dataHook = useEmailEngineData();
    const { templates, setTemplates, carreras, projects, convocatorias, loading } = dataHook;

    // 2. Email Composer Hook
    const composerHook = useEmailComposer({
        templates,
        projects,
        convocatorias
    });

    // 3. Templates CRUD Hook
    const templatesHook = useEmailTemplates({
        templates,
        setTemplates
    });

    // 4. Audit History Log Hook
    const historyHook = useEmailHistory();
    const { fetchHistory } = historyHook;

    // Load history when tab changes to 'history' and maintain a gentle background heartbeat failsafe
    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
            const timer = setInterval(() => {
                fetchHistory(undefined, true);
            }, 15000);
            return () => clearInterval(timer);
        }
    }, [activeTab, fetchHistory]);

    return (
        <main className="flex-1 bg-bg-deep p-4 md:p-10 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto">
                {/* Brand Header */}
                <PageHeader
                    kicker="Comunicaciones de Investigación"
                    icon={Mail}
                    title="Correos DOSIER"
                    description="Comunicaciones guiadas por plantillas del sistema: el contenido se arma automáticamente según el contexto que seleccione."
                />

                {/* Pestañas sobre Riel Plano Modern Enterprise Docs */}
                <div className="border-b border-slate-200 dark:border-zinc-800 mb-6">
                    <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" aria-label="Secciones de correos">
                        <button
                            type="button"
                            onClick={() => handleTabChange('send')}
                            className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'send'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                                }`}
                        >
                            <Send size={13} />
                            <span>Redactar</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('templates')}
                            className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'templates'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                                }`}
                        >
                            <Layers size={13} />
                            <span>Plantillas</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('history')}
                            className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'history'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                                }`}
                        >
                            <History size={13} />
                            <span>Historial</span>
                        </button>
                    </nav>
                </div>

                {/* Loading state indicator */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-brand" size={32} />
                    </div>
                )}

                {!loading && (
                    <div className="animate-fade-up [animation-delay:100ms]">
                        {/* TAB 1: REDACTAR CORREO */}
                        {activeTab === 'send' && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <EmailComposerSection
                                    composer={composerHook}
                                    templates={templates}
                                    carreras={carreras}
                                    projects={projects}
                                    convocatorias={convocatorias}
                                />
                                <EmailPreviewSection
                                    parsedPreview={composerHook.parsedPreview}
                                    previewReplacements={composerHook.parsedPreview ? {
                                        ...composerHook.tokenValues,
                                        ...(composerHook.selectedPeople[0] ? {
                                            '[[destinatario_nombre]]': composerHook.selectedPeople[0].nombre,
                                            '[[destinatario_email]]': composerHook.selectedPeople[0].email
                                        } : {})
                                    } : {}}
                                />
                            </div>
                        )}

                        {/* TAB 2: GESTIÓN DE PLANTILLAS */}
                        {activeTab === 'templates' && (
                            <EmailTemplatesSection
                                templates={templates}
                                openCreateTemplateModal={templatesHook.openCreateTemplateModal}
                                openEditTemplateModal={templatesHook.openEditTemplateModal}
                                handleDeleteTemplate={templatesHook.handleDeleteTemplate}
                            />
                        )}

                        {/* TAB 3: HISTORIAL DE ENVÍOS */}
                        {activeTab === 'history' && (
                            <EmailHistorySection historyHook={historyHook} />
                        )}
                    </div>
                )}
            </div>

            {/* MODAL: CREAR/EDITAR PLANTILLA */}
            <EmailTemplateModal templatesHook={templatesHook} />

            {/* DRAWER: DETALLE INSPECCIÓN DE ENVÍO */}
            <EmailHistoryDrawer historyHook={historyHook} />
        </main>
    );
};

export default EmailEnginePage;
