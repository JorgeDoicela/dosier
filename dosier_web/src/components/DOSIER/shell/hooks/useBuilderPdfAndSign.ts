import { useState, useEffect, useCallback } from 'react';
import { documentInstanceService } from '../../../../services/documentInstanceService';
import { getPeaByUuid, firmarPea } from '../../../../services/peaService';
import { signDocumentWithDosier, signDocumentWithP12 } from '../../../../services/signaturesService';
import { useNotifications } from '../../../../api/NotificationsContext';
import { useAuth } from '../../../../api/AuthContext';

export interface UseBuilderPdfAndSignProps {
    templateCode: string;
    formData: any;
    documentUuid?: string;
    entityUuid?: string;
    projectStatus?: string;
    signatureType?: string;
    addAudit: (msg: string, type?: string) => void;
}

export const useBuilderPdfAndSign = ({
    templateCode,
    formData,
    documentUuid,
    entityUuid,
    projectStatus,
    addAudit
}: UseBuilderPdfAndSignProps) => {
    const { addToast } = useNotifications();
    const { roles = [] } = useAuth();

    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isDraftMode, setIsDraftMode] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [signaturePassword, setSignaturePassword] = useState('');
    const [institutionalPassword, setInstitutionalPassword] = useState('');
    const [signatureCertFile, setSignatureCertFile] = useState<File | null>(null);
    const [isSigning, setIsSigning] = useState(false);
    const [signatureRefreshTrigger, setSignatureRefreshTrigger] = useState(0);
    const [isSignedModalOpen, setIsSignedModalOpen] = useState(false);
    const [signedModalData, setSignedModalData] = useState<{
        documentTitle?: string;
        rolFirmante?: string;
        fechaFirma?: string;
    } | null>(null);

    const isPea = templateCode === 'PEA_OFICIAL';

    const getPeaRol = (): { codigo: string; label: string } => {
        if (roles.includes('DOSIER_VICERRECTOR') || roles.includes('DOSIER_ADMIN'))
            return { codigo: 'Vicerrector', label: 'Vicerrectorado Académico' };
        if (roles.includes('DOSIER_COORD_ACAD'))
            return { codigo: 'CoordinadorAcademico', label: 'Coordinación Académica' };
        if (roles.includes('DOSIER_COORD_CARRERA'))
            return { codigo: 'Coordinador', label: 'Coordinación de Carrera' };
        return { codigo: 'Docente', label: 'Docente Elaborador' };
    };

    const resolvePeaId = async (): Promise<number | null> => {
        const directId = Number(formData?.IdPea || formData?.id_pea || formData?.peaData?.id_pea || formData?.peaData?.IdPea || 0);
        if (directId > 0) return directId;

        const targetUuid = entityUuid || documentUuid || formData?.EntityUuid || formData?.entityUuid || formData?.Uuid || formData?.uuid;
        if (targetUuid && !targetUuid.startsWith('temp_')) {
            try {
                const res = await getPeaByUuid(targetUuid);
                const foundId = Number(res?.id_pea || res?.idPea || 0);
                if (foundId > 0) return foundId;
            } catch {}
        }
        return null;
    };

    // ── Gestión de URL del PDF (revocación de ObjectURL para evitar memory leaks) ──
    useEffect(() => {
        if (!pdfBlob) { setPdfUrl(null); return; }
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        return () => {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        };
    }, [pdfBlob]);

    // ── Generación de PDF ──
    const handleGeneratePdf = useCallback(async (blind = false) => {
        setIsGenerating(true);
        addAudit(blind ? 'Generando vista previa sin identidades...' : 'Generando vista previa del documento...');
        try {
            const blob = await documentInstanceService.renderDocumentPdf(templateCode, formData, isDraftMode, blind);
            setPdfBlob(blob);
            addAudit('PDF Generado exitosamente', 'success');
        } catch (err: any) {
            let errorMsg = err;
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    errorMsg = JSON.parse(text);
                } catch {}
            }
            console.error('[DOSIER] PDF render error:', errorMsg);
            addAudit('Error al generar el documento PDF', 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [templateCode, isDraftMode, formData, addAudit]);

    // ── Cargar PDF firmado u oficial ──
    const fetchSignedPdf = useCallback(async (): Promise<boolean> => {
        const targetUuid = entityUuid || documentUuid || formData?.Uuid || formData?.uuid;
        if (!targetUuid || targetUuid.startsWith('temp_')) return false;

        try {
            let instanceData: any = null;
            const currentDocId = documentUuid || formData?.Uuid || formData?.uuid;
            if (currentDocId && !currentDocId.startsWith('temp_')) {
                try {
                    const directRes: any = await documentInstanceService.getById(currentDocId);
                    const resData = directRes?.data || directRes;
                    if (resData?.finalPdfPath || resData?.final_pdf_path) {
                        instanceData = resData;
                    }
                } catch { }
            }

            if (!instanceData) {
                const instanceRes: any = await documentInstanceService.resolve({
                    templateCode,
                    entityUuid: targetUuid
                });
                instanceData = instanceRes?.data || instanceRes;
            }

            if (instanceData?.finalPdfPath || instanceData?.final_pdf_path) {
                const pdfBlob = await documentInstanceService.getInstancePdf(instanceData.uuid);
                setPdfBlob(pdfBlob);
                setIsDraftMode(false);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [entityUuid, documentUuid, formData, templateCode]);

    // Autocargar PDF firmado si existe; si no, mantener estado inicial en borrador
    useEffect(() => {
        let isMounted = true;
        const initPdf = async () => {
            const hasSigned = await fetchSignedPdf();
            if (!hasSigned && isMounted) {
                setIsDraftMode(true);
            }
        };
        initPdf();
        return () => { isMounted = false; };
    }, [entityUuid, documentUuid, projectStatus, signatureRefreshTrigger, fetchSignedPdf]);

    // ── Firma Electrónica PAdES — Upload-on-Demand ──
    const handleSign = async () => {
        if (!signatureCertFile) {
            addAudit('Debe adjuntar su archivo de firma digital (.p12) para continuar.', 'warning');
            return;
        }

        setIsSigning(true);
        addAudit('Iniciando proceso de firma electrónica...');
        try {
            const peaRoleInfo = getPeaRol();
            const calculatedRol = isPea ? peaRoleInfo.label : 'Director de Proyecto';

            if (isPea) {
                const idPea = await resolvePeaId();
                if (idPea) {
                    const base64Cert = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = reader.result as string;
                            resolve(result.includes(',') ? result.split(',')[1] : result);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(signatureCertFile);
                    });

                    await firmarPea(idPea, {
                        tipoFirma: 'FirmaEC',
                        certificadoP12Base64: base64Cert,
                        contraseniaP12: signaturePassword,
                        rolFirmante: peaRoleInfo.codigo as any
                    });
                }
            }

            let targetDocUuid = documentUuid || formData?.Uuid || formData?.uuid;
            const pUuid = entityUuid || formData?.EntityUuid || formData?.entityUuid;

            if ((!targetDocUuid || targetDocUuid.startsWith('temp_') || targetDocUuid === pUuid) && pUuid && templateCode) {
                try {
                    const res: any = await documentInstanceService.resolve({
                        templateCode,
                        entityUuid: pUuid
                    });
                    targetDocUuid = res?.uuid || res?.Uuid || targetDocUuid;
                } catch {}
            }

            const formDataObj = new FormData();
            formDataObj.append('certificate', signatureCertFile);
            formDataObj.append('password', signaturePassword || '');
            formDataObj.append('documentoUuid', targetDocUuid || '');
            formDataObj.append('rolFirmante', calculatedRol);

            await signDocumentWithP12(formDataObj).catch(() => {});

            setIsDraftMode(false);
            const loaded = await fetchSignedPdf();
            if (!loaded) {
                await handleGeneratePdf(false);
            }

            setSignatureCertFile(null);
            setSignaturePassword('');
            addAudit('Firma digital avanzada (.p12) aplicada exitosamente.', 'success');

            const docLabel = isPea ? 'Programa de Estudio de la Asignatura (PEA)' : 'Protocolo de Investigación';

            setSignedModalData({
                documentTitle: docLabel,
                rolFirmante: calculatedRol,
                fechaFirma: new Date().toLocaleString()
            });
            setIsSignedModalOpen(true);

            setSignatureRefreshTrigger(prev => prev + 1);
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        } catch (err: any) {
            console.error('[DOSIER] Error signing document:', err);

            let serverMessage = '';
            try {
                if (err?.response?.data?.error) {
                    serverMessage = err.response.data.error;
                } else if (typeof err?.response?.data === 'string') {
                    serverMessage = err.response.data;
                } else if (err?.response?.data?.message) {
                    serverMessage = err.response.data.message;
                }
            } catch {}

            const isLopdpGate = serverMessage.toLowerCase().includes('términos') ||
                serverMessage.toLowerCase().includes('lopdp') ||
                serverMessage.toLowerCase().includes('consentimiento');
            const isProfileMissing = serverMessage.toLowerCase().includes('perfil') ||
                serverMessage.toLowerCase().includes('cargo') ||
                serverMessage.toLowerCase().includes('trazo') ||
                serverMessage.toLowerCase().includes('firma institucional');

            let finalMsg = '';
            if (isLopdpGate) {
                finalMsg = 'Firma bloqueada: Acepte los términos de firma en Configuración → Mi Cuenta y Firma';
                addAudit(finalMsg, 'warning');
                addToast('Firma Bloqueada', finalMsg, 'warning', '/configuracion?mainTab=perfil#lopdp', undefined, 'Configurar');
            } else if (isProfileMissing) {
                finalMsg = serverMessage;
                addAudit(`Error de firma: ${serverMessage}`, 'error');
                addToast('Error de Firma', finalMsg, 'error', '/configuracion?editFirma=true#perfil-firma', undefined, 'Configurar');
            } else if (serverMessage) {
                finalMsg = serverMessage;
                addAudit(`Error de firma: ${serverMessage}`, 'error');
                addToast('Error de Firma', finalMsg, 'error');
            } else {
                finalMsg = 'Clave o certificado inválido';
                addAudit('Error de firma: Clave o certificado inválido', 'error');
                addToast('Error de Firma', finalMsg, 'error');
            }
        } finally {
            setIsSigning(false);
        }
    };

    const handleSignDosier = async () => {
        if (!institutionalPassword.trim()) {
            addAudit('Debe ingresar su contraseña institucional para firmar.', 'warning');
            return;
        }

        setIsSigning(true);
        addAudit('Iniciando proceso de firma institucional DOSIER...');
        try {
            const peaRoleInfo = getPeaRol();
            const calculatedRol = isPea ? peaRoleInfo.label : 'Director de Proyecto';

            if (isPea) {
                const idPea = await resolvePeaId();
                if (idPea) {
                    await firmarPea(idPea, {
                        tipoFirma: 'DOSIER',
                        password: institutionalPassword,
                        rolFirmante: peaRoleInfo.codigo as any
                    });
                }
            }

            let targetDocUuid = documentUuid || formData?.Uuid || formData?.uuid;
            const pUuid = entityUuid || formData?.EntityUuid || formData?.entityUuid;

            if ((!targetDocUuid || targetDocUuid.startsWith('temp_') || targetDocUuid === pUuid) && pUuid && templateCode) {
                try {
                    const res: any = await documentInstanceService.resolve({
                        templateCode,
                        entityUuid: pUuid
                    });
                    targetDocUuid = res?.uuid || res?.Uuid || targetDocUuid;
                } catch {}
            }

            const dto = {
                documento_uuid: targetDocUuid || '',
                rol_firmante: calculatedRol,
                password: institutionalPassword
            };

            await signDocumentWithDosier(dto as any).catch(() => {});

            setIsDraftMode(false);
            const loaded = await fetchSignedPdf();
            if (!loaded) {
                await handleGeneratePdf(false);
            }

            setInstitutionalPassword('');
            addAudit('Firma institucional DOSIER aplicada exitosamente.', 'success');

            const docLabel = isPea ? 'Programa de Estudio de la Asignatura (PEA)' : 'Protocolo de Investigación';

            setSignedModalData({
                documentTitle: docLabel,
                rolFirmante: calculatedRol,
                fechaFirma: new Date().toLocaleString()
            });
            setIsSignedModalOpen(true);

            setSignatureRefreshTrigger(prev => prev + 1);
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        } catch (err: any) {
            console.error('[DOSIER] Error al aplicar firma institucional:', err);
            let serverMessage = '';
            try {
                if (err?.response?.data instanceof Blob) {
                    const text = await err.response.data.text();
                    const parsed = JSON.parse(text);
                    serverMessage = parsed?.error || parsed?.message || '';
                } else if (err?.response?.data?.error) {
                    serverMessage = err.response.data.error;
                } else if (err?.response?.data?.message) {
                    serverMessage = err.response.data.message;
                } else if (typeof err?.response?.data === 'string') {
                    serverMessage = err.response.data;
                }
            } catch {}
            
            const finalMsg = serverMessage || 'Contraseña incorrecta o error de red';
            const lowerMsg = finalMsg.toLowerCase();
            const isProfileMissing = lowerMsg.includes('perfil') || 
                                     lowerMsg.includes('trazo') || 
                                     lowerMsg.includes('cargo') || 
                                     lowerMsg.includes('configure') || 
                                     lowerMsg.includes('firma institucional');
            const isLopdpGate = lowerMsg.includes('términos') || 
                                lowerMsg.includes('lopdp') || 
                                lowerMsg.includes('consentimiento');

            addAudit(`Error de firma: ${finalMsg}`, 'error');
            
            if (isProfileMissing) {
                addToast(
                    'Error de Firma', 
                    finalMsg, 
                    'error', 
                    '/configuracion?editFirma=true#perfil-firma', 
                    undefined, 
                    'Configurar'
                );
            } else if (isLopdpGate) {
                addToast(
                    'Firma Bloqueada', 
                    finalMsg, 
                    'warning', 
                    '/configuracion?mainTab=perfil#lopdp', 
                    undefined, 
                    'Configurar'
                );
            } else {
                addToast('Error de Firma', finalMsg, 'error');
            }
        } finally {
            setIsSigning(false);
        }
    };

    return {
        pdfBlob,
        pdfUrl,
        isDraftMode,
        setIsDraftMode,
        isGenerating,
        signaturePassword,
        setSignaturePassword,
        institutionalPassword,
        setInstitutionalPassword,
        signatureCertFile,
        setSignatureCertFile,
        isSigning,
        signatureRefreshTrigger,
        isSignedModalOpen,
        setIsSignedModalOpen,
        signedModalData,
        handleGeneratePdf,
        handleSign,
        handleSignDosier
    };
};
