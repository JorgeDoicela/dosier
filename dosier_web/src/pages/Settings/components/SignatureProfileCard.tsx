import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PenLine, ShieldCheck, CheckCircle2, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useSignatureProfile } from './useSignatureProfile';
import { useImageCropper } from './useImageCropper';
import { useAuth } from '../../../api/AuthContext';
import { AutoSignatureTab } from './AutoSignatureTab';
import { UploadSignatureTab } from './UploadSignatureTab';
import { DrawSignatureTab } from './DrawSignatureTab';
import { DocumentStampPreview } from './DocumentStampPreview';
import './SignatureProfileCard.css';

export const SignatureProfileCard: React.FC = () => {
    const { user } = useAuth();
    const sig = useSignatureProfile();
    const cropper = useImageCropper();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showLiveStamp, setShowLiveStamp] = useState(true);

    const userName = user?.nombre_completo || sig.autoText || 'Docente Institucional';
    const userCi = user?.id_referencia || '17XXXXXXXX';

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sig.cargo.trim()) {
            sig.setMessage({ text: 'Por favor, ingrese su Cargo Institucional.', type: 'error' });
            return;
        }
        if (!sig.departamento.trim()) {
            sig.setMessage({ text: 'Por favor, ingrese su Departamento o Unidad Académica.', type: 'error' });
            return;
        }
        if (!sig.firmaImagenB64) {
            sig.setMessage({ text: 'Por favor, establezca su firma digital.', type: 'error' });
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        setShowConfirmModal(false);
        await sig.executeSaveProfile();
    };

    if (sig.loading) {
        return (
            <div className="bg-surface p-6 rounded-lg border border-slate-200/90 dark:border-zinc-800 flex justify-center py-12">
                <Loader2 className="animate-spin text-[#0070f3]" size={24} />
            </div>
        );
    }

    return (
        <div className="signature-profile-container bg-surface p-6 rounded-lg border border-slate-200/90 dark:border-zinc-800 space-y-6" id="perfil-firma">
            {/* Cabecera de la Sección */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-zinc-800">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-main flex items-center gap-2 font-mono">
                            <ShieldCheck size={16} className="text-[#0070f3]" />
                            Firma Digital Institucional
                        </h2>
                        {sig.profile?.esConfigurado && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Perfil Activo</span>
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-text-dim leading-relaxed">
                        Configure su perfil y trazo digital oficial para firmar programas de estudio y actas curriculares.
                    </p>
                </div>
                {!sig.isEditing && sig.profile?.esConfigurado && (
                    <button
                        type="button"
                        onClick={() => sig.setIsEditing(true)}
                        className="btn-vercel-secondary text-xs inline-flex items-center gap-1.5 shrink-0"
                    >
                        <PenLine size={13} className="text-[#0070f3]" />
                        <span>Editar Perfil</span>
                    </button>
                )}
            </div>

            {sig.message && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                    sig.message.type === 'error'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                }`}>
                    {sig.message.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                    <span>{sig.message.text}</span>
                </div>
            )}

            {/* ── VISTA VACÍA (NO CONFIGURADO) ─────────────────────────── */}
            {!sig.isEditing && !sig.profile?.esConfigurado && (
                <div
                    onClick={() => sig.setIsEditing(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sig.setIsEditing(true); } }}
                    className="p-8 text-center border border-dashed border-slate-200/90 dark:border-zinc-800 rounded-lg hover:border-[#0070f3] transition-colors cursor-pointer space-y-3"
                >
                    <ShieldCheck size={28} className="mx-auto text-text-dim opacity-40" />
                    <div>
                        <h4 className="text-xs font-semibold text-text-main">Firma digital no configurada</h4>
                        <p className="text-xs text-text-dim max-w-md mx-auto mt-1 leading-relaxed">
                            Para firmar los Programas de Estudio de la Asignatura (PEA) o actas institucionales, configure su trazo y cargo docente.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); sig.setIsEditing(true); }}
                        className="btn-vercel-primary text-xs inline-flex items-center gap-1.5"
                    >
                        <PenLine size={13} />
                        <span>Configurar Firma Ahora</span>
                    </button>
                </div>
            )}

            {/* ── VISTA DE DETALLE (READ-ONLY) CON PREVISUALIZACIÓN DUAL ─────────────────────────── */}
            {!sig.isEditing && sig.profile?.esConfigurado && (
                <div className="space-y-6">
                    {/* Metadatos en línea sin cajas ni bordes */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-text-dim font-medium">Cargo Institucional:</span>
                            <span className="font-semibold text-text-main">{sig.profile?.cargo || 'Docente Titular'}</span>
                        </div>
                        <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
                        <div className="flex items-center gap-2">
                            <span className="text-text-dim font-medium">Departamento / Área:</span>
                            <span className="font-semibold text-text-main">{sig.profile?.departamento || 'ISTPET'}</span>
                        </div>
                    </div>

                    {/* Instrumento Registrado Según Elección */}
                    <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-main font-mono">
                                {(sig.profile?.tipoSello || (sig.profile as any)?.tipo_sello) === 'solo_firma'
                                    ? 'Firma Digital Registrada'
                                    : 'Sello Institucional Registrado'}
                            </h3>
                            <span className="text-[11px] font-normal normal-case text-text-dim font-sans">
                                Modo: <strong className="text-text-main font-semibold">{(sig.profile?.tipoSello || (sig.profile as any)?.tipo_sello) === 'solo_firma' ? 'Solo Firma Digital' : 'Sello Institucional Completo'}</strong>
                            </span>
                        </div>

                        <div className="w-full">
                            <DocumentStampPreview
                                nombreFirmante={userName}
                                cargo={sig.profile?.cargo || 'Docente'}
                                departamento={sig.profile?.departamento || 'Coordinación Académica'}
                                cedula={userCi}
                                firmaImagenB64={sig.profile?.firmaImagenB64 || (sig.profile as any)?.firma_imagen_b64 || sig.firmaImagenB64}
                                tipoPresentacion={(sig.profile?.tipoSello || (sig.profile as any)?.tipo_sello) === 'solo_firma' ? 'solo_firma' : 'completo'}
                                firmadoEn={sig.profile?.actualizadoEn ? `${new Date(sig.profile.actualizadoEn).toLocaleDateString('es-EC')} UTC` : undefined}
                            />
                        </div>
                    </div>
                </div>
            )}

                {/* ── FORMULARIO DE EDICIÓN ─────────────────────────────────── */}
                {sig.isEditing && (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="sig-cargo" className="text-xs font-bold text-text-main uppercase tracking-wider block">
                                    Cargo Institucional <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="sig-cargo"
                                    type="text"
                                    value={sig.cargo}
                                    onChange={(e) => sig.setCargo(e.target.value)}
                                    placeholder="Ej. Docente Titular"
                                    className="w-full bg-bg-deep border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="sig-dept" className="text-xs font-bold text-text-main uppercase tracking-wider block">
                                    Departamento o Unidad Académica <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="sig-dept"
                                    type="text"
                                    value={sig.departamento}
                                    onChange={(e) => sig.setDepartamento(e.target.value)}
                                    placeholder="Ej. Tecnología Superior en Desarrollo de Software"
                                    className="w-full bg-bg-deep border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
                                />
                            </div>
                        </div>

                        {/* Selector de modo sobre riel plano */}
                        <div className="space-y-3 pt-2">
                            <span className="text-xs font-bold text-text-main uppercase tracking-wider block">
                                Método de Generación del Trazo
                            </span>
                            <div className="border-b border-border-thin">
                                <nav className="-mb-px flex items-center gap-6 overflow-x-auto no-scrollbar">
                                    {(['auto', 'upload', 'draw'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => sig.selectMode(mode)}
                                            className={`pb-2.5 border-b-2 font-semibold text-xs sm:text-sm tracking-tight transition-colors whitespace-nowrap cursor-pointer ${sig.activeMode === mode
                                                    ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400'
                                                    : 'border-transparent text-text-dim hover:text-text-main'
                                                }`}
                                        >
                                            {mode === 'auto' ? 'Generación Automática' : mode === 'upload' ? 'Cargar Imagen (Foto)' : 'Dibujo Manual (Lienzo)'}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Workspace del modo activo */}
                        <div className="pt-2">
                            {sig.activeMode === 'auto' && (
                                <AutoSignatureTab
                                    autoText={sig.autoText}
                                    selectedFont={sig.selectedFont}
                                    firmaImagenB64={sig.firmaImagenB64}
                                    onAutoTextChange={sig.setAutoText}
                                    onFontChange={sig.setSelectedFont}
                                    onSignatureGenerated={sig.updateFirmaAuto}
                                />
                            )}
                            {sig.activeMode === 'upload' && (
                                <UploadSignatureTab
                                    {...cropper}
                                    firmaImagenB64={sig.firmaImagenB64}
                                    onSuccess={sig.updateFirmaUpload}
                                    onError={(msg) => sig.setMessage({ text: msg, type: 'error' })}
                                />
                            )}
                            {sig.activeMode === 'draw' && (
                                <DrawSignatureTab
                                    firmaDrawB64={sig.firmaDrawB64}
                                    onSignatureChange={sig.updateFirmaDraw}
                                />
                            )}
                        </div>

                        {/* Selector de Estilo de Firma */}
                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-bold text-text-main uppercase tracking-wider block">
                                Estilo de Firma en Documentos
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Opción A: Sello Institucional Completo */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => sig.setTipoSello('completo')}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sig.setTipoSello('completo'); } }}
                                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${sig.tipoSello === 'completo'
                                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0070f3] ring-1 ring-[#0070f3] shadow-xs'
                                            : 'bg-bg-deep border-border-thin hover:border-slate-300 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="space-y-0.5">
                                        <span className="text-xs sm:text-sm font-bold text-text-main block">
                                            Sello Institucional Completo
                                        </span>
                                        <span className="text-xs text-text-dim block">
                                            Cabecera azul, metadatos y código QR
                                        </span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${sig.tipoSello === 'completo'
                                            ? 'bg-[#0070f3] border-[#0070f3] text-white'
                                            : 'border-border-thin bg-surface text-transparent'
                                        }`}>
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                </div>

                                {/* Opción B: Solo Firma Digital */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => sig.setTipoSello('solo_firma')}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sig.setTipoSello('solo_firma'); } }}
                                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${sig.tipoSello === 'solo_firma'
                                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0070f3] ring-1 ring-[#0070f3] shadow-xs'
                                            : 'bg-bg-deep border-border-thin hover:border-slate-300 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="space-y-0.5">
                                        <span className="text-xs sm:text-sm font-bold text-text-main block">
                                            Solo Firma Digital
                                        </span>
                                        <span className="text-xs text-text-dim block">
                                            Únicamente el trazo manuscrito
                                        </span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${sig.tipoSello === 'solo_firma'
                                            ? 'bg-[#0070f3] border-[#0070f3] text-white'
                                            : 'border-border-thin bg-surface text-transparent'
                                        }`}>
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Previsualización en Tiempo Real del Sello Institucional */}
                        <div className="border-t border-border-thin pt-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-[#0070f3]" />
                                    <span className="text-xs sm:text-sm font-bold text-text-main uppercase tracking-wider">
                                        Previsualización en Tiempo Real ({sig.tipoSello === 'solo_firma' ? 'Solo Firma Digital' : 'Sello Institucional Completo'})
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowLiveStamp(!showLiveStamp)}
                                    className="text-xs text-text-dim hover:text-text-main font-semibold transition-colors cursor-pointer"
                                >
                                    {showLiveStamp ? 'Ocultar Previsualización' : 'Mostrar Previsualización'}
                                </button>
                            </div>

                            {showLiveStamp && (
                                <DocumentStampPreview
                                    nombreFirmante={sig.autoText || userName}
                                    cargo={sig.cargo.trim() || 'Docente Titular'}
                                    departamento={sig.departamento.trim() || 'Coordinación Académica'}
                                    cedula={userCi}
                                    firmaImagenB64={sig.firmaImagenB64}
                                    tipoPresentacion={sig.tipoSello}
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/90 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={sig.cancelEdit}
                                className="btn-vercel-secondary text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={sig.saving || !sig.firmaImagenB64}
                                className="btn-vercel-primary text-xs"
                            >
                                {sig.saving ? 'Guardando...' : 'Guardar y Activar Firma'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Precarga de tipografías cursivas */}
                <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }}>
                    {['Caveat', 'Dancing Script', 'Sacramento', 'Alex Brush', 'Great Vibes', 'Pinyon Script', 'Mrs Saint Delafield'].map(f => (
                        <span key={f} style={{ fontFamily: f }}>preload</span>
                    ))}
                </div>

                {/* ── MODAL CENTRADO DE CONFIRMACIÓN CON VISTA DE SELLO COMPLETO ─────────────────────────────────── */}
                {showConfirmModal && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
                        <div
                            className="absolute inset-0 cursor-pointer"
                            onClick={() => setShowConfirmModal(false)}
                            aria-hidden="true"
                        />

                        <div
                            className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col z-10 animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Cabecera Institucional Sobria */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[#0070f3] dark:text-blue-400 shrink-0" />
                                    <div>
                                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                                            Confirmar Firma y Sello Institucional
                                        </h2>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Verifique el estampado oficial para la firma de PEA y actas del ISTPET
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="p-1.5 rounded-lg text-text-dim hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Contenido: Previsualización Directa y Fiel del Sello */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-zinc-950 text-left">
                                <DocumentStampPreview
                                    nombreFirmante={sig.autoText || userName}
                                    cargo={sig.cargo.trim()}
                                    departamento={sig.departamento.trim()}
                                    cedula={userCi}
                                    firmaImagenB64={sig.firmaImagenB64}
                                    tipoPresentacion={sig.tipoSello}
                                />
                            </div>

                            {/* Pie de página con botones */}
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="btn-vercel-secondary text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmSave}
                                    className="btn-vercel-primary text-xs"
                                >
                                    Confirmar y Activar
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};
