import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../api/AuthContext';
import { FullscreenLoader } from '../../components/Common/FullscreenLoader';
import { RoleFlowBanner, type RolSimulado } from './Roles/Components/RoleFlowBanner';
import { PipelineCurricularStepper } from './Roles/Components/PipelineCurricularStepper';
import { CoordAcadDashboard } from './Roles/CoordAcadDashboard';
import { CoordCarreraDashboard } from './Roles/CoordCarreraDashboard';
import { DocentePeaDashboard } from './Roles/DocentePeaDashboard';
import { VicerrectorDashboard } from './Roles/VicerrectorDashboard';
import { AdminPeaDashboard } from './Roles/AdminPeaDashboard';
import { ChevronDown, ChevronUp, GitBranch } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { isAdmin, isVicerrector, isCoordAcad, isCoordCarrera, isDocente, isLoading, user, roleDisplayName } = useAuth();

    // Determinar el rol por defecto según la sesión activa
    const defaultRol = useMemo<RolSimulado>(() => {
        if (isVicerrector) return 'VICERRECTOR';
        if (isCoordAcad) return 'COORD_ACAD';
        if (isCoordCarrera) return 'COORD_CARRERA';
        if (isDocente) return 'DOCENTE';
        if (isAdmin) return 'ADMIN';
        return 'COORD_ACAD';
    }, [isAdmin, isVicerrector, isCoordAcad, isCoordCarrera, isDocente]);

    const [rolSimulado, setRolSimulado] = useState<RolSimulado>(defaultRol);
    const [mostrarPipeline, setMostrarPipeline] = useState(true);

    // Actualizar rol cuando cambie la autenticación
    useEffect(() => {
        setRolSimulado(defaultRol);
    }, [defaultRol]);

    // Mapeo de fase activa según el rol simulado
    const faseIndexPorRol: Record<RolSimulado, number> = {
        COORD_ACAD: 0,
        DOCENTE: 1,
        COORD_CARRERA: 2,
        VICERRECTOR: 4,
        ADMIN: 0
    };

    if (isLoading) {
        return <FullscreenLoader message="Cargando panel de control y circuito curricular..." />;
    }

    return (
        <main className="flex-1 bg-bg-deep selection:bg-selection-bg selection:text-selection-fg transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
                {/* Simulador Interactivo de Roles para Navegación del Flujo Completo */}
                <RoleFlowBanner
                    rolActivo={rolSimulado}
                    onCambiarRol={setRolSimulado}
                    nombreUsuarioReal={user?.nombre_completo}
                    rolReal={roleDisplayName}
                />

                {/* Botón de control del Pipeline */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setMostrarPipeline(prev => !prev)}
                        className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                        <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                        {mostrarPipeline ? 'Ocultar Diagrama de Pipeline de 5 Fases' : 'Mostrar Diagrama de Pipeline de 5 Fases'}
                        {mostrarPipeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[11px] text-zinc-500">
                        Visualizando perspectiva de: <strong className="text-zinc-900 dark:text-white">{rolSimulado}</strong>
                    </span>
                </div>

                {/* Diagrama del Pipeline Curricular Interactivo */}
                {mostrarPipeline && (
                    <PipelineCurricularStepper
                        faseActiva={faseIndexPorRol[rolSimulado]}
                    />
                )}

                {/* Vista Específica del Rol Seleccionado con todas sus herramientas operativas */}
                <div className="pt-2">
                    {rolSimulado === 'COORD_ACAD' && <CoordAcadDashboard />}
                    {rolSimulado === 'COORD_CARRERA' && <CoordCarreraDashboard />}
                    {rolSimulado === 'DOCENTE' && <DocentePeaDashboard />}
                    {rolSimulado === 'VICERRECTOR' && <VicerrectorDashboard />}
                    {rolSimulado === 'ADMIN' && <AdminPeaDashboard />}
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
