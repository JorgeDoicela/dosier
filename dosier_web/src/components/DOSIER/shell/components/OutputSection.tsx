import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Settings, FileText, Shield, CheckCircle, Clock, ArrowRight, AlertCircle, X } from 'lucide-react';
import { FullscreenLoader } from '../../../Common/FullscreenLoader';
import { TimedSuccessModal } from '../../../Common/TimedSuccessModal';
import { getDocumentSignatures, getSignatureProfile, type UserSignatureProfileDto } from '../../../../services/signaturesService';
import { SignatureBlock } from '../../SignatureBlock';
import { useAuth } from '../../../../api/AuthContext';
import { documentInstanceService } from '../../../../services/documentInstanceService';

export interface OutputSectionProps {
    title: string;
    templateCode?: string;
    projectStatus?: string;
    canSign?: boolean;
    signatureType?: string;
    documentUuid?: string;
    formData: any;
    pdfUrl: string | null;
    isGenerating: boolean;
    isDraftMode: boolean;
    setIsDraftMode: (val: boolean) => void;
    handleGeneratePdf: (blind?: boolean) => Promise<void>;
    fetchSignedPdf?: () => Promise<boolean>;
    isAlreadySubmitted?: boolean;
    isSigning: boolean;
    institutionalPassword: string;
    setInstitutionalPassword: (val: string) => void;
    handleSignDosier: () => Promise<void>;
    signatureCertFile: File | null;
    setSignatureCertFile: (file: File | null) => void;
    signaturePassword: string;
    setSignaturePassword: (val: string) => void;
    handleSign: () => Promise<void>;
    signatureRefreshTrigger: number;
    isSignedModalOpen?: boolean;
    setIsSignedModalOpen?: (val: boolean) => void;
    signedModalData?: {
        documentTitle?: string;
        rolFirmante?: string;
        fechaFirma?: string;
    } | null;
}

export const OutputSection: React.FC<OutputSectionProps> = ({
    title,
    templateCode,
    projectStatus,
    canSign = true,
    signatureType = 'DOSIER',
    documentUuid,
    formData,
    pdfUrl,
    isGenerating,
    isDraftMode,
    setIsDraftMode,
    handleGeneratePdf,
    fetchSignedPdf,
    isAlreadySubmitted = false,
    isSigning,
    institutionalPassword,
    setInstitutionalPassword,
    handleSignDosier,
    signatureCertFile,
    setSignatureCertFile,
    signaturePassword,
    setSignaturePassword,
    handleSign,
    signatureRefreshTrigger,
    isSignedModalOpen = false,
    setIsSignedModalOpen,
    signedModalData
}) => {
    const { user, isAdmin, isRevisor, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const isReviewer = Boolean(isAdmin || isRevisor || isCoordCarrera || isCoordAcad || isVicerrector);
    const navigate = useNavigate();
    const [signatures, setSignatures] = React.useState<any[]>([]);
    const [isProtocoloSigned, setIsProtocoloSigned] = React.useState<boolean | null>(null);
    const [signatureProfile, setSignatureProfile] = React.useState<UserSignatureProfileDto | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = React.useState<boolean>(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(false);

    // Cerrar modal de confirmación con Escape
    React.useEffect(() => {
        if (!isConfirmModalOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSigning) {
                setIsConfirmModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isConfirmModalOpen, isSigning]);

    const projectUuid = formData?.EntityUuid || formData?.entityUuid || formData?.Uuid || formData?.uuid;
    const directDocId = documentUuid || formData?.Uuid || formData?.uuid;

    React.useEffect(() => {
        let isMounted = true;
        const fetchSignatures = async () => {
            let targetDocId = directDocId;
            if ((!targetDocId || targetDocId.startsWith('temp_')) && projectUuid && templateCode) {
                try {
                    const instRes = await documentInstanceService.resolve({
                        templateCode,
                        entityUuid: projectUuid
                    });
                    targetDocId = instRes?.uuid || (instRes as any)?.Uuid;
                } catch { }
            }

            if (targetDocId && !targetDocId.startsWith('temp_')) {
                try {
                    const data = await getDocumentSignatures(targetDocId);
                    if (isMounted) {
                        setSignatures(data || []);
                    }
                } catch {
                    if (isMounted) setSignatures([]);
                }
            }
        };

        fetchSignatures();
        return () => { isMounted = false; };
    }, [directDocId, projectUuid, templateCode, signatureRefreshTrigger]);

    React.useEffect(() => {
        let isMounted = true;
        setIsLoadingProfile(true);
        getSignatureProfile()
            .then(profile => {
                if (isMounted) setSignatureProfile(profile);
            })
            .catch(() => {
                if (isMounted) setSignatureProfile(null);
            })
            .finally(() => {
                if (isMounted) setIsLoadingProfile(false);
            });
        return () => { isMounted = false; };
    }, [signatureRefreshTrigger]);

    React.useEffect(() => {
        let isMounted = true;
        if (!projectUuid || projectUuid.startsWith('temp_')) return;

        documentInstanceService.getByEntity(projectUuid)
            .then(res => {
                const list = Array.isArray(res) ? res : ((res as any)?.data || []);
                if (isMounted && Array.isArray(list)) {
                    const isDocValidlySigned = (doc: any): boolean => {
                        if (!doc) return false;
                        if (['Aprobado', 'En Ejecución', 'Finalizado'].includes(projectStatus || '')) return true;
                        const hasSignedState = doc.state === 3 || doc.state === '3' || doc.state === 'Signed' || doc.estado === 3 || doc.estado === '3' || doc.estado === 'Firmado' || doc.is_signed === true || doc.isSigned === true;
                        const hasSignedFile = Boolean(doc.final_pdf_path || doc.finalPdfPath);
                        return hasSignedState || hasSignedFile;
                    };

                    const protoDoc = list.find(
                        (d: any) => d.template_code === 'PEA_OFICIAL' || d.templateCode === 'PEA_OFICIAL'
                    );
                    setIsProtocoloSigned(isDocValidlySigned(protoDoc));
                }
            })
            .catch(() => { });

        return () => { isMounted = false; };
    }, [projectUuid, projectStatus, signatureRefreshTrigger]);

    const statusNormalized = (projectStatus || formData?.estado || formData?.status || '').toString().toLowerCase();
    const isCorrectionState = ['observado', 'corregido', 'encorrección', 'encorreccion'].includes(statusNormalized);

    const activeSignatures = signatures.filter(s =>
        (s.esValida !== false && (s as any).es_valida !== false) &&
        (s.estado !== 2 && (s as any).estado !== 2) &&
        !s.revocadaEn &&
        !(s as any).revocada_en
    );
    const isDocumentSigned = !isCorrectionState && activeSignatures.length > 0;
    const isSubmittedOrApproved = !isCorrectionState && ([
        'enrevision', 'en revisión', 'en_revision',
        'revisadocoord', 'revisado_coord', 'revisado coordinación',
        'revisadoacad', 'revisado_acad', 'revisado vicerrectorado', 'revisado vicerrector',
        'aprobado', 'en ejecucion', 'en ejecución', 'finalizado', 'firmado', 'signed'
    ].includes(statusNormalized) || Boolean(formData?.FirmaElaboradoDocente || formData?.firma_elaborado_docente) || Boolean(isAlreadySubmitted));

    const isOfficialDocument = !isCorrectionState && (isDocumentSigned || isSubmittedOrApproved || Boolean(isProtocoloSigned));

    // Autocargar vista previa con pantalla de carga al entrar a la sección
    const hasInitialGeneratedRef = React.useRef(false);
    React.useEffect(() => {
        if (!pdfUrl && !isGenerating && !hasInitialGeneratedRef.current) {
            hasInitialGeneratedRef.current = true;
            if (isOfficialDocument && fetchSignedPdf) {
                fetchSignedPdf().then(loaded => {
                    if (!loaded) handleGeneratePdf(false);
                });
            } else {
                handleGeneratePdf(false);
            }
        }
    }, [pdfUrl, isGenerating, isOfficialDocument, fetchSignedPdf, handleGeneratePdf]);

    const isCurrentProtocolo = (templateCode?.toUpperCase().includes('PROTOCOLO')) || title.toLowerCase().includes('protocolo') || title.toLowerCase().includes('formato proyecto');
    const isExpedienteCompleto = isProtocoloSigned || ['En Revisión', 'Aprobado', 'En Ejecución', 'Finalizado'].includes(projectStatus || '');

    return (
        <div className="flex-1 p-2 sm:p-4 lg:p-6 flex flex-col gap-3 md:gap-4 animate-fade-in overflow-y-auto lg:overflow-hidden custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0 lg:overflow-hidden p-0.5">
                {/* Panel de Controles Unificado de Emisión y Firma */}
                <div className="col-span-1 lg:col-span-4 bg-bg-deep border border-border-thin rounded-2xl shadow-sm flex flex-col lg:overflow-hidden lg:h-full">
                    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                        {isOfficialDocument ? (
                            /* Vista Oficial Inmutable: Estado y Acciones Directas */
                            <div className="p-5 sm:p-6 flex flex-col gap-3 shrink-0">
                                <span className={`text-xs font-bold uppercase tracking-wider text-center ${isDocumentSigned ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-main'}`}>
                                    {isDocumentSigned ? 'Documento Firmado' : 'Documento en Revisión'}
                                </span>

                                <div className="flex flex-col gap-2 pt-1">
                                    {isReviewer && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const pId = projectUuid || documentUuid;
                                                if (pId) navigate(`/documentacion/revision-tecnica/${pId}`);
                                            }}
                                            className="w-full py-2.5 px-3 btn-vercel-secondary text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer"
                                        >
                                            <span>Ir a Revisión Técnica</span>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const params = new URLSearchParams(window.location.search);
                                            if (params.get('from') === 'revision') {
                                                const pId = projectUuid || documentUuid;
                                                if (pId) {
                                                    navigate(`/documentacion/revision-tecnica/${pId}`);
                                                    return;
                                                }
                                            }
                                            if (params.get('from') === 'sala') {
                                                const carreraId = params.get('carrera');
                                                const perId = params.get('periodo');
                                                if (carreraId) {
                                                    navigate(`/documentacion/carrera/${carreraId}/sala-curricular${perId ? `?periodo=${encodeURIComponent(perId)}` : ''}`);
                                                    return;
                                                }
                                                navigate('/salas-curriculares');
                                                return;
                                            }
                                            navigate('/documentacion/mis-proyectos');
                                        }}
                                        className="w-full py-2.5 px-3 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-xs"
                                    >
                                        <span>Volver a Mis Asignaturas</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Vista Borrador / Subsanación: Selector de Marca de Agua y Generación de Vista Previa */
                            <div className="p-5 sm:p-6 flex flex-col gap-4 shrink-0">
                                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border-thin">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs sm:text-sm font-semibold text-text-main">Modo borrador</span>
                                        <span className="text-xs text-text-dim">Marca de agua institucional</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isDraftMode}
                                            onChange={(e) => setIsDraftMode(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-border-thin peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0070f3]"></div>
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleGeneratePdf(false)}
                                    disabled={isGenerating}
                                    className="w-full py-3 px-4 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    <FileText size={16} />
                                    <span>{isGenerating ? 'Generando vista previa...' : 'Generar Vista Previa'}</span>
                                </button>
                            </div>
                        )}

                        {/* Sección 2: Firmas (Visible únicamente cuando el documento aún no está firmado) */}
                        {!isDocumentSigned && (
                            <>
                                <div className="h-[1px] bg-border-thin/60 w-full shrink-0" />
                                <div className="p-5 sm:p-6 flex flex-col gap-5 shrink-0">
                                    <div className="space-y-4">
                                        {!canSign ? (
                                            <div className="p-5 bg-surface border border-border-thin rounded-xl text-center space-y-2.5">
                                                <div className="flex justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500">
                                                        <Shield size={18} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-text-main">Firma restringida</p>
                                                    <p className="text-xs text-text-dim leading-relaxed">
                                                        Solo los roles autorizados (Docente, Coordinación o Vicerrectorado) pueden firmar digitalmente este instrumento.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-4">
                                                {(signatureType === 'DOSIER' || signatureType === 'HIBRIDO') && (
                                                    isLoadingProfile ? (
                                                        <div className="flex flex-col items-center justify-center gap-2 p-6 border border-border-thin rounded-xl bg-surface text-text-dim text-xs">
                                                            <Clock size={16} className="animate-spin text-[#0070f3]" />
                                                            <span>Verificando perfil de firma institucional...</span>
                                                        </div>
                                                    ) : !signatureProfile?.esConfigurado ? (
                                                        <div className="flex flex-col gap-3.5 p-5 border border-amber-500/30 rounded-xl bg-amber-50/60 dark:bg-amber-950/20">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                                                                    <AlertCircle size={20} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h4 className="text-xs sm:text-sm font-bold text-text-main">
                                                                        Perfil de firma no configurado
                                                                    </h4>
                                                                    <p className="text-xs text-text-dim leading-relaxed">
                                                                        Para aplicar su firma digital institucional debe configurar previamente su cargo institucional y trazo manuscrito en su perfil. No puede firmar este instrumento mientras no esté configurada.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => navigate('/configuracion?editFirma=true#perfil-firma')}
                                                                className="w-full py-2.5 px-4 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                                            >
                                                                <Settings size={14} />
                                                                <span>Configurar Firma Institucional</span>
                                                                <ArrowRight size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-3.5 p-5 border border-border-thin rounded-xl bg-surface">
                                                            <div className="mb-0.5">
                                                                <h4 className="text-xs sm:text-sm font-bold text-text-main">Firma Institucional DOSIER</h4>
                                                            </div>

                                                            <p className="text-xs text-text-dim leading-relaxed">
                                                                Se aplicará el sello de firma digital institucional vinculado a su cuenta activa y perfil configurado.
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={() => setIsConfirmModalOpen(true)}
                                                                disabled={isSigning}
                                                                className="w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer bg-[#0070f3] hover:bg-[#005bb5] text-white shadow-xs disabled:opacity-50"
                                                            >
                                                                {isSigning ? (
                                                                    <span className="flex items-center gap-2">
                                                                        <Clock size={15} className="animate-spin" />
                                                                        <span>Firmando documento...</span>
                                                                    </span>
                                                                ) : (
                                                                    <span>Aplicar firma institucional</span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )
                                                )}

                                                {(signatureType === 'ECUADOR_P12' || signatureType === 'HIBRIDO') && (
                                                    <div className="flex flex-col gap-3.5 p-5 border border-border-thin rounded-xl bg-surface">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <FileText size={18} className="text-[#0070f3]" />
                                                            <h4 className="text-xs sm:text-sm font-bold text-text-main">Firma Digital (.p12 / .pfx)</h4>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-text-dim block">Certificado .p12</label>
                                                            <label
                                                                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all gap-1.5 ${signatureCertFile
                                                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                                                    : 'border-border-thin hover:border-[#0070f3]/50 bg-bg-deep'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="file"
                                                                    accept=".p12,.pfx"
                                                                    className="sr-only"
                                                                    onChange={(e) => setSignatureCertFile(e.target.files?.[0] || null)}
                                                                />
                                                                {signatureCertFile ? (
                                                                    <>
                                                                        <CheckCircle size={18} className="text-emerald-500" />
                                                                        <span className="text-xs font-semibold text-text-main truncate max-w-[200px]">{signatureCertFile.name}</span>
                                                                        <span className="text-[11px] text-text-dim">Clic para cambiar archivo</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Shield size={18} className="text-text-dim" />
                                                                        <span className="text-xs font-semibold text-text-main">Seleccionar archivo .p12 / .pfx</span>
                                                                        <span className="text-[11px] text-text-dim">No se almacena en el servidor</span>
                                                                    </>
                                                                )}
                                                            </label>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-text-dim block">Contraseña del certificado</label>
                                                            <input
                                                                type="password"
                                                                placeholder="Contraseña del archivo .p12"
                                                                value={signaturePassword}
                                                                onChange={(e) => setSignaturePassword(e.target.value)}
                                                                className="w-full bg-bg-deep border border-border-thin rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-main focus:border-[#0070f3] outline-none transition-all placeholder:text-text-dim/40"
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={handleSign}
                                                            disabled={isSigning || !signatureCertFile}
                                                            className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${(!signatureCertFile || isSigning)
                                                                ? 'bg-surface border border-border-thin text-text-dim cursor-not-allowed opacity-60'
                                                                : 'bg-[#0070f3] hover:bg-[#005bb5] text-white shadow-xs'
                                                                }`}
                                                        >
                                                            {isSigning ? <><Clock size={15} className="animate-spin" /> Firmando documento...</> : <><Shield size={15} /> Aplicar firma electrónica</>}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {signatures.length > 0 && (
                            <div className="border-t border-border-thin/60 p-5 sm:p-6 shrink-0">
                                <SignatureBlock
                                    documentoUuid={documentUuid || formData.Uuid || formData.uuid || ''}
                                    refreshTrigger={signatureRefreshTrigger}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Visor de PDF */}
                <div className="col-span-1 lg:col-span-8 bg-bg-deep border border-border-thin rounded-2xl flex flex-col shadow-inner relative overflow-hidden h-[85vh] sm:h-[88vh] min-h-[750px] lg:h-full lg:min-h-0">
                    {isGenerating ? (
                        <FullscreenLoader
                            fullscreen={false}
                            message={isOfficialDocument ? [
                                "Obteniendo documento oficial...",
                                "Cargando archivo firmado...",
                                "Preparando vista oficial...",
                                "Validando firmas y trazabilidad..."
                            ] : [
                                "Generando documento...",
                                "Preparando vista previa...",
                                "Compilando plantilla PDF...",
                                "Cargando firmas registradas..."
                            ]}
                        />
                    ) : pdfUrl ? (
                        <iframe
                            key={`${pdfUrl || 'no-pdf'}_${signatureRefreshTrigger}_${isOfficialDocument ? 'official' : 'draft'}`}
                            src={pdfUrl}
                            className="flex-1 w-full bg-white rounded-xl border-none shadow-2xl"
                            title={`Vista previa — ${title}`}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-dim/20 p-8">
                            <FileText size={80} strokeWidth={0.5} className="mb-6 lg:mb-8 md:w-[120px]" />
                            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-center">
                                {isOfficialDocument ? 'Cargando documento oficial...' : 'Listo para generar'}
                            </p>
                            {!isOfficialDocument && (
                                <button onClick={() => handleGeneratePdf(false)} className="mt-6 px-6 py-3 bg-text-main text-bg-deep rounded-xl text-[10px] font-bold uppercase tracking-widest lg:hidden cursor-pointer">
                                    Generar PDF
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmación de Firma Institucional (Portal al Body para cobertura total de viewport) */}
            {isConfirmModalOpen && typeof document !== 'undefined' && createPortal(
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={() => !isSigning && setIsConfirmModalOpen(false)}
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 font-sans p-4 animate-fade-in"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                Confirmar Firma Institucional
                            </h3>
                            <button
                                type="button"
                                onClick={() => !isSigning && setIsConfirmModalOpen(false)}
                                disabled={isSigning}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-50"
                                title="Cerrar"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 bg-white dark:bg-zinc-950">
                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                ¿Deseas firmar este documento? Al hacerlo, pasará a revisión.
                            </p>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-500 dark:text-zinc-400">Firmante:</span>
                                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                        {user?.nombre_completo || 'Usuario activo'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-500 dark:text-zinc-400">Cargo:</span>
                                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                                        {signatureProfile?.cargo || 'Docente'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsConfirmModalOpen(false)}
                                disabled={isSigning}
                                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    handleSignDosier().catch(() => {});
                                }}
                                disabled={isSigning}
                                className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-50"
                            >
                                <span>Confirmar y firmar</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Reutilizable de Éxito de Firma */}
            {isSignedModalOpen && setIsSignedModalOpen && (
                <TimedSuccessModal
                    isOpen={isSignedModalOpen}
                    onClose={() => setIsSignedModalOpen(false)}
                    durationMs={4500}
                    title="¡Documento firmado exitosamente!"
                    subtitle="Su firma institucional ha sido estampada y certificada en el documento oficial con trazabilidad inmutable."
                    badgeText="Firma electrónica certificada"
                    details={[
                        { label: 'Documento', value: signedModalData?.documentTitle || title },
                        { label: 'Rol firmante', value: signedModalData?.rolFirmante || 'Firmante autorizado' },
                        { label: 'Fecha y hora', value: signedModalData?.fechaFirma || new Date().toLocaleString() }
                    ]}
                />
            )}
        </div>
    );
};

export default OutputSection;
