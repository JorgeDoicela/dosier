import { useState, useEffect, useCallback, useRef } from 'react';
import { documentInstanceService } from '../../../../services/documentInstanceService';
import { getPeaByUuid, firmarPea } from '../../../../services/peaService';
import { signDocumentWithDosier, signDocumentWithP12, getSignatureProfile } from '../../../../services/signaturesService';
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
    onBeforeSign?: () => Promise<void>;
    onAfterSign?: () => void;
}

export const computeInstitutionalFilename = (tmplCode: string, data: any, defaultTitle?: string): string => {
    const code = (tmplCode || 'PEA').replace('_OFICIAL', '');
    const carrera = data?.carrera || data?.Carrera || data?.peaData?.carrera?.nombre || data?.carrera_nombre || '';
    const asignatura = data?.asignatura || data?.Asignatura || data?.peaData?.asignatura?.nombre || data?.asignatura_nombre || defaultTitle || '';
    const periodo = data?.periodo || data?.Periodo || data?.peaData?.periodo?.codigo || data?.periodo_academico || '';

    const sanitize = (raw: string) => (raw || '').replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').trim();
    const parts = [code, sanitize(carrera), sanitize(asignatura), sanitize(periodo)].filter(Boolean);
    const base = parts.length > 0 ? parts.join('_') : `DOSIER_${code}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    return base.endsWith('.pdf') ? base : `${base}.pdf`;
};

export const useBuilderPdfAndSign = ({
    templateCode,
    formData,
    documentUuid,
    entityUuid,
    projectStatus,
    addAudit,
    onBeforeSign,
    onAfterSign
}: UseBuilderPdfAndSignProps) => {
    const { addToast } = useNotifications();
    const { roles = [] } = useAuth();

    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const isDirectApiUrl = useRef(false);
    const [resolvedFilename, setResolvedFilename] = useState<string>(() =>
        computeInstitutionalFilename(templateCode, formData)
    );
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

    const [localStatus, setLocalStatus] = useState<string | null>(null);
    const isSignedInSessionRef = useRef(false);
    const effectiveStatus = (localStatus || formData?.estado || formData?.status || projectStatus || '').toString().toLowerCase();
    const isCorrectionState = !isSignedInSessionRef.current && ['observado', 'corregido', 'encorrección', 'encorreccion'].includes(effectiveStatus);
    const isAlreadySubmitted = isSignedInSessionRef.current || (!isCorrectionState && (
        effectiveStatus === 'enrevision' ||
        effectiveStatus === 'en revisión' ||
        effectiveStatus === 'en_revision' ||
        effectiveStatus === 'revisadocoord' ||
        effectiveStatus === 'revisadoacad' ||
        effectiveStatus === 'aprobado' ||
        effectiveStatus === 'finalizado' ||
        effectiveStatus === 'signed' ||
        !!formData?.FirmaElaboradoDocente ||
        !!formData?.firma_elaborado_docente
    ));

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

    const resolvePeaId = async (): Promise<number | string | null> => {
        const directId = Number(formData?.IdPea || formData?.id_pea || formData?.peaData?.id_pea || formData?.peaData?.IdPea || 0);
        if (directId > 0) return directId;

        const targetUuid = entityUuid || documentUuid || formData?.EntityUuid || formData?.entityUuid || formData?.Uuid || formData?.uuid;
        if (targetUuid && !targetUuid.startsWith('temp_')) {
            try {
                const res = await getPeaByUuid(targetUuid);
                const foundId = Number(res?.id_pea || res?.idPea || 0);
                if (foundId > 0) return foundId;
                if (res?.uuid) return res.uuid;
            } catch {}
            if (targetUuid.includes('-')) return targetUuid;
        }
        return null;
    };

    // ── Gestión de URL del PDF (revocación de ObjectURL para evitar memory leaks) ──
    useEffect(() => {
        if (!pdfBlob) {
            setPdfUrl(null);
            return;
        }

        // Si fue establecido explícitamente desde la API oficial, preservarla
        if (isDirectApiUrl.current) {
            isDirectApiUrl.current = false;
            return;
        }

        // Si pdfUrl ya es una ruta API directa con nomenclatura institucional, preservarla para visor
        if (pdfUrl && !pdfUrl.startsWith('blob:')) {
            return;
        }

        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        return () => {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        };
    }, [pdfBlob]);

    // ── Generación de PDF ──
    const handleGeneratePdf = useCallback(async (blind = false, forceOfficial = false) => {
        if (!templateCode || templateCode === 'SALA_CARRERA' || templateCode === 'NONE') {
            return;
        }
        isDirectApiUrl.current = false;
        setIsGenerating(true);
        addAudit(blind ? 'Generando vista previa sin identidades...' : 'Generando vista previa del documento...');
        try {
            const draftMode = (forceOfficial || isSignedInSessionRef.current || isAlreadySubmitted) ? false : isDraftMode;
            const payload = {
                ...formData,
                uuid: documentUuid || formData?.Uuid || formData?.uuid,
                entityUuid: entityUuid || formData?.EntityUuid || formData?.entityUuid
            };
            const { blob, filename } = await documentInstanceService.renderDocumentPdfWithFilename(templateCode, payload, draftMode, blind);
            const finalFilename = filename && filename !== `${templateCode}.pdf`
                ? filename
                : computeInstitutionalFilename(templateCode, payload);
            setResolvedFilename(finalFilename);
            setPdfBlob(blob);
            const blobUrl = URL.createObjectURL(blob);
            setPdfUrl(blobUrl);
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
    }, [templateCode, isDraftMode, isAlreadySubmitted, formData, documentUuid, entityUuid, addAudit]);

    // ── Cargar PDF firmado u oficial ──
    const fetchSignedPdf = useCallback(async (force: boolean = false): Promise<boolean> => {
        if (!templateCode || templateCode === 'SALA_CARRERA' || templateCode === 'NONE') return false;
        // En estado de corrección / subsanación, nunca se debe cargar el PDF congelado anterior salvo forzado post-firma
        if (!force && !isSignedInSessionRef.current && isCorrectionState) return false;

        const targetUuid = entityUuid || documentUuid || formData?.Uuid || formData?.uuid;
        if (!targetUuid || targetUuid.startsWith('temp_')) return false;

        setIsGenerating(true);
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

            const docInstanceUuid = instanceData?.uuid || instanceData?.Uuid;
            if (docInstanceUuid) {
                const { blob, filename } = await documentInstanceService.getInstancePdfWithFilename(docInstanceUuid);
                if (blob && blob.size > 1000) {
                    const finalFilename = filename && filename !== 'documento.pdf' && !filename.startsWith('documento_')
                        ? filename
                        : computeInstitutionalFilename(templateCode, formData, instanceData?.title);

                    isDirectApiUrl.current = true;
                    setResolvedFilename(finalFilename);
                    setPdfBlob(blob);
                    setIsDraftMode(false);

                    // Establecer URL directa al endpoint oficial con bust-cache para que el visor cargue el PDF firmado actualizado
                    const directUrl = documentInstanceService.getInstancePdfUrl(docInstanceUuid, finalFilename);
                    const cacheBusterUrl = directUrl.includes('?') ? `${directUrl}&t=${Date.now()}` : `${directUrl}?t=${Date.now()}`;
                    setPdfUrl(cacheBusterUrl);
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        } finally {
            setIsGenerating(false);
        }
    }, [entityUuid, documentUuid, formData, templateCode, isCorrectionState]);

    // Autocargar PDF firmado si existe al montar o cambiar de documento; si no, mantener estado inicial en borrador
    useEffect(() => {
        if (isSignedInSessionRef.current) return;
        if (!templateCode || templateCode === 'SALA_CARRERA' || templateCode === 'NONE') return;

        let isMounted = true;
        const initPdf = async () => {
            if (isCorrectionState) {
                // En subsanación: generar vista previa preliminar de trabajo con los cambios recientes
                setIsDraftMode(true);
                await handleGeneratePdf(false);
                return;
            }

            const hasSigned = await fetchSignedPdf();
            if (!hasSigned && isMounted) {
                if (isAlreadySubmitted) {
                    setIsDraftMode(false);
                    await handleGeneratePdf(false, true);
                } else {
                    setIsDraftMode(true);
                }
            }
        };
        initPdf();
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityUuid, documentUuid, projectStatus, templateCode]);

    // ── Firma Electrónica PAdES — Upload-on-Demand ──
    const handleSign = async () => {
        if (!signatureCertFile) {
            addAudit('Debe adjuntar su archivo de firma digital (.p12) para continuar.', 'warning');
            return;
        }

        setIsSigning(true);
        addAudit('Iniciando proceso de firma electrónica...');
        try {
            if (onBeforeSign) {
                try {
                    await onBeforeSign();
                } catch {}
            }

            const peaRoleInfo = getPeaRol();
            const calculatedRol = isPea ? peaRoleInfo.label : 'Director de Proyecto';

            if (isPea) {
                const idPea = await resolvePeaId();
                if (!idPea) {
                    throw new Error('No se pudo resolver el identificador oficial del PEA para firmar.');
                }
                const base64Cert = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        resolve(result.includes(',') ? result.split(',')[1] : result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(signatureCertFile);
                });

                const signRes = await firmarPea(idPea, {
                    tipoFirma: 'FirmaEC',
                    certificadoP12Base64: base64Cert,
                    contraseniaP12: signaturePassword,
                    rolFirmante: peaRoleInfo.codigo as any
                });

                isSignedInSessionRef.current = true;
                if (formData && signRes) {
                    const nextStatus = signRes.estadoNuevo || signRes.estado_nuevo || 'EnRevision';
                    setLocalStatus(nextStatus);
                    formData.estado = nextStatus;
                    formData.status = nextStatus;
                    if (signRes.firmaCode || signRes.firma_code) {
                        formData.FirmaElaboradoDocente = signRes.firmaCode || signRes.firma_code;
                        formData.firma_elaborado_docente = signRes.firmaCode || signRes.firma_code;
                    }
                }
                if (onAfterSign) onAfterSign();
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

            if (!isPea) {
                const formDataObj = new FormData();
                formDataObj.append('certificate', signatureCertFile);
                formDataObj.append('password', signaturePassword || '');
                formDataObj.append('documentoUuid', targetDocUuid || '');
                formDataObj.append('rolFirmante', calculatedRol);

                await signDocumentWithP12(formDataObj).catch(() => {});
                isSignedInSessionRef.current = true;
                if (onAfterSign) onAfterSign();
            }

            setIsDraftMode(false);
            const loaded = await fetchSignedPdf(true);
            if (!loaded) {
                await handleGeneratePdf(false, true);
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
        setIsSigning(true);
        addAudit('Iniciando proceso de firma institucional DOSIER...');
        try {
            // Verificación defensiva previa de perfil de firma institucional
            const profile = await getSignatureProfile().catch(() => null);
            if (!profile?.esConfigurado) {
                addToast(
                    'Perfil de Firma Incompleto',
                    'Debe configurar su cargo institucional y trazo de firma en su perfil antes de aplicar la firma oficial.',
                    'warning',
                    '/configuracion?editFirma=true#perfil-firma',
                    undefined,
                    'Configurar'
                );
                addAudit('Firma bloqueada: perfil de firma institucional no configurado.', 'warning');
                setIsSigning(false);
                return;
            }

            if (onBeforeSign) {
                try {
                    await onBeforeSign();
                } catch {}
            }

            const peaRoleInfo = getPeaRol();
            const calculatedRol = isPea ? peaRoleInfo.label : 'Director de Proyecto';

            if (isPea) {
                const idPea = await resolvePeaId();
                if (!idPea) {
                    throw new Error('No se pudo resolver el identificador oficial del PEA para firmar.');
                }
                const signRes = await firmarPea(idPea, {
                    tipoFirma: 'DOSIER',
                    password: institutionalPassword ? institutionalPassword : undefined,
                    rolFirmante: peaRoleInfo.codigo as any
                });

                isSignedInSessionRef.current = true;
                if (formData && signRes) {
                    const nextStatus = signRes.estadoNuevo || signRes.estado_nuevo || 'EnRevision';
                    setLocalStatus(nextStatus);
                    formData.estado = nextStatus;
                    formData.status = nextStatus;
                    if (signRes.firmaCode || signRes.firma_code) {
                        formData.FirmaElaboradoDocente = signRes.firmaCode || signRes.firma_code;
                        formData.firma_elaborado_docente = signRes.firmaCode || signRes.firma_code;
                    }
                }
                if (onAfterSign) onAfterSign();
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

            if (!isPea) {
                const dto = {
                    documento_uuid: targetDocUuid || '',
                    rol_firmante: calculatedRol,
                    password: institutionalPassword ? institutionalPassword : undefined
                };

                await signDocumentWithDosier(dto as any).catch(() => {});
                isSignedInSessionRef.current = true;
                if (onAfterSign) onAfterSign();
            }

            setIsDraftMode(false);
            const loaded = await fetchSignedPdf(true);
            if (!loaded) {
                await handleGeneratePdf(false, true);
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

    const handleDownloadPdf = useCallback(() => {
        const finalName = resolvedFilename || computeInstitutionalFilename(templateCode, formData);

        if (pdfBlob) {
            const link = document.createElement('a');
            const blobUrl = URL.createObjectURL(pdfBlob);
            link.href = blobUrl;
            link.download = finalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            return;
        }

        const targetUuid = entityUuid || documentUuid || formData?.Uuid || formData?.uuid;
        if (targetUuid && !targetUuid.startsWith('temp_')) {
            window.location.href = `/api/documents/instances/${encodeURIComponent(targetUuid)}/download`;
        }
    }, [pdfBlob, resolvedFilename, templateCode, formData, entityUuid, documentUuid]);

    return {
        pdfBlob,
        pdfUrl,
        resolvedFilename,
        handleDownloadPdf,
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
        fetchSignedPdf,
        isAlreadySubmitted,
        handleSign,
        handleSignDosier
    };
};
