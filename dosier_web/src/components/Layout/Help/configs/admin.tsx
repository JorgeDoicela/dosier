import {
    Shield, History, Mail, LayoutTemplate, HardDrive
} from 'lucide-react';
import type { HelpConfig, MockupProps } from '../types';

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
            <div className={`rounded-lg border p-1.5 flex flex-col gap-1 shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="flex gap-3 border-b border-slate-200 dark:border-zinc-800 pb-0.5 text-[6px]">
                    <span className="font-semibold text-[#0070f3] border-b border-[#0070f3] pb-0.5">Docentes</span>
                    <span className="text-slate-400">Administrativos</span>
                    <span className="text-slate-400">Con carga docente</span>
                </div>
            </div>
            <div className={`flex-1 rounded-lg border p-2 flex flex-col gap-1.5 transition-all duration-300 ${highlightBottomClass}`}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/70">
                        <div className="space-y-0.5">
                            <div className="w-24 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                            <div className="w-16 h-1 bg-slate-200 dark:bg-zinc-700 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[5px] font-mono text-emerald-600">PKCS#12</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                    </div>
                ))}
            </div>
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
            <div className={`rounded-lg border p-1.5 flex justify-between items-center shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="w-28 h-2.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                <div className="w-14 h-4 bg-slate-200 dark:bg-zinc-700 rounded" />
            </div>
            <div className={`flex-1 flex gap-1.5 min-h-0`}>
                <div className={`flex-[1.5] rounded-lg border p-1.5 space-y-1.5 transition-all duration-300 ${highlightBottomClass}`}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between py-0.5 border-b border-slate-100 dark:border-zinc-800">
                            <div className="w-16 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                            <div className="w-10 h-1.5 bg-[#0070f3]/60 rounded" />
                        </div>
                    ))}
                </div>
                <div className={`flex-1 rounded-lg border p-1.5 font-mono text-[5px] space-y-1 bg-slate-50 dark:bg-zinc-900 transition-all duration-300 ${highlightBottomClass}`}>
                    <div className="text-rose-500">- estado: Borrador</div>
                    <div className="text-emerald-600">+ estado: Aprobado</div>
                </div>
            </div>
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
            <div className={`h-8 rounded-lg border px-2 flex items-center justify-between shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="w-24 h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                <div className="flex gap-1">
                    <div className="w-12 h-3.5 border border-slate-200 dark:border-zinc-700 rounded" />
                    <div className="w-12 h-3.5 bg-[#0070f3] rounded" />
                </div>
            </div>
            <div className={`flex-1 flex gap-1.5 min-h-0`}>
                <div className={`flex-[2] rounded-lg border p-2 space-y-1.5 transition-all duration-300 ${highlightBottomClass}`}>
                    <div className="w-full h-5 rounded border border-[#0070f3] bg-[#0070f3]/5" />
                    <div className="w-full h-7 rounded border border-slate-200 dark:border-zinc-800" />
                    <div className="w-full h-5 rounded border border-slate-200 dark:border-zinc-800" />
                </div>
                <div className={`flex-1 rounded-lg border p-1.5 space-y-1 transition-all duration-300 ${highlightBottomClass}`}>
                    <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 pb-0.5 text-[5px]">
                        <span className="text-[#0070f3] font-semibold">Propiedades</span>
                        <span className="text-slate-400">Estilos</span>
                    </div>
                    <div className="w-full h-3 rounded bg-slate-100 dark:bg-zinc-900" />
                    <div className="w-full h-3 rounded bg-slate-100 dark:bg-zinc-900" />
                </div>
            </div>
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
            <div className={`h-8 rounded-lg border px-2 flex items-center justify-between shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="w-32 h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                <div className="w-14 h-4 bg-[#0070f3] rounded" />
            </div>
            <div className={`flex-1 rounded-lg border p-2 space-y-2 transition-all duration-300 ${highlightBottomClass}`}>
                <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-[#0070f3] rounded-full" />
                </div>
                <div className="space-y-1">
                    <div className="w-full h-5 rounded border border-slate-200 dark:border-zinc-800" />
                    <div className="w-full h-5 rounded border border-slate-200 dark:border-zinc-800" />
                </div>
            </div>
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
            <div className={`h-8 rounded-lg border px-2 flex items-center justify-between shrink-0 transition-all duration-300 ${highlightTopClass}`}>
                <div className="w-28 h-2 bg-slate-300 dark:bg-zinc-600 rounded" />
                <div className="w-14 h-4 bg-[#0070f3] rounded" />
            </div>
            <div className={`flex-1 flex gap-1.5 min-h-0`}>
                <div className={`flex-1 rounded-lg border p-1.5 space-y-1 transition-all duration-300 ${highlightBottomClass}`}>
                    <div className="w-full h-4 rounded border border-[#0070f3] bg-[#0070f3]/10" />
                    <div className="w-full h-4 rounded border border-slate-200 dark:border-zinc-800" />
                    <div className="w-full h-4 rounded border border-slate-200 dark:border-zinc-800" />
                </div>
                <div className={`flex-[1.8] rounded-lg border p-1.5 space-y-1 bg-slate-50 dark:bg-zinc-900 transition-all duration-300 ${highlightBottomClass}`}>
                    <div className="w-3/4 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                    <div className="w-2/3 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                </div>
            </div>
        </>
    )
};
