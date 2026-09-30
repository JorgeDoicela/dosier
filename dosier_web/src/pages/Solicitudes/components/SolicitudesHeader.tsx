import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, BookOpen } from 'lucide-react';
import { PageHeader } from '../../../components/Common/PageHeader';

interface SolicitudesHeaderProps {
    isDocente: boolean;
}

export const SolicitudesHeader: React.FC<SolicitudesHeaderProps> = ({ isDocente }) => {
    return (
        <PageHeader
            title="Centro de Solicitudes"
            description="Canal centralizado para la tramitación de prórrogas curriculares, clonación de contenidos PEA, aperturas extraordinarias y soporte institucional."
        >
            <div className="flex items-center gap-2">
                {isDocente && (
                    <Link
                        to="/documentacion/mis-proyectos"
                        className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 transition-all cursor-pointer inline-flex items-center gap-2 no-underline"
                    >
                        <BookOpen size={14} className="stroke-[1.75]" />
                        <span>Mis Instrumentos PEA</span>
                    </Link>
                )}
                <Link
                    to="/incidencias"
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer inline-flex items-center gap-2 no-underline"
                >
                    <MessageSquarePlus size={14} className="stroke-[2]" />
                    <span>Buzón de Incidencias</span>
                </Link>
            </div>
        </PageHeader>
    );
};
