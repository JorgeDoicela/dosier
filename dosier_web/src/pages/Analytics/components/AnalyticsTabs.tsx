import React from 'react';
import type { AnalyticsTab } from '../hooks/useAnalyticsState';

export interface AnalyticsTabsProps {
    activeTab: AnalyticsTab;
    setActiveTab: (tab: AnalyticsTab) => void;
}

export const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
    activeTab,
    setActiveTab
}) => {
    return (
        <div className="tabs-vercel">
            <button
                onClick={() => setActiveTab('general')}
                className={`tab-vercel-item ${activeTab === 'general' ? 'active' : ''} text-[10px] font-black uppercase tracking-widest`}
                id="tab-general"
            >
                Métricas Curriculares
            </button>
            <button
                onClick={() => setActiveTab('caces')}
                className={`tab-vercel-item ${activeTab === 'caces' ? 'active' : ''} text-[10px] font-black uppercase tracking-widest`}
                id="tab-caces"
            >
                Cumplimiento Curricular
            </button>
            <button
                onClick={() => setActiveTab('proyectos')}
                className={`tab-vercel-item ${activeTab === 'proyectos' ? 'active' : ''} text-[10px] font-black uppercase tracking-widest`}
                id="tab-proyectos"
            >
                Portafolio de Instrumentos
            </button>
        </div>
    );
};
