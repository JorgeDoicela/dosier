import { useState, useEffect, useRef } from 'react';
import { Award, Link, BookOpen, Fingerprint, Save, RefreshCw, ChevronRight, FileText } from 'lucide-react';
import api from '../../../api/axios_config';
import { useConfirm } from '../../../api/ConfirmContext';

interface UserProfileModalProps {
    user: {
        id_profesor: string;
        nombre_completo: string;
        user_uuid: string;
        type?: string;
    };
    onClose: () => void;
    onDraftCleared?: () => void;
}

const formatNombre = (nombre: string | null | undefined) => {
    if (!nombre) return '';
    return nombre
        .toLowerCase()
        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
};

const UserProfileModal = ({ user, onClose, onDraftCleared }: UserProfileModalProps) => {
    const confirm = useConfirm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [metadata, setMetadata] = useState({
        nombre: '',
        email: ''
    });

    const [officialMetadata, setOfficialMetadata] = useState<any>(null);
    const [isDraftRestored, setIsDraftRestored] = useState(false);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (user.user_uuid) {
            fetchMetadata();
        }
    }, [user.user_uuid]);

    const fetchMetadata = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/Admin/metadata/${user.user_uuid}`);
            const officialData = response.data;
            setOfficialMetadata(officialData);
            
            // Check if there is a draft
            const draftKey = `edit_user_metadata_draft_${user.user_uuid}`;
            const draft = localStorage.getItem(draftKey);
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (parsed && typeof parsed === 'object' && parsed.metadata && typeof parsed.metadata === 'object') {
                        const validated = {
                            nombre: typeof parsed.metadata.nombre === 'string' ? parsed.metadata.nombre : '',
                            email: typeof parsed.metadata.email === 'string' ? parsed.metadata.email : ''
                        };
                        setMetadata(validated);
                        setIsDraftRestored(true);
                    } else {
                        throw new Error("Estructura de borrador de perfil de usuario inválida");
                    }
                } catch (e) {
                    console.warn("Borrador corrupto o desactualizado detectado. Limpiando almacenamiento...", e);
                    localStorage.removeItem(draftKey);
                    localStorage.removeItem('user_metadata_draft_metadata');
                    setMetadata(officialData);
                    setIsDraftRestored(false);
                }
            } else {
                setMetadata(officialData);
                setIsDraftRestored(false);
            }
            isInitializedRef.current = true;
        } catch (error) {
            console.error('Error fetching metadata:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearDraft = () => {
        localStorage.removeItem(`edit_user_metadata_draft_${user.user_uuid}`);
        localStorage.removeItem('user_metadata_draft_metadata');
        setIsDraftRestored(false);
        if (onDraftCleared) {
            onDraftCleared();
        }
    };

    // Auto-save effect
    useEffect(() => {
        if (loading || !isInitializedRef.current || !user.user_uuid) return;

        const draftData = { metadata };
        const draftKey = `edit_user_metadata_draft_${user.user_uuid}`;
        localStorage.setItem(draftKey, JSON.stringify(draftData));

        const meta = {
            type: 'edit',
            uuid: user.user_uuid,
            userName: user.nombre_completo,
            timestamp: Date.now()
        };
        localStorage.setItem('user_metadata_draft_metadata', JSON.stringify(meta));
    }, [metadata, loading, user.user_uuid, user.nombre_completo]);

    const handleCloseModal = async () => {
        const hasChanges = officialMetadata && JSON.stringify(metadata) !== JSON.stringify(officialMetadata);
        if (hasChanges) {
            if (await confirm({
                title: "Salir del Formulario",
                message: "¿Está seguro de salir? Perderá todos los cambios no guardados en este formulario.",
                confirmText: "Salir",
                cancelText: "Cancelar",
                variant: "warning"
            })) {
                clearDraft();
                onClose();
            }
        } else {
            clearDraft();
            onClose();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/Admin/metadata/${user.user_uuid}`, metadata);
            clearDraft();
            onClose();
        } catch (error: any) {
            console.error('Error saving metadata:', error);
            const msg = error.response?.data?.message || 'Ocurrió un error inesperado al actualizar el perfil.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex justify-end">
            <div 
                className="absolute inset-0 bg-bg-deep/90 backdrop-blur-sm cursor-pointer animate-fade-in"
                onClick={handleCloseModal}
            />
            <div className="relative w-full max-w-md h-full bg-surface border-l border-border-thin flex flex-col z-10 animate-fade-up overflow-hidden">
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <div className="icon-circle icon-circle-brand">
                            <Award size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-text-main tracking-tight">{formatNombre(user.nombre_completo)}</h3>
                            <p className="section-label text-text-dim">Gestión de Cuenta de Usuario</p>
                        </div>
                    </div>
                    <button onClick={handleCloseModal} className="text-text-dim hover:text-text-main p-2 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isDraftRestored && (
                        <div className="border border-border-thin bg-surface-hover rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in mb-6">
                            <div className="flex items-center gap-3">
                                <FileText size={16} className="text-text-main shrink-0" />
                                <p className="text-xs text-text-dim">
                                    <span className="text-text-main font-semibold">Borrador restaurado:</span> Se han recuperado tus datos no guardados localmente.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (officialMetadata) {
                                        setMetadata(officialMetadata);
                                    }
                                    localStorage.removeItem(`edit_user_metadata_draft_${user.user_uuid}`);
                                    localStorage.removeItem('user_metadata_draft_metadata');
                                    setIsDraftRestored(false);
                                    if (onDraftCleared) {
                                        onDraftCleared();
                                    }
                                }}
                                className="text-xs font-medium text-brand hover:underline cursor-pointer shrink-0"
                            >
                                Descartar borrador
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <RefreshCw className="animate-spin text-brand" size={24} />
                            <p className="section-label text-text-dim">Cargando datos del usuario...</p>
                        </div>
                    ) : (
                        <section className="space-y-4 border border-border-thin bg-surface-hover/20 p-4 rounded-xl animate-fade-in">
                            <div className="space-y-1.5">
                                <label className="section-label text-text-dim">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    value={metadata.nombre || ''}
                                    onChange={(e) => setMetadata({...metadata, nombre: e.target.value})}
                                    className="input-vercel"
                                    placeholder="Nombres y Apellidos"
                                    disabled={user.type !== 'EXTERNO'}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="section-label text-text-dim">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    value={metadata.email || ''}
                                    onChange={(e) => setMetadata({...metadata, email: e.target.value})}
                                    className="input-vercel"
                                    placeholder="correo@ejemplo.com"
                                    disabled={user.type !== 'EXTERNO'}
                                />
                            </div>
                        </section>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={handleCloseModal} className="btn-vercel-secondary">Cancelar</button>
                    {user.type === 'EXTERNO' && (
                        <button 
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="btn-vercel-primary flex items-center gap-2"
                        >
                            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;