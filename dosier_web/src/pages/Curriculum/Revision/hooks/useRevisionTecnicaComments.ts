import { useState, useEffect, useRef, useCallback } from 'react';
import type { SectionComment } from '../types/revisionTecnicaTypes';
import {
    getObservacionesPea,
    agregarObservacionPea,
    eliminarObservacionPea,
    type PeaObservacionDto
} from '../../../../services/peaService';
import { useAuth } from '../../../../api/AuthContext';

interface UseRevisionTecnicaCommentsParams {
    projectUuid: string | undefined;
    activeCommentField: string;
    addToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info' | 'default', url?: string, onUndo?: () => void | Promise<void>) => void;
}

export const useRevisionTecnicaComments = ({
    projectUuid,
    activeCommentField,
    addToast
}: UseRevisionTecnicaCommentsParams) => {
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const [comments, setComments] = useState<Record<string, SectionComment[]>>({});
    const [contextualInput, setContextualInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [loadingComments, setLoadingComments] = useState(false);

    const prevActiveFieldRef = useRef(activeCommentField);

    useEffect(() => {
        const fieldChanged = prevActiveFieldRef.current !== activeCommentField;
        if (fieldChanged) {
            setEditingCommentId(null);
            setContextualInput('');
            prevActiveFieldRef.current = activeCommentField;
        }
    }, [activeCommentField]);

    // Cargar observaciones oficiales desde doc_pea_observaciones
    const loadObservations = useCallback(async () => {
        if (!projectUuid) return;
        setLoadingComments(true);
        try {
            const list: PeaObservacionDto[] = await getObservacionesPea(projectUuid);
            const grouped: Record<string, SectionComment[]> = {};

            list.forEach(obs => {
                const key = obs.seccionAfectada || 'General';
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push({
                    id: obs.idObservacion,
                    uuid: obs.uuid,
                    status: obs.estado,
                    text: obs.textoObservacion,
                    creadoEn: obs.fechaObservacion,
                    nombreUsuario: obs.nombreObservador || obs.rolObservador || 'Revisor Curricular',
                    rolObservador: obs.rolObservador,
                    seccionAfectada: obs.seccionAfectada,
                    respuestaDocente: obs.respuestaDocente,
                    fechaResolucion: obs.fechaResolucion
                });
            });

            setComments(grouped);
        } catch (err) {
            console.error('[DOSIER] Error al cargar observaciones del PEA:', err);
        } finally {
            setLoadingComments(false);
        }
    }, [projectUuid]);

    useEffect(() => {
        loadObservations();
    }, [loadObservations]);

    const removeCommentLocal = async (section: string, id: number) => {
        try {
            await eliminarObservacionPea(id);
            setComments(prev => {
                const current = prev[section] || [];
                const updatedList = current.filter(c => c.id !== id);
                return {
                    ...prev,
                    [section]: updatedList
                };
            });
            addToast("Observación Eliminada", "La observación ha sido retirada del expediente curricular.", "info");
        } catch (err: any) {
            console.error('[DOSIER] Error al eliminar observación:', err);
            addToast("Error", err.response?.data?.message || "No se pudo eliminar la observación.", "error");
        }
    };

    const saveContextualComment = async () => {
        if (!contextualInput.trim() || !projectUuid) return;

        const rolObservador = isVicerrector
            ? 'Vicerrector'
            : isCoordAcad
                ? 'CoordinadorAcademico'
                : isCoordCarrera
                    ? 'CoordinadorCarrera'
                    : isAdmin
                        ? 'Administrador'
                        : 'CoordinadorCarrera';

        try {
            const nuevaObs = await agregarObservacionPea(projectUuid, {
                rolObservador,
                seccionAfectada: activeCommentField,
                texto: contextualInput.trim()
            });

            const newComment: SectionComment = {
                id: nuevaObs.idObservacion,
                uuid: nuevaObs.uuid,
                status: nuevaObs.estado,
                text: nuevaObs.textoObservacion,
                creadoEn: nuevaObs.fechaObservacion,
                nombreUsuario: nuevaObs.nombreObservador || rolObservador,
                rolObservador: nuevaObs.rolObservador,
                seccionAfectada: nuevaObs.seccionAfectada,
                respuestaDocente: nuevaObs.respuestaDocente
            };

            setComments(prev => {
                const current = prev[activeCommentField] || [];
                return {
                    ...prev,
                    [activeCommentField]: [...current, newComment]
                };
            });

            setContextualInput('');
            setEditingCommentId(null);
            addToast(
                "Observación Registrada",
                `Se ha guardado la observación técnica en ${activeCommentField}. El PEA pasa a estado Observado.`,
                "success"
            );
        } catch (err: any) {
            console.error('[DOSIER] Error al registrar observación:', err);
            addToast("Error", err.response?.data?.message || "No se pudo guardar la observación en el servidor.", "error");
        }
    };

    const handleStartListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            addToast("Reconocimiento de voz no soportado", "Su navegador no es compatible con el dictado por voz.", "warning");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'es-EC';
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onerror = (e: any) => {
                console.error("Speech recognition error:", e);
                setIsListening(false);
                if (e.error === 'not-allowed') {
                    addToast("Permiso denegado", "Habilite el acceso al micrófono en su navegador.", "warning");
                } else if (e.error === 'no-speech') {
                    addToast("Sin audio", "No se detectó voz. Intente hablar más cerca del micrófono.", "info");
                } else {
                    addToast("Error de dictado", "No se pudo procesar el audio.", "error");
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    setContextualInput(prev => prev ? `${prev} ${transcript}` : transcript);
                    addToast("Audio transcrito", "Se ha insertado la nota de voz en las observaciones.", "success");
                }
            };

            recognition.start();
        } catch (err) {
            console.error(err);
            setIsListening(false);
        }
    };

    return {
        comments,
        setComments,
        contextualInput,
        setContextualInput,
        isListening,
        editingCommentId,
        setEditingCommentId,
        loadingComments,
        removeCommentLocal,
        saveContextualComment,
        handleStartListening,
        reloadObservations: loadObservations
    };
};
