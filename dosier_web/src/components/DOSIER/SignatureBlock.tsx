import React, { useEffect, useState } from 'react';
import { getDocumentSignatures } from '../../services/signaturesService';
import type { SignatureRecordDto } from '../../services/signaturesService';

interface SignatureBlockProps {
    documentoUuid: string;
    refreshTrigger?: number; // Para forzar recarga tras firmar
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({ 
    documentoUuid, 
    refreshTrigger = 0 
}) => {
    const [signatures, setSignatures] = useState<SignatureRecordDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSignatures();
    }, [documentoUuid, refreshTrigger]);

    const loadSignatures = async () => {
        try {
            setLoading(true);
            const data = await getDocumentSignatures(documentoUuid);
            setSignatures(data);
        } catch (err) {
            console.error('Error al cargar firmas del documento:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-text-dim py-3">
                <span className="w-3.5 h-3.5 border-2 border-[#0070f3] border-t-transparent rounded-full animate-spin" />
                <span>Cargando registro de firmas...</span>
            </div>
        );
    }

    if (signatures.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-dim">
                Firmas del Documento ({signatures.length})
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
                {signatures.map((sig: any) => {
                    const idFirma = sig.idFirma ?? sig.id_firma;
                    const firmanteNombre = sig.firmanteNombre ?? sig.firmante_nombre ?? sig.firmanteId ?? sig.firmante_id ?? 'Firmante';
                    const firmanteRol = sig.firmanteRol ?? sig.firmante_rol ?? 'Firmante';
                    const fechaFirma = sig.fechaFirma ?? sig.fecha_firma;
                    const firmaCode = sig.firmaCode ?? sig.firma_code ?? '';
                    const estado = sig.estado ?? 1;
                    const motivoRevocacion = sig.motivoRevocacion ?? sig.motivo_revocacion;

                    return (
                        <div 
                            key={idFirma || firmaCode} 
                            className="p-4 flex flex-col gap-2.5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-semibold text-text-main">
                                    {firmanteNombre}
                                </span>
                                <span className={`text-xs font-semibold ${estado === 2 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {estado === 2 ? 'Revocada' : 'Firma Válida'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-text-dim">Rol:</span>
                                    <span className="text-text-main font-medium">{firmanteRol}</span>
                                </div>
                                {fechaFirma && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-dim">Fecha:</span>
                                        <span className="text-text-main font-medium">
                                            {new Date(fechaFirma).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-text-dim">Código:</span>
                                    <span className="font-mono text-xs text-text-main">{firmaCode}</span>
                                </div>
                                {estado === 2 && motivoRevocacion && (
                                    <div className="mt-1 flex flex-col gap-1 text-xs">
                                        <span className="text-rose-600 dark:text-rose-400 font-semibold">Motivo de Anulación:</span>
                                        <span className="text-rose-700 dark:text-rose-300">{motivoRevocacion}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
