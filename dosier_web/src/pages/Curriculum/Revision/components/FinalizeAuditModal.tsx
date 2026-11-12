import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Scale,
    X,
    Loader2,
    CheckCircle2,
    RotateCcw,
    Clock,
    KeyRound,
    FileCheck2,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../../api/AuthContext';
import { getSignatureProfile, type UserSignatureProfileDto } from '../../../../services/signaturesService';
import { GeistDatePicker } from '../../../../components/Common/GeistDatePicker';

interface FinalizeAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    generalFeedback: string;
    setGeneralFeedback: (val: string) => void;
    submitting: boolean;
    onAprobar: (
        motivo: string,
        password?: string,
        tipoFirma?: 'DOSIER' | 'FirmaEC',
        certificadoP12Base64?: string,
        contraseniaP12?: string
    ) => Promise<boolean>;
    onDevolver: (fechaLimite?: string) => Promise<boolean>;
    pendingObservationsCount?: number;
    projectTitle?: string;
}

export const FinalizeAuditModal: React.FC<FinalizeAuditModalProps> = ({
    isOpen,
    onClose,
    generalFeedback,
    setGeneralFeedback,
    submitting,
    onAprobar,
    onDevolver,
    pendingObservationsCount = 0,
    projectTitle
}) => {
    const navigate = useNavigate();
    const { isCoordCarrera, isCoordAcad, isVicerrector, isAdmin, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'avalar' | 'devolver'>('avalar');

    // Perfil de firma digital configurado del usuario
    const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
    const [sigProfile, setSigProfile] = useState<UserSignatureProfileDto | null>(null);

    const [motivoAval, setMotivoAval] = useState(
        isVicerrector
            ? 'Aprobación definitiva y legalización microcurricular para vigencia académica e inspección CACES.'
            : isCoordAcad
                ? 'Aprobación de consistencia metodológica, cuadre de horas y ponderaciones normativas conforme al modelo educativo.'
                : 'Aprobación curricular favorable: contenidos mínimos, articulación con el perfil de egreso y pertinencia disciplinar aprobados.'
    );

    // Cargar perfil de firma al abrir el modal
    useEffect(() => {
        if (!isOpen) return;
        let isMounted = true;
        setLoadingProfile(true);
        getSignatureProfile()
            .then((data) => {
                if (isMounted) setSigProfile(data);
            })
            .catch((err) => {
                console.error('[DOSIER] Error al obtener perfil de firma institucional:', err);
            })
            .finally(() => {
                if (isMounted) setLoadingProfile(false);
            });
        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !submitting) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, submitting, onClose]);

    // Devolución
    const formatDateDDMMYYYY = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getFutureDate = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return formatDateDDMMYYYY(d);
    };

    const todayStr = React.useMemo(() => formatDateDDMMYYYY(new Date()), []);

    const [fechaLimite, setFechaLimite] = useState<string>(getFutureDate(2));
    const [selectedDays, setSelectedDays] = useState<number>(2);

    if (!isOpen) return null;

    const handlePresetClick = (days: number) => {
        setSelectedDays(days);
        setFechaLimite(getFutureDate(days));
    };

    const handleConfirmAval = async () => {
        const success = await onAprobar(
            motivoAval,
            undefined,
            'DOSIER',
            undefined,
            undefined
        );
        if (success) onClose();
    };

    const handleConfirmDevolver = async () => {
        const success = await onDevolver(fechaLimite);
        if (success) onClose();
    };

    const getRoleTitle = () => {
        if (isVicerrector) return 'Vicerrectorado Académico';
        if (isCoordAcad) return 'Coordinación Académica';
        if (isCoordCarrera) return 'Coordinación de Carrera';
        return 'Administrador Curricular';
    };

    return (
        <div 
            onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 animate-fade-in font-sans p-4"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="w-[560px] max-w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5 animate-scale-up"
            >
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Scale size={16} className="text-[#0070f3]" />
                        <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                                Dictamen de Revisión Curricular
                            </span>
                            <span className="block text-[10px] text-slate-500 dark:text-zinc-400">
                                Rol actuante: <strong className="text-slate-800 dark:text-zinc-200">{getRoleTitle()}</strong>
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
                        title="Cerrar modal"
                    >
                        <X size={13} />
                    </button>
                </div>

                {/* Selector de Pestañas (Riel Plano) */}
                <div className="flex border-b border-slate-200 dark:border-zinc-800 -mb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('avalar')}
                        className={`pb-2.5 px-4 text-xs font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'avalar'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                        }`}
                    >
                        <FileCheck2 size={13} />
                        <span>Emitir Aprobación</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('devolver')}
                        className={`pb-2.5 px-4 text-xs font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'devolver'
                                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                        }`}
                    >
                        <RotateCcw size={13} />
                        <span>{isCoordAcad || isVicerrector ? 'Devolver a Carrera' : 'Devolver al Docente'}</span>
                    </button>
                </div>

                {/* ── PESTAÑA 1: EMITIR APROBACIÓN INSTITUCIONAL ── */}
                {activeTab === 'avalar' && (
                    <div className="space-y-6 pt-3">
                        {loadingProfile ? (
                            <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                                <Loader2 size={15} className="animate-spin text-[#0070f3]" />
                                <span>Cargando firma digital institucional...</span>
                            </div>
                        ) : sigProfile?.esConfigurado ? (
                            <div className="flex items-center justify-between gap-6 py-1">
                                <div className="space-y-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                        {user?.nombre_completo || 'Firmante Institucional'}
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-zinc-300 truncate">
                                        {sigProfile.cargo || getRoleTitle()}
                                    </p>
                                    {sigProfile.departamento && (
                                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                            {sigProfile.departamento}
                                        </p>
                                    )}
                                </div>

                                {sigProfile.firmaImagenB64 && (
                                    <img
                                        src={sigProfile.firmaImagenB64}
                                        alt="Rúbrica oficial"
                                        className="h-12 max-w-[140px] object-contain dark:invert shrink-0"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="py-2 space-y-2">
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                    Firma digital institucional no configurada en su perfil.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate('/settings?tab=perfil');
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs text-[#0070f3] hover:underline font-medium cursor-pointer"
                                >
                                    <span>Configurar firma en mi perfil</span>
                                    <ExternalLink size={12} />
                                </button>
                            </div>
                        )}

                        <div className="pt-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAval}
                                disabled={submitting || loadingProfile || !sigProfile?.esConfigurado}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#0070f3] hover:bg-[#0060df] text-white rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-40 cursor-pointer shadow-sm active:scale-95 transition-all"
                                title={!sigProfile?.esConfigurado ? "Debe configurar su firma digital para emitir la aprobación" : undefined}
                            >
                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                Firmar y Aprobar PEA
                            </button>
                        </div>
                    </div>
                )}

                {/* ── PESTAÑA 2: DEVOLVER AL DOCENTE ── */}
                {activeTab === 'devolver' && (
                    <div className="space-y-6 pt-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">
                                Plazo límite de entrega
                            </label>
                            <div className="flex items-center gap-2">
                                {[2, 5, 10].map((days) => (
                                    <button
                                        key={days}
                                        type="button"
                                        onClick={() => handlePresetClick(days)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                                            selectedDays === days
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                                        }`}
                                    >
                                        +{days} {days === 2 ? 'días (48h)' : 'días'}
                                    </button>
                                ))}
                                <GeistDatePicker
                                    value={fechaLimite}
                                    onChange={(val) => {
                                        setFechaLimite(val);
                                        setSelectedDays(0);
                                    }}
                                    minDate={todayStr}
                                    placeholder="dd/mm/aaaa"
                                    containerClassName="flex-1 min-w-[140px]"
                                    className="!py-1.5 !px-3 !text-xs !rounded-lg !border-slate-200 dark:!border-zinc-800 !bg-slate-100 dark:!bg-zinc-900 !text-slate-900 dark:!text-zinc-100 font-mono"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDevolver}
                                disabled={submitting}
                                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-40 cursor-pointer shadow-sm active:scale-95 transition-all"
                            >
                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                                {isCoordAcad || isVicerrector ? 'Devolver a Carrera' : 'Devolver al Docente'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
