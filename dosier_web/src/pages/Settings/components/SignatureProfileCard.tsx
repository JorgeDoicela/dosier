import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PenLine, ShieldCheck, CheckCircle2, User, Building, Clock, AlertCircle } from 'lucide-react';
import { useSignatureProfile } from './useSignatureProfile';
import { useImageCropper } from './useImageCropper';
import { AutoSignatureTab } from './AutoSignatureTab';
import { UploadSignatureTab } from './UploadSignatureTab';
import { DrawSignatureTab } from './DrawSignatureTab';
import './SignatureProfileCard.css';

export const SignatureProfileCard: React.FC = () => {
    const sig = useSignatureProfile();
    const cropper = useImageCropper();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-bg-deep border border-border-thin hover:border-[#0070f3] text-xs font-semibold text-text-main transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                        >
                            <PenLine size={13} className="text-[#0070f3]" />
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
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                            <PenLine size={14} />
                            <span>Configurar Firma Ahora</span>
                        </button>
                    </div>
                )}

                {/* ── VISTA DE DETALLE (READ-ONLY) ─────────────────────────── */}
                {!sig.isEditing && sig.profile?.esConfigurado && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Ficha Clave-Valor */}
                        <div className="lg:col-span-7 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-xl bg-bg-deep border border-border-thin space-y-1">
                                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                                        <User size={12} className="text-[#0070f3]" />
                                        Cargo Institucional
                                    </span>
                                    <span className="text-xs font-bold text-text-main block">
                                        {sig.profile?.cargo || 'Docente Titular'}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-bg-deep border border-border-thin space-y-1">
                                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                                        <Building size={12} className="text-[#0070f3]" />
                                        Departamento / Unidad
                                    </span>
                                    <span className="text-xs font-bold text-text-main block">
                                        {sig.profile?.departamento || 'ISTPET'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                    <span className="font-semibold">Perfil activo y listo para firmar</span>
                                </div>

                                {sig.profile?.actualizadoEn && (
                                    <div className="p-3.5 rounded-xl bg-bg-deep border border-border-thin flex items-center gap-2 text-xs text-text-dim">
                                        <Clock size={14} className="text-text-dim shrink-0" />
                                        <span>Actualizado el {new Date(sig.profile.actualizadoEn).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vista Previa del Trazo Oficial */}
                        <div className="lg:col-span-5 space-y-1.5">
                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">
                                Sello y Trazo Digital Registrado
                            </span>
                            <div className="p-4 rounded-xl border border-border-thin bg-surface flex items-center justify-center min-h-[120px] shadow-2xs overflow-hidden">
                                {sig.profile?.firmaImagenB64 ? (
                                    <img
                                        src={sig.profile.firmaImagenB64}
                                        alt="Firma registrada"
                                        className="max-h-24 w-auto object-contain dark:invert transition-all"
                                    />
                                ) : (
                                    <span className="text-xs text-text-dim italic">No hay trazo registrado</span>
                                )}
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
                                    className="w-full bg-bg-deep border border-border-thin rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
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
                                    className="w-full bg-bg-deep border border-border-thin rounded-xl px-3.5 py-2.5 text-xs text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
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
                                            className={`pb-2.5 border-b-2 font-semibold text-xs tracking-tight transition-colors whitespace-nowrap cursor-pointer ${
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

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-thin">
                            <button
                                type="button"
                                onClick={sig.cancelEdit}
                                className="px-4 py-2 rounded-xl border border-border-thin hover:bg-bg-deep text-xs font-semibold text-text-dim hover:text-text-main transition-all cursor-pointer shadow-2xs"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={sig.saving || !sig.firmaImagenB64}
                                className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] text-white rounded-xl font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
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

                {/* ── MODAL DE CONFIRMACIÓN ─────────────────────────────────── */}
                {showConfirmModal && createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                        <div className="bg-surface border border-border-thin rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in">
                            {/* Cabecera */}
                            <div className="flex items-center justify-between p-5 border-b border-border-thin bg-surface">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-[#0070f3]" />
                                    <h3 className="font-bold text-sm text-text-main uppercase tracking-tight">
                                        Confirmar Firma Digital
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="p-1 rounded-lg text-text-dim hover:text-text-main hover:bg-bg-deep transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Contenido */}
                            <div className="p-6 space-y-4 text-left">
                                <p className="text-xs text-text-dim leading-relaxed">
                                    Esta información se incrustará de manera oficial al estampar su firma en los documentos. ¿Desea guardar y activar su perfil con los siguientes datos?
                                </p>

                                <div className="space-y-2.5 p-4 rounded-xl bg-bg-deep border border-border-thin text-xs">
                                    <div className="flex justify-between items-center py-1 border-b border-border-thin">
                                        <span className="text-text-dim">Cargo:</span>
                                        <span className="font-bold text-text-main">{sig.cargo.trim()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-border-thin">
                                        <span className="text-text-dim">Departamento:</span>
                                        <span className="font-bold text-text-main">{sig.departamento.trim()}</span>
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-text-dim block mb-1.5 text-[10px] uppercase font-bold tracking-wider">
                                            Trazo Oficial:
                                        </span>
                                        <div className="p-3 bg-surface border border-border-thin rounded-lg flex items-center justify-center">
                                            <img src={sig.firmaImagenB64} alt="Firma a guardar" className="max-h-20 object-contain dark:invert" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pie de página */}
                            <div className="p-4 bg-bg-deep/50 border-t border-border-thin flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 rounded-xl border border-border-thin bg-surface hover:bg-bg-deep text-xs font-semibold text-text-dim transition-colors cursor-pointer shadow-2xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmSave}
                                    className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
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

