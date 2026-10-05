import React, { useState, useRef } from 'react';
import { ShieldCheck, LogOut, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lopdpService } from '../../services/lopdpService';
import { useAuth } from '../../api/AuthContext';
import { useNotifications } from '../../api/NotificationsContext';
import { useConfirm } from '../../api/ConfirmContext';

const LopdpConsentPage: React.FC = () => {
    const { logout, refreshUser, user } = useAuth();
    const { addToast } = useNotifications();
    const confirm = useConfirm();
    const navigate = useNavigate();

    const [hasRead, setHasRead] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Check if scrolled close to the bottom (within 10 pixels tolerance)
        const isBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
        if (isBottom) {
            setHasRead(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasRead || !accepted) return;

        setIsSubmitting(true);
        try {
            // Se registran ambos consentimientos de forma secuencial para evitar condiciones de carrera en base de datos
            await lopdpService.registrarConsentimiento('LOPDP_GENERAL');
            await lopdpService.registrarConsentimiento('FIRMA_ELECTRONICA');
            addToast('Consentimientos Registrados', 'Ha aceptado la política de tratamiento de datos y los términos de uso de firma electrónica.', 'success');
            // Refresh user state so the guard lets the user proceed
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
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0d11] flex flex-col items-center justify-center p-4 md:p-6">
            <div className="w-full max-w-2xl bg-surface p-6 md:p-8 space-y-6 border border-slate-200/90 dark:border-zinc-800 rounded-lg animate-scale-up">
                
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="text-[#0070f3] mb-1">
                        <ShieldCheck size={32} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-main">
                        Protección de Datos Personales (LOPDP)
                    </h1>
                    <p className="text-xs md:text-sm text-text-dim max-w-md">
                        Hola, <span className="font-semibold text-text-main">{user?.nombre_completo}</span>. Para poder ingresar a DOSIER, es necesario que leas y aceptes los términos de tratamiento de tus datos personales.
                    </p>
                </div>

                {/* Policy terms scroll container */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="border border-slate-200/90 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 rounded-lg p-4 md:p-6 h-[340px] overflow-y-auto custom-scrollbar text-xs md:text-sm text-text-dim space-y-4 leading-relaxed"
                >
                    <h3 className="font-bold text-text-main text-center uppercase tracking-wider text-xs md:text-sm mb-2">
                        TÉRMINOS DE CONSENTIMIENTO Y POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES
                    </h3>
                    <p className="text-center font-semibold text-text-main text-xs">
                        DOSIER — SISTEMA DE GESTIÓN DE PORTAFOLIO DOCENTE ISTPET (ECUADOR)
                    </p>

                    <p>
                        <strong>1. OBJETO Y ALCANCE:</strong><br />
                        El presente documento regula el tratamiento de los datos personales proporcionados por los docentes y autoridades académicas en la plataforma DOSIER. De conformidad con lo dispuesto en la Ley Orgánica de Protección de Datos Personales (LOPDP) de la República del Ecuador, garantizamos la confidencialidad, seguridad e integridad de su información.
                    </p>

                    <p>
                        <strong>2. FINALIDADES DEL TRATAMIENTO:</strong><br />
                        Sus datos personales serán tratados exclusivamente para las siguientes finalidades institucionales y académicas:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Elaboración, co-redacción y gestión de PEAs, Sílabos de 19 semanas, Guías APE y Guías de Estudio.</li>
                        <li>Registro y acreditación del portafolio docente ante los organismos de control de la educación superior (SENESCYT, CACES).</li>
                        <li>Habilitación y uso temporal de firmas electrónicas PKCS#12 (.p12) para la suscripción y legalización de documentos oficiales.</li>
                        <li>Revisión y validación curricular por coordinadores de carrera y vicerrectorado.</li>
                        <li>Envío de notificaciones críticas de la plataforma y alertas sobre fechas límite y parciales.</li>
                    </ul>

                    <p>
                        <strong>3. DATOS OBJETO DE TRATAMIENTO:</strong><br />
                        DOSIER recopila y procesa los siguientes datos:
                        Datos de identificación y contacto (nombres completos, cédula, correo institucional).
                        Datos académicos (asignaturas asignadas, mallas curriculares, títulos y grados académicos).
                        Datos técnicos de seguridad y de auditoría (dirección IP, navegador y dispositivo, fecha y hora de acceso, firmas electrónicas y códigos de verificación).
                    </p>

                    <p>
                        <strong>4. SEGURIDAD Y PRIVACIDAD DE LA FIRMA:</strong><br />
                        Los datos personales son custodiados utilizando altos estándares de seguridad informática. El certificado digital (.p12) y su contraseña ingresados para la firma electrónica se procesan de forma temporal en la memoria del servidor durante la firma y <strong>nunca se almacenan</strong> en bases de datos o discos del sistema.
                    </p>

                    <p className="border-t border-border-thin/50 pt-3 text-center text-[10px] font-semibold text-text-main">
                        --- FIN DEL DOCUMENTO ---
                    </p>
                </div>

                {/* Instructions helper */}
                {!hasRead && (
                    <p className="text-[10px] text-center text-text-dim/70 font-normal">
                        * La habilitación de la conformidad requiere completar la revisión íntegra de las condiciones descritas.
                    </p>
                )}

                {/* Checkbox Acceptance */}
                <div className={`flex items-start gap-3 p-3.5 bg-surface border rounded-lg transition-colors ${hasRead ? 'border-slate-200/90 dark:border-zinc-800 opacity-100' : 'border-slate-200/50 dark:border-zinc-850 opacity-50'}`}>
                    <input
                        type="checkbox"
                        id="lopdpAcceptanceCheckbox"
                        disabled={!hasRead}
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1 h-3.5 w-3.5 rounded border-slate-300 dark:border-zinc-700 accent-[#0070f3] cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label 
                        htmlFor="lopdpAcceptanceCheckbox"
                        className={`text-xs md:text-sm leading-relaxed select-none ${hasRead ? 'text-text-main cursor-pointer font-medium' : 'text-text-dim cursor-not-allowed'}`}
                    >
                        Declaro que he leído atentamente y otorgo mi consentimiento libre, específico, informado e inequívoco para el tratamiento de mis datos personales y autorizo el procesamiento temporal de mi firma electrónica en DOSIER según los términos descritos.
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="btn-vercel-secondary sm:w-1/3 order-2 sm:order-1 cursor-pointer"
                    >
                        <LogOut size={13} />
                        Cerrar Sesión
                    </button>
                    
                    <button
                        type="button"
                        disabled={!hasRead || !accepted || isSubmitting}
                        onClick={handleSubmit}
                        className="h-10 px-4 rounded-md font-medium text-xs text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors flex-1 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={13} />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={13} />
                                Aceptar y Continuar
                                <ArrowRight size={13} />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LopdpConsentPage;
