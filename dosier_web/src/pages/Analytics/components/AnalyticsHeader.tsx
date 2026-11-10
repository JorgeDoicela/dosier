import React from 'react';
import { BarChart2 } from 'lucide-react';
import { PageHeader } from '../../../components/Common/PageHeader';

export const AnalyticsHeader: React.FC = () => {
    return (
        <PageHeader
            kicker="Reportes y Seguimiento"
            icon={BarChart2}
            title="Seguimiento de PEAs"
            description="Revisa el avance de elaboración, revisión y firmas de los programas de estudio por período y carrera."
        />
    );
};
