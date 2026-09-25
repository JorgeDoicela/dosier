import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../api/AuthContext';
import { FullscreenLoader } from '../../components/Common/FullscreenLoader';
import { RoleFlowBanner, type RolSimulado } from './Roles/Components/RoleFlowBanner';
import { CoordAcadDashboard } from './Roles/CoordAcadDashboard';
import { CoordCarreraDashboard } from './Roles/CoordCarreraDashboard';
import { DocentePeaDashboard } from './Roles/DocentePeaDashboard';
import { VicerrectorDashboard } from './Roles/VicerrectorDashboard';
import { AdminPeaDashboard } from './Roles/AdminPeaDashboard';

const Dashboard: React.FC = () => {
    const { isAdmin, isVicerrector, isCoordAcad, isCoordCarrera, isDocente, activeRole, isLoading, user, roleDisplayName } = useAuth();

    // Determinar el rol por defecto según la sesión activa o el rol seleccionado
    const defaultRol = useMemo<RolSimulado>(() => {
        if (activeRole === 'DOSIER_ADMIN') return 'ADMIN';
        if (activeRole === 'DOSIER_VICERRECTOR') return 'VICERRECTOR';
        if (activeRole === 'DOSIER_COORD_ACAD') return 'COORD_ACAD';
        if (activeRole === 'DOSIER_COORD_CARRERA') return 'COORD_CARRERA';
        if (activeRole === 'DOSIER_DOCENTE') return 'DOCENTE';

        if (isAdmin) return 'ADMIN';
        if (isVicerrector) return 'VICERRECTOR';
        if (isCoordAcad) return 'COORD_ACAD';
        if (isCoordCarrera) return 'COORD_CARRERA';
        if (isDocente) return 'DOCENTE';
        return 'ADMIN';
    }, [activeRole, isAdmin, isVicerrector, isCoordAcad, isCoordCarrera, isDocente]);

    const [rolSimulado, setRolSimulado] = useState<RolSimulado>(defaultRol);

    useEffect(() => {
        setRolSimulado(defaultRol);
    }, [defaultRol]);

    if (isLoading) {
        return <FullscreenLoader message="Cargando panel de control y circuito curricular..." />;
    }

    // Para usuarios regulares (Docentes, Coordinadores, Vicerrector): vista limpia y directa de su dashboard institucional
    if (!isAdmin) {
        return (
            <main className="flex-1 bg-bg-deep transition-colors duration-200">
                <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-6">
                    {isVicerrector && <VicerrectorDashboard />}
                    {isCoordAcad && !isVicerrector && <CoordAcadDashboard />}
                    {isCoordCarrera && !isCoordAcad && !isVicerrector && <CoordCarreraDashboard />}
                    {isDocente && !isCoordCarrera && !isCoordAcad && !isVicerrector && <DocentePeaDashboard />}
                    {!isVicerrector && !isCoordAcad && !isCoordCarrera && !isDocente && <DocentePeaDashboard />}
                </div>
            </main>
        );
    }

    // Para el Superadministrador / Desarrollador: consola con selector de flujo de roles para auditar y verificar el sistema
    return (
        <main className="flex-1 bg-bg-deep transition-colors duration-200">
            <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-6">
                {/* Selector Segmentado de Roles Exclusivo para Superadministrador */}
                <RoleFlowBanner
                    rolActivo={rolSimulado}
                    onCambiarRol={setRolSimulado}
                    nombreUsuarioReal={user?.nombre_completo}
                    rolReal={roleDisplayName}
                />

                {/* Vistas Limpias de Gestión por Rol Simulado */}
                <div>
                    {rolSimulado === 'COORD_ACAD' && <CoordAcadDashboard />}
                    {rolSimulado === 'COORD_CARRERA' && <CoordCarreraDashboard />}
                    {rolSimulado === 'DOCENTE' && <DocentePeaDashboard />}
                    {rolSimulado === 'VICERRECTOR' && <VicerrectorDashboard />}
                    {rolSimulado === 'ADMIN' && <AdminPeaDashboard onCambiarRol={setRolSimulado} />}
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
