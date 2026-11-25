import {
    PenTool, BookOpen, Activity, FileCheck2, Users, FileEdit
} from 'lucide-react';
import type { HelpConfig, MockupProps } from '../types';
import {
    WfZone,
    WfSearchBar,
    WfSelect,
    WfTabs,
    WfButton,
    WfStatusBadge,
    WfListRow,
    WfMiniCard,
    WfStepperRail,
    WfDocSheet,
    WfThreadBubbles
} from '../WireframePrimitives';

export const DOCUMENTACION_CONFIG: HelpConfig = {
    icon: <PenTool size={20} className="text-[#0070f3]" />,
    title: 'Revisión Curricular de Programas de Estudio (PEA)',
    summary: 'Bandeja de supervisión, control normativo y aval colegiado de los PEAs del período lectivo.',
    description: 'Consola central para Coordinación de Carrera, Coordinación Académica, Vicerrectorado y Administración. Permite filtrar los instrumentos enviados por los docentes, inspeccionar su estado en el circuito de firmas y emitir observaciones o aprobaciones.',
    roleOverrides: {
        coord_carrera: {
            summary: 'Bandeja de revisión disciplinar y aval de PEAs para tu carrera asignada.',
            description: 'Revisa los Programas de Estudio enviados por los docentes de tu carrera, verifica la pertinencia de contenidos y unidades, y emite el aval de carrera o devuelve con observaciones.'
        },
        coord_acad: {
            summary: 'Supervisión académica transversal de PEAs avalados por las coordinaciones de carrera.',
            description: 'Verifica el cumplimiento estructural, balance de horas CD/APE/TA y alineación normativa CACES antes de elevar el PEA a legalización.'
        },
        vicerrector: {
            summary: 'Despacho de aprobación final y legalización institucional de PEAs.',
            description: 'Inspecciona los instrumentos con aval académico completo para proceder con la aprobación definitiva y firma electrónica institucional.'
        }
    },
    steps: [
        {
            title: 'Filtros por carrera, período y estado del flujo',
            description: 'Utiliza las pestañas y filtros superiores para segmentar los PEAs por estado (En Revisión, Revisado Carrera, Revisado Académica, Aprobado, Con Observaciones) o buscar por asignatura y docente.',
            highlight: 'content-top'
        },
        {
            title: 'Inspección y revisión técnica del PEA',
            description: 'Haz clic en Revisar o Ver PEA sobre cualquier registro de la tabla para abrir la vista de revisión técnica, donde podrás leer todas las secciones, dejar observaciones o aprobar el avance.',
            highlight: 'content-bottom'
        },
        {
            title: 'Seguimiento de trazabilidad y firmas',
            description: 'Accede al monitoreo del expediente para verificar la línea de tiempo de cambios, avales previos y estado de estampado de firmas digitales.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Respalda el circuito colegiado de validación curricular exigido por el Reglamento de Régimen Académico y los criterios de evaluación del CACES.',
    tips: [
        'Al devolver un PEA con observaciones, detalla la sección específica para que el docente pueda subsanar con precisión.',
        'Los PEAs aprobados por Vicerrectorado quedan bloqueados contra edición para garantizar su inmutabilidad.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone className={`shrink-0 ${highlightTopClass}`}>
                <WfTabs count={3} activeIndex={0} />
                <div className="flex items-center gap-1.5">
                    <WfSearchBar />
                    <WfSelect widthClass="w-16" />
                </div>
            </WfZone>
            <WfZone className={`flex-1 divide-y divide-slate-100 dark:divide-zinc-800 justify-center ${highlightBottomClass}`}>
                <WfListRow dotTone="blue" titleWidth="w-24" metaWidth="w-14" actionTone="blue" />
                <WfListRow dotTone="amber" titleWidth="w-20" metaWidth="w-12" actionTone="amber" />
                <WfListRow dotTone="emerald" titleWidth="w-24" metaWidth="w-16" actionTone="neutral" />
            </WfZone>
        </>
    )
};

export const MIS_PROYECTOS_CONFIG: HelpConfig = {
    icon: <BookOpen size={20} className="text-[#0070f3]" />,
    title: 'Mis Instrumentos Curriculares - PEA',
    summary: 'Espacio docente para consultar tu distributivo académico de SIGAFI y gestionar la elaboración de tus PEAs.',
    description: 'Lista las asignaturas asignadas en el período lectivo actual y también permite consultar PEAs de otros docentes de la institución como referencia. Desde aquí inicias, continúas o corriges cada Programa de Estudio de la Asignatura.',
    steps: [
        {
            title: 'Pestañas de vista y filtros de búsqueda',
            description: 'Alterna entre Mis Asignaturas y PEAs de Otros Docentes en el riel superior, y filtra por carrera, estado del workflow (Borrador, En Revisión, Con Observaciones, Aprobado) o nombre de asignatura.',
            highlight: 'content-top'
        },
        {
            title: 'Elaboración, continuación y corrección del PEA',
            description: 'Cada tarjeta muestra el código, carrera, nivel, horas distributivas y estado actual. Usa Elaborar PEA, Continuar PEA o Corregir PEA para abrir el Workspace colaborativo.',
            highlight: 'content-bottom'
        },
        {
            title: 'Monitoreo y descarga oficial',
            description: 'Accede al monitoreo del documento para revisar observaciones de coordinación o descargar el PDF oficial cuando el instrumento esté disponible.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Vincula directamente el distributivo oficial de SIGAFI con la planificación microcurricular del docente conforme a los estándares CACES.',
    tips: [
        'Si tu PEA tiene observaciones, el botón cambia a Corregir PEA para que atiendas los comentarios de coordinación.',
        'Puedes abrir el monitoreo de cualquier asignatura para revisar su historial de estados antes de enviarla a revisión.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone className={`shrink-0 ${highlightTopClass}`}>
                <WfTabs count={2} activeIndex={0} />
                <div className="flex items-center gap-1.5">
                    <WfSearchBar />
                    <WfSelect widthClass="w-16" />
                </div>
            </WfZone>
            <WfZone layout="grid2" className={`flex-1 ${highlightBottomClass}`}>
                <WfMiniCard dotTone="blue" progress={60} actionTone="blue" />
                <WfMiniCard dotTone="amber" progress={30} actionTone="amber" />
            </WfZone>
        </>
    )
};

export const WORKSPACE_CONFIG: HelpConfig = {
    icon: <FileEdit size={20} className="text-[#0070f3]" />,
    title: 'Espacio de Trabajo y Co-Redacción PEA',
    summary: 'Editor curricular modular en tiempo real con sincronización colaborativa Yjs y guardado automático por sección.',
    description: 'Entorno de redacción oficial del Programa de Estudio de la Asignatura (Secciones A - K). Permite trabajar simultáneamente con otros docentes de la misma cátedra mediante co-edición en vivo, validar horas normativas y enviar el instrumento a revisión.',
    steps: [
        {
            title: 'Navegación por secciones del PEA',
            description: 'Usa la barra lateral del Workspace para saltar entre las secciones oficiales del PEA (Datos Generales, Descripción, Objetivos, Contenidos/Unidades, Metodología, Evaluación, Bibliografía y Firmas).',
            highlight: 'sidebar'
        },
        {
            title: 'Co-redacción concurrente y autoguardado',
            description: 'Redacta directamente sobre los campos activos. Los bloques colaborativos sincronizan cambios en tiempo real con otros co-autores y guardan automáticamente tu progreso sin bloquear la interfaz.',
            highlight: 'content-bottom'
        },
        {
            title: 'Envío a revisión y previsualización',
            description: 'En la barra superior del editor puedes verificar el estado de guardado, previsualizar el documento o enviarlo formalmente a Coordinación de Carrera cuando todas las secciones estén completas.',
            highlight: 'topbar'
        }
    ],
    compliance: 'Implementa la estructura oficial de 11 secciones del PEA del ISTPET con trazabilidad por campo, control de concurrencia y bloqueo formal al entrar en revisión.',
    tips: [
        'Cuando el PEA avanza a En Revisión o Aprobado, las secciones pasan automáticamente a modo solo lectura para proteger la integridad del dictamen.',
        'Si trabajas junto a otro docente de la misma materia, verás los cambios reflejados al instante sin sobrescribir su trabajo.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfStatusBadge tone="emerald" barWidth="w-14" />
                <div className="flex items-center gap-1">
                    <WfButton tone="neutral" widthClass="w-10" />
                    <WfButton tone="blue" widthClass="w-12" />
                </div>
            </WfZone>
            <WfZone className={`flex-1 ${highlightBottomClass}`}>
                <WfDocSheet collaborative />
            </WfZone>
        </>
    )
};

export const MONITOREO_CONFIG: HelpConfig = {
    icon: <Activity size={20} className="text-[#0070f3]" />,
    title: 'Monitoreo y Trazabilidad del PEA',
    summary: 'Seguimiento detallado del estado del workflow, historial de revisiones, observaciones y firmas del expediente.',
    description: 'Vista de expediente individual de un PEA. Permite consultar en qué etapa del circuito de aprobación se encuentra, revisar observaciones históricas, verificar firmas estampadas y acceder a la edición o revisión.',
    steps: [
        {
            title: 'Resumen del expediente y estado actual',
            description: 'Consulta en la cabecera el código de la asignatura, carrera, docente responsable, período académico y el paso actual dentro del flujo de aprobación.',
            highlight: 'content-top'
        },
        {
            title: 'Línea de tiempo, observaciones y acciones',
            description: 'Revisa el historial cronológico de envíos, devoluciones y avales colegiados, y accede directamente al Workspace o a la descarga del PDF certificado.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Garantiza la trazabilidad completa del proceso de aprobación microcurricular y conserva la bitácora de observaciones para auditoría académica.',
    tips: [
        'Desde esta pantalla puedes comprobar rápidamente qué autoridad tiene pendiente la revisión o firma del PEA.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <div className="space-y-1">
                    <span className="block w-24 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    <span className="block w-14 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="flex items-center gap-1.5">
                    <WfStatusBadge tone="emerald" barWidth="w-10" />
                    <WfButton tone="neutral" widthClass="w-8" />
                </div>
            </WfZone>
            <WfZone className={`flex-1 justify-center ${highlightBottomClass}`}>
                <WfStepperRail />
            </WfZone>
        </>
    )
};

export const REVISION_TECNICA_CONFIG: HelpConfig = {
    icon: <FileCheck2 size={20} className="text-[#0070f3]" />,
    title: 'Revisión Técnica y Previsualización Oficial',
    summary: 'Inspección integral del PEA para emitir avales colegiados, registrar observaciones o ejecutar firma electrónica.',
    description: 'Interfaz especializada para revisores (Coordinación de Carrera, Coordinación Académica, Vicerrectorado y Administración) que muestra la previsualización oficial del documento junto con los controles de dictamen.',
    steps: [
        {
            title: 'Previsualización fiel del documento PEA',
            description: 'Examina el contenido completo del Programa de Estudio de la Asignatura tal como se generará en el PDF oficial institucional.',
            highlight: 'content-bottom'
        },
        {
            title: 'Emisión de observaciones o aprobación con firma',
            description: 'Utiliza las acciones superiores para aprobar y avanzar el PEA a la siguiente instancia (o legalizarlo con firma electrónica), o bien devolverlo al docente con observaciones detalladas.',
            highlight: 'content-top'
        }
    ],
    compliance: 'Soporta el control de calidad microcurricular previo a la legalización y estampado de firmas electrónicas institucionales.',
    tips: [
        'Verifica que la distribución de horas y la bibliografía correspondan al formato vigente antes de emitir tu aval.',
        'Al aprobar en la instancia final, el sistema genera el PDF legalizado con código QR de verificación.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <span className="w-24 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />
                <div className="flex items-center gap-1">
                    <WfButton tone="amber" widthClass="w-11" />
                    <WfButton tone="blue" widthClass="w-11" />
                </div>
            </WfZone>
            <WfZone className={`flex-1 ${highlightBottomClass}`}>
                <WfDocSheet stamped />
            </WfZone>
        </>
    )
};

export const SALAS_CURRICULARES_CONFIG: HelpConfig = {
    icon: <Users size={20} className="text-[#0070f3]" />,
    title: 'Salas Curriculares Colegiadas',
    summary: 'Espacio colaborativo por carrera para coordinar asignaturas, compartir lineamientos y dar seguimiento en vivo.',
    description: 'Reúne a los docentes de una misma carrera junto con su Coordinación de Carrera en el período activo para alinear criterios pedagógicos, revisar avances grupales y acceder a los PEAs de la carrera.',
    steps: [
        {
            title: 'Contexto de carrera y período activo',
            description: 'En la cabecera identificas la carrera seleccionada y el período lectivo vigente. Si perteneces a más de una carrera, puedes cambiar entre ellas.',
            highlight: 'content-top'
        },
        {
            title: 'Trabajo colegiado y acceso a instrumentos',
            description: 'Consulta el listado de asignaturas y participantes de la sala, coordina acuerdos curriculares y abre directamente los documentos asociados.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Fomenta la articulación microcurricular horizontal y vertical entre docentes de una misma carrera según los lineamientos CACES.',
    tips: [
        'Las salas curriculares reflejan automáticamente las asignaturas y docentes vinculados a la carrera en SIGAFI.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfSelect widthClass="w-24" active />
                <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                        <span className="w-3 h-3 rounded-full bg-[#0070f3] border border-white dark:border-zinc-950" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-zinc-950" />
                        <span className="w-3 h-3 rounded-full bg-amber-500 border border-white dark:border-zinc-950" />
                    </div>
                    <WfStatusBadge tone="emerald" barWidth="w-6" />
                </div>
            </WfZone>
            <WfZone layout="split" className={`flex-1 ${highlightBottomClass}`}>
                <div className="flex-[1.3] divide-y divide-slate-100 dark:divide-zinc-800 flex flex-col justify-center">
                    <WfListRow dotTone="blue" titleWidth="w-16" metaWidth="w-10" actionTone="blue" />
                    <WfListRow dotTone="emerald" titleWidth="w-14" metaWidth="w-10" actionTone="neutral" />
                </div>
                <WfThreadBubbles />
            </WfZone>
        </>
    )
};
