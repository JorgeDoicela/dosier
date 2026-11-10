import { useState, useEffect, useMemo, useCallback } from 'react';
import { analyticsService } from '../../../services/analyticsService';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import { useAuth } from '../../../api/AuthContext';
import type {
    ProyectoResumen,
    DashboardStats,
    ProcessedAnalyticsData,
    EstadoConteo
} from '../types/analytics.types';

export const useAnalyticsData = (period: string, carrera: string) => {
    const { isAdmin, isVicerrector, isCoordAcad, isCoordCarrera } = useAuth();
    const esSuperAutoridad = isAdmin || isVicerrector || isCoordAcad;

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

        // 2. Distribución real por estado del PEA
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
            const st = p.estado || 'Borrador';
            counts[st] = (counts[st] || 0) + 1;
        });
        const proyectosPorEstado: EstadoConteo[] = Object.entries(counts).map(([estado, cantidad]) => ({
            estado,
            cantidad,
            color: stateColors[estado] || "#64748b"
        }));

        // 3. Períodos disponibles en los datos
        const dbPeriods = Array.from(new Set(
            projects.map(p => {
                if (!p.convocatoriaTitulo) return '';
                const match = p.convocatoriaTitulo.match(/\d{4}-(?:I|II)/i);
                return match ? match[0].toUpperCase() : p.convocatoriaTitulo.trim().toUpperCase();
            }).filter(Boolean)
        )) as string[];
        if (dbPeriods.length === 0) {
            dbPeriods.push('OCT2026');
        }

        // 4. Carreras disponibles para el selector y segmentación:
        // Regla institucional estricta:
        // - El Coordinador Académico, Vicerrector y Administrador supervisan y visualizan todas las carreras.
        // - Los Coordinadores de Carrera visualizan ÚNICAMENTE las carreras que coordinan.
        let dbCareers: string[] = [];

        if (esSuperAutoridad) {
            const catalogCareers = allCareers
                .map((c: any) => c.carrera1 || c.nombre || c.nombre_carrera || c.carrera)
                .filter(Boolean) as string[];

            dbCareers = Array.from(new Set([
                ...catalogCareers,
                ...projects.map(p => p.carrera).filter(Boolean)
            ])).sort();
        } else {
            // Coordinador de carrera: únicamente las carreras vinculadas a su supervisión disciplinar
            dbCareers = Array.from(new Set(
                projects.map(p => p.carrera).filter(Boolean)
            )).sort();
        }

        // 5. Avance y porcentaje de aprobación por carrera
        const carrerasMap: Record<string, {
            carrera: string;
            total: number;
            aprobados: number;
            enRevision: number;
            observados: number;
            borradores: number;
        }> = {};

        filteredProjects.forEach(p => {
            const nomCarrera = p.carrera || 'General';
            if (!carrerasMap[nomCarrera]) {
                carrerasMap[nomCarrera] = {
                    carrera: nomCarrera,
                    total: 0,
                    aprobados: 0,
                    enRevision: 0,
                    observados: 0,
                    borradores: 0
                };
            }
            const item = carrerasMap[nomCarrera];
            item.total += 1;

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
                estadoSemaforo
            };
        }).sort((a, b) => b.totalAsignaturas - a.totalAsignaturas || b.porcentajeAprobados - a.porcentajeAprobados);

        // 6. Estado actual del trámite (etapas del circuito)
        const totalP = filteredProjects.length || 1;
        const borradorC = filteredProjects.filter(p => p.estado === 'Borrador' || p.estado === 'NoIniciado' || !p.estado).length;
        const observadoC = filteredProjects.filter(p => p.estado === 'Observado').length;
        const enRevCarreraC = filteredProjects.filter(p => p.estado === 'EnRevision').length;
        const revCoordC = filteredProjects.filter(p => p.estado === 'RevisadoCoord').length;
        const revAcadC = filteredProjects.filter(p => p.estado === 'RevisadoAcad').length;
        const aprobadoC = filteredProjects.filter(p => p.estado === 'Aprobado').length;

        const cuelloBotella = [
            {
                etapa: '1. Redacción inicial',
                responsable: 'Docente titular',
                rol: 'Elaboración del PEA',
                cantidad: borradorC,
                porcentaje: Math.round((borradorC / totalP) * 100),
                colorBadge: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300',
                bgProgress: 'bg-slate-500'
            },
            {
                etapa: '2. Por corregir',
                responsable: 'Docente titular',
                rol: 'Subsanación de observaciones',
                cantidad: observadoC,
                porcentaje: Math.round((observadoC / totalP) * 100),
                colorBadge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
                bgProgress: 'bg-amber-500'
            },
            {
                etapa: '3. En revisión de carrera',
                responsable: 'Coordinación de Carrera',
                rol: 'Revisión disciplinar',
                cantidad: enRevCarreraC,
                porcentaje: Math.round((enRevCarreraC / totalP) * 100),
                colorBadge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
                bgProgress: 'bg-purple-600'
            },
            {
                etapa: '4. En coordinación académica',
                responsable: 'Coordinación Académica',
                rol: 'Validación curricular',
                cantidad: revCoordC,
                porcentaje: Math.round((revCoordC / totalP) * 100),
                colorBadge: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300',
                bgProgress: 'bg-sky-600'
            },
            {
                etapa: '5. En vicerrectorado',
                responsable: 'Vicerrectorado',
                rol: 'Aprobación institucional',
                cantidad: revAcadC,
                porcentaje: Math.round((revAcadC / totalP) * 100),
                colorBadge: 'bg-blue-50 dark:bg-blue-950/40 text-[#0070f3]',
                bgProgress: 'bg-[#0070f3]'
            },
            {
                etapa: '6. Aprobados y firmados',
                responsable: 'Trámite completado',
                rol: '4 de 4 firmas registradas',
                cantidad: aprobadoC,
                porcentaje: Math.round((aprobadoC / totalP) * 100),
                colorBadge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
                bgProgress: 'bg-emerald-600'
            }
        ];

        return {
            filteredProjects,
            proyectosPorEstado,
            dbPeriods,
            dbCareers,
            carrerasCumplimiento,
            cuelloBotella
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
