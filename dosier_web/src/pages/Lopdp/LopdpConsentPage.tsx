import React, { useState, useRef, useEffect } from 'react';
import { LogOut, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lopdpService } from '../../services/lopdpService';
import { useAuth } from '../../api/AuthContext';
import { useNotifications } from '../../api/NotificationsContext';
import { useConfirm } from '../../api/ConfirmContext';

const cleanLopdpHtml = (raw: string): string => {
    if (!raw) return '';

    let content = raw;

    // Eliminar el formulario simulado con checkbox duplicado del HTML institucional de origen
    content = content.replace(/<div class="acceptance-form">[\s\S]*?<\/div>/gi, '');

    // Extraer el contenido interior del .container para evitar el doble marco, margenes y fondos desalineados
    const containerMatch = content.match(/<div class="container">([\s\S]*?)<\/div>\s*(?:<\/body>)?\s*(?:<\/html>)?$/i);
    if (containerMatch && containerMatch[1]) {
        content = containerMatch[1];
    } else {
        // En caso de estructura alternativa, remover envolturas completas de documento
        content = content
            .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
            .replace(/<html[\s\S]*?>/gi, '')
            .replace(/<\/html>/gi, '')
            .replace(/<head>[\s\S]*?<\/head>/gi, '')
            .replace(/<body[\s\S]*?>/gi, '')
            .replace(/<\/body>/gi, '');
    }

    return content.trim();
};

const LopdpConsentPage: React.FC = () => {
    const { logout, refreshUser, user } = useAuth();
    const { addToast } = useNotifications();
    const confirm = useConfirm();
    const navigate = useNavigate();

    const [hasRead, setHasRead] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [terminoHtml, setTerminoHtml] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Bloquear el scroll global del body del navegador mientras esta pantalla esté activa
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        lopdpService.getTerminoVigente()
            .then(res => {
                if (isMounted && res?.contenido) {
                    setTerminoHtml(cleanLopdpHtml(res.contenido));
                }
            })
            .catch(err => {
                console.warn('Uso de plantilla de respaldo para LOPDP institucional:', err);
            });
        return () => { isMounted = false; };
    }, []);

    // Si el contenido cabe completamente en pantalla sin requerir scroll (ej. pantallas grandes), habilitar lectura
    useEffect(() => {
        const checkScrollable = () => {
            const container = scrollContainerRef.current;
            if (!container) return;
            if (container.scrollHeight <= container.clientHeight + 10) {
                setHasRead(true);
            }
        };
        const timer = setTimeout(checkScrollable, 200);
        return () => clearTimeout(timer);
    }, [terminoHtml]);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Comprueba si el usuario se ha desplazado hasta el final (tolerancia de 25px)
        const isBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 25;
        if (isBottom) {
            setHasRead(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasRead || !accepted) return;

        setIsSubmitting(true);
        try {
            // Se registra el consentimiento en pd_aceptaciones_usuarios de SIGAFI
            await lopdpService.registrarConsentimiento('LOPDP_GENERAL');
            addToast('Consentimiento Registrado', 'Ha aceptado la política de tratamiento de datos personales institucional.', 'success');
            await refreshUser();
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Error submitting LOPDP consent:', err);
            addToast('Error', 'No se pudo registrar su consentimiento. Intente nuevamente.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        const ok = await confirm({
            title: 'Cerrar Sesión',
            message: '¿Está seguro de que desea salir del sistema? Deberá iniciar sesión nuevamente para revisar y aceptar los términos institucionales.',
            confirmText: 'Cerrar Sesión',
            cancelText: 'Cancelar',
            variant: 'destructive',
            icon: LogOut,
        });
        if (!ok) return;
        await logout();
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 overflow-hidden bg-slate-100 dark:bg-[#090b0e] flex items-center justify-center p-3 sm:p-5 z-50">
            <div className="w-full max-w-4xl h-[calc(100dvh-2.5rem)] max-h-[760px] bg-white dark:bg-[#12161f] p-5 sm:p-7 md:p-8 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col animate-scale-up">
                
                {/* Header */}
                <div className="shrink-0 flex flex-col items-center text-center space-y-1.5 border-b border-slate-100 dark:border-zinc-800/80 pb-4 mb-3">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                        Protección de Datos Personales (LOPDP)
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-xl">
                        Hola, <span className="font-semibold text-slate-800 dark:text-zinc-200">{user?.nombre_completo}</span>. Para continuar en DOSIER, revise los términos institucionales de tratamiento de datos personales del ISTPET vigentes en SIGAFI.
                    </p>
                </div>

                {/* Policy terms scroll container (único scroll en pantalla) */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 min-h-[180px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0d1017] rounded-lg p-5 sm:p-7 overflow-y-auto custom-scrollbar text-xs sm:text-sm leading-relaxed"
                >
                    {terminoHtml ? (
                        <div 
                            className="lopdp-document-viewer text-slate-700 dark:text-zinc-300 space-y-4 [&_header]:text-center [&_header]:pb-5 [&_header]:mb-5 [&_header]:border-b-2 [&_header]:border-[#a6863b] [&_h1]:text-lg [&_h1]:sm:text-xl [&_h1]:font-bold [&_h1]:text-[#1f295b] dark:[&_h1]:text-blue-300 [&_.subtitle]:text-xs [&_.subtitle]:sm:text-sm [&_.subtitle]:font-semibold [&_.subtitle]:text-[#a6863b] [&_.subtitle]:mt-1 [&_h2]:text-xs [&_h2]:sm:text-sm [&_h2]:font-bold [&_h2]:text-[#1f295b] dark:[&_h2]:text-blue-300 [&_h2]:border-l-4 [&_h2]:border-[#a6863b] [&_h2]:pl-3 [&_h2]:mt-5 [&_h2]:mb-2 [&_p]:mb-3 [&_p]:text-justify [&_p]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:list-disc [&_a]:text-[#0070f3] [&_a]:underline [&_.highlight-box]:bg-amber-50 dark:[&_.highlight-box]:bg-amber-950/30 [&_.highlight-box]:border-l-4 [&_.highlight-box]:border-[#a6863b] [&_.highlight-box]:p-3.5 [&_.highlight-box]:rounded-r-md [&_.footer-info]:text-center [&_.footer-info]:text-xs [&_.footer-info]:text-slate-400 [&_.footer-info]:pt-5 [&_.footer-info]:mt-6 [&_.footer-info]:border-t [&_.footer-info]:border-slate-100 dark:[&_.footer-info]:border-zinc-800"
                            dangerouslySetInnerHTML={{ __html: terminoHtml }} 
                        />
                    ) : (
                        <div className="space-y-4 text-slate-700 dark:text-zinc-300">
                            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-center uppercase tracking-wider text-xs sm:text-sm mb-2">
                                TÉRMINOS DE CONSENTIMIENTO Y POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES
                            </h3>
                            <p className="text-center font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                                SISTEMA INSTITUCIONAL DE GESTIÓN ACADÉMICA ISTPET (ECUADOR)
                            </p>

                            <p className="text-justify">
                                <strong>1. OBJETO Y ALCANCE:</strong><br />
                                El presente documento regula el tratamiento de los datos personales proporcionados por los docentes y autoridades académicas en las plataformas del ISTPET. De conformidad con lo dispuesto en la Ley Orgánica de Protección de Datos Personales (LOPDP) de la República del Ecuador, garantizamos la confidencialidad, seguridad e integridad de su información.
                            </p>

                            <p className="text-justify">
                                <strong>2. FINALIDADES DEL TRATAMIENTO:</strong><br />
                                Sus datos personales serán tratados exclusivamente para las finalidades institucionales y académicas:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li>Elaboración, revisión y gestión curricular de PEAs, Sílabos y Guías de Estudio.</li>
                                <li>Registro y acreditación institucional ante organismos de control de la educación superior (SENESCYT, CACES).</li>
                                <li>Habilitación y validación de firmas digitales para la legalización de documentos oficiales.</li>
                                <li>Supervisión y control curricular por coordinadores de carrera y vicerrectorado.</li>
                            </ul>

                            <p className="text-justify">
                                <strong>3. DATOS OBJETO DE TRATAMIENTO:</strong><br />
                                Datos de identificación (nombres completos, cédula, correo institucional), datos académicos y carga distributiva (asignaturas, mallas curriculares, títulos y grados académicos), y metadatos técnicos de seguridad y trazabilidad (dirección IP, navegador, fecha y hora de acceso).
                            </p>

                            <p className="border-t border-slate-200 dark:border-zinc-800 pt-4 text-center text-xs font-semibold text-slate-400">
                                --- FIN DEL DOCUMENTO ---
                            </p>
                        </div>
                    )}
                </div>

                {/* Helper de lectura obligatoria (aparece solo si no ha terminado de desplazarse) */}
                {!hasRead && (
                    <p className="shrink-0 text-xs text-center text-slate-500 dark:text-zinc-400 font-medium pt-2">
                        Debe desplazarse hasta el final del documento para habilitar la casilla de conformidad.
                    </p>
                )}

                {/* Checkbox de Aceptación */}
                <div className={`shrink-0 flex items-start gap-3 p-3.5 mt-2 bg-white dark:bg-[#12161f] border rounded-lg transition-colors ${hasRead ? 'border-slate-300 dark:border-zinc-700 opacity-100' : 'border-slate-200 dark:border-zinc-800 opacity-60'}`}>
                    <input
                        type="checkbox"
                        id="lopdpAcceptanceCheckbox"
                        disabled={!hasRead}
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-[#0070f3] focus:ring-[#0070f3] cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label 
                        htmlFor="lopdpAcceptanceCheckbox"
                        className={`text-xs sm:text-sm leading-relaxed select-none ${hasRead ? 'text-slate-800 dark:text-zinc-200 cursor-pointer font-medium' : 'text-slate-400 dark:text-zinc-500 cursor-not-allowed'}`}
                    >
                        Declaro que he leído atentamente y otorgo mi consentimiento libre, específico, informado e inequívoco para el tratamiento de mis datos personales en los términos descritos por la institución.
                    </label>
                </div>

                {/* Botones de Acción */}
                <div className="shrink-0 flex flex-col sm:flex-row gap-3 pt-3">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="h-10 px-4 rounded-md font-medium text-xs text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 sm:w-1/3 order-2 sm:order-1 cursor-pointer"
                    >
                        <LogOut size={14} />
                        Cerrar Sesión
                    </button>
                    
                    <button
                        type="button"
                        disabled={!hasRead || !accepted || isSubmitting}
                        onClick={handleSubmit}
                        className="h-10 px-5 rounded-md font-medium text-xs text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors flex-1 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={14} />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={14} />
                                Aceptar y Continuar
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LopdpConsentPage;
