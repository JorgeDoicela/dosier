import React, { useState } from 'react';
import { CheckCircle2, Terminal } from 'lucide-react';
import { ROLES_DATA } from './roles/rolesData';
import { InvestigadorConsole } from './roles/InvestigadorConsole';
import { DirectorConsole } from './roles/DirectorConsole';
import { ComiteConsole } from './roles/ComiteConsole';
import { AdminConsole } from './roles/AdminConsole';

const Roles: React.FC = () => {
    const [activeRole, setActiveRole] = useState<number>(0);
    
    // Estados internos para la consola interactiva
    const [invSigned, setInvSigned] = useState<boolean>(false);
    const [isSigning, setIsSigning] = useState<boolean>(false);
    const [assignState, setAssignState] = useState<'idle' | 'assigning' | 'assigned'>('idle');
    const [voteState, setVoteState] = useState<'idle' | 'approved' | 'rejected'>('idle');
    const [isVoting, setIsVoting] = useState<boolean>(false);
    const [apiTesting, setApiTesting] = useState<boolean>(false);
    const [apiResult, setApiResult] = useState<string>('');

    // Estados dinámicos adicionales para la interacción avanzada
    // Investigador
    const [selectedProject, setSelectedProject] = useState<'riego' | 'robot' | 'plagas'>('riego');
    const [hitoProgress, setHitoProgress] = useState<number>(50);

    // Director
    const [assignmentCriteria, setAssignmentCriteria] = useState<'linea' | 'carga' | 'aleatorio'>('linea');
    const [assignLog, setAssignLog] = useState<string>('Esperando revisión curricular institucional...');

    // Comité de Ética
    const [gradeMetodologia, setGradeMetodologia] = useState<number>(3);
    const [gradeEtica, setGradeEtica] = useState<boolean>(false);

    // Administrador
    const [selectedApi, setSelectedApi] = useState<'siies' | 'firmaec' | 'senadi'>('siies');
    const [syncProgress, setSyncProgress] = useState<number>(0);
    const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'completed'>('idle');

    // Estado de interacción de la Cascada (Tooltip al pasar el mouse, null por defecto)
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const runAssignSimulation = () => {
        if (assignState !== 'idle') return;
        setAssignState('assigning');
        setAssignLog('Filtrando mallas y horas curriculares en SIGAFI...');
        setTimeout(() => {
            setAssignLog('Evaluando distribución horaria docente (Docencia, APE, Autónomo)...');
            setTimeout(() => {
                setAssignLog('Verificando correspondencia con prerrequisitos de carrera...');
                setTimeout(() => {
                    setAssignState('assigned');
                    setAssignLog('✓ Validación completada. Planificación cuadrada con el distributivo SIGAFI.');
                }, 400);
            }, 400);
        }, 400);
    };

    const handleSignProposal = () => {
        setIsSigning(true);
        setTimeout(() => {
            setIsSigning(false);
            setInvSigned(true);
        }, 900);
    };

    const handleCastVote = (approved: boolean) => {
        setIsVoting(true);
        setTimeout(() => {
            setIsVoting(false);
            setVoteState(approved ? 'approved' : 'rejected');
        }, 800);
    };

    const runApiTest = () => {
        if (apiTesting) return;
        setApiTesting(true);
        setApiResult('');
        setTimeout(() => {
            setApiTesting(false);
            if (selectedApi === 'siies') {
                setApiResult('SIGAFI Gateway (Conectado) | Latencia: 18ms | Mallas y Distributivos: Sincronizados');
            } else if (selectedApi === 'firmaec') {
                setApiResult('FirmaEC Engine (Conectado) | Latencia: 32ms | Validador Criptográfico BCE: Listo');
            } else {
                setApiResult('CACES Gateway (Conectado) | Latencia: 14ms | Formato de Portafolio: Válido');
            }
        }, 1000);
    };

    const runSyncSimulation = () => {
        if (syncState === 'syncing') return;
        setSyncState('syncing');
        setSyncProgress(0);
        const interval = setInterval(() => {
            setSyncProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setSyncState('completed');
                    return 100;
                }
                return prev + 10;
            });
        }, 150);
    };

    const getWaterfallSteps = (roleIdx: number) => {
        switch (roleIdx) {
            case 0:
                return [
                    { 
                        name: 'Elaborar PEA curricular', 
                        duration: '2d', 
                        startPercent: '0%', 
                        widthPercent: '30%', 
                        permission: 'PEA:CREAR',
                        desc: 'Borrador inicial del PEA alineado a la malla de SIGAFI.',
                        colorClass: 'bg-success/10 border-l-2 border-success text-success shadow-[inset_1px_0_0_rgba(0,224,84,0.1)] hover:bg-success/20 cursor-pointer' 
                    },
                    { 
                        name: 'Planificar Sílabo (19 semanas)', 
                        duration: '3d', 
                        startPercent: '30%', 
                        widthPercent: '50%', 
                        permission: 'SILABO:GESTIONAR',
                        desc: 'Matriz semanal detallada con fechas oficiales de parciales 1 y 2.',
                        colorClass: 'bg-brand/10 border-l-2 border-brand text-brand shadow-[inset_1px_0_0_rgba(0,112,243,0.1)] hover:bg-brand/20 cursor-pointer' 
                    },
                    { 
                        name: hitoProgress === 100 
                            ? 'Guías APE y Estudio (Completado ✓)' 
                            : `Guías APE y Estudio (${hitoProgress}%)`, 
                        duration: '1d', 
                        startPercent: '80%', 
                        widthPercent: `${(hitoProgress / 100) * 20}%`, 
                        permission: 'GUIAS:EDITAR',
                        desc: 'Micro-planificación práctica de laboratorios y compendios teóricos.',
                        colorClass: hitoProgress === 100
                            ? 'bg-success/10 border-l-2 border-success text-success transition-all duration-300 hover:bg-success/20 cursor-pointer'
                            : 'bg-warning/10 border-l-2 border-warning text-warning transition-all duration-300 hover:bg-warning/20 cursor-pointer' 
                    }
                ];
            case 1:
                return [
                    { 
                        name: 'Habilitación de asignaturas de período', 
                        duration: '3d', 
                        startPercent: '0%', 
                        widthPercent: '42%', 
                        permission: 'ASIGNATURAS:GESTIONAR',
                        desc: 'Alineación de mallas activas y materias asignadas a docentes.',
                        colorClass: 'bg-success/10 border-l-2 border-success text-success hover:bg-success/20 cursor-pointer' 
                    },
                    { 
                        name: 'Control de carga horaria y prerrequisitos', 
                        duration: '2d', 
                        startPercent: '42%', 
                        widthPercent: '28%', 
                        permission: 'MALLA:VALIDAR',
                        desc: 'Verificación matemática de correspondencia horaria con SIGAFI.',
                        colorClass: 'bg-brand/10 border-l-2 border-brand text-brand hover:bg-brand/20 cursor-pointer' 
                    },
                    { 
                        name: assignState === 'assigned'
                            ? `Planificación validada (${assignmentCriteria}) ✓`
                            : assignState === 'assigning'
                                ? 'Validando en SIGAFI...'
                                : 'Esperando revisión curricular', 
                        duration: '2d', 
                        startPercent: '70%', 
                        widthPercent: assignState === 'assigned' ? '30%' : '15%', 
                        permission: 'PLANIFICACION:APROBAR',
                        desc: 'Aprobación oficial de PEAs y Sílabos a nivel de carrera.',
                        colorClass: assignState === 'assigned'
                            ? 'bg-success/10 border-l-2 border-success text-success transition-all duration-300 hover:bg-success/20 cursor-pointer'
                            : assignState === 'assigning'
                                ? 'bg-brand/10 border-l-2 border-brand text-brand animate-pulse transition-all duration-300'
                                : 'bg-warning/5 border-l-2 border-warning/30 text-text-dim/80 transition-all duration-300 hover:bg-warning/10 cursor-pointer' 
                    }
                ];
            case 2:
                return [
                    { 
                        name: 'Auditoría normativa y curricular', 
                        duration: '5d', 
                        startPercent: '0%', 
                        widthPercent: '60%', 
                        permission: 'PORTAFOLIO:AUDITAR',
                        desc: 'Revisión integral de estándares CACES en el portafolio docente.',
                        colorClass: 'bg-success/10 border-l-2 border-success text-success hover:bg-success/20 cursor-pointer' 
                    },
                    { 
                        name: 'Legalización institucional', 
                        duration: '2d', 
                        startPercent: '60%', 
                        widthPercent: '25%', 
                        permission: 'PORTAFOLIO:LEGALIZAR',
                        desc: 'Registro de resolución de aprobación en secretaría académica.',
                        colorClass: 'bg-brand/10 border-l-2 border-brand text-brand hover:bg-brand/20 cursor-pointer' 
                    },
                    { 
                        name: voteState === 'approved'
                            ? 'Resolución oficial firmada ✓'
                            : voteState === 'rejected'
                                ? 'Resolución devuelta con observaciones ✗'
                                : 'Firma de resolución académica', 
                        duration: '1d', 
                        startPercent: '85%', 
                        widthPercent: '15%', 
                        permission: 'FIRMA:OFICIAL',
                        desc: 'Sello institucional con certificado .p12 y código QR.',
                        colorClass: voteState === 'approved'
                            ? 'bg-success/10 border-l-2 border-success text-success transition-all duration-300 hover:bg-success/20 cursor-pointer'
                            : voteState === 'rejected'
                                ? 'bg-error/10 border-error text-error transition-all duration-300 hover:bg-error/20 cursor-pointer'
                                : 'bg-warning/5 border-l-2 border-warning/30 text-text-dim/80 hover:bg-warning/10 cursor-pointer' 
                    }
                ];
            case 3:
                return [
                    { 
                        name: 'Configurar período y fechas de parciales', 
                        duration: '1d', 
                        startPercent: '0%', 
                        widthPercent: '25%', 
                        permission: 'PERIODO:EDITAR',
                        desc: 'Habilitación de semanas lectivas y fechas de corte institucionales.',
                        colorClass: 'bg-success/10 border-l-2 border-success text-success hover:bg-success/20 cursor-pointer' 
                    },
                    { 
                        name: syncState === 'completed'
                            ? 'Sincronizar base de datos SIGAFI (100%) ✓'
                            : syncState === 'syncing'
                                ? `Sincronizando SIGAFI (${syncProgress}%)`
                                : 'Sincronizar base de datos SIGAFI (Pendiente)', 
                        duration: '2d', 
                        startPercent: '25%', 
                        widthPercent: syncState === 'completed' ? '50%' : syncState === 'syncing' ? `${(syncProgress / 100) * 50}%` : '20%', 
                        permission: 'SIGAFI:SINC',
                        desc: 'Mapeo automatizado de mallas, asignaturas y docentes.',
                        colorClass: syncState === 'completed'
                            ? 'bg-success/10 border-l-2 border-success text-success transition-all duration-300 hover:bg-success/20 cursor-pointer'
                            : syncState === 'syncing'
                                ? 'bg-brand/10 border-l-2 border-brand text-brand transition-all duration-150 animate-pulse'
                                : 'bg-warning/5 border-l-2 border-warning/30 text-text-dim/80 hover:bg-warning/10 cursor-pointer'
                    },
                    { 
                        name: 'Auditoría y compilación CACES', 
                        duration: '1d', 
                        startPercent: '75%', 
                        widthPercent: '25%', 
                        permission: 'CACES:AUDITAR',
                        desc: 'Generación de expedientes completos de portafolio docente para CACES.',
                        colorClass: syncState === 'completed'
                            ? 'bg-success/10 border-l-2 border-success text-success hover:bg-success/20 cursor-pointer'
                            : 'bg-warning/5 border-l-2 border-warning/30 text-text-dim/80 hover:bg-warning/10 cursor-pointer' 
                    }
                ];
            default:
                return [];
        }
    };

    return (
        <section id="roles" className="py-20 lg:-ml-24 lg:-mr-24 space-y-10">
            {/* Header Limpio */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border-thin">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold tracking-tighter leading-[0.95] text-text-main">
                        Estructura & Niveles de Acceso
                    </h2>
                </div>
                <p className="text-xs text-text-dim max-w-md leading-relaxed font-medium">
                    Gestión de flujos institucionales con roles claramente definidos y segregación de funciones para asegurar la integridad de la producción científica. Explora el flujo simulado y nivel de acceso de cada rol.
                </p>
            </div>

            {/* Panel Principal Dashboard Rediseñado */}
            <div className="border border-border-thin rounded-xl bg-surface/35 shadow-xl font-sans relative overflow-hidden backdrop-blur-sm flex flex-col md:flex-row min-h-[480px]">
                
                {/* Lateral: Selector de Roles */}
                <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border-thin bg-surface/50 p-2.5 flex flex-col gap-1.5 shrink-0">
                    {ROLES_DATA.map((item, idx) => {
                        const Icon = item.icon;
                        const isSelected = activeRole === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    setActiveRole(idx);
                                    setInvSigned(false);
                                    setHitoProgress(50);
                                    setAssignState('idle');
                                    setAssignLog('Esperando revisión curricular institucional...');
                                    setVoteState('idle');
                                    setGradeMetodologia(3);
                                    setGradeEtica(false);
                                    setApiResult('');
                                    setSyncState('idle');
                                    setSyncProgress(0);
                                    setHoveredStep(null);
                                }}
                                className={`w-full flex items-center gap-2.5 py-2 px-2.5 rounded-md text-left transition-all duration-200 cursor-pointer ${
                                    isSelected 
                                        ? 'bg-brand-subtle border border-brand/20 text-brand shadow-[0_2px_10px_rgba(0,112,243,0.04)] font-semibold scale-[1.01]' 
                                        : 'hover:bg-surface-hover/60 border border-transparent text-text-dim hover:text-text-main hover:translate-x-0.5'
                                }`}
                            >
                                <div className={`p-1 rounded border transition-colors ${
                                    isSelected ? 'bg-brand/10 border-brand/35 text-brand' : 'bg-bg-deep border-border-thin text-text-dim'
                                }`}>
                                    <Icon size={13} strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10.5px] md:text-[11.5px] tracking-tight truncate leading-none font-medium">
                                        {item.role}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Área de Trabajo Derecha */}
                <div className="flex-1 p-5 flex flex-col justify-start gap-3.5 min-w-0">
                    
                    {/* Info de Rol & Badges de Permisos */}
                    <div className="space-y-2.5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[13px] md:text-[14px] font-bold text-text-main">
                                    {ROLES_DATA[activeRole].role}
                                </h3>
                                <span className="text-[8.5px] md:text-[9px] font-mono px-1.5 py-0.5 border border-brand/20 bg-brand-subtle text-brand rounded-full uppercase font-bold">
                                    Nivel 0{activeRole + 1}
                                </span>
                            </div>
                            <p className="text-[11px] md:text-[11.5px] text-text-dim leading-relaxed max-w-2xl">
                                {ROLES_DATA[activeRole].desc}
                            </p>
                        </div>

                        {/* Acciones/Permisos en formato Badges */}
                        <div className="space-y-1">
                            <div className="flex flex-wrap gap-1.5">
                                {ROLES_DATA[activeRole].permissions.map((perm, pIdx) => (
                                    <div key={pIdx} className="flex items-center gap-1 text-[8px] md:text-[9px] text-text-main font-sans border border-border-thin bg-surface/50 px-2 py-0.5 rounded">
                                        <CheckCircle2 size={10} className="text-brand shrink-0" />
                                        <span>{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Flujo de Actividades (Waterfall) */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] md:text-[10px] font-mono text-text-dim/60 uppercase tracking-wider">
                            <span>Secuencia del flujo de trabajo:</span>
                            <span className="text-[8px] lowercase font-bold text-brand bg-brand-subtle border border-brand/20 px-1.5 rounded transition-all duration-300">
                                {activeRole === 0 
                                    ? `planificacion_${selectedProject}_activa()` 
                                    : activeRole === 1 
                                        ? `validacion_curricular_${assignmentCriteria}()` 
                                        : activeRole === 2 
                                            ? `dictamen_resolucion_${voteState === 'idle' ? 'pendiente' : voteState === 'approved' ? 'aprobada' : 'rechazada'}()` 
                                            : `gateway_academico_${selectedApi}()`}
                            </span>
                        </div>
                        
                        <div className="border border-border-thin rounded-lg bg-bg-deep/30 p-2.5 space-y-1.5 font-mono text-[10px]">
                            {getWaterfallSteps(activeRole).map((step, idx) => (
                                <div 
                                    key={idx} 
                                    className="relative h-5.5 flex items-center rounded border border-border-thin/40 px-2 overflow-hidden transition-all duration-300 cursor-pointer"
                                    onMouseEnter={() => setHoveredStep(idx)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                >
                                    <div 
                                        className={`absolute inset-y-0 rounded-r transition-all duration-500 ease-out ${step.colorClass}`} 
                                        style={{ 
                                            left: step.startPercent, 
                                            width: step.widthPercent 
                                        }} 
                                    />
                                    <span className="text-text-main text-[9px] md:text-[10px] z-10 pl-2 relative flex items-center gap-1.5 min-w-0 flex-1">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[1px] bg-border-thin" />
                                        <span className="font-sans font-medium truncate pr-2">{step.name}</span>
                                    </span>
                                    
                                    <span className="ml-auto text-text-dim text-[8px] md:text-[8.5px] font-bold z-10 bg-bg-deep/70 px-1.5 py-0.5 rounded border border-border-thin/30">
                                        {step.duration}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Detalle interactivo del paso actual */}
                        <div className={`transition-all duration-300 rounded px-2.5 py-1 min-h-[30px] flex items-center justify-center border ${
                            hoveredStep !== null 
                                ? 'border-border-thin bg-surface/20 opacity-100' 
                                : 'border-transparent bg-transparent opacity-0'
                        }`}>
                            {hoveredStep !== null && getWaterfallSteps(activeRole)[hoveredStep] && (
                                <p className="text-[8px] md:text-[9px] text-text-dim leading-relaxed flex flex-wrap items-center gap-1.5 font-sans transition-opacity duration-300">
                                    <span className="font-mono text-brand font-bold bg-brand-subtle border border-brand/20 px-1 py-0.5 rounded text-[7.5px] tracking-wider uppercase">
                                        {getWaterfallSteps(activeRole)[hoveredStep].permission}
                                    </span>
                                    <span className="text-text-main font-semibold">{getWaterfallSteps(activeRole)[hoveredStep].name}:</span>
                                    <span>{getWaterfallSteps(activeRole)[hoveredStep].desc}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Simulación interactiva */}
                    <div className="border border-border-thin rounded-lg bg-surface/50 p-3 space-y-2.5">
                        <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-mono text-text-dim uppercase tracking-wider">
                            <Terminal size={11} className="text-brand" />
                            <span>Simulador de Acciones de Rol</span>
                        </div>

                        <div className="min-h-[70px] flex flex-col justify-center">
                            {activeRole === 0 && (
                                <InvestigadorConsole 
                                    selectedProject={selectedProject}
                                    setSelectedProject={setSelectedProject}
                                    hitoProgress={hitoProgress}
                                    setHitoProgress={setHitoProgress}
                                    invSigned={invSigned}
                                    setInvSigned={setInvSigned}
                                    isSigning={isSigning}
                                    handleSignProposal={handleSignProposal}
                                />
                            )}
                            {activeRole === 1 && (
                                <DirectorConsole 
                                    assignmentCriteria={assignmentCriteria}
                                    setAssignmentCriteria={setAssignmentCriteria}
                                    assignState={assignState}
                                    setAssignState={setAssignState}
                                    assignLog={assignLog}
                                    setAssignLog={setAssignLog}
                                    runAssignSimulation={runAssignSimulation}
                                />
                            )}
                            {activeRole === 2 && (
                                <ComiteConsole 
                                    gradeMetodologia={gradeMetodologia}
                                    setGradeMetodologia={setGradeMetodologia}
                                    gradeEtica={gradeEtica}
                                    setGradeEtica={setGradeEtica}
                                    voteState={voteState}
                                    setVoteState={setVoteState}
                                    isVoting={isVoting}
                                    handleCastVote={handleCastVote}
                                />
                            )}
                            {activeRole === 3 && (
                                <AdminConsole 
                                    selectedApi={selectedApi}
                                    setSelectedApi={setSelectedApi}
                                    apiTesting={apiTesting}
                                    apiResult={apiResult}
                                    setApiResult={setApiResult}
                                    runApiTest={runApiTest}
                                    syncProgress={syncProgress}
                                    syncState={syncState}
                                    runSyncSimulation={runSyncSimulation}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Roles;
