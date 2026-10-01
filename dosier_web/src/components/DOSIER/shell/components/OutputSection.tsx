import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, FileText, Users, Shield, ShieldCheck, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { FullscreenLoader } from '../../../Common/FullscreenLoader';
import { TimedSuccessModal } from '../../../Common/TimedSuccessModal';
import { getDocumentSignatures } from '../../../../services/signaturesService';
import { SignatureBlock } from '../../SignatureBlock';
import { useAuth } from '../../../../api/AuthContext';
import { documentInstanceService } from '../../../../services/documentInstanceService';
import { PeaReviewPanel } from '../../../../pages/Curriculum/Workspace/components/PeaReviewPanel';

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
    const { isAdmin, isRevisor, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const isReviewer = Boolean(isAdmin || isRevisor || isCoordCarrera || isCoordAcad || isVicerrector);
    const [panelViewMode, setPanelViewMode] = React.useState<'emission' | 'review'>(() => {
        return isReviewer ? 'review' : 'emission';
    });
    const navigate = useNavigate();
    const [signatures, setSignatures] = React.useState<any[]>([]);
    const [isProtocoloSigned, setIsProtocoloSigned] = React.useState<boolean | null>(null);

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
                } catch {}
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
            .catch(() => {});

        return () => { isMounted = false; };
    }, [projectUuid, projectStatus, signatureRefreshTrigger]);

    // Autocargar vista previa con pantalla de carga al entrar a la sección
    const hasInitialGeneratedRef = React.useRef(false);
    React.useEffect(() => {
        if (!pdfUrl && !isGenerating && !hasInitialGeneratedRef.current) {
            hasInitialGeneratedRef.current = true;
            handleGeneratePdf(false);
        }
    }, [pdfUrl, isGenerating, handleGeneratePdf]);

    const activeSignatures = signatures.filter(s => (s.esValida !== false && (s as any).es_valida !== false) && (s.estado !== 2 && (s as any).estado !== 2));
    const isDocumentSigned = activeSignatures.length > 0;
    const isCurrentProtocolo = (templateCode?.toUpperCase().includes('PROTOCOLO')) || title.toLowerCase().includes('protocolo') || title.toLowerCase().includes('formato proyecto');
    const isExpedienteCompleto = isProtocoloSigned || ['En Revisión', 'Aprobado', 'En Ejecución', 'Finalizado'].includes(projectStatus || '');

    return (
        <div className="flex-1 p-2 sm:p-4 lg:p-6 flex flex-col gap-3 md:gap-4 animate-fade-in overflow-y-auto lg:overflow-hidden custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0 lg:overflow-hidden p-0.5">
                {/* Panel de Controles Unificado */}
                <div className="col-span-1 lg:col-span-4 bg-bg-deep border border-border-thin rounded-2xl shadow-sm flex flex-col lg:overflow-hidden lg:h-full">
                    {/* Selector de Modo: Auditoría vs Emisión */}
                    <div className="flex border-b border-border-thin bg-bg-deep shrink-0 select-none">
                        <button
                            type="button"
                            onClick={() => setPanelViewMode('review')}
                            className={`flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                                panelViewMode === 'review'
                                    ? 'border-[#0070f3] text-[#0070f3] bg-[#0070f3]/5 font-bold'
                                    : 'border-transparent text-text-dim hover:text-text-main hover:bg-surface/30'
                            }`}
                        >
                            <ShieldCheck size={14} />
                            <span>Auditoría y Avales</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPanelViewMode('emission')}
                            className={`flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                                panelViewMode === 'emission'
                                    ? 'border-text-main text-text-main bg-surface/50 font-bold'
                                    : 'border-transparent text-text-dim hover:text-text-main hover:bg-surface/30'
                            }`}
                        >
                            <Settings size={14} />
                            <span>Emisión y Firma</span>
                        </button>
                    </div>

                    {panelViewMode === 'review' ? (
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                            <PeaReviewPanel
                                peaData={formData}
                                entityUuid={projectUuid || directDocId}
                                onStatusChanged={() => {
                                    window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                            {/* Sección 1: Emisión y Vista Previa */}
                    <div className="p-5 sm:p-6 flex flex-col gap-4 shrink-0">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-dim flex items-center gap-2">
                            <Settings size={16} className="text-text-dim" /> Emisión del Documento
                        </h4>

                        {/* Switch Modo Borrador */}
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

                        {/* Botón de Generación de Vista Previa */}
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

                    <div className="h-[1px] bg-border-thin/60 w-full shrink-0" />

                    {/* Sección 2: Firmas */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {isDocumentSigned ? (
                                <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-3 animate-fade-in">
                                    <div className="flex justify-center">
                                        <div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
                                            <CheckCircle size={22} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-text-main">Documento Firmado Oficialmente</p>
                                        <p className="text-xs text-text-dim leading-relaxed">
                                            {isCurrentProtocolo && isExpedienteCompleto && projectStatus === 'Enviado'
                                                ? 'El documento cuenta con firmas electrónicas y ha sido remitido a la etapa de Revisión del Administrador.'
                                                : 'Este documento cuenta con firma electrónica oficial y registro inmutable de trazabilidad.'}
                                        </p>
                                    </div>

                                    <div className="pt-2 flex flex-col gap-2">
                                        {isReviewer && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const pId = projectUuid || documentUuid;
                                                    if (pId) navigate(`/documentacion/revision-tecnica/${pId}`);
                                                }}
                                                className="w-full py-2.5 px-3 bg-[#0070f3] hover:bg-[#005bb5] text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                            >
                                                <Shield size={14} />
                                                <span>Ir a Revisión Técnica</span>
                                                <ArrowRight size={13} />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const url = new URL(window.location.href);
                                                url.searchParams.delete('edit');
                                                url.searchParams.delete('section');
                                                navigate(url.pathname);
                                            }}
                                            className="w-full py-2.5 px-3 btn-vercel-secondary text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <Settings size={15} />
                                            <span>Ver Asignatura</span>
                                        </button>
                                    </div>
                                </div>
                            ) : !canSign ? (
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
                                        <div className="flex flex-col gap-3.5 p-5 border border-border-thin rounded-xl bg-surface">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <Shield size={18} className="text-[#0070f3]" />
                                                <h4 className="text-xs sm:text-sm font-bold text-text-main">Firma Institucional DOSIER</h4>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-text-dim block">Contraseña Institucional</label>
                                                <input
                                                    type="password"
                                                    placeholder="Ingresa la contraseña de tu cuenta"
                                                    value={institutionalPassword}
                                                    onChange={(e) => setInstitutionalPassword(e.target.value)}
                                                    className="w-full bg-bg-deep border border-border-thin rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-main focus:border-[#0070f3] outline-none transition-all placeholder:text-text-dim/40"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleSignDosier}
                                                disabled={isSigning || !institutionalPassword}
                                                className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${(!institutionalPassword || isSigning)
                                                        ? 'bg-surface border border-border-thin text-text-dim cursor-not-allowed opacity-60'
                                                        : 'bg-[#0070f3] hover:bg-[#005bb5] text-white shadow-xs'
                                                    }`}
                                            >
                                                {isSigning ? <><Clock size={15} className="animate-spin" /> Firmando documento...</> : <><Shield size={15} /> Aplicar firma institucional</>}
                                            </button>
                                        </div>
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

                            <div className="mt-2 border-t border-border-thin pt-4">
                                <SignatureBlock 
                                    documentoUuid={documentUuid || formData.Uuid || formData.uuid || ''} 
                                    refreshTrigger={signatureRefreshTrigger} 
                                    />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

                {/* Visor de PDF */}
                <div className="col-span-1 lg:col-span-8 bg-bg-deep border border-border-thin rounded-2xl flex flex-col shadow-inner relative overflow-hidden h-[85vh] sm:h-[88vh] min-h-[750px] lg:h-full lg:min-h-0">
                    {isGenerating ? (
                        <FullscreenLoader 
                            fullscreen={false} 
                            message={[
                                "Generando documento...",
                                "Preparando vista previa...",
                                "Compilando plantilla PDF...",
                                "Cargando firmas registradas..."
                            ]} 
                        />
                    ) : pdfUrl ? (
                        <iframe src={pdfUrl} className="flex-1 w-full bg-white rounded-xl border-none shadow-2xl" title={`Vista previa — ${title}`} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-dim/20 p-8">
                            <FileText size={80} strokeWidth={0.5} className="mb-6 lg:mb-8 md:w-[120px]" />
                            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-center">Listo para generar</p>
                            <button onClick={() => handleGeneratePdf(false)} className="mt-6 px-6 py-3 bg-text-main text-bg-deep rounded-xl text-[10px] font-bold uppercase tracking-widest lg:hidden cursor-pointer">
                                Generar PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Reutilizable de Éxito de Firma */}
            {isSignedModalOpen && setIsSignedModalOpen && (
                <TimedSuccessModal
                    isOpen={isSignedModalOpen}
                    onClose={() => setIsSignedModalOpen(false)}
                    durationMs={4500}
                    title="¡Documento Firmado Exitosamente!"
                    subtitle="Su firma institucional ha sido estampada y certificada en el documento oficial con trazabilidad inmutable."
                    badgeText="Firma Electrónica Certificada"
                    details={[
                        { label: 'Documento', value: signedModalData?.documentTitle || title },
                        { label: 'Rol Firmante', value: signedModalData?.rolFirmante || 'Firmante Autorizado' },
                        { label: 'Fecha y Hora', value: signedModalData?.fechaFirma || new Date().toLocaleString() }
                    ]}
                />
            )}
        </div>
    );
};

export default OutputSection;
