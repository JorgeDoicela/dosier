import { useState, useEffect, useMemo, useCallback } from 'react';
import { analyticsService } from '../../../services/analyticsService';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import type {
    ProyectoResumen,
    DashboardStats,
    ProcessedAnalyticsData,
    LineaInvestigacionData,
    EstadoConteo
} from '../types/analytics.types';
import { calculateCacesIndicators } from '../utils/cacesCalculator';

export const useAnalyticsData = (period: string, carrera: string) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [projects, setProjects] = useState<ProyectoResumen[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [allCareers, setAllCareers] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        setRefreshing(true);
        try {
            const [projectsData, statsData, careersData] = await Promise.all([
                analyticsService.getProjects().catch(err => {
                    console.error("[Analytics] Error loading projects:", err);
                    return [];
                }),
                analyticsService.getStats().catch(err => {
                    console.error("[Analytics] Error loading stats:", err);
                    return null;
                }),
                analyticsService.getCarreras().catch(err => {
                    console.error("[Analytics] Error loading carreras:", err);
                    return [];
                })
            ]);

            setProjects(projectsData as ProyectoResumen[]);
            if (statsData) setStats(statsData as DashboardStats);
            setAllCareers(careersData);

        } catch (error) {
            console.error("[Analytics System API Error]", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Sincronización continua en tiempo real (SignalR, foco y heartbeat pasivo)
    useRealtimeSync({
        onSync: loadData,
        events: ['dosier-projects-changed'],
        heartbeatIntervalMs: 45000
    });

    // ── PROCESAMIENTO REACTIVO DE CORTE (FILTROS) ──
    const processed: ProcessedAnalyticsData = useMemo(() => {
        // 1. Filtrar proyectos por periodo y carrera
        const filteredProjects = projects.filter(p => {
            const matchesPeriod = period === 'TODOS' || 
                (p.convocatoriaTitulo && p.convocatoriaTitulo.toLowerCase().includes(period.toLowerCase()));
            
            const matchesCarrera = carrera === 'TODAS' || 
                (p.carrera && p.carrera.toUpperCase() === carrera.toUpperCase());

            return matchesPeriod && matchesCarrera;
        });

        // 2. Recalcular las líneas de investigación prioritarias del corte
        const linesMap: Record<string, { proyectos: number; pres: number }> = {};
        filteredProjects.forEach(p => {
            const line = p.lineaInvestigacion || "Línea General / No Asignada";
            if (!linesMap[line]) linesMap[line] = { proyectos: 0, pres: 0 };
            linesMap[line].proyectos += 1;
            linesMap[line].pres += p.presupuestoTotal || 0;
        });

        const colors = ["bg-brand", "bg-purple-500", "bg-amber-500", "bg-emerald-500", "bg-red-500", "bg-indigo-500"];
        const linesData: LineaInvestigacionData[] = Object.entries(linesMap).map(([nombre, val], idx) => ({
            nombre,
            proyectos: val.proyectos,
            pres: val.pres,
            pct: (val.proyectos / (filteredProjects.length || 1)) * 100,
            colorClass: colors[idx % colors.length]
        })).sort((a, b) => b.proyectos - a.proyectos);

        // 3. Recalcular la distribución por estado real del PEA en el corte
        const stateColors: Record<string, string> = {
            "Borrador": "#64748b",
            "EnRevision": "#0070f3",
            "Observado": "#d97706",
            "RevisadoCoord": "#7c3aed",
            "RevisadoAcad": "#0284c7",
            "Aprobado": "#059669"
        };
        const counts: Record<string, number> = {};
        filteredProjects.forEach(p => {
            counts[p.estado] = (counts[p.estado] || 0) + 1;
        });
        const proyectosPorEstado: EstadoConteo[] = Object.entries(counts).map(([estado, cantidad]) => ({
            estado,
            cantidad,
            color: stateColors[estado] || "#64748b"
        }));

        // 4. Calcular presupuesto acumulado
        const budgetTotal = filteredProjects.reduce((sum, p) => sum + (p.presupuestoTotal || 0), 0);
        const budgetExecuted = filteredProjects.reduce((sum, p) => sum + (p.presupuestoEjecutado || 0), 0);

        // 5. CACES compliance indicators
        const cacesIndicators = calculateCacesIndicators(filteredProjects, stats);

        // 6. Lista dinámica de periodos disponibles en la BD
        const dbPeriods = Array.from(new Set(
            projects.map(p => {
                const match = p.convocatoriaTitulo?.match(/\d{4}-(?:I|II)/i);
                return match ? match[0].toUpperCase() : p.convocatoriaTitulo;
            }).filter(Boolean)
        )) as string[];

        // 7. Lista dinámica de carreras que tienen proyectos en la BD
        const dbCareers = Array.from(new Set(
            projects.map(p => p.carrera).filter(Boolean)
        )) as string[];

        // 8. Semáforo y Ranking de Cumplimiento por Carrera / Tecnología
        const carrerasMap: Record<string, {
            carrera: string;
            total: number;
            aprobados: number;
            enRevision: number;
            observados: number;
            borradores: number;
            totalHoras: number;
            totalCreditos: number;
        }> = {};

        filteredProjects.forEach(p => {
            const nomCarrera = p.carrera || 'Tecnología General';
            if (!carrerasMap[nomCarrera]) {
                carrerasMap[nomCarrera] = {
                    carrera: nomCarrera,
                    total: 0,
                    aprobados: 0,
                    enRevision: 0,
                    observados: 0,
                    borradores: 0,
                    totalHoras: 0,
                    totalCreditos: 0
                };
            }
            const item = carrerasMap[nomCarrera];
            item.total += 1;
            item.totalHoras += p.totalHoras || 0;
            item.totalCreditos += p.creditos || 0;

            if (p.estado === 'Aprobado') {
                item.aprobados += 1;
            } else if (p.estado === 'Observado') {
                item.observados += 1;
            } else if (p.estado === 'EnRevision' || p.estado === 'RevisadoCoord' || p.estado === 'RevisadoAcad') {
                item.enRevision += 1;
            } else {
                item.borradores += 1;
            }
        });

        const carrerasCumplimiento = Object.values(carrerasMap).map(c => {
            const pct = c.total > 0 ? Math.round((c.aprobados / c.total) * 100) : 0;
            const estadoSemaforo: 'optimo' | 'regular' | 'critico' =
                pct >= 80 ? 'optimo' : pct >= 40 ? 'regular' : 'critico';
            return {
                carrera: c.carrera,
                totalAsignaturas: c.total,
                aprobados: c.aprobados,
                enRevision: c.enRevision,
                observados: c.observados,
                borradores: c.borradores,
                porcentajeAprobados: pct,
                totalHoras: c.totalHoras,
                totalCreditos: c.totalCreditos,
                estadoSemaforo
            };
        }).sort((a, b) => b.totalAsignaturas - a.totalAsignaturas || b.porcentajeAprobados - a.porcentajeAprobados);

        // 9. Diagnóstico de Cuellos de Botella (Embudo Operativo del Circuito de Avales)
        const totalP = filteredProjects.length || 1;
        const borradorC = filteredProjects.filter(p => p.estado === 'Borrador' || p.estado === 'NoIniciado' || !p.estado).length;
        const observadoC = filteredProjects.filter(p => p.estado === 'Observado').length;
        const enRevCarreraC = filteredProjects.filter(p => p.estado === 'EnRevision').length;
        const revCoordC = filteredProjects.filter(p => p.estado === 'RevisadoCoord').length;
        const revAcadC = filteredProjects.filter(p => p.estado === 'RevisadoAcad').length;
        const aprobadoC = filteredProjects.filter(p => p.estado === 'Aprobado').length;

        const cuelloBotella = [
            {
                etapa: '1. Formulación Inicial',
                responsable: 'Docente Titular',
                rol: 'Elaboración',
                cantidad: borradorC,
                porcentaje: Math.round((borradorC / totalP) * 100),
                tiempoEstimado: 'En desarrollo inicial',
                colorBadge: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300',
                bgProgress: 'bg-slate-500'
            },
            {
                etapa: '2. Subsanación de Observaciones',
                responsable: 'Docente Titular',
                rol: 'Corrección Pedagógica',
                cantidad: observadoC,
                porcentaje: Math.round((observadoC / totalP) * 100),
                tiempoEstimado: '48h límite normativo',
                colorBadge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
                bgProgress: 'bg-amber-500'
            },
            {
                etapa: '3. Revisión Técnica y Aval',
                responsable: 'Coordinación de Carrera',
                rol: 'Revisión Disciplinar',
                cantidad: enRevCarreraC,
                porcentaje: Math.round((enRevCarreraC / totalP) * 100),
                tiempoEstimado: '72h para emisión de dictamen',
                colorBadge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
                bgProgress: 'bg-purple-600'
            },
            {
                etapa: '4. Verificación y Aval Académico',
                responsable: 'Coordinación Académica',
                rol: 'Validación Curricular',
                cantidad: revCoordC,
                porcentaje: Math.round((revCoordC / totalP) * 100),
                tiempoEstimado: '48h verificación de malla',
                colorBadge: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300',
                bgProgress: 'bg-sky-600'
            },
            {
                etapa: '5. Aprobación y Firma Final',
                responsable: 'Vicerrectorado Académico',
                rol: 'Legalización Institucional',
                cantidad: revAcadC,
                porcentaje: Math.round((revAcadC / totalP) * 100),
                tiempoEstimado: '24h firma con validez jurídica',
                colorBadge: 'bg-blue-50 dark:bg-blue-950/40 text-[#0070f3]',
                bgProgress: 'bg-[#0070f3]'
            },
            {
                etapa: '6. PEAs Legalizados',
                responsable: 'Expediente Institucional',
                rol: 'Circuito Concluido (4/4 firmas)',
                cantidad: aprobadoC,
                porcentaje: Math.round((aprobadoC / totalP) * 100),
                tiempoEstimado: 'Vigente para el período',
                colorBadge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
                bgProgress: 'bg-emerald-600'
            }
        ];

        // 10. Auditoría de Carga Horaria y Componentes CACES (RRA Art. 21)
        const totalHoras = filteredProjects.reduce((s, p) => s + (p.totalHoras || 0), 0);
        const totalCreditos = filteredProjects.reduce((s, p) => s + (p.creditos || 0), 0);
        let horasCD = filteredProjects.reduce((s, p) => s + (p.horasCD || 0), 0);
        let horasAPE = filteredProjects.reduce((s, p) => s + (p.horasAPE || 0), 0);
        let horasAA = filteredProjects.reduce((s, p) => s + (p.horasAA || 0), 0);

        // Si las horas desagregadas aún no fueron editadas individualmente, estimar por estándar RRA técnico
        if (horasCD === 0 && totalHoras > 0) {
            horasCD = Math.round(totalHoras * 0.35);
            horasAPE = Math.round(totalHoras * 0.35);
            horasAA = totalHoras - horasCD - horasAPE;
        }

        const pctCD = totalHoras > 0 ? Math.round((horasCD / totalHoras) * 100) : 0;
        const pctAPE = totalHoras > 0 ? Math.round((horasAPE / totalHoras) * 100) : 0;
        const pctAA = totalHoras > 0 ? Math.round((horasAA / totalHoras) * 100) : 0;
        const asignaturasSinCarga = filteredProjects.filter(p => !p.totalHoras || p.totalHoras <= 0).length;

        const cargaHorariaCaces = {
            totalHoras,
            totalCreditos,
            horasCD,
            horasAPE,
            horasAA,
            pctCD,
            pctAPE,
            pctAA,
            asignaturasSinCarga
        };

        return {
            filteredProjects,
            linesData,
            proyectosPorEstado,
            budgetTotal,
            budgetExecuted,
            cacesIndicators,
            dbPeriods,
            dbCareers,
            carrerasCumplimiento,
            cuelloBotella,
            cargaHorariaCaces
        };

    }, [projects, stats, period, carrera]);

    return {
        loading,
        refreshing,
        projects,
        stats,
        allCareers,
        processed,
        reload: loadData
    };
};
