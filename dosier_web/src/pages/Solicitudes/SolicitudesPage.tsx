import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../api/AuthContext';
import { solicitudesService } from '../../services/solicitudesService';
import { SolicitudesHeader } from './components/SolicitudesHeader';
import { SolicitudesTabs } from './components/SolicitudesTabs';
import { SolicitudBentoCard } from './components/SolicitudBentoCard';
import { SolicitudesHistoryTable } from './components/SolicitudesHistoryTable';
import type { 
    SolicitudCategoria, 
    SolicitudTramiteItem, 
    SolicitudRegistroHistorial 
} from './types';

export const SolicitudesPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { 
        roles, 
        isAdmin, 
        isDocente 
    } = useAuth();

    // Sincronización con Query Params
    const activeCategoryParam = (searchParams.get('tipo') as SolicitudCategoria) || 'todas';
    const activeTabParam = (searchParams.get('tab') as 'catalogo' | 'historial') || 'catalogo';

    const [activeCategory, setActiveCategory] = useState<SolicitudCategoria>(activeCategoryParam);
    const [activeTab, setActiveTab] = useState<'catalogo' | 'historial'>(activeTabParam);
    const [historial, setHistorial] = useState<SolicitudRegistroHistorial[]>([]);
    const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);

    useEffect(() => {
        setIsLoadingHistorial(true);
        solicitudesService.getHistorialSolicitudes(isAdmin)
            .then(data => setHistorial(data))
            .catch(() => setHistorial([]))
            .finally(() => setIsLoadingHistorial(false));
    }, [isAdmin]);

    // Actualizar estado local si cambia la URL
    useEffect(() => {
        const tipo = searchParams.get('tipo') as SolicitudCategoria;
        if (tipo) setActiveCategory(tipo);
        const tab = searchParams.get('tab') as 'catalogo' | 'historial';
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const handleSelectCategory = (category: SolicitudCategoria) => {
        setActiveCategory(category);
        const newParams = new URLSearchParams(searchParams);
        if (category === 'todas') {
            newParams.delete('tipo');
        } else {
            newParams.set('tipo', category);
        }
        setSearchParams(newParams);
    };

    const handleSelectTab = (tab: 'catalogo' | 'historial') => {
        setActiveTab(tab);
        const newParams = new URLSearchParams(searchParams);
        if (tab === 'catalogo') {
            newParams.delete('tab');
        } else {
            newParams.set('tab', tab);
        }
        setSearchParams(newParams);
    };

    // Obtener catálogo adaptado al rol del usuario
    const tramitesDisponibles = useMemo(() => {
        const userRolesList = roles || [];
        return solicitudesService.getTramitesPorRoles(userRolesList, isAdmin);
    }, [roles, isAdmin]);

    // Filtrar catálogo por categoría seleccionada
    const tramitesFiltrados = useMemo(() => {
        if (activeCategory === 'todas') return tramitesDisponibles;
        const filtrados = tramitesDisponibles.filter(item => item.categoria === activeCategory);
        return filtrados.length > 0 ? filtrados : tramitesDisponibles;
    }, [tramitesDisponibles, activeCategory]);

    // Ejecución de acciones de trámite (redirección fáctica a rutas funcionales)
    const handleEjecutarAccion = (tramite: SolicitudTramiteItem) => {
        if (tramite.rutaDestino) {
            navigate(tramite.rutaDestino);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Cabecera institucional */}
            <SolicitudesHeader isDocente={isDocente} />

            {/* Pestañas sobre riel plano continuo */}
            <SolicitudesTabs
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                activeTab={activeTab}
                onSelectTab={handleSelectTab}
                totalTramites={tramitesFiltrados.length}
                totalHistorial={historial.length}
                isAdmin={isAdmin}
            />

            {/* Contenido Principal */}
            {activeTab === 'catalogo' ? (
                tramitesFiltrados.length === 0 ? (
                    <div className="p-12 text-center border border-slate-200/90 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            No se encontraron trámites disponibles para la categoría seleccionada en su perfil curricular.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tramitesFiltrados.map(tramite => (
                            <SolicitudBentoCard
                                key={tramite.id}
                                tramite={tramite}
                                onEjecutarAccion={handleEjecutarAccion}
                            />
                        ))}
                    </div>
                )
            ) : (
                isLoadingHistorial ? (
                    <div className="p-12 text-center border border-slate-200/90 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Cargando historial de solicitudes e incidencias...
                        </p>
                    </div>
                ) : (
                    <SolicitudesHistoryTable historial={historial} />
                )
            )}
        </div>
    );
};

export default SolicitudesPage;
