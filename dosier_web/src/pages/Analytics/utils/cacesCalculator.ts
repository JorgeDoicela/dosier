import type { ProyectoResumen, DashboardStats, CacesIndicator } from '../types/analytics.types';

export const calculateCacesIndicators = (
    projects: ProyectoResumen[],
    stats: DashboardStats | null
): readonly CacesIndicator[] => {
    const totalProyectos = projects.length || (stats?.totalProyectos || 0);
    const aprobados = stats?.proyectosAprobados ?? projects.filter(p => p.status === 'Aprobado' || p.status === 'Finalizado').length;
    const enRevision = stats?.proyectosEnRevision ?? projects.filter(p => p.status === 'En Revisión' || p.status === 'Enviado').length;
    const completados = aprobados + enRevision;

    // C1.PEA: Cobertura Microcurricular Institucional (Meta: 100% de asignaturas con PEA)
    const peaProgress = totalProyectos > 0 ? Math.min(100, Math.round((completados / totalProyectos) * 100)) : 0;

    // C2.CES: Conformidad Horaria Art. 21 CES (Docencia CD, Prácticas APE, Autónomo AA)
    // Se valida la consistencia pedagógica de los instrumentos formulados
    const validHoursCount = projects.filter(p => p.status !== 'Borrador').length || aprobados;
    const hoursProgress = totalProyectos > 0 ? Math.min(100, Math.round((validHoursCount / totalProyectos) * 100)) : 0;

    // C3.LEY67: Fe Pública y Firmas Digitales (Ley 67 DFRM: Elaborado, Revisado, Aprobado)
    const signedCount = aprobados;
    const signedProgress = totalProyectos > 0 ? Math.min(100, Math.round((signedCount / totalProyectos) * 100)) : 0;

    return [
        {
            code: 'C1.PEA',
            name: 'Cobertura de Planificación Microcurricular',
            description: 'Instrumentos Curriculares (PEA) formulados y aprobados para el período académico activo conforme al Reglamento de Régimen Académico.',
            status: peaProgress >= 90 ? 'CUMPLIDO' : peaProgress >= 50 ? 'EN PROCESO' : 'ALERTA',
            progress: peaProgress,
            metaLabel: `Meta: 100% de Asignaturas`,
            currentLabel: `${completados} de ${totalProyectos} Instrumentos Formulados`
        },
        {
            code: 'C2.CES',
            name: 'Conformidad Horaria Art. 21 CES',
            description: 'Cumplimiento estricto del desglose en Docencia (CD), Práctico Experimental (APE) y Aprendizaje Autónomo (AA) balanceados con la malla curricular.',
            status: hoursProgress >= 85 ? 'CUMPLIDO' : hoursProgress >= 50 ? 'EN PROCESO' : 'ALERTA',
            progress: hoursProgress,
            metaLabel: `Meta: 100% Conforme Art. 21`,
            currentLabel: `${validHoursCount} Instrumentos con Carga Validada`
        },
        {
            code: 'C3.LEY67',
            name: 'Circuito Colegiado y Firmas Digitales',
            description: 'Instrumentos que completaron el ciclo colegiado de firmas digitales con validez jurídica (Ley 67: Docente, Coordinador y Vicerrectorado).',
            status: signedProgress >= 80 ? 'CUMPLIDO' : signedProgress >= 40 ? 'EN PROCESO' : 'ALERTA',
            progress: signedProgress,
            metaLabel: `Meta: >= 80% Aprobados con Firma`,
            currentLabel: `${signedCount} Instrumentos con Dictamen Favorable`
        }
    ] as const;
};

export const getProjectClassification = (projects: ProyectoResumen[], code: string) => {
    const poor: ProyectoResumen[] = [];
    const warning: ProyectoResumen[] = [];
    const great: ProyectoResumen[] = [];

    projects.forEach(p => {
        if (code === 'C1.PEA') {
            if (p.status === 'Borrador') {
                poor.push(p);
            } else if (p.status === 'En Revisión' || p.status === 'Enviado') {
                warning.push(p);
            } else {
                great.push(p);
            }
        } else if (code === 'C2.CES') {
            if (p.status === 'Borrador') {
                poor.push(p);
            } else if (p.status === 'En Corrección') {
                warning.push(p);
            } else {
                great.push(p);
            }
        } else if (code === 'C3.LEY67') {
            if (p.status === 'Borrador' || p.status === 'En Corrección') {
                poor.push(p);
            } else if (p.status === 'En Revisión' || p.status === 'Enviado') {
                warning.push(p);
            } else {
                great.push(p);
            }
        } else {
            great.push(p);
        }
    });

    return { poor, warning, great };
};

export const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val);
};

export const formatDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
};
