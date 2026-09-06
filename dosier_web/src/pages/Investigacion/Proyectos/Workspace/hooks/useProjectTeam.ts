import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../../../../api/axios_config';
import { useAuth } from '../../../../../api/AuthContext';
import { useNotifications } from '../../../../../api/NotificationsContext';
import { useConfirm } from '../../../../../api/ConfirmContext';
import { mapInvestigador } from './useProjectCore';

export const formatCareerName = (name: string) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase())
        .replace(/\b(De|En|Y|La|El|Los|Las|Con|Para)\b/g, (m: string) => m.toLowerCase());
};

export function useProjectTeam(
    currentProject: any,
    setCurrentProject: React.Dispatch<React.SetStateAction<any>>,
    resolvedProjectUuid: string | null,
    isLoadingProject: boolean,
    _isPreproposalState: boolean
) {
    const { user, isAdmin, roles } = useAuth();
    const { addToast } = useNotifications();
    const confirm = useConfirm();

    const [investigadores, setInvestigadores] = useState<any[]>([]);
    const [isSavingTeam, setIsSavingTeam] = useState(false);
    const [teamMessage, setTeamMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [teamChangeRequests, setTeamChangeRequests] = useState<any[]>([]);
    const [isLoadingTeamChangeRequests, setIsLoadingTeamChangeRequests] = useState(false);
    const [isSubmittingTeamChangeRequest, setIsSubmittingTeamChangeRequest] = useState(false);
    const [teamChangeForm, setTeamChangeForm] = useState({
        tipo: 'ALTA',
        cedulaObjetivo: '',
        rolPropuesto: 'Co-Investigador',
        motivo: '',
        resolucionReferencia: ''
    });

    const [availableProfessors, setAvailableProfessors] = useState<any[]>([]);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [requestSearchQuery, setRequestSearchQuery] = useState('');
    const [requestSearchResults, setRequestSearchResults] = useState<any[]>([]);
    const [isRequestSearching, setIsRequestSearching] = useState(false);
    const [showRequestSearchResults, setShowRequestSearchResults] = useState(false);

    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferDirector, setTransferDirector] = useState<any>(null);
    const [newDirectorCedula, setNewDirectorCedula] = useState('');
    const [transferMotivo, setTransferMotivo] = useState('Reasignación institucional');
    const [transferDescripcion, setTransferDescripcion] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferSearchQuery, setTransferSearchQuery] = useState('');
    const [transferSearchResults, setTransferSearchResults] = useState<any[]>([]);
    const [isTransferSearching, setIsTransferSearching] = useState(false);
    const [showTransferSearchResults, setShowTransferSearchResults] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const [isChangeRequestsExpanded, setIsChangeRequestsExpanded] = useState(false);
    const canReviewTeamChanges = isAdmin || roles?.includes('DOSIER_ADMIN');

    const fetchTeamChangeRequests = useCallback(async (projectUuid?: string) => {
        const uuidToUse = projectUuid || currentProject?.uuid || resolvedProjectUuid;
        if (!uuidToUse) {
            setTeamChangeRequests([]);
            return;
        }
        setIsLoadingTeamChangeRequests(true);
        try {
            const res = await api.get(`/projects/${uuidToUse}/team-change-requests`);
            setTeamChangeRequests(res.data || []);
        } catch (err) {
            console.error("[DOSIER] Error al obtener solicitudes de cambio de equipo", err);
        } finally {
            setIsLoadingTeamChangeRequests(false);
        }
    }, [currentProject?.uuid, resolvedProjectUuid]);

    useEffect(() => {
        const fetchAvailableUsers = async () => {
            try {
                const [profRes, alumRes] = await Promise.all([
                    api.get('/Admin/users?type=DOCENTE&soloConHoras=false&pageSize=100'),
                    api.get('/Admin/users?type=ESTUDIANTE&origenEstudiante=TODOS&estadoEstudiante=TODOS&pageSize=100')
                ]);
                const mapUser = (u: any) => ({
                    cedula: u.id_profesor || u.id_sigafi || '',
                    nombre: u.nombre_completo || u.nombre || '',
                    email: u.email || u.email_institucional || '',
                    carrera: u.carrera || '',
                    telefono: '',
                    nivelAcademico: 'Tercer Nivel',
                    horasDisponibles: u.horas_investigacion || 0,
                    horasAsignadas: u.horas_asignadas || 0,
                    id_usuario: u.id_usuario || 0,
                    tipo: u.type === 'ESTUDIANTE' ? 'alumno' : 'profesor'
                });
                setAvailableProfessors((profRes.data?.items || []).map(mapUser));
                setAvailableStudents((alumRes.data?.items || []).map(mapUser));
            } catch (err) {
                console.error("[DOSIER] Error fetching available users for request form", err);
            }
        };
        if (resolvedProjectUuid && isChangeRequestsExpanded) {
            fetchAvailableUsers();
        }
    }, [resolvedProjectUuid, isChangeRequestsExpanded]);

    useEffect(() => {
        if (!requestSearchQuery.trim() || requestSearchQuery.length < 2) {
            setRequestSearchResults([]);
            return;
        }

        const isStudentRole = ['Semillerista', 'SEMILLERISTA', 'Auxiliar de Investigación', 'alumno'].some(r => teamChangeForm.rolPropuesto.toLowerCase().includes(r.toLowerCase()));
        const targetType = (teamChangeForm.tipo === 'CAMBIO_DIRECTOR') ? 'DOCENTE' : (isStudentRole ? 'ESTUDIANTE' : 'DOCENTE');

        const isAlreadySelected = (targetType === 'DOCENTE' ? availableProfessors : availableStudents)
            .some(u => u.nombre === requestSearchQuery);
        if (isAlreadySelected) return;

        const delayDebounceFn = setTimeout(async () => {
            setIsRequestSearching(true);
            try {
                const endpoint = `/Admin/users?type=${targetType}&soloConHoras=false&estadoEstudiante=TODOS&origenEstudiante=TODOS&search=${encodeURIComponent(requestSearchQuery.trim())}&pageSize=30`;
                const res = await api.get(endpoint);
                const mapped = (res.data?.items || []).map((u: any) => ({
                    cedula: u.id_profesor || u.id_sigafi || '',
                    nombre: u.nombre_completo || u.nombre || '',
                    email: u.email || u.email_institucional || '',
                    carrera: u.carrera || '',
                    telefono: '',
                    nivelAcademico: 'Tercer Nivel',
                    horasDisponibles: u.horas_investigacion || 0,
                    horasAsignadas: u.horas_asignadas || 0,
                    id_usuario: u.id_usuario || 0,
                    tipo: targetType === 'ESTUDIANTE' ? 'alumno' : 'profesor'
                }));
                setRequestSearchResults(mapped);
                setShowRequestSearchResults(true);
            } catch (err) {
                console.error("[DOSIER] Error searching users", err);
            } finally {
                setIsRequestSearching(false);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [requestSearchQuery, teamChangeForm.rolPropuesto, teamChangeForm.tipo, availableProfessors, availableStudents]);

    useEffect(() => {
        if (!transferSearchQuery.trim()) {
            setTransferSearchResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            setIsTransferSearching(true);
            try {
                const res = await api.get(`/Admin/users?type=DOCENTE&soloConHoras=false&search=${encodeURIComponent(transferSearchQuery.trim())}&pageSize=30`);
                const mapped = (res.data?.items || []).map((u: any) => ({
                    cedula: u.id_profesor || u.id_sigafi || '',
                    nombre: u.nombre_completo || u.nombre || '',
                    email: u.email || u.email_institucional || '',
                    carrera: u.carrera || '',
                    telefono: '',
                    nivelAcademico: 'Tercer Nivel',
                    horasDisponibles: u.horas_investigacion || 0,
                    horasAsignadas: u.horas_asignadas || 0,
                    id_usuario: u.id_usuario || 0,
                    tipo: 'profesor'
                }));
                setTransferSearchResults(mapped);
                setShowTransferSearchResults(true);
            } catch (err) {
                console.error("[DOSIER] Error al buscar directores", err);
            } finally {
                setIsTransferSearching(false);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [transferSearchQuery]);




    const handleOpenTransferModal = (director: any) => {
        setTransferDirector(director);
        setNewDirectorCedula('');
        setTransferSearchQuery('');
        setTransferMotivo('Reasignación institucional');
        setTransferDescripcion('');
        setShowTransferModal(true);
    };

    const handleConfirmTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDirectorCedula) {
            addToast("Validación de Relevo", "Por favor selecciona un nuevo director.", "warning");
            return;
        }
        setIsTransferring(true);
        try {
            const res = await api.post(`/projects/${currentProject.uuid}/transfer-director`, {
                nuevo_director_cedula: newDirectorCedula,
                motivo: transferMotivo,
                descripcion: transferDescripcion
            });
            if (res.data.success) {
                addToast("Transferencia Exitosa", "¡Transferencia de dirección realizada con éxito!", "success");
                setShowTransferModal(false);
                const updatedProjectRes = await api.get(`/projects/${currentProject.uuid}/detail`);
                setInvestigadores((updatedProjectRes.data.investigadores || []).map(mapInvestigador));
            } else {
                addToast("Error de Transferencia", res.data.message || "Error al realizar la transferencia.", "error");
            }
        } catch (err: any) {
            console.error("[DOSIER] Error en transferencia de director", err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || "Error al realizar la transferencia.";
            addToast("Error de Transferencia", errMsg, "error");
        } finally {
            setIsTransferring(false);
        }
    };

    const handleUpdateMember = (cedula: string, field: string, value: any) => {
        setInvestigadores(prev => prev.map(inv => inv.cedula === cedula ? { ...inv, [field]: value } : inv));
    };

    const handleRemoveMember = (cedula: string) => {

        setInvestigadores(prev => prev.filter(inv => inv.cedula !== cedula));
    };

    const handleSaveTeam = async () => {
        setIsSavingTeam(true);
        setTeamMessage(null);
        try {
            const payload = investigadores.map(inv => ({
                nombre: inv.nombre,
                cedula: inv.cedula,
                rol: inv.rol,
                nivel_academico: inv.nivelAcademico,
                telefono: inv.telefono || "",
                activo: inv.activo !== false,
                horas_semanales: inv.horasSemanales !== undefined && inv.horasSemanales !== null && inv.horasSemanales !== '' ? parseFloat(inv.horasSemanales) : null
            }));
            const res = await api.patch(`/projects/${currentProject.uuid}/team`, payload);
            if (res.data.success) {
                addToast(
                    "Equipo de Trabajo",
                    "¡Equipo de trabajo guardado con éxito!",
                    "success"
                );

                const refreshed = await api.get(`/projects/${currentProject.uuid}/detail`);
                setInvestigadores((refreshed.data.investigadores || []).map(mapInvestigador));
                await fetchTeamChangeRequests(currentProject.uuid);
            } else {
                addToast("Error al Guardar", res.data.message || 'Error al guardar los cambios.', "error");
            }
        } catch (err: any) {
            console.error("[DOSIER] Error al guardar equipo de trabajo", err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || 'Ocurrió un error inesperado al guardar.';
            addToast("Error al Guardar", errMsg, "error");
        } finally {
            setIsSavingTeam(false);
        }
    };

    const handleCreateTeamChangeRequest = async () => {
        if (!currentProject?.uuid) return;
        if (!teamChangeForm.cedulaObjetivo.trim() || !teamChangeForm.motivo.trim()) {
            addToast("Solicitud incompleta", "Debes indicar cédula objetivo y motivo de la solicitud.", "warning");
            return;
        }

        setIsSubmittingTeamChangeRequest(true);
        try {
            const payload = {
                tipo: teamChangeForm.tipo,
                cedula_objetivo: teamChangeForm.cedulaObjetivo.trim(),
                rol_propuesto: teamChangeForm.tipo === 'BAJA' ? null : teamChangeForm.rolPropuesto,
                motivo: teamChangeForm.motivo.trim(),
                resolucion_referencia: teamChangeForm.resolucionReferencia.trim() || null
            };
            const res = await api.post(`/projects/${currentProject.uuid}/team-change-requests`, payload);
            if (res.data?.success) {
                addToast("Solicitud registrada", "La solicitud de cambio quedó registrada para revisión.", "success");
                setTeamChangeForm({
                    tipo: 'ALTA',
                    cedulaObjetivo: '',
                    rolPropuesto: 'Co-Investigador',
                    motivo: '',
                    resolucionReferencia: ''
                });
                setRequestSearchQuery('');
                await fetchTeamChangeRequests(currentProject.uuid);
            } else {
                addToast("No se pudo registrar", res.data?.message || "Error al registrar solicitud.", "error");
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Error al registrar solicitud de cambio.';
            addToast("Error de Solicitud", errMsg, "error");
        } finally {
            setIsSubmittingTeamChangeRequest(false);
        }
    };

    const handleReviewTeamChangeRequest = async (requestUuid: string, aprobar: boolean) => {
        if (!currentProject?.uuid) return;
        try {
            const res = await api.patch(`/projects/${currentProject.uuid}/team-change-requests/${requestUuid}/review`, {
                aprobar,
                ejecutar: aprobar,
                observacion_revision: aprobar ? "Aprobado por autoridad competente." : "Rechazado por autoridad competente."
            });
            if (res.data?.success) {
                addToast("Revisión completada", res.data.message || "Solicitud procesada.", "success");
                await fetchTeamChangeRequests(currentProject.uuid);
                const refreshed = await api.get(`/projects/${currentProject.uuid}/detail`);
                setInvestigadores((refreshed.data.investigadores || []).map(mapInvestigador));
            } else {
                addToast("Error de revisión", res.data?.message || "No se pudo revisar la solicitud.", "error");
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || "No se pudo revisar la solicitud.";
            addToast("Error de revisión", errMsg, "error");
        }
    };



    const populateTeamFromProject = useCallback((data: any) => {
        if (!data) return;
        setInvestigadores((data.investigadores || []).map(mapInvestigador));
        if (data.estado !== 'Prepropuesta' && data.estado !== 'Prepropuesta Rechazada') {
            fetchTeamChangeRequests(data.uuid);
        }
    }, [fetchTeamChangeRequests]);

    return {
        investigadores,
        setInvestigadores,
        isSavingTeam,
        teamMessage,
        teamChangeRequests,
        isLoadingTeamChangeRequests,
        isSubmittingTeamChangeRequest,
        teamChangeForm,
        setTeamChangeForm,
        availableProfessors,
        setAvailableProfessors,
        availableStudents,
        setAvailableStudents,
        requestSearchQuery,
        setRequestSearchQuery,
        requestSearchResults,
        isRequestSearching,
        showRequestSearchResults,
        setShowRequestSearchResults,
        canReviewTeamChanges,
        showTransferModal,
        setShowTransferModal,
        transferDirector,
        newDirectorCedula,
        setNewDirectorCedula,
        transferMotivo,
        setTransferMotivo,
        transferDescripcion,
        setTransferDescripcion,
        isTransferring,
        transferSearchQuery,
        setTransferSearchQuery,
        transferSearchResults,
        isTransferSearching,
        showTransferSearchResults,
        setShowTransferSearchResults,
        isHistoryExpanded,
        setIsHistoryExpanded,
        isChangeRequestsExpanded,
        setIsChangeRequestsExpanded,
        fetchTeamChangeRequests,
        handleOpenTransferModal,
        handleConfirmTransfer,
        handleUpdateMember,
        handleRemoveMember,
        handleSaveTeam,
        handleCreateTeamChangeRequest,
        handleReviewTeamChangeRequest,
        populateTeamFromProject,
        formatCareerName
    };
}
