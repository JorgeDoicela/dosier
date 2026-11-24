import {
    PenTool, BookOpen, Activity, FileCheck2, Users, FileEdit
} from 'lucide-react';
import type { HelpConfig, MockupProps } from '../types';

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
            <div className={`rounded-lg border p-1.5 flex flex-col gap-1.5 shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                        <div className="w-28 h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                        <div className="w-20 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                    </div>
                    <div className="w-16 h-4 bg-slate-200 dark:bg-zinc-700 rounded" />
                </div>
                <div className="flex gap-3 border-b border-slate-200 dark:border-zinc-800 pb-0.5 text-[6px]">
                    <span className="font-semibold text-[#0070f3] border-b border-[#0070f3] pb-0.5">Pendientes</span>
                    <span className="text-slate-400">Observados</span>
                    <span className="text-slate-400">Aprobados</span>
                </div>
            </div>
            <div className={`flex-1 rounded-lg border p-2 flex flex-col gap-1.5 transition-all duration-300 ${highlightBottomClass}`}>
                {[1, 2, 3].map((row) => (
                    <div key={row} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/70">
                        <div className="space-y-0.5">
                            <div className="w-28 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                            <div className="w-20 h-1 bg-slate-200 dark:bg-zinc-700 rounded" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
                            <div className="w-10 h-3.5 bg-[#0070f3] rounded" />
                        </div>
                    </div>
                ))}
            </div>
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
            <div className={`rounded-lg border p-1.5 flex flex-col gap-1.5 shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="flex gap-3 border-b border-slate-200 dark:border-zinc-800 pb-0.5 text-[6px]">
                    <span className="font-semibold text-[#0070f3] border-b border-[#0070f3] pb-0.5">Mis Asignaturas</span>
                    <span className="text-slate-400">PEAs de Otros Docentes</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="flex-1 h-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded" />
                    <div className="w-16 h-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded" />
                </div>
            </div>
            <div className={`flex-1 rounded-lg border p-2 grid grid-cols-2 gap-2 transition-all duration-300 ${highlightBottomClass}`}>
                {[1, 2].map((i) => (
                    <div key={i} className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2 flex flex-col justify-between">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[5px] font-mono text-slate-400">DS-20{i}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
                            </div>
                            <div className="w-full h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                            <div className="w-2/3 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                        </div>
                        <div className="w-full h-3.5 bg-[#0070f3] rounded mt-2" />
                    </div>
                ))}
            </div>
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
            <div className={`h-7 rounded-lg border px-2 flex items-center justify-between shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="flex items-center gap-1.5">
                    <div className="w-20 h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="flex gap-1">
                    <div className="w-10 h-3.5 border border-slate-200 dark:border-zinc-700 rounded" />
                    <div className="w-12 h-3.5 bg-[#0070f3] rounded" />
                </div>
            </div>
            <div className={`flex-1 rounded-lg border p-2 flex flex-col gap-1.5 transition-all duration-300 ${highlightBottomClass}`}>
                <div className="w-1/2 h-2.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="h-5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900" />
                    <div className="h-5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900" />
                </div>
                <div className="flex-1 rounded border border-[#0070f3]/40 bg-[#0070f3]/5 p-1.5 space-y-1">
                    <div className="w-full h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                    <div className="w-5/6 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                    <div className="w-2/3 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                </div>
            </div>
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
            <div className={`rounded-lg border p-2 flex items-center justify-between shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="space-y-1">
                    <div className="w-28 h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[6px] font-semibold text-emerald-600">En Circuito</span>
                </div>
            </div>
            <div className={`flex-1 rounded-lg border p-2 flex flex-col gap-2 transition-all duration-300 ${highlightBottomClass}`}>
                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold ${step === 1 ? 'bg-emerald-500 text-white' : step === 2 ? 'bg-[#0070f3] text-white' : 'border border-slate-300 dark:border-zinc-700 text-slate-400'}`}>
                            {step}
                        </div>
                        <div className="flex-1 space-y-0.5">
                            <div className="w-24 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                            <div className="w-16 h-1 bg-slate-200 dark:bg-zinc-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
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
            <div className={`h-8 rounded-lg border px-2 flex items-center justify-between shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="w-24 h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                <div className="flex gap-1">
                    <div className="w-12 h-4 bg-amber-600 rounded" />
                    <div className="w-12 h-4 bg-[#0070f3] rounded" />
                </div>
            </div>
            <div className={`flex-1 rounded-lg border p-2.5 flex flex-col gap-1.5 bg-slate-50 dark:bg-zinc-900 transition-all duration-300 ${highlightBottomClass}`}>
                <div className="w-1/2 h-2.5 bg-slate-300 dark:bg-zinc-600 rounded mx-auto" />
                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded mt-1" />
                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                <div className="w-4/5 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                <div className="flex-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 mt-1" />
            </div>
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
            <div className={`h-8 rounded-lg border px-2 flex items-center justify-between shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="space-y-0.5">
                    <div className="w-28 h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                    <div className="w-20 h-1 bg-slate-200 dark:bg-zinc-700 rounded" />
                </div>
                <div className="w-12 h-3.5 bg-[#0070f3]/15 border border-[#0070f3]/30 rounded" />
            </div>
            <div className={`flex-1 rounded-lg border p-2 flex gap-2 transition-all duration-300 ${highlightBottomClass}`}>
                <div className="flex-[1.5] space-y-1.5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-5 rounded border border-slate-200 dark:border-zinc-800 px-1.5 flex items-center justify-between">
                            <div className="w-20 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                            <div className="w-6 h-1.5 bg-[#0070f3] rounded" />
                        </div>
                    ))}
                </div>
                <div className="flex-1 rounded border border-slate-200 dark:border-zinc-800 p-1.5 space-y-1">
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                    <div className="w-4/5 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                </div>
            </div>
        </>
    )
};
