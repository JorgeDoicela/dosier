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
        if (!sig.firmaImagenB64 && sig.tipoSello !== 'solo_sello') {
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-main flex items-center gap-2 font-mono">
                        Firma Digital Institucional
                    </h2>
                    {sig.profile?.esConfigurado && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Perfil Activo</span>
                        </span>
                    )}
                </div>
                {!sig.isEditing && sig.profile?.esConfigurado && (
                    <button
                        type="button"
                        onClick={() => sig.setIsEditing(true)}
                        className="btn-vercel-secondary text-xs inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                    >
                        <PenLine size={13} className="text-[#0070f3]" />
                        <span>Editar Perfil</span>
                    </button>
                )}
            </div>

            {sig.message && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${sig.message.type === 'error'
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
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-center">
                    {/* Ficha técnica clave-valor */}
                    <dl className="space-y-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                            <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Cargo Institucional
                            </dt>
                            <dd className="font-semibold text-text-main">
                                {sig.profile?.cargo || 'Docente Titular'}
                            </dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Departamento / Área
                            </dt>
                            <dd className="font-semibold text-text-main">
                                {sig.profile?.departamento || 'ISTPET'}
                            </dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Instrumento Registrado
                            </dt>
                            <dd className="font-semibold text-text-main">
                                {(() => {
                                    const tipo = sig.profile?.tipoSello || (sig.profile as any)?.tipo_sello;
                                    if (tipo === 'solo_sello') return 'Solo Sello Oficial';
                                    if (tipo === 'solo_firma') return 'Solo Firma Personal';
                                    if (tipo === 'sello_y_firma' || tipo === 'sello_institucional') return 'Firma y Sello Oficial';
                                    return 'Sello Criptográfico Completo (QR)';
                                })()}
                            </dd>
                        </div>
                    </dl>

                    {/* Previsualización del instrumento */}
                    <div className="w-full flex items-center justify-center">
                        <DocumentStampPreview
                            nombreFirmante={userName}
                            cargo={sig.profile?.cargo || 'Docente'}
                            departamento={sig.profile?.departamento || ''}
                            cedula={userCi}
                            firmaImagenB64={sig.profile?.firmaImagenB64 || (sig.profile as any)?.firma_imagen_b64 || sig.firmaImagenB64}
                            tipoPresentacion={(() => {
                                const tipo = sig.profile?.tipoSello || (sig.profile as any)?.tipo_sello;
                                if (tipo === 'solo_sello') return 'solo_sello';
                                if (tipo === 'solo_firma') return 'solo_firma';
                                if (tipo === 'sello_y_firma' || tipo === 'sello_institucional') return 'sello_y_firma';
                                return 'completo';
                            })()}
                            firmadoEn={sig.profile?.actualizadoEn ? `${new Date(sig.profile.actualizadoEn).toLocaleDateString('es-EC')} UTC` : undefined}
                        />
                    </div>
                </div>
            )}

            {/* ── FORMULARIO DE EDICIÓN ─────────────────────────────────── */}
            {sig.isEditing && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Selector de modo sobre riel plano centrado */}
                    <div className="border-b border-border-thin">
                        <nav className="-mb-px flex items-center justify-center gap-6 sm:gap-10 overflow-x-auto overflow-y-hidden no-scrollbar">
                            {(['auto', 'upload', 'draw'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => sig.selectMode(mode)}
                                    className={`py-3 px-2 border-b-[3px] text-sm sm:text-[15px] tracking-tight transition-colors whitespace-nowrap cursor-pointer ${sig.activeMode === mode
                                        ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400 font-bold'
                                        : 'border-transparent text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white font-semibold'
                                        }`}
                                >
                                    {mode === 'auto' ? 'Generación Automática' : mode === 'upload' ? 'Cargar Imagen (Foto)' : 'Dibujo Manual (Lienzo)'}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1 text-center">
                            <label htmlFor="sig-cargo" className="text-xs font-bold text-text-main uppercase tracking-wider block text-center">
                                Cargo Institucional <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="sig-cargo"
                                type="text"
                                value={sig.cargo}
                                onChange={(e) => sig.setCargo(e.target.value)}
                                placeholder="Ej. Docente Titular"
                                className="w-full bg-transparent border-0 border-b border-slate-300 dark:border-zinc-700 rounded-none px-1 py-2.5 text-center text-xs sm:text-sm font-semibold text-text-main placeholder:text-slate-400 focus:border-[#0070f3] dark:focus:border-blue-400 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1 text-center">
                            <label htmlFor="sig-dept" className="text-xs font-bold text-text-main uppercase tracking-wider block text-center">
                                Departamento o Unidad Académica <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="sig-dept"
                                type="text"
                                value={sig.departamento}
                                onChange={(e) => sig.setDepartamento(e.target.value)}
                                placeholder="Ej. Tecnología Superior en Desarrollo de Software"
                                className="w-full bg-transparent border-0 border-b border-slate-300 dark:border-zinc-700 rounded-none px-1 py-2.5 text-center text-xs sm:text-sm text-text-main placeholder:text-slate-400 focus:border-[#0070f3] dark:focus:border-blue-400 outline-none transition-colors"
                            />
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
                            Estilo de Firma y Estampado en Documentos
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Opción 1: Firma y Sello Oficial (Los 2 Combinados) */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => sig.setTipoSello('sello_y_firma')}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sig.setTipoSello('sello_y_firma'); } }}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${sig.tipoSello === 'sello_y_firma'
                                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0070f3] ring-1 ring-[#0070f3] shadow-xs'
                                    : 'bg-bg-deep border-border-thin hover:border-slate-300 dark:hover:border-zinc-700'
                                    }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-text-main block">
                                            Firma y Sello Oficial (Los dos)
                                        </span>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${sig.tipoSello === 'sello_y_firma'
                                            ? 'bg-[#0070f3] border-[#0070f3] text-white'
                                            : 'border-border-thin bg-surface text-transparent'
                                            }`}>
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-text-dim block leading-relaxed">
                                        Sello circular oficial del ISTPET con su rúbrica manuscrita superpuesta en el centro.
                                    </span>
                                </div>
                            </div>

                            {/* Opción 2: Solo Firma Personal */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => sig.setTipoSello('solo_firma')}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sig.setTipoSello('solo_firma'); } }}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${sig.tipoSello === 'solo_firma'
                                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0070f3] ring-1 ring-[#0070f3] shadow-xs'
                                    : 'bg-bg-deep border-border-thin hover:border-slate-300 dark:hover:border-zinc-700'
                                    }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-text-main block">
                                            Solo Firma Personal
                                        </span>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${sig.tipoSello === 'solo_firma'
                                            ? 'bg-[#0070f3] border-[#0070f3] text-white'
                                            : 'border-border-thin bg-surface text-transparent'
                                            }`}>
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-text-dim block leading-relaxed">
                                        Únicamente su trazo manuscrito personal o firma escaneada sobre la línea documental.
                                    </span>
                                </div>
                            </div>

                            {/* Opción 3: Solo Sello Oficial Departamental */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => sig.setTipoSello('solo_sello')}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sig.setTipoSello('solo_sello'); } }}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${sig.tipoSello === 'solo_sello'
                                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0070f3] ring-1 ring-[#0070f3] shadow-xs'
                                    : 'bg-bg-deep border-border-thin hover:border-slate-300 dark:hover:border-zinc-700'
                                    }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-text-main block">
                                            Solo Sello Oficial
                                        </span>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${sig.tipoSello === 'solo_sello'
                                            ? 'bg-[#0070f3] border-[#0070f3] text-white'
                                            : 'border-border-thin bg-surface text-transparent'
                                            }`}>
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-text-dim block leading-relaxed">
                                        Únicamente el sello circular oficial vectorial del ISTPET (sin rúbrica personal).
                                    </span>
                                </div>
                            </div>

                            {/* Opción 4: Sello Criptográfico Completo QR */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => sig.setTipoSello('completo')}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sig.setTipoSello('completo'); } }}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${sig.tipoSello === 'completo'
                                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0070f3] ring-1 ring-[#0070f3] shadow-xs'
                                    : 'bg-bg-deep border-border-thin hover:border-slate-300 dark:hover:border-zinc-700'
                                    }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-text-main block">
                                            Sello Criptográfico QR
                                        </span>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${sig.tipoSello === 'completo'
                                            ? 'bg-[#0070f3] border-[#0070f3] text-white'
                                            : 'border-border-thin bg-surface text-transparent'
                                            }`}>
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-text-dim block leading-relaxed">
                                        Bloque institucional con cabecera azul corporativa, metadatos y código QR de auditoría.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previsualización en Tiempo Real del Sello Institucional */}
                    <div className="pt-2">
                        <DocumentStampPreview
                            nombreFirmante={sig.autoText || userName}
                            cargo={sig.cargo.trim() || 'Docente Titular'}
                            departamento={sig.departamento.trim()}
                            cedula={userCi}
                            firmaImagenB64={sig.firmaImagenB64}
                            tipoPresentacion={sig.tipoSello}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
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
                        <div className="flex items-center justify-between px-6 pt-6 pb-2 bg-white dark:bg-zinc-950">
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                                    Confirmar Firma y Sello Institucional
                                </h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Verifique el estampado oficial para la firma de PEA y actas del ISTPET
                                </p>
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
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white dark:bg-zinc-950 text-left">
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
                        <div className="px-6 pt-2 pb-6 bg-white dark:bg-zinc-950 flex items-center justify-end gap-3">
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
