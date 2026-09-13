import { 
    PenTool, BookOpen, Activity, Folder, FileText, Search
} from 'lucide-react';
import type { HelpConfig, MockupProps } from '../types';

export const INVESTIGACION_CONFIG: HelpConfig = {
    icon: <PenTool size={24} className="text-brand" />,
    title: "Supervisión de Documentación y Planificación PEA",
    summary: "Módulo administrativo central para la formulación, registro y supervisión de instrumentos curriculares oficiales PEA.",
    description: "Esta consola proporciona un entorno estructurado para la planificación y seguimiento de los instrumentos curriculares de la institución. Permite a directivos y coordinadores supervisar el estado de formulación, revisar las cargas horarias, conformar equipos docentes y verificar el cumplimiento curricular institucional.",
    steps: [
        {
            title: "Creación y registro de instrumentos PEA",
            description: "Usa el botón de acción principal '+ Nuevo Instrumento PEA' para iniciar el asistente interactivo. Este formulario te guiará en la definición de la asignatura, el campo de conocimiento, la justificación pedagógica y las horas curriculares.",
            highlight: 'content-top'
        },
        {
            title: "Buzón de expedientes e instrumentos firmados",
            description: "Inspecciona el buzón inferior de documentos generados por el sistema. Aquí se listan en tiempo real los PEAs aprobados, resoluciones académicas y actas institucionales. Todos incorporan firma electrónica válida y certificados de validación en formato PDF/A.",
            highlight: 'content-bottom'
        },
        {
            title: "Seguimiento y control de avance curricular",
            description: "Durante el período académico, utiliza las herramientas de seguimiento para supervisar el avance de las unidades temáticas y el cumplimiento de resultados de aprendizaje.",
            highlight: 'content-bottom'
        }
    ],
    compliance: "Alineado con los estándares del CACES y el modelo curricular institucional del ISTPET, garantizando la trazabilidad integral de la planificación académica.",
    tips: [
        "Asegúrate de que la distribución horaria (docencia, prácticas y trabajo autónomo) cumpla con los créditos establecidos en la malla curricular oficial.",
        "Descarga una copia oficial en PDF del PEA firmado una vez que el instrumento cambie a 'Aprobado'."
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            {/* Header & Controls Area */}
            <div className={`rounded-lg border p-1.5 flex justify-between items-center transition-all duration-300 shrink-0 ${highlightTopClass}`}>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[4px] text-brand uppercase font-mono tracking-wider font-semibold">Documentación</span>
                    <span className="text-[7px] text-text-main font-bold">Consola de Supervisión PEA</span>
                </div>
                <div className="flex gap-1">
                    <div className="px-1.5 py-0.5 bg-brand text-white rounded text-[5px] font-bold shadow-sm">
                        + Nuevo Instrumento PEA
                    </div>
                </div>
            </div>

            {/* Bento cards & DocumentTray / Bottom Content */}
            <div className={`flex-1 rounded-lg border p-2 flex flex-col gap-2 transition-all duration-300 min-h-0 ${highlightBottomClass}`}>
                {/* Bento Cards Row */}
                <div className="grid grid-cols-2 gap-1.5 shrink-0">
                    <div className="rounded-md border border-border-thin bg-surface-hover/10 p-1.5 flex flex-col gap-1">
                        <div className="w-3.5 h-3.5 rounded bg-brand/10 text-brand flex items-center justify-center">
                            <Folder size={8} />
                        </div>
                        <span className="text-[7px] font-bold text-text-main leading-tight uppercase">Mis Proyectos</span>
                        <span className="text-[5px] text-text-dim leading-none uppercase">Mis proyectos</span>
                    </div>
                    <div className="rounded-md border border-border-thin bg-surface-hover/10 p-1.5 flex flex-col gap-1">
                        <div className="w-3.5 h-3.5 rounded bg-brand/10 text-brand flex items-center justify-center">
                            <FileText size={8} />
                        </div>
                        <span className="text-[7px] font-bold text-text-main leading-tight uppercase">Informes de Avance</span>
                        <span className="text-[5px] text-text-dim leading-none uppercase">Avances</span>
                    </div>
                </div>

                {/* DocumentTray */}
                <div className="flex-1 flex flex-col gap-1 min-h-0">
                    <span className="text-[6px] font-bold text-text-main uppercase tracking-wider">Documentos Generados</span>
                    <div className="flex-1 border border-dashed border-border-thin rounded bg-surface p-1 space-y-1 overflow-hidden">
                        <div className="flex justify-between items-center py-0.5 border-b border-border-thin/40 text-[5px]">
                            <div className="flex items-center gap-1">
                                <FileText size={7} className="text-brand shrink-0" />
                                <span className="text-text-main font-medium truncate max-w-[120px]">CONTRATO_FONDOS_2026.pdf</span>
                            </div>
                            <span className="px-1 py-0.2 bg-success/15 border border-success/35 text-success rounded text-[4px] font-semibold">FIRMADO</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-border-thin/40 text-[5px]">
                            <div className="flex items-center gap-1">
                                <FileText size={7} className="text-brand shrink-0" />
                                <span className="text-text-main font-medium truncate max-w-[120px]">RESOLUCION_DI-008.pdf</span>
                            </div>
                            <span className="px-1 py-0.2 bg-success/15 border border-success/35 text-success rounded text-[4px] font-semibold">FIRMADO</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export const MIS_PROYECTOS_CONFIG: HelpConfig = {
    icon: <BookOpen size={24} className="text-brand" />,
    title: "Mis Instrumentos Curriculares y PEA",
    summary: "Gestión docente centralizada, co-redacción y seguimiento del ciclo de vida de los PEAs asignados.",
    description: "Tablero docente principal para la administración de todas las asignaturas e instrumentos PEA asignados. Muestra tarjetas con métricas en tiempo real sobre estados de revisión colegiada, aprobación de autoridades y accesos directos al espacio de co-redacción concurrente.",
    steps: [
        {
            title: "Listado interactivo de asignaturas y estado curricular",
            description: "Visualiza de forma clara el estado actual de cada instrumento curricular (Borrador, En Revisión, En Corrección, Aprobado). El distintivo de color te permite identificar de un vistazo si existen observaciones de la coordinación de carrera.",
            highlight: 'content-bottom'
        },
        {
            title: "Acceso al espacio de trabajo y editor curricular",
            description: "Haz clic en cualquier tarjeta para abrir el Espacio de Trabajo. Podrás acceder al editor TipTap colaborativo en tiempo real, redactar los resultados de aprendizaje y verificar la consistencia de las horas asignadas.",
            highlight: 'content-bottom'
        },
        {
            title: "Seguimiento pedagógico y unidades temáticas",
            description: "Monitorea la barra de avance y las unidades temáticas para comprobar que tu instrumento curricular cumple con la planificación del período académico.",
            highlight: 'content-bottom'
        }
    ],
    compliance: "Garantiza el cumplimiento de las metas curriculares de la asignatura según la normativa institucional y los estándares CACES.",
    tips: [
        "Revisa periódicamente las observaciones en caso de devolución para ajustar oportunamente los contenidos de la asignatura.",
        "Utiliza la opción de descarga para exportar el PEA completo en formato PDF institucional en cualquier momento."
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            {/* Top Toolbar */}
            <div className={`rounded-lg border p-1.5 flex flex-col gap-1 transition-all duration-300 shrink-0 ${highlightTopClass}`}>
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[4px] text-brand uppercase font-mono tracking-wider font-semibold">Mis Asignaturas</span>
                        <span className="text-[7px] text-text-main font-bold">Mis instrumentos curriculares</span>
                    </div>
                    <div className="px-1.5 py-0.5 bg-brand text-white rounded text-[5px] font-bold">
                        + Nuevo Instrumento PEA
                    </div>
                </div>
                <div className="flex gap-1">
                    <div className="flex-1 h-3.5 bg-surface-hover/20 border border-border-thin rounded-md px-1 flex items-center gap-1 text-[5px] text-text-dim">
                        <Search size={7} className="shrink-0" />
                        <span className="truncate">Buscar por título...</span>
                    </div>
                    <div className="w-16 h-3.5 bg-surface-hover/20 border border-border-thin rounded-md px-1 flex items-center justify-between text-[4.5px] text-text-main">
                        <span>Todos los estados</span>
                        <span>▼</span>
                    </div>
                </div>
            </div>

            {/* Grid of Projects */}
            <div className={`flex-1 rounded-lg border p-1.5 grid grid-cols-2 gap-1.5 transition-all duration-300 min-h-0 overflow-hidden ${highlightBottomClass}`}>
                {/* Project Card 1 */}
                <div className="rounded-md border border-border-thin bg-surface p-1.5 flex flex-col justify-between hover:border-brand/40 transition-colors">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[4px] font-mono text-text-dim font-bold">
                            <span>PROY-SOFT-2026-001</span>
                            <span>&rarr;</span>
                        </div>
                        <h4 className="text-[5.5px] font-semibold text-text-main leading-tight line-clamp-2">
                            Plataforma IoT con IA para Monitoreo de Consumo...
                        </h4>
                        <div className="flex items-center gap-1 py-0.2 px-1 rounded-full bg-brand/10 text-brand border border-brand/20 w-fit text-[4.5px]">
                            <span className="w-1 h-1 rounded-full bg-brand" />
                            <span>En Ejecución · IP</span>
                        </div>
                        <div className="text-[4px] text-text-dim truncate">
                            IA y Aprendizaje Automático
                        </div>
                    </div>

                    <div className="space-y-1 mt-1.5">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-0.5 text-center">
                            <div className="bg-bg-deep rounded p-0.5 border border-border-thin">
                                <span className="text-[5px] font-bold text-text-main block">3</span>
                                <span className="text-[3.5px] text-text-dim uppercase">Invest.</span>
                            </div>
                            <div className="bg-bg-deep rounded p-0.5 border border-border-thin">
                                <span className="text-[5px] font-bold text-text-main block">2</span>
                                <span className="text-[3.5px] text-text-dim uppercase">Produc.</span>
                            </div>
                            <div className="bg-bg-deep rounded p-0.5 border border-border-thin">
                                <span className="text-[5px] font-bold text-text-main block">2/2</span>
                                <span className="text-[3.5px] text-text-dim uppercase">Informes</span>
                            </div>
                        </div>

                        {/* Budget Progress */}
                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[4px] text-text-dim">
                                <span>Ejecución</span>
                                <span className="font-bold text-text-main">71%</span>
                            </div>
                            <div className="w-full h-0.5 bg-border-thin rounded-full overflow-hidden">
                                <div className="h-full bg-brand rounded-full" style={{ width: '71%' }} />
                            </div>
                            <div className="flex justify-between text-[3.5px] text-text-dim font-mono">
                                <span>$3.200</span>
                                <span>$4.500</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border-thin/40 pt-1 mt-1.5 flex justify-between items-center text-[4px] text-text-dim">
                        <span>4/15/2026</span>
                        <span className="px-0.5 rounded bg-success/15 text-success border border-success/35 font-bold">85.5/100</span>
                    </div>
                </div>

                {/* Project Card 2 */}
                <div className="rounded-md border border-border-thin bg-surface p-1.5 flex flex-col justify-between hover:border-brand/40 transition-colors">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[4px] font-mono text-text-dim font-bold">
                            <span>PROY-ADM-2026-003</span>
                            <span>&rarr;</span>
                        </div>
                        <h4 className="text-[5.5px] font-semibold text-text-main leading-tight line-clamp-2">
                            Impacto del Teletrabajo en la Productividad...
                        </h4>
                        <div className="flex items-center gap-1 py-0.2 px-1 rounded-full bg-brand/10 text-brand border border-brand/20 w-fit text-[4.5px]">
                            <span className="w-1 h-1 rounded-full bg-brand" />
                            <span>En Ejecución · Dir</span>
                        </div>
                        <div className="text-[4px] text-text-dim truncate">
                            Gestión del Talento Humano
                        </div>
                    </div>

                    <div className="space-y-1 mt-1.5">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-0.5 text-center">
                            <div className="bg-bg-deep rounded p-0.5 border border-border-thin">
                                <span className="text-[5px] font-bold text-text-main block">3</span>
                                <span className="text-[3.5px] text-text-dim uppercase">Invest.</span>
                            </div>
                            <div className="bg-bg-deep rounded p-0.5 border border-border-thin">
                                <span className="text-[5px] font-bold text-text-main block">1</span>
                                <span className="text-[3.5px] text-text-dim uppercase">Produc.</span>
                            </div>
                            <div className="bg-bg-deep rounded p-0.5 border border-border-thin">
                                <span className="text-[5px] font-bold text-text-main block">0/0</span>
                                <span className="text-[3.5px] text-text-dim uppercase">Informes</span>
                            </div>
                        </div>

                        {/* Budget Progress */}
                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[4px] text-text-dim">
                                <span>Ejecución</span>
                                <span className="font-bold text-text-main">67%</span>
                            </div>
                            <div className="w-full h-0.5 bg-border-thin rounded-full overflow-hidden">
                                <div className="h-full bg-brand rounded-full" style={{ width: '67%' }} />
                            </div>
                            <div className="flex justify-between text-[3.5px] text-text-dim font-mono">
                                <span>$1.200</span>
                                <span>$1.800</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border-thin/40 pt-1 mt-1.5 flex justify-between items-center text-[4px] text-text-dim">
                        <span>4/15/2026</span>
                        <span className="px-0.5 rounded bg-success/15 text-success border border-success/35 font-bold">78/100</span>
                    </div>
                </div>
            </div>
        </>
    )
};

export const MONITOREO_CONFIG: HelpConfig = {
    icon: <Activity size={24} className="text-brand" />,
    title: "Monitoreo Curricular y Planificación",
    summary: "Consola de seguimiento curricular, cronograma de unidades temáticas y registro de avance en tiempo real.",
    description: "Interfaz integral para supervisar la ejecución pedagógica y temporal de las asignaturas activas. Permite a los docentes y coordinadores registrar avances, verificar hitos del período académico y asegurar la cobertura de contenidos.",
    steps: [
        {
            title: "Control del cronograma e hitos curriculares",
            description: "Monitorea el progreso de cada unidad temática planificada en el PEA. Marca hitos como completados y registra las actividades prácticas ejecutadas.",
            highlight: 'content-top'
        },
        {
            title: "Carga de evidencias y rúbricas de evaluación",
            description: "Adjunta soportes de actividades prácticas, talleres y evaluaciones para respaldar el cumplimiento de los resultados de aprendizaje.",
            highlight: 'content-bottom'
        },
        {
            title: "Bitácora pedagógica y horas impartidas",
            description: "Registra detalladamente las horas impartidas de docencia presencial, prácticas y tutorías en base a la carga horaria establecida.",
            highlight: 'content-bottom'
        }
    ],
    compliance: "Asegura el cumplimiento de los estándares de aseguramiento de la calidad del CACES, certificando el avance del programa de estudio.",
    tips: [
        "Actualiza el avance de tus unidades temáticas semanalmente para mantener al día el portafolio docente institucional.",
        "Consulta el estado de revisión colegiada para validar el cumplimiento de las observaciones de carrera."
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            {/* Header & Overall Monitoring Stats */}
            <div className={`rounded-lg border p-1.5 flex justify-between items-center transition-all duration-300 shrink-0 ${highlightTopClass}`}>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[4px] text-brand uppercase font-mono tracking-wider font-semibold">Seguimiento de Hitos</span>
                    <span className="text-[7px] text-text-main font-bold">Monitoreo de Proyecto #104</span>
                </div>
                <div className="flex gap-1.5 items-center font-mono">
                    <div className="text-right text-[4px] text-text-dim">
                        <span>Físico: 75%</span> · <span className="text-brand">Finan: 60%</span>
                    </div>
                    <div className="w-10 h-4 bg-success/10 border border-success/30 text-success rounded flex items-center justify-center text-[4px] font-bold">
                        A Tiempo
                    </div>
                </div>
            </div>

            {/* Activities Progress & Evidence Upload Panel */}
            <div className="flex-1 flex gap-1.5 min-h-0">
                {/* Left Side: Tasks Timeline */}
                <div className={`flex-[1.4] rounded-lg border p-1.5 flex flex-col gap-1 transition-all duration-300 min-h-0 overflow-hidden ${highlightBottomClass}`}>
                    <span className="text-[5px] text-text-main font-bold uppercase pb-0.5 border-b border-border-thin/40">Cronograma</span>
                    <div className="space-y-1.5 py-1 overflow-y-auto">
                        <div className="flex items-center gap-1 text-[4px]">
                            <span className="text-success">●</span>
                            <div className="flex-1">
                                <span className="text-text-main font-semibold block leading-tight">Fase 1: Requisitos</span>
                                <span className="text-text-dim text-[3.5px]">Entregable aprobado</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[4px]">
                            <span className="text-brand">●</span>
                            <div className="flex-1">
                                <span className="text-text-main font-semibold block leading-tight">Fase 2: Prototipo IoT</span>
                                <span className="text-text-dim text-[3.5px]">En ejecución</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Evidence Uploader */}
                <div className={`flex-1 rounded-lg border p-1.5 flex flex-col justify-between border-dashed transition-all duration-300 min-h-0 ${highlightBottomClass}`}>
                    <div className="flex flex-col gap-1 items-center justify-center py-2 flex-1 border border-dashed border-border-thin/60 rounded bg-surface-hover/10">
                        <span className="text-brand text-xs font-bold">+</span>
                        <span className="text-[4.5px] font-semibold text-text-main uppercase tracking-wider leading-none">Cargar Evidencia</span>
                        <span className="text-[3px] text-text-dim">PDF / ZIP</span>
                    </div>
                    <div className="border-t border-border-thin/40 pt-1 mt-1 text-[3.5px] flex justify-between text-text-dim">
                        <span>Límite: 25MB</span>
                        <span className="text-brand font-bold cursor-pointer">Historial</span>
                    </div>
                </div>
            </div>
        </>
    )
};

export const INFORMES_AVANCE_CONFIG: HelpConfig = {
    icon: <BookOpen size={24} className="text-brand" />,
    title: "Bandeja de Revisiones Curriculares",
    summary: "Consola de revisión y validación de instrumentos curriculares y PEAs institucionales.",
    description: "Espacio centralizado donde la Coordinación de Carrera, Coordinación Académica y Vicerrectorado revisan, aprueban o devuelven los PEAs presentados por los docentes para asegurar la calidad académica.",
    steps: [
        {
            title: "Revisión técnica y metodológica del PEA",
            description: "Examina los contenidos, unidades temáticas, bibliografía y metodología del PEA para validar su correspondencia con la malla curricular.",
            highlight: 'content-bottom'
        },
        {
            title: "Gestión de observaciones colegiadas",
            description: "En caso de observaciones, emite comentarios contextuales y devuelve el instrumento al docente con plazo de subsanación.",
            highlight: 'content-top'
        }
    ],
    compliance: "Respalda los procesos de auditoría y calidad académica requeridos en los modelos de acreditación del CACES.",
    tips: [
        "Sé específico en las observaciones para que el docente pueda realizar los ajustes pedagógicos rápidamente.",
        "Verifica que las firmas electrónicas institucionales se apliquen en el orden reglamentario."
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            {/* Header & Controls */}
            <div className={`rounded-lg border p-1.5 flex justify-between items-center transition-all duration-300 shrink-0 ${highlightTopClass}`}>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[4px] text-text-dim uppercase font-mono tracking-wider font-semibold">Revisión de Entregables</span>
                    <span className="text-[7px] text-text-main font-bold">Bandeja de Informes de Avance</span>
                </div>
                <div className="flex gap-1 text-[4.5px]">
                    <div className="w-16 h-4 bg-surface-hover/20 border border-border-thin rounded px-1 flex items-center justify-between text-text-dim">
                        <span>Todos los periodos</span>
                        <span>▼</span>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className={`flex-1 rounded-lg border p-1.5 flex flex-col gap-1 transition-all duration-300 min-h-0 overflow-hidden ${highlightBottomClass}`}>
                <table className="w-full text-left border-collapse text-[4.5px]">
                    <thead>
                        <tr className="border-b border-border-thin/60 text-[3.5px] font-mono text-text-dim uppercase tracking-wider">
                            <th className="pb-1 font-bold">Informe / Proyecto</th>
                            <th className="pb-1 font-bold">Investigador</th>
                            <th className="pb-1 font-bold text-center">Estado</th>
                            <th className="pb-1 font-bold text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-thin/30">
                        <tr className="hover:bg-surface/30">
                            <td className="py-1">
                                <span className="text-text-main font-semibold block leading-tight">Informe Hito 2 - IA IoT</span>
                                <span className="text-[3.5px] font-mono text-text-dim">PROY-SOFT-2026-001</span>
                            </td>
                            <td className="py-1">
                                <span className="text-text-main block leading-tight">Dr. Carlos Mendoza</span>
                                <span className="text-[3.5px] text-text-dim">Dpto. Sistemas</span>
                            </td>
                            <td className="py-1 text-center">
                                <span className="px-1 py-0.2 bg-warning/15 border border-warning/35 text-warning rounded-[2px] text-[3.5px] font-semibold">
                                    En Revisión
                                </span>
                            </td>
                            <td className="py-1 text-right">
                                <span className="px-1 py-0.5 bg-brand text-white text-[4px] rounded font-bold cursor-pointer">Detalles</span>
                            </td>
                        </tr>
                        <tr className="hover:bg-surface/30">
                            <td className="py-1">
                                <span className="text-text-main font-semibold block leading-tight">Informe Hito 1 - Teletrabajo</span>
                                <span className="text-[3.5px] font-mono text-text-dim">PROY-ADM-2026-003</span>
                            </td>
                            <td className="py-1">
                                <span className="text-text-main block leading-tight">Mgs. Juan Pérez</span>
                                <span className="text-[3.5px] text-text-dim">Dpto. Administración</span>
                            </td>
                            <td className="py-1 text-center">
                                <span className="px-1 py-0.2 bg-success/15 border border-success/35 text-success rounded-[2px] text-[3.5px] font-semibold">
                                    Aprobado
                                </span>
                            </td>
                            <td className="py-1 text-right">
                                <span className="px-1 py-0.5 bg-text-main/10 border border-border-thin text-text-main rounded text-[4px] font-bold cursor-pointer">Revisar</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
};
