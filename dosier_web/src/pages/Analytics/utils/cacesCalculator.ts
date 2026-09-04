import type { ProyectoResumen, DashboardStats, CacesIndicator } from '../types/analytics.types';

export const calculateCacesIndicators = (
    projects: ProyectoResumen[],
    stats: DashboardStats | null
): readonly CacesIndicator[] => {
    const totalProyectos = projects.length;
    const totalPublicaciones = (stats?.articulosIndexados || 0) + (stats?.ponencias || 0) + projects.reduce((sum, p) => sum + (p.informesAprobados || 0), 0);
    const totalInvestigadores = stats?.totalInvestigadoresActivos || projects.reduce((sum, p) => sum + (p.totalInvestigadores || 0), 0);

    // E2.PROD: Tasa de Publicación por Docente (Meta: 0.5 por investigador)
    const prodTarget = Math.max(1, Math.ceil(totalInvestigadores * 0.5));
    const prodProgress = Math.min(100, Math.round((totalPublicaciones / prodTarget) * 100)) || 0;

    // E4.STUD: Vinculación Formativa / Semilleros (Meta: 30% de proyectos con estudiantes semilleristas activos)
    const studentTarget = Math.max(1, Math.ceil(totalProyectos * 0.3));
    const projectsWithStudents = projects.filter(p => (p.totalEstudiantes || 0) > 0).length;
    const studProgress = Math.min(100, Math.round((projectsWithStudents / studentTarget) * 100)) || 0;

    // E5.BUDG: Eficiencia y Ejecución Presupuestaria (Meta: >= 75% de ejecución sobre lo asignado)
    const budgetTotal = projects.reduce((sum, p) => sum + (p.presupuestoTotal || 0), 0);
    const budgetExecuted = projects.reduce((sum, p) => sum + (p.presupuestoEjecutado || 0), 0);
    const budgetProgress = budgetTotal > 0 ? Math.min(100, Math.round((budgetExecuted / budgetTotal) * 100)) : 0;

    return [
        {
            code: 'E2.PROD',
            name: 'Producción Académica y Científica',
            description: 'Artículos en revistas indexadas (Latindex, Scopus) y ponencias en eventos académicos. Meta: 0.5 publicaciones por docente.',
            status: prodProgress >= 100 ? 'CUMPLIDO' : prodProgress >= 50 ? 'EN PROCESO' : 'ALERTA',
            progress: prodProgress,
            metaLabel: `Meta: ${prodTarget} Publicaciones`,
            currentLabel: `${totalPublicaciones} Publicaciones Registradas`
        },
        {
            code: 'E4.STUD',
            name: 'Vinculación Formativa (Semilleros)',
            description: 'Participación activa de estudiantes de tecnologías en semilleros y co-redacción formativa de artículos.',
            status: studProgress >= 100 ? 'CUMPLIDO' : studProgress >= 50 ? 'EN PROCESO' : 'ALERTA',
            progress: studProgress,
            metaLabel: `Meta: ${studentTarget} Proyectos con Alumnos`,
            currentLabel: `${projectsWithStudents} Proyectos con Semilleristas`
        },
        {
            code: 'E5.BUDG',
            name: 'Ejecución Presupuestaria',
            description: 'Eficiencia en el gasto de fondos asignados. Evaluado bajo auditoría institucional.',
            status: budgetProgress >= 75 ? 'CUMPLIDO' : budgetProgress >= 40 ? 'EN PROCESO' : 'ALERTA',
            progress: budgetProgress,
            metaLabel: `Meta de Ejecución: >= 75%`,
            currentLabel: `Tasa de Gasto: ${budgetProgress}%`
        }
    ] as const;
};

export const getProjectClassification = (projects: ProyectoResumen[], code: string) => {
    const poor: ProyectoResumen[] = [];
    const warning: ProyectoResumen[] = [];
    const great: ProyectoResumen[] = [];

    projects.forEach(p => {
        if (code === 'E2.PROD') {
            if (p.informesAprobados === 0) {
                poor.push(p);
            } else if (p.informesAprobados === 1) {
                warning.push(p);
            } else {
                great.push(p);
            }
        } else if (code === 'E4.STUD') {
            const students = p.totalEstudiantes || 0;
            if (students === 0) {
                poor.push(p);
            } else if (students === 1) {
                warning.push(p);
            } else {
                great.push(p);
            }
        } else if (code === 'E5.BUDG') {
            const total = p.presupuestoTotal || 0;
            const executed = p.presupuestoEjecutado || 0;
            const pct = total > 0 ? (executed / total) * 100 : 0;
            if (pct < 40) {
                poor.push(p);
            } else if (pct < 75) {
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
