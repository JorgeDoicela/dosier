import {
    Activity, Settings2, BarChart3, Bell, ShieldCheck, Calendar,
    Trash2, FolderKanban, MessageSquareWarning
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
    WfDonutChart,
    WfBarChart,
    WfQrGlyph,
    WfCheckBadge,
    WfCalendarGrid,
    WfThreadBubbles
} from '../WireframePrimitives';

export const DEFAULT_CONFIG: HelpConfig = {
    icon: <Settings2 size={20} className="text-[#0070f3]" />,
    title: 'Módulo General del Sistema',
    summary: 'Consola unificada de acceso y gestión curricular para el Programa de Estudio de la Asignatura (PEA) del ISTPET.',
    description: 'Este espacio centraliza la navegación entre los módulos curriculares, la conmutación de roles institucionales, la búsqueda rápida de expedientes y la configuración de la cuenta.',
    steps: [
        {
            title: 'Navegación general y jerarquía lateral',
            description: 'Usa el panel lateral izquierdo para desplazarte entre los módulos habilitados según tu rol institucional (Docente, Coordinación de Carrera, Coordinación Académica, Vicerrectorado o Administrador). Puedes contraer o expandir la barra lateral para ganar espacio de trabajo.',
            highlight: 'sidebar'
        },
        {
            title: 'Barra superior, rol activo y guía en vivo',
            description: 'En la barra superior verificas tu rol curricular activo, accedes a tus notificaciones y puedes abrir esta guía contextual en cualquier pantalla. La guía detecta automáticamente la ruta actual y tu perfil.',
            highlight: 'topbar'
        }
    ],
    compliance: 'Cumple con los criterios de organización académica, accesibilidad y trazabilidad institucional exigidos por el CACES para la gestión curricular de los Programas de Estudio de la Asignatura (PEA).',
    tips: [
        'Presiona Ctrl + K (o Cmd + K en macOS) en cualquier pantalla para abrir la paleta de comandos y saltar rápidamente entre módulos.',
        'Si cuentas con múltiples atribuciones académicas, verifica tu rol activo antes de iniciar revisiones o elaborar un PEA.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                {(['blue', 'emerald', 'amber'] as const).map((tone, idx) => (
                    <div key={idx} className="flex-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 space-y-1">
                        <WfStatusBadge tone={tone} barWidth="w-8" />
                        <span className="block w-1/2 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    </div>
                ))}
            </WfZone>
            <WfZone className={`flex-1 divide-y divide-slate-100 dark:divide-zinc-800 justify-center ${highlightBottomClass}`}>
                <WfListRow dotTone="blue" titleWidth="w-24" metaWidth="w-14" actionTone="blue" />
                <WfListRow dotTone="amber" titleWidth="w-20" metaWidth="w-12" actionTone="amber" />
                <WfListRow dotTone="emerald" titleWidth="w-24" metaWidth="w-16" actionTone="neutral" />
            </WfZone>
        </>
    )
};

export const DASHBOARD_CONFIG: HelpConfig = {
    icon: <Activity size={20} className="text-[#0070f3]" />,
    title: 'Panel de Control Curricular',
    summary: 'Tablero principal adaptado a tu rol institucional para gestionar y supervisar el ciclo de vida de los PEAs.',
    description: 'Centraliza el estado de las asignaturas del período lectivo vigente sincronizadas con SIGAFI, los plazos normativos del calendario académico y las acciones inmediatas según tu responsabilidad curricular.',
    roleOverrides: {
        docente: {
            title: 'Panel de Control Docente',
            summary: 'Resumen operativo de tus asignaturas asignadas, horas distributivas y estado de tus PEAs.',
            description: 'Visualiza tu carga horaria oficial (CD, APE, TA), el avance de elaboración de tus Programas de Estudio de la Asignatura y las observaciones pendientes de subsanación.'
        },
        coord_carrera: {
            title: 'Panel de Coordinación de Carrera',
            summary: 'Consola de seguimiento curricular de los PEAs pertenecientes a tu carrera.',
            description: 'Supervisa el cumplimiento de entregas de los docentes de tu carrera, revisa instrumentos pendientes de aval y coordina el trabajo colegiado.'
        },
        coord_acad: {
            title: 'Panel de Coordinación Académica',
            summary: 'Control institucional transversal de la planificación microcurricular del ISTPET.',
            description: 'Monitorea el avance global por carreras, valida la coherencia normativa de los PEAs avalados y administra el cumplimiento de plazos.'
        },
        vicerrector: {
            title: 'Panel de Vicerrectorado Académico',
            summary: 'Despacho de aprobación final y legalización institucional de instrumentos curriculares.',
            description: 'Supervisa las métricas consolidadas de cumplimiento por carrera y ejecuta la revisión y firma final de los PEAs listos para legalización.'
        },
        admin: {
            title: 'Panel de Administración Curricular',
            summary: 'Vista ejecutiva integral del sistema DOSIER, períodos activos y estado operativo.',
            description: 'Permite alternar entre vistas de rol institucional, supervisar la sincronización con SIGAFI y acceder a los módulos de gobernanza.'
        }
    },
    steps: [
        {
            title: 'Selector de rol y contexto del período',
            description: 'En la parte superior se muestra el período lectivo activo y, si tienes múltiples roles asignados, el selector para cambiar de perspectiva operativa sin cerrar sesión.',
            highlight: 'content-top'
        },
        {
            title: 'Resumen de estado curricular y plazos',
            description: 'Consulta las fichas clave-valor del período: asignaturas en borrador, en revisión colegiada, con observaciones o aprobadas, junto con las fechas límite vigentes.',
            highlight: 'content-top'
        },
        {
            title: 'Acciones directas sobre asignaturas y bandejas',
            description: 'Accede directamente a elaborar o corregir un PEA (como Docente) o a revisar y emitir dictámenes sobre instrumentos enviados (como Coordinación o Vicerrectorado).',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Respalda el seguimiento oportuno de la planificación microcurricular y la verificación de carga horaria docente conforme al Reglamento de Régimen Académico y estándares CACES.',
    tips: [
        {
            text: 'Si alguna asignatura de tu distributivo no aparece en el panel, verifica que el período lectivo activo esté sincronizado con SIGAFI.',
            roles: ['docente', 'admin']
        },
        {
            text: 'Prioriza los PEAs marcados con observaciones para subsanarlos antes del cierre de entregas del período.',
            roles: ['docente']
        },
        {
            text: 'Usa el selector de rol superior para inspeccionar cómo visualiza el flujo cada perfil curricular cuando realizas soporte.',
            roles: ['admin']
        },
        'Haz clic directamente en cualquier asignatura o expediente listado para abrir su flujo correspondiente.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <div className="space-y-1">
                    <span className="block w-20 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    <span className="block w-28 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="flex items-center gap-1">
                    <WfSelect widthClass="w-14" active />
                    <WfSelect widthClass="w-12" />
                </div>
            </WfZone>
            <WfZone layout="split" className={`flex-1 ${highlightBottomClass}`}>
                <div className="flex-[1.6] flex flex-col gap-1.5 min-w-0">
                    <WfTabs count={3} activeIndex={1} />
                    <WfSearchBar widthClass="w-full" />
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800 flex-1 flex flex-col justify-center">
                        <WfListRow dotTone="blue" titleWidth="w-24" progress={75} actionTone="blue" />
                        <WfListRow dotTone="amber" titleWidth="w-20" progress={35} actionTone="amber" />
                    </div>
                </div>
                <div className="flex-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-1.5 flex flex-col gap-1.5">
                    <span className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    <div className="space-y-1.5 pt-0.5">
                        <WfListRow dotTone="blue" titleWidth="w-12" metaWidth="w-8" />
                        <WfListRow dotTone="emerald" titleWidth="w-10" metaWidth="w-7" />
                    </div>
                </div>
            </WfZone>
        </>
    )
};

export const SETTINGS_CONFIG: HelpConfig = {
    icon: <Settings2 size={20} className="text-[#0070f3]" />,
    title: 'Configuración y Firma Electrónica',
    summary: 'Administración de perfil personal, certificado de firma electrónica PKCS#12 y parámetros del sistema.',
    description: 'Espacio para gestionar tus datos de usuario, cargar y validar tu certificado de firma digital (.p12) para suscribir PEAs oficiales, y —para administradores— configurar períodos académicos y almacenamiento.',
    steps: [
        {
            title: 'Navegación por pestañas sobre riel',
            description: 'Alterna entre las secciones disponibles en la parte superior: Mi Perfil y Firma Electrónica para todos los usuarios, y pestañas administrativas de Parámetros Normativos, Plantillas o Almacenamiento según tus permisos.',
            highlight: 'content-top'
        },
        {
            title: 'Gestión de firma electrónica PKCS#12',
            description: 'Carga tu certificado digital (.p12) emitido por una entidad certificadora autorizada (como FirmaEC) o verifica el estado de tu firma institucional interna (DFRM) para legalizar documentos.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Alineado con la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos del Ecuador y el resguardo seguro de credenciales criptográficas.',
    tips: [
        'Tu archivo .p12 y su contraseña se protegen mediante cifrado antes de su almacenamiento.',
        'Verifica la fecha de vigencia de tu certificado digital antes de los cierres de aprobación de PEAs.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone className={`shrink-0 ${highlightTopClass}`}>
                <WfTabs count={3} activeIndex={0} />
            </WfZone>
            <WfZone className={`flex-1 justify-between ${highlightBottomClass}`}>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0070f3]/15 border border-[#0070f3]/30 shrink-0" />
                        <div className="space-y-1">
                            <span className="block w-24 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                            <span className="block w-16 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
                        </div>
                    </div>
                    <WfCheckBadge />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    <span className="h-4 rounded-md border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
                    <span className="h-4 rounded-md border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
                </div>
                <div className="rounded-md border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 px-2 py-1.5 flex items-center justify-between">
                    <WfStatusBadge tone="emerald" barWidth="w-20" />
                    <WfButton tone="blue" widthClass="w-10" heightClass="h-3" />
                </div>
            </WfZone>
        </>
    )
};

export const ANALYTICS_CONFIG: HelpConfig = {
    icon: <BarChart3 size={20} className="text-[#0070f3]" />,
    title: 'Analíticas Curriculares',
    summary: 'Tablero de seguimiento cuantitativo sobre cobertura de PEAs, avance por carrera y tiempos de revisión.',
    description: 'Consola gerencial para autoridades y coordinadores que permite evaluar el estado global de elaboración, revisión y aprobación de los Programas de Estudio de la Asignatura por período académico y carrera.',
    steps: [
        {
            title: 'Filtros por período y carrera',
            description: 'Segmenta los indicadores utilizando los controles superiores para enfocar el análisis en un período lectivo específico o en una carrera determinada.',
            highlight: 'content-top'
        },
        {
            title: 'Distribución de estados y cumplimiento',
            description: 'Analiza los gráficos y tablas comparativas de PEAs en Borrador, En Revisión, Con Observaciones y Aprobados, identificando cuellos de botella en el circuito colegiado.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Proporciona evidencia cuantitativa verificable sobre cobertura microcurricular y cumplimiento de plazos académicos para auditorías internas y procesos CACES.',
    tips: [
        'Revisa periódicamente las carreras con mayor porcentaje de borradores pendientes para emitir recordatorios oportunos.',
        'Combina esta vista con la bandeja de Supervisión Curricular para gestionar devoluciones específicas.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <div className="flex items-center gap-1.5">
                    <WfSelect widthClass="w-16" active />
                    <WfSelect widthClass="w-16" />
                </div>
                <WfButton tone="blue" widthClass="w-12" />
            </WfZone>
            <WfZone layout="split" className={`flex-1 ${highlightBottomClass}`}>
                <WfDonutChart />
                <WfBarChart />
            </WfZone>
        </>
    )
};

export const NOTIFICATIONS_CONFIG: HelpConfig = {
    icon: <Bell size={20} className="text-[#0070f3]" />,
    title: 'Centro de Notificaciones',
    summary: 'Bandeja unificada de alertas del flujo curricular, observaciones de revisión y firmas pendientes.',
    description: 'Agrupa todas las comunicaciones automáticas del sistema DOSIER: asignaciones de cátedra, devoluciones con observaciones, aprobaciones de coordinación y alertas de vencimiento del calendario.',
    steps: [
        {
            title: 'Filtros y lectura masiva',
            description: 'Filtra las notificaciones por estado (No leídas, Todas) y marca alertas como leídas de forma individual o masiva desde la barra superior.',
            highlight: 'content-top'
        },
        {
            title: 'Navegación directa al documento',
            description: 'Haz clic sobre cualquier notificación del folio para abrir directamente el PEA, monitoreo o revisión técnica relacionada.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Mantiene registro trazable de las comunicaciones oficiales emitidas dentro del circuito de aprobación curricular.',
    tips: [
        'Las notificaciones no leídas se identifican con un punto azul discreto a la izquierda.',
        'Atiende con prioridad las alertas de observaciones para no retrasar la aprobación del PEA.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfTabs count={2} activeIndex={1} />
                <WfButton tone="neutral" widthClass="w-12" heightClass="h-3" />
            </WfZone>
            <WfZone className={`flex-1 divide-y divide-slate-100 dark:divide-zinc-800 justify-center ${highlightBottomClass}`}>
                <WfListRow dotTone="blue" titleWidth="w-28" metaWidth="w-16" actionTone="neutral" />
                <WfListRow dotTone="blue" titleWidth="w-24" metaWidth="w-14" actionTone="neutral" />
                <WfListRow dotTone="neutral" titleWidth="w-24" metaWidth="w-12" />
            </WfZone>
        </>
    )
};

export const VERIFY_CONFIG: HelpConfig = {
    icon: <ShieldCheck size={20} className="text-[#0070f3]" />,
    title: 'Verificación de Autenticidad y Firmas',
    summary: 'Portal de validación pública para comprobar la integridad y vigencia de documentos PEA emitidos por DOSIER.',
    description: 'Permite verificar documentos oficiales generados por el sistema ingresando su código alfanumérico de verificación o escaneando el código QR estampado en el PDF.',
    steps: [
        {
            title: 'Búsqueda por código institucional',
            description: 'Ingresa el código único impreso en el pie de página o sello del PDF y presiona Validar para consultar el registro forense en tiempo real.',
            highlight: 'content-top'
        },
        {
            title: 'Dictamen de integridad y firmantes',
            description: 'Inspecciona el resultado devuelto: vigencia del documento, hash de integridad SHA-256, fecha de emisión y cadena de autoridades firmantes.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Garantiza la autenticidad, integridad y no repudio de los Programas de Estudio de la Asignatura legalizados ante auditorías académicas del CACES y CES.',
    tips: [
        'El enlace del código QR apunta directamente a esta vista con el código precargado.',
        'Esta verificación está disponible tanto dentro de la sesión como para consulta pública externa.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfSearchBar />
                <WfButton tone="blue" widthClass="w-12" />
            </WfZone>
            <WfZone className={`flex-1 items-center justify-center ${highlightBottomClass}`}>
                <div className="flex items-center gap-3">
                    <WfQrGlyph />
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <WfCheckBadge />
                            <span className="w-16 h-2 rounded-full bg-emerald-500/40" />
                        </div>
                        <span className="block w-24 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="w-4 h-0.5 bg-emerald-400" />
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="w-4 h-0.5 bg-emerald-400" />
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                    </div>
                </div>
            </WfZone>
        </>
    )
};

export const CALENDARIO_CONFIG: HelpConfig = {
    icon: <Calendar size={20} className="text-[#0070f3]" />,
    title: 'Calendario de Actividades e Hitos PEA',
    summary: 'Cronograma normativo del período académico con fechas límite de elaboración, revisión y aprobación de PEAs.',
    description: 'Visualiza los hitos oficiales programados por la institución para el ciclo lectivo vigente. Permite consultar vencimientos en vista de calendario o tablero según tu perfil.',
    steps: [
        {
            title: 'Controles de período y filtros de vista',
            description: 'Navega entre meses o cambia de perspectiva en la barra superior para localizar entregas de PEAs, ventanas de revisión colegiada y cierres de período.',
            highlight: 'content-top'
        },
        {
            title: 'Detalle de hitos y plazos normativos',
            description: 'Selecciona cualquier evento del calendario para consultar su descripción, rango de fechas, estado y responsables asignados.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Asegura el cumplimiento del cronograma académico oficial aprobado por el Órgano Colegiado Superior y su trazabilidad documental.',
    tips: [
        'Consulta las fechas de corte antes de enviar tu PEA a revisión para evitar bloqueos por cierre de ventana.',
        'Los administradores pueden gestionar los hitos institucionales desde Configuración > Parámetros.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                        <span className="w-1 h-1 border-l border-b border-slate-400 rotate-45" />
                    </span>
                    <span className="w-16 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    <span className="w-3.5 h-3.5 rounded border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                        <span className="w-1 h-1 border-r border-t border-slate-400 rotate-45" />
                    </span>
                </div>
                <div className="flex gap-1">
                    <WfButton tone="neutral" widthClass="w-8" heightClass="h-3.5" />
                    <WfButton tone="blue" widthClass="w-8" heightClass="h-3.5" />
                </div>
            </WfZone>
            <WfZone className={`flex-1 ${highlightBottomClass}`}>
                <WfCalendarGrid highlightedDays={[3, 9, 12]} />
            </WfZone>
        </>
    )
};

export const PAPELERA_CONFIG: HelpConfig = {
    icon: <Trash2 size={20} className="text-[#0070f3]" />,
    title: 'Papelera de Reciclaje',
    summary: 'Resguardo temporal de instrumentos y registros eliminados con opción de restauración o borrado definitivo.',
    description: 'Centraliza los elementos eliminados lógicamente dentro de DOSIER para prevenir pérdidas accidentales de información curricular.',
    steps: [
        {
            title: 'Búsqueda y filtrado de elementos eliminados',
            description: 'Localiza el registro eliminado revisando su tipo, título y fecha de envío a la papelera en la cabecera de la lista.',
            highlight: 'content-top'
        },
        {
            title: 'Restauración o eliminación permanente',
            description: 'Usa la acción Restaurar para devolver el elemento a su módulo original, o Eliminar permanentemente cuando confirmes que ya no es requerido.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Previene la pérdida accidental de evidencia académica manteniendo control sobre la retención y eliminación de registros.',
    tips: [
        'La eliminación permanente es irreversible; verifica siempre el código de la asignatura antes de confirmar.',
        'Los documentos aprobados y firmados cuentan con protección normativa contra borrado accidental.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfSearchBar />
                <WfSelect widthClass="w-16" />
            </WfZone>
            <WfZone className={`flex-1 divide-y divide-slate-100 dark:divide-zinc-800 justify-center ${highlightBottomClass}`}>
                <WfListRow dotTone="neutral" titleWidth="w-24" metaWidth="w-14" secondaryAction actionTone="rose" />
                <WfListRow dotTone="neutral" titleWidth="w-20" metaWidth="w-12" secondaryAction actionTone="rose" />
            </WfZone>
        </>
    )
};

export const SOLICITUDES_CONFIG: HelpConfig = {
    icon: <FolderKanban size={20} className="text-[#0070f3]" />,
    title: 'Solicitudes y Trámites Curriculares',
    summary: 'Catálogo centralizado de canales operativos y trámites académicos disponibles según tu rol.',
    description: 'Reúne accesos directos a los distintos trámites curriculares del ISTPET habilitados para tu perfil, redirigiendo al flujo correspondiente.',
    steps: [
        {
            title: 'Identificación de trámites disponibles',
            description: 'Explora las tarjetas del catálogo filtradas automáticamente según tus roles asignados en DOSIER.',
            highlight: 'content-bottom'
        },
        {
            title: 'Ejecución directa del trámite',
            description: 'Haz clic en la acción de cualquier tarjeta para ir al módulo operativo donde se procesa la solicitud o gestión.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Estandariza los canales de atención y tramitación curricular institucional.',
    tips: [
        'Si no visualizas un trámite específico, verifica tu rol activo en la barra superior o consulta con Administración.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfSearchBar />
                <WfStatusBadge tone="blue" barWidth="w-10" />
            </WfZone>
            <WfZone layout="grid2" className={`flex-1 ${highlightBottomClass}`}>
                <WfMiniCard dotTone="blue" actionTone="blue" />
                <WfMiniCard dotTone="emerald" actionTone="blue" />
            </WfZone>
        </>
    )
};

export const INCIDENCIAS_CONFIG: HelpConfig = {
    icon: <MessageSquareWarning size={20} className="text-[#0070f3]" />,
    title: 'Buzón de Incidencias y Soporte',
    summary: 'Canal directo para reportar novedades técnicas, inconsistencias de datos SIGAFI o sugerencias de mejora.',
    description: 'Permite a los usuarios registrar reportes con seguimiento en hilo de conversación y a los administradores gestionar, responder y resolver cada caso.',
    roleOverrides: {
        admin: {
            title: 'Bandeja de Incidencias (Administración)',
            summary: 'Consola de atención, respuesta y cierre de reportes enviados por docentes y coordinadores.',
            description: 'Centraliza todos los tickets reportados en la plataforma, permitiendo abrir conversaciones, actualizar estados y dar solución oportuna.'
        }
    },
    steps: [
        {
            title: 'Registro o filtrado de incidencias',
            description: 'Crea un nuevo reporte describiendo el módulo afectado y el detalle observado, o filtra la bandeja por estado de atención.',
            highlight: 'content-top'
        },
        {
            title: 'Seguimiento y conversación en hilo',
            description: 'Abre cualquier incidencia para revisar las respuestas de soporte, adjuntar aclaraciones y confirmar la resolución.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Documenta la atención de incidentes operativos y solicitudes de soporte técnico dentro de la plataforma institucional.',
    tips: [
        'Indica el código de la asignatura o la ruta exacta de la pantalla donde ocurrió la novedad para agilizar la atención.',
        'Los mensajes nuevos sin leer se destacan en la lista para seguimiento inmediato.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfTabs count={2} activeIndex={0} />
                <WfButton tone="blue" widthClass="w-12" />
            </WfZone>
            <WfZone layout="split" className={`flex-1 ${highlightBottomClass}`}>
                <div className="flex-1 divide-y divide-slate-100 dark:divide-zinc-800 flex flex-col justify-center">
                    <WfListRow dotTone="amber" titleWidth="w-16" metaWidth="w-10" />
                    <WfListRow dotTone="emerald" titleWidth="w-14" metaWidth="w-10" />
                </div>
                <WfThreadBubbles />
            </WfZone>
        </>
    )
};

export const LOPDP_ADMIN_CONFIG: HelpConfig = {
    icon: <ShieldCheck size={20} className="text-[#0070f3]" />,
    title: 'Panel de Administración LOPDP',
    summary: 'Consola de gobernanza y auditoría de consentimientos de protección de datos personales.',
    description: 'Permite a los administradores auditar la bitácora completa de consentimientos otorgados por los usuarios conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.',
    steps: [
        {
            title: 'Filtros de búsqueda y versión de política',
            description: 'Filtra los registros por usuario, estado de aceptación o versión de la política institucional vigente.',
            highlight: 'content-top'
        },
        {
            title: 'Auditoría de consentimiento digital',
            description: 'Consulta fecha, versión aceptada, dirección IP y agente de usuario registrados al momento de la aceptación.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Asegura el registro permanente y verificable exigido al Responsable de Tratamiento por la Ley Orgánica de Protección de Datos Personales (LOPDP).',
    tips: [
        'Los usuarios que aún no aceptan la política vigente son redirigidos automáticamente al flujo de consentimiento antes de operar.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfSearchBar />
                <WfSelect widthClass="w-16" active />
            </WfZone>
            <WfZone className={`flex-1 divide-y divide-slate-100 dark:divide-zinc-800 justify-center ${highlightBottomClass}`}>
                {[1, 2, 3].map((row) => (
                    <div key={row} className="flex items-center justify-between py-1 gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-zinc-700 shrink-0" />
                            <div className="space-y-1">
                                <span className="block w-24 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                                <span className="block w-16 h-1 rounded-full bg-slate-200 dark:bg-zinc-800" />
                            </div>
                        </div>
                        <WfCheckBadge />
                    </div>
                ))}
            </WfZone>
        </>
    )
};
