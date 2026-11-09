import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../api/AuthContext';
import { solicitudesService } from '../../services/solicitudesService';
import { SolicitudesHeader } from './components/SolicitudesHeader';
import { SolicitudBentoCard } from './components/SolicitudBentoCard';
import type { SolicitudTramiteItem } from './types';

export const SolicitudesPage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        roles, 
        isAdmin 
    } = useAuth();

    // Obtener catálogo adaptado al rol del usuario
    const tramitesDisponibles = useMemo(() => {
        const userRolesList = roles || [];
        return solicitudesService.getTramitesPorRoles(userRolesList, isAdmin);
    }, [roles, isAdmin]);

    // Ejecución de acciones de trámite (redirección directa al canal operativo)
    const handleEjecutarAccion = (tramite: SolicitudTramiteItem) => {
        if (tramite.rutaDestino) {
            navigate(tramite.rutaDestino);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Cabecera institucional */}
            <SolicitudesHeader />

            {/* Catálogo de Canales y Trámites Curriculares */}
            {tramitesDisponibles.length === 0 ? (
                <div className="p-12 text-center border border-slate-200/90 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        No se encontraron canales de tramitación disponibles para su perfil curricular.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tramitesDisponibles.map(tramite => (
                        <SolicitudBentoCard
                            key={tramite.id}
                            tramite={tramite}
                            onEjecutarAccion={handleEjecutarAccion}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SolicitudesPage;
