import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PenLine, ShieldCheck, CheckCircle2, User, Building, Clock, AlertCircle } from 'lucide-react';
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
            <div className="bg-surface p-6 rounded-xl border border-border-thin shadow-2xs">
                <div className="flex items-center justify-center py-12 gap-3 text-text-dim text-xs">
                    <div className="w-4 h-4 border-2 border-[#0070f3] border-t-transparent rounded-full animate-spin" />
                    <span>Cargando configuración de firma institucional...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-xl border border-border-thin shadow-2xs overflow-hidden" id="perfil-firma">
            <div className="p-5 sm:p-6 space-y-6">
                {/* Cabecera de la Tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-thin">
                    <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-[#0070f3]" />
                        <div>
                            <h3 className="font-bold text-sm sm:text-base text-text-main uppercase tracking-tight">
                                Firma Digital Institucional
                            </h3>
                            <p className="text-xs text-text-dim mt-0.5">
                                Configure su perfil y trazo digital oficial para firmar programas de estudio y actas curriculares.
                            </p>
                        </div>
                    </div>
                    {!sig.isEditing && sig.profile?.esConfigurado && (
                        <button
                            type="button"
                            onClick={() => sig.setIsEditing(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-bg-deep border border-border-thin hover:border-[#0070f3] text-xs font-semibold text-text-main transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                        >
                            <PenLine size={14} className="text-[#0070f3]" />
                            <span>Editar Perfil de Firma</span>
                        </button>
                    )}
                </div>

                {sig.message && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                        sig.message.type === 'error'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
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
                        className="p-8 text-center border border-dashed border-border-thin rounded-xl bg-bg-deep/30 hover:border-[#0070f3] transition-colors cursor-pointer space-y-3"
                    >
                        <ShieldCheck size={32} className="mx-auto text-text-dim opacity-40" />
                        <div>
                            <h4 className="text-sm font-bold text-text-main">Su firma digital no está configurada</h4>
                            <p className="text-xs text-text-dim max-w-md mx-auto mt-1 leading-relaxed">
                                Para firmar los Programas de Estudio de la Asignatura (PEA) o actas institucionales, configure su trazo y cargo docente.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); sig.setIsEditing(true); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                            <PenLine size={14} />
                            <span>Configurar Firma Ahora</span>
                        </button>
                    </div>
                )}

                {/* ── VISTA DE DETALLE (READ-ONLY) CON PREVISUALIZACIÓN DUAL ─────────────────────────── */}
                {!sig.isEditing && sig.profile?.esConfigurado && (
                    <div className="space-y-6">
                        {/* Fichas Clave-Valor */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 sm:p-5 rounded-xl bg-bg-deep border border-border-thin space-y-1.5">
                                <span className="text-xs font-bold text-text-dim uppercase tracking-wider flex items-center gap-2">
                                    <User size={15} className="text-[#0070f3]" />
                                    Cargo Institucional
                                </span>
                                <span className="text-sm sm:text-base font-bold text-text-main block">
                                    {sig.profile?.cargo || 'Docente Titular'}
                                </span>
                            </div>

                            <div className="p-4 sm:p-5 rounded-xl bg-bg-deep border border-border-thin space-y-1.5">
                                <span className="text-xs font-bold text-text-dim uppercase tracking-wider flex items-center gap-2">
                                    <Building size={15} className="text-[#0070f3]" />
                                    Departamento / Área
                                </span>
                                <span className="text-sm sm:text-base font-bold text-text-main block truncate" title={sig.profile?.departamento || 'ISTPET'}>
                                    {sig.profile?.departamento || 'ISTPET'}
                                </span>
                            </div>

                            <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                <div>
                                    <span className="font-bold text-sm block">Perfil Activo</span>
                                    <span className="text-xs opacity-80">Listo para firmar PEA</span>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5 rounded-xl bg-bg-deep border border-border-thin flex items-center gap-3 text-xs sm:text-sm text-text-dim">
                                <Clock size={18} className="text-text-dim shrink-0" />
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider block">Última Actualización</span>
                                    <span className="text-sm font-semibold text-text-main">
                                        {sig.profile?.actualizadoEn ? new Date(sig.profile.actualizadoEn).toLocaleDateString() : 'Vigente'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Vista Previa Dual (Trazo Digital + Sello Institucional) */}
                        <div className="space-y-3.5 pt-2">
                            <span className="text-sm sm:text-base font-bold uppercase tracking-wide text-text-main block">
                                Instrumentos Digitales Registrados
                            </span>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                                {/* Trazo Digital */}
                                <div className="lg:col-span-4 flex flex-col gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-text-dim">Trazo Digital Manuscrito</span>
                                    <div className="p-5 rounded-xl border border-border-thin bg-surface flex items-center justify-center min-h-[160px] h-full shadow-2xs overflow-hidden">
                                        {sig.profile?.firmaImagenB64 ? (
                                            <img
                                                src={sig.profile.firmaImagenB64}
                                                alt="Firma registrada"
                                                className="max-h-28 w-auto object-contain dark:invert transition-all"
                                            />
                                        ) : (
                                            <span className="text-xs sm:text-sm text-text-dim italic">No hay trazo registrado</span>
                                        )}
                                    </div>
                                </div>

                                {/* Sello Institucional Oficial */}
                                <div className="lg:col-span-8 flex flex-col gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-text-dim">Sello Institucional Oficial (Idéntico al PDF)</span>
                                    <DocumentStampPreview
                                        nombreFirmante={userName}
                                        cargo={sig.profile?.cargo || 'Docente'}
                                        departamento={sig.profile?.departamento || 'Coordinación Académica'}
                                        cedula={userCi}
                                        firmaImagenB64={sig.profile?.firmaImagenB64}
                                        firmadoEn={sig.profile?.actualizadoEn ? `${new Date(sig.profile.actualizadoEn).toLocaleDateString('es-EC')} UTC` : undefined}
                                    />
                                </div>
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
                                            className={`pb-2.5 border-b-2 font-semibold text-xs sm:text-sm tracking-tight transition-colors whitespace-nowrap cursor-pointer ${
                                                sig.activeMode === mode
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

                        {/* Previsualización en Tiempo Real del Sello Institucional */}
                        <div className="border-t border-border-thin pt-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-[#0070f3]" />
                                    <span className="text-xs sm:text-sm font-bold text-text-main uppercase tracking-wider">
                                        Previsualización del Sello Institucional (En Tiempo Real)
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
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-thin">
                            <button
                                type="button"
                                onClick={sig.cancelEdit}
                                className="px-4 py-2.5 rounded-xl border border-border-thin hover:bg-bg-deep text-xs sm:text-sm font-semibold text-text-dim hover:text-text-main transition-all cursor-pointer shadow-2xs"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={sig.saving || !sig.firmaImagenB64}
                                className="px-5 py-2.5 bg-[#0070f3] hover:bg-[#005bb5] text-white rounded-xl font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
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

                {/* ── MODAL DRAWER DE CONFIRMACIÓN CON VISTA DE SELLO COMPLETO ─────────────────────────────────── */}
                {showConfirmModal && createPortal(
                    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
                        <div
                            className="fixed inset-0"
                            onClick={() => setShowConfirmModal(false)}
                            aria-hidden="true"
                        />

                        <div className="relative w-full max-w-2xl h-full bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 flex flex-col z-10 animate-slide-left shadow-2xl">
                            {/* Cabecera */}
                            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-surface text-text-dim border border-border-thin text-[10px] font-mono uppercase font-bold rounded-md">
                                        FIRMA-DIGITAL
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0070f3]">
                                        <span className="w-2 h-2 rounded-full bg-[#0070f3] animate-pulse" />
                                        <span>Verificación de Sello</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="p-1.5 rounded-lg text-text-dim hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Contenido con Bento Cards */}
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white dark:bg-zinc-950 text-left">
                                <div className="space-y-2">
                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main leading-tight font-sans">
                                        Confirmar Firma y Sello Institucional
                                    </h2>
                                    <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-medium">
                                        A continuación se presenta cómo quedará estampado su sello oficial en los Programas de Estudio de la Asignatura (PEA) y actas del ISTPET. Verifique los datos antes de activar.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 sm:p-5 rounded-xl border border-border-thin bg-bg-deep space-y-1.5">
                                        <div className="text-xs font-bold text-text-dim uppercase tracking-wider">
                                            Cargo Institucional
                                        </div>
                                        <div className="text-base sm:text-lg font-bold text-text-main font-sans">
                                            {sig.cargo.trim()}
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-5 rounded-xl border border-border-thin bg-bg-deep space-y-1.5">
                                        <div className="text-xs font-bold text-text-dim uppercase tracking-wider">
                                            Departamento / Unidad
                                        </div>
                                        <div className="text-base sm:text-lg font-bold text-text-main font-sans truncate" title={sig.departamento.trim()}>
                                            {sig.departamento.trim()}
                                        </div>
                                    </div>
                                </div>

                                {/* Previsualización del Sello Institucional */}
                                <div className="space-y-3">
                                    <div className="text-xs sm:text-sm font-bold text-text-main uppercase tracking-wider">
                                        Sello Institucional Oficial (Vista Previa en Vivo)
                                    </div>
                                    <DocumentStampPreview
                                        nombreFirmante={sig.autoText || userName}
                                        cargo={sig.cargo.trim()}
                                        departamento={sig.departamento.trim()}
                                        cedula={userCi}
                                        firmaImagenB64={sig.firmaImagenB64}
                                    />
                                </div>
                            </div>

                            {/* Pie de página con botones */}
                            <div className="p-6 sm:p-8 border-t border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-5 py-3 rounded-xl border border-border-thin bg-surface hover:bg-bg-deep text-xs sm:text-sm font-semibold text-text-dim hover:text-text-main transition-colors cursor-pointer shadow-2xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmSave}
                                    className="flex-1 px-5 py-3 bg-[#0070f3] hover:bg-[#005bb5] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                                >
                                    Confirmar y Activar
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};
