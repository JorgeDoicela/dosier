import React from 'react';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '../../components/Common/PageHeader';
import { PeaSupervisionTray } from './components/PeaSupervisionTray';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER — Dominio Curricular: Supervisión y Gobernanza Curricular (PEA)
 * ══════════════════════════════════════════════════════════════════════════════
 * Bandeja de supervisión de instrumentos curriculares para autoridades del ISTPET:
 * Coordinación de Carrera, Coordinación Académica, Vicerrectorado y Calidad/Admin.
 */
export const SupervisionCurricularPage: React.FC = () => {
    return (
        <main className="flex-1 bg-[#f8fafc] dark:bg-[#0b0d11] p-6 md:p-8 overflow-y-auto space-y-6">
            <PageHeader
                kicker="Gobernanza Curricular Institucional"
                icon={BookOpen}
                title="Supervisión de Programas de Estudio (PEA)"
                description="Supervise los instrumentos curriculares PEA oficiales del ISTPET, valide la carga horaria pedagógica y audite el circuito colegiado de firmas."
            />
            <PeaSupervisionTray />
        </main>
    );
};

export default SupervisionCurricularPage;
