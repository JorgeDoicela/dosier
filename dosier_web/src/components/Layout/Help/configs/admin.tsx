import {
    Shield, History, Mail, LayoutTemplate, HardDrive
} from 'lucide-react';
import type { HelpConfig, MockupProps } from '../types';
import {
    WfZone,
    WfSearchBar,
    WfSelect,
    WfTabs,
    WfButton,
    WfStatusBadge,
    WfProgressBar,
    WfListRow,
    WfCheckBadge,
    WfDiffPanel
} from '../WireframePrimitives';

export const USUARIOS_CONFIG: HelpConfig = {
    icon: <Shield size={20} className="text-[#0070f3]" />,
    title: 'Gestión de Usuarios y Roles Curriculares',
    summary: 'Control administrativo de identidades, sincronización con SIGAFI y asignación de los 5 roles institucionales.',
    description: 'Consola para administrar accesos y capacidades en DOSIER. Permite asignar los roles oficiales (Administrador, Vicerrector, Coordinador Académico, Coordinador de Carrera y Docente) y verificar el estado de firma electrónica PKCS#12.',
    steps: [
        {
            title: 'Filtros por categoría de personal y estado',
            description: 'Filtra la nómina entre Docentes, Administrativos o Con carga docente usando los controles superiores y el buscador por nombre o cédula.',
            highlight: 'content-top'
        },
        {
            title: 'Asignación dinámica de roles y revisión de perfiles',
            description: 'Activa o ajusta los roles curriculares directamente en la tabla y abre el panel de detalles de cualquier usuario para auditar su firma PKCS#12 y vinculación con SIGAFI.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Respalda el control de acceso basado en roles (RBAC) y la idoneidad de los firmantes exigida por el CACES para documentos académicos oficiales.',
    tips: [
        'Las cuentas docentes y carreras se sincronizan desde la frontera de solo lectura de SIGAFI.',
        'Un usuario puede tener múltiples roles (por ejemplo Docente y Coordinador de Carrera) y alternar entre ellos desde su panel.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone className={`shrink-0 ${highlightTopClass}`}>
                <WfTabs count={3} activeIndex={0} />
                <WfSearchBar widthClass="w-full" />
            </WfZone>
            <WfZone className={`flex-1 divide-y divide-slate-100 dark:divide-zinc-800 justify-center ${highlightBottomClass}`}>
                {[true, true, false].map((hasCert, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-zinc-700 shrink-0" />
                            <div className="space-y-1">
                                <span className="block w-20 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                                <span className="block w-14 h-1 rounded-full bg-slate-200 dark:bg-zinc-800" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {hasCert ? <WfCheckBadge /> : <WfStatusBadge tone="amber" barWidth="w-6" />}
                            <WfButton tone="neutral" widthClass="w-8" heightClass="h-3" />
                        </div>
                    </div>
                ))}
            </WfZone>
        </>
    )
};

export const AUDITORIA_CONFIG: HelpConfig = {
    icon: <History size={20} className="text-[#0070f3]" />,
    title: 'Registro de Auditoría del Sistema',
    summary: 'Bitácora cronológica de eventos, cambios estructurales y trazabilidad forense de DOSIER.',
    description: 'Registra cada acción relevante ejecutada en la plataforma: usuario operante, módulo afectado, fecha y hora exacta, dirección IP y detalle de cambios (antes y después).',
    steps: [
        {
            title: 'Filtros de búsqueda y exportación de reportes',
            description: 'Acota los registros por módulo, tipo de acción, rango de fechas o usuario desde la barra superior, y exporta reportes certificados cuando sea requerido.',
            highlight: 'content-top'
        },
        {
            title: 'Inspección de diferencias estructuradas (Diff)',
            description: 'Selecciona cualquier fila de la bitácora para inspeccionar los valores anteriores y nuevos de los campos modificados.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Garantiza integridad de la información y trazabilidad forense conforme a auditorías tecnológicas del CACES y la LOPDP.',
    tips: [
        'Usa los filtros por rango de fechas para auditar ventanas específicas de aprobación o cambios de roles.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfSearchBar />
                <div className="flex items-center gap-1">
                    <WfSelect widthClass="w-14" />
                    <WfButton tone="neutral" widthClass="w-10" />
                </div>
            </WfZone>
            <WfZone layout="split" className={`flex-1 ${highlightBottomClass}`}>
                <div className="flex-[1.3] divide-y divide-slate-100 dark:divide-zinc-800 flex flex-col justify-center">
                    <WfListRow dotTone="blue" titleWidth="w-16" metaWidth="w-10" />
                    <WfListRow dotTone="emerald" titleWidth="w-14" metaWidth="w-12" />
                    <WfListRow dotTone="neutral" titleWidth="w-16" metaWidth="w-8" />
                </div>
                <WfDiffPanel />
            </WfZone>
        </>
    )
};

export const PLANTILLAS_CONFIG: HelpConfig = {
    icon: <LayoutTemplate size={20} className="text-[#0070f3]" />,
    title: 'Editor de Plantillas Documentales',
    summary: 'Diseñador visual de moldes oficiales PEA con bloques modulares, propiedades y previsualización PDF.',
    description: 'Permite configurar la estructura maestra de los formatos institucionales (como PEA_OFICIAL). Los cambios realizados en el molde aplican a nuevas instancias sin alterar documentos ya generados.',
    steps: [
        {
            title: 'Barra de acciones y previsualización PDF',
            description: 'En la cabecera puedes previsualizar el PDF en caliente con los bloques y estilos actuales o restablecer la plantilla oficial cuando sea necesario.',
            highlight: 'content-top'
        },
        {
            title: 'Lienzo interactivo y panel de propiedades',
            description: 'Organiza bloques en el lienzo central y ajusta su configuración en el panel lateral derecho (Propiedades y Estilos) sin perder reactividad.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Mantiene la separación entre el molde maestro institucional y las instancias inmutables de cada asignatura.',
    tips: [
        'Las instancias de PEA ya resueltas conservan su snapshot original para evitar desconfiguraciones en documentos en curso.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfSelect widthClass="w-20" active />
                <div className="flex items-center gap-1">
                    <WfButton tone="neutral" widthClass="w-10" />
                    <WfButton tone="blue" widthClass="w-10" />
                </div>
            </WfZone>
            <WfZone layout="split" className={`flex-1 ${highlightBottomClass}`}>
                <div className="flex-[1.6] space-y-1.5 flex flex-col justify-center">
                    <div className="h-5 rounded border border-[#0070f3] bg-blue-50/40 dark:bg-blue-950/20 px-1.5 flex items-center">
                        <span className="w-1/2 h-1.5 rounded-full bg-[#0070f3]" />
                    </div>
                    <div className="h-6 rounded border border-slate-200 dark:border-zinc-800 px-1.5 flex items-center">
                        <span className="w-2/3 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    </div>
                    <div className="h-5 rounded border border-slate-200 dark:border-zinc-800 px-1.5 flex items-center">
                        <span className="w-1/2 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700" />
                    </div>
                </div>
                <div className="flex-1 rounded-md border border-slate-200 dark:border-zinc-800 p-1.5 space-y-1.5">
                    <WfTabs count={2} activeIndex={0} />
                    <span className="block w-full h-3 rounded border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
                    <span className="block w-full h-3 rounded border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
                </div>
            </WfZone>
        </>
    )
};

export const ALMACENAMIENTO_CONFIG: HelpConfig = {
    icon: <HardDrive size={20} className="text-[#0070f3]" />,
    title: 'Almacenamiento y Copias de Seguridad',
    summary: 'Consola de mantenimiento documental, diagnóstico de archivos y respaldo de documentos generados.',
    description: 'Permite a los administradores supervisar el almacenamiento de documentos PDF, anexos y copias de seguridad del sistema.',
    steps: [
        {
            title: 'Resumen de uso y mantenimiento',
            description: 'Consulta el estado del almacenamiento de archivos institucionales y ejecuta tareas de verificación o respaldo.',
            highlight: 'content-top'
        },
        {
            title: 'Gestión de archivos y respaldos',
            description: 'Inspecciona el listado de paquetes de respaldo y verifica su integridad para recuperación ante contingencias.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Respalda la continuidad operativa y preservación documental exigida para repositorios académicos institucionales.',
    tips: [
        'Programa copias de seguridad periódicas antes de realizar actualizaciones mayores o cierres de período lectivo.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfStatusBadge tone="emerald" barWidth="w-20" />
                <WfButton tone="blue" widthClass="w-12" />
            </WfZone>
            <WfZone className={`flex-1 justify-between ${highlightBottomClass}`}>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="w-16 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                        <span className="w-8 h-1.5 rounded-full bg-[#0070f3]/60" />
                    </div>
                    <WfProgressBar percent={42} tone="blue" />
                </div>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                    <WfListRow dotTone="emerald" titleWidth="w-24" metaWidth="w-12" actionTone="neutral" />
                    <WfListRow dotTone="emerald" titleWidth="w-20" metaWidth="w-10" actionTone="neutral" />
                </div>
            </WfZone>
        </>
    )
};

export const EMAILS_CONFIG: HelpConfig = {
    icon: <Mail size={20} className="text-[#0070f3]" />,
    title: 'Plantillas y Correos Institucionales',
    summary: 'Administración de plantillas de correo transaccionales y configuración de notificaciones por email.',
    description: 'Permite editar las plantillas HTML de notificaciones automáticas del circuito PEA (envío a revisión, devolución con observaciones, aprobación final) y realizar envíos de prueba.',
    steps: [
        {
            title: 'Configuración y envío de prueba',
            description: 'Valida la conexión con el servidor de correo institucional y envía un mensaje de prueba antes de publicar cambios.',
            highlight: 'content-top'
        },
        {
            title: 'Edición de plantillas y variables dinámicas',
            description: 'Selecciona una plantilla de la lista izquierda y ajusta su contenido HTML utilizando las variables dinámicas disponibles.',
            highlight: 'content-bottom'
        }
    ],
    compliance: 'Asegura la formalidad de las comunicaciones automáticas emitidas durante el flujo de revisión y aprobación curricular.',
    tips: [
        'Conserva intactas las variables entre llaves dobles (por ejemplo {{nombre_usuario}}) para que los datos se reemplacen correctamente.'
    ],
    Mockup: ({ highlightTopClass, highlightBottomClass }: MockupProps) => (
        <>
            <WfZone layout="row" className={`shrink-0 ${highlightTopClass}`}>
                <WfStatusBadge tone="emerald" barWidth="w-20" />
                <WfButton tone="blue" widthClass="w-12" />
            </WfZone>
            <WfZone layout="split" className={`flex-1 ${highlightBottomClass}`}>
                <div className="flex-1 space-y-1 flex flex-col justify-center">
                    <div className="h-4 rounded border border-[#0070f3] bg-blue-50/40 dark:bg-blue-950/20 px-1.5 flex items-center">
                        <span className="w-3/4 h-1.5 rounded-full bg-[#0070f3]" />
                    </div>
                    <div className="h-4 rounded border border-slate-200 dark:border-zinc-800 px-1.5 flex items-center">
                        <span className="w-2/3 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    </div>
                    <div className="h-4 rounded border border-slate-200 dark:border-zinc-800 px-1.5 flex items-center">
                        <span className="w-1/2 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700" />
                    </div>
                </div>
                <div className="flex-[1.6] rounded-md border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2 space-y-1.5">
                    <span className="block w-1/2 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    <div className="flex gap-1">
                        <span className="w-8 h-2.5 rounded bg-[#0070f3]/15 border border-[#0070f3]/30" />
                        <span className="w-10 h-2.5 rounded bg-[#0070f3]/15 border border-[#0070f3]/30" />
                    </div>
                    <span className="block w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700" />
                    <span className="block w-4/5 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700" />
                </div>
            </WfZone>
        </>
    )
};
