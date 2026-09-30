import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../api/AuthContext';
import { useNotifications } from '../../api/NotificationsContext';
import { solicitudesService } from '../../services/solicitudesService';
import { docenteAsignaturasService, type DocenteAsignaturaDto } from '../../services/docenteAsignaturasService';
import { SolicitudesHeader } from './components/SolicitudesHeader';
import { SolicitudesTabs } from './components/SolicitudesTabs';
import { SolicitudBentoCard } from './components/SolicitudBentoCard';
import { SolicitudesHistoryTable } from './components/SolicitudesHistoryTable';
import { ProrrogaPlazoModal } from '../Dashboard/Roles/Modals/ProrrogaPlazoModal';
import { ClonarPeaModal } from '../Dashboard/Roles/Modals/ClonarPeaModal';
import { AperturaConvocatoriaModal } from '../Dashboard/Roles/Modals/AperturaConvocatoriaModal';
import { RecordatorioDocentesModal, type DocenteRezagadoItem } from '../Dashboard/Roles/Modals/RecordatorioDocentesModal';
import type { 
    SolicitudCategoria, 
    SolicitudTramiteItem, 
    SolicitudRegistroHistorial 
} from './types';

export const SolicitudesPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToast } = useNotifications();
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

    // Modales Curriculares
    const [isProrrogaOpen, setIsProrrogaOpen] = useState(false);
    const [isClonarOpen, setIsClonarOpen] = useState(false);
    const [isConvocatoriaOpen, setIsConvocatoriaOpen] = useState(false);
    const [isRecordatorioOpen, setIsRecordatorioOpen] = useState(false);

    // Asignaturas y contexto del docente para clonación
    const [misMaterias, setMisMaterias] = useState<DocenteAsignaturaDto[]>([]);
    const [historial, setHistorial] = useState<SolicitudRegistroHistorial[]>([]);

    useEffect(() => {
        if (isDocente) {
            docenteAsignaturasService.getMisMaterias()
                .then(materias => setMisMaterias(materias))
                .catch(() => setMisMaterias([]));
        }
        solicitudesService.getHistorialSolicitudes()
            .then(data => setHistorial(data))
            .catch(() => setHistorial([]));
    }, [isDocente]);

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
        return tramitesDisponibles.filter(item => item.categoria === activeCategory);
    }, [tramitesDisponibles, activeCategory]);

    // Ejecución de acciones de trámite
    const handleEjecutarAccion = (tramite: SolicitudTramiteItem) => {
        switch (tramite.tipoAccion) {
            case 'modal_prorroga':
                setIsProrrogaOpen(true);
                break;
            case 'modal_clonar':
                setIsClonarOpen(true);
                break;
            case 'modal_convocatoria':
                setIsConvocatoriaOpen(true);
                break;
            case 'modal_recordatorio':
                setIsRecordatorioOpen(true);
                break;
            case 'ruta':
                if (tramite.rutaDestino) {
                    navigate(tramite.rutaDestino);
                }
                break;
            default:
                break;
        }
    };

    const asignaturaDestinoClonacion = useMemo(() => {
        if (misMaterias.length > 0) {
            return misMaterias[0].nombre_asignatura;
        }
        return 'Asignatura en curso';
    }, [misMaterias]);

    // Docentes de ejemplo para modal de recordatorio si es coordinador
    const docentesRezagadosEjemplo: DocenteRezagadoItem[] = [
        {
            nombre: 'Ing. Carlos Mendoza',
            asignatura: 'Desarrollo de Software Web',
            carrera: 'Desarrollo de Software',
            email: 'carlos.mendoza@istpet.edu.ec',
            estado: 'Borrador',
            dias_restantes: 2
        },
        {
            nombre: 'Lic. Ana Morales',
            asignatura: 'Ciberseguridad y Redes',
            carrera: 'Ciberseguridad',
            email: 'ana.morales@istpet.edu.ec',
            estado: 'En elaboración',
            dias_restantes: 1
        }
    ];

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
                <SolicitudesHistoryTable historial={historial} />
            )}

            {/* Modales Institucionales Integrados */}
            <ProrrogaPlazoModal
                isOpen={isProrrogaOpen}
                onClose={() => setIsProrrogaOpen(false)}
                onProrrogaConcedida={() => {
                    addToast(
                        'Prórroga Curricular Registrada',
                        'La solicitud de extensión de plazo fue registrada y comunicada a las instancias académicas.',
                        'success'
                    );
                }}
            />

            <ClonarPeaModal
                isOpen={isClonarOpen}
                onClose={() => setIsClonarOpen(false)}
                asignaturaDestino={asignaturaDestinoClonacion}
                onClonadoExitoso={() => {
                    addToast(
                        'Clonación Curricular Exitosa',
                        'Los contenidos históricos del PEA fueron importados satisfactoriamente.',
                        'success'
                    );
                }}
            />

            <AperturaConvocatoriaModal
                isOpen={isConvocatoriaOpen}
                onClose={() => setIsConvocatoriaOpen(false)}
                onConvocatoriaActivada={() => {
                    addToast(
                        'Convocatoria Activada',
                        'El calendario oficial del PEA ha sido sincronizado con el período académico.',
                        'success'
                    );
                }}
            />

            <RecordatorioDocentesModal
                isOpen={isRecordatorioOpen}
                onClose={() => setIsRecordatorioOpen(false)}
                tituloContexto="Recordatorio Institucional a Docentes con PEAs en Elaboración"
                docentes={docentesRezagadosEjemplo}
            />
        </div>
    );
};

export default SolicitudesPage;
