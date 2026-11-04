import React, { useState, useEffect } from 'react';
import { GeistSelect } from '../../../Common/GeistSelect';
import {
    Key,
    X,
    Check,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import {
    getPeaAiConfig,
    savePeaAiConfig,
    type PeaAiConfigStatus,
    type PeaAiProvider
} from '../../../../services/peaAiService';
import { useNotifications } from '../../../../api/NotificationsContext';

export interface PeaAiAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    peaUuid?: string;
    formData?: any;
    initialTargetSection?: string;
    initialCustomInstructions?: string;
    autoGenerateOnOpen?: boolean;
    initialTab?: 'generate' | 'config';
    isAdmin?: boolean;
    onApplyDraft?: (patch: Record<string, any>) => void;
    onConfigSaved?: () => void;
}

const PROVIDER_PRESETS: Record<PeaAiProvider, {
    label: string;
    defaultBaseUrl: string;
    defaultModel: string;
    models: string[];
    keyPlaceholder: string;
    keyDocs: string;
}> = {
    deepseek: {
        label: 'DeepSeek (Recomendado)',
        defaultBaseUrl: 'https://api.deepseek.com/chat/completions',
        defaultModel: 'deepseek-chat',
        models: ['deepseek-chat', 'deepseek-reasoner'],
        keyPlaceholder: 'sk-...',
        keyDocs: 'DeepSeek Platform'
    },
    gemini: {
        label: 'Google Gemini',
        defaultBaseUrl: 'https://generativelanguage.googleapis.com',
        defaultModel: 'gemini-2.5-flash',
        models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
        keyPlaceholder: 'AIzaSy...',
        keyDocs: 'Google AI Studio'
    },
    openai: {
        label: 'OpenAI (ChatGPT)',
        defaultBaseUrl: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini',
        models: ['gpt-4o-mini', 'gpt-4o', 'o3-mini'],
        keyPlaceholder: 'sk-proj-...',
        keyDocs: 'OpenAI Platform'
    },
    anthropic: {
        label: 'Anthropic Claude',
        defaultBaseUrl: 'https://api.anthropic.com/v1/messages',
        defaultModel: 'claude-3-5-sonnet-latest',
        models: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
        keyPlaceholder: 'sk-ant-...',
        keyDocs: 'Anthropic Console'
    },
    openrouter: {
        label: 'OpenRouter (Multi-modelo)',
        defaultBaseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        defaultModel: 'deepseek/deepseek-chat',
        models: [
            'deepseek/deepseek-chat',
            'anthropic/claude-3.5-sonnet',
            'meta-llama/llama-3.3-70b-instruct',
            'google/gemini-2.0-flash-001',
            'mistralai/mistral-large-2411',
            'qwen/qwen-2.5-coder-32b-instruct'
        ],
        keyPlaceholder: 'sk-or-v1-...',
        keyDocs: 'OpenRouter Platform'
    },
    groq: {
        label: 'Groq Cloud',
        defaultBaseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'llama-3.3-70b-versatile',
        models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
        keyPlaceholder: 'gsk_...',
        keyDocs: 'Groq Console'
    },
    ollama: {
        label: 'Ollama (Servidor Local)',
        defaultBaseUrl: 'http://localhost:11434/v1/chat/completions',
        defaultModel: 'llama3',
        models: ['llama3', 'qwen2.5', 'deepseek-r1', 'mistral'],
        keyPlaceholder: 'Opcional en servidor local',
        keyDocs: 'Servidor Local Ollama'
    },
    custom: {
        label: 'Servidor Personalizado (OpenAI-compatible)',
        defaultBaseUrl: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'custom-model',
        models: [],
        keyPlaceholder: 'sk-... (opcional si no requiere autenticación)',
        keyDocs: 'Servidor / Proxy compatible'
    }
};

export const PeaAiAssistantModal: React.FC<PeaAiAssistantModalProps> = ({
    isOpen,
    onClose,
    isAdmin = false,
    onConfigSaved
}) => {
    const { addToast } = useNotifications();
    const [, setLoadingConfig] = useState(false);
    const [configStatus, setConfigStatus] = useState<PeaAiConfigStatus | null>(null);

    // Estado de Configuración de Proveedor y Credenciales
    const [provider, setProvider] = useState<PeaAiProvider>('deepseek');
    const [model, setModel] = useState<string>('deepseek-chat');
    const [baseUrl, setBaseUrl] = useState<string>('https://api.deepseek.com/chat/completions');
    const [isCustomModelInput, setIsCustomModelInput] = useState<boolean>(false);
    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [scope, setScope] = useState<'user' | 'global'>('user');
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const initConfig = async () => {
            setLoadingConfig(true);
            try {
                const status = await getPeaAiConfig();
                setConfigStatus(status);
                setProvider(status.activeProvider);
                setModel(status.activeModel);
                const resolvedBaseUrl = status.activeBaseUrl || PROVIDER_PRESETS[status.activeProvider]?.defaultBaseUrl || 'https://api.deepseek.com/chat/completions';
                setBaseUrl(resolvedBaseUrl);
                const presetModels = PROVIDER_PRESETS[status.activeProvider]?.models || [];
                if (!presetModels.includes(status.activeModel) && status.activeModel) {
                    setIsCustomModelInput(true);
                }
            } catch (err) {
                console.error('[DOSIER AI] Error cargando configuración:', err);
            } finally {
                setLoadingConfig(false);
            }
        };

        initConfig();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleProviderChange = (newProv: PeaAiProvider) => {
        setProvider(newProv);
        const preset = PROVIDER_PRESETS[newProv];
        if (preset) {
            setBaseUrl(preset.defaultBaseUrl);
            setModel(preset.defaultModel);
            setIsCustomModelInput(newProv === 'custom');
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingConfig(true);
        try {
            const status = await savePeaAiConfig({
                provider,
                model,
                baseUrl,
                apiKey: apiKeyInput.trim() ? apiKeyInput.trim() : undefined,
                scope: isAdmin ? scope : 'user'
            });
            setConfigStatus(status);
            setApiKeyInput('');
            addToast(
                'Configuración Guardada',
                'El proveedor y la credencial de IA se han almacenado de forma cifrada.',
                'success'
            );
            onConfigSaved?.();
            onClose();
        } catch (err: any) {
            addToast(
                'Error al guardar configuración',
                err?.response?.data?.message || err?.message || 'No se pudo guardar la configuración del proveedor.',
                'error'
            );
        } finally {
            setSavingConfig(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Cabecera Sólida Profesional */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Key size={18} className="text-[#0070f3] shrink-0" />
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                Configuración del Proveedor de IA
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                Credenciales y modelo de lenguaje para la formulación curricular
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                        aria-label="Cerrar"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Formulario de Configuración */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-white dark:bg-zinc-950">
                    <form onSubmit={handleSaveConfig} className="space-y-5">
                        {/* Estado del Servicio */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                            <div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                    Estado del servicio
                                </span>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                    {configStatus?.isReady
                                        ? 'El motor de IA se encuentra listo para generar propuestas.'
                                        : 'Ingrese su clave de acceso para activar el motor de IA.'}
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 shrink-0">
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        configStatus?.isReady ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                />
                                {configStatus?.isReady ? 'Activo' : 'Sin configurar'}
                            </span>
                        </div>

                        {/* Proveedor y Configuración */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Proveedor de Inteligencia Artificial
                                </label>
                                <GeistSelect
                                    value={provider}
                                    onChange={val => handleProviderChange(val as PeaAiProvider)}
                                    className="w-full text-xs font-medium"
                                    options={Object.entries(PROVIDER_PRESETS).map(([k, p]) => ({
                                        value: k,
                                        label: p.label
                                    }))}
                                />
                            </div>

                            {/* Dirección del servicio (solo para servidor personalizado o local) */}
                            {(provider === 'custom' || provider === 'ollama') && (
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        Dirección del servidor (URL)
                                    </label>
                                    <input
                                        type="text"
                                        value={baseUrl}
                                        onChange={e => setBaseUrl(e.target.value)}
                                        placeholder="http://localhost:11434/v1/chat/completions"
                                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                    />
                                </div>
                            )}

                            {/* Modelo */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        Modelo de lenguaje
                                    </label>
                                    {PROVIDER_PRESETS[provider]?.models.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomModelInput(prev => !prev)}
                                            className="text-[11px] text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer"
                                        >
                                            {isCustomModelInput ? 'Seleccionar de la lista' : 'Ingresar modelo manual'}
                                        </button>
                                    )}
                                </div>

                                {isCustomModelInput || PROVIDER_PRESETS[provider]?.models.length === 0 ? (
                                    <input
                                        type="text"
                                        value={model}
                                        onChange={e => setModel(e.target.value)}
                                        placeholder="Ej. deepseek-chat, claude-3-5-sonnet-20241022, gpt-4o, etc."
                                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                    />
                                ) : (
                                    <GeistSelect
                                        value={model}
                                        onChange={val => setModel(String(val))}
                                        className="w-full text-xs font-medium"
                                        options={PROVIDER_PRESETS[provider]?.models.map(m => ({
                                            value: m,
                                            label: m
                                        })) || []}
                                    />
                                )}
                            </div>

                            {/* API Key */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Clave de acceso (API Key)
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={apiKeyInput}
                                        onChange={e => setApiKeyInput(e.target.value)}
                                        placeholder={
                                            configStatus?.maskedApiKey
                                                ? '•••••••••••••••• (dejar en blanco para mantener)'
                                                : 'Pegue su clave de acceso aquí'
                                        }
                                        className="w-full pl-3 pr-10 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(prev => !prev)}
                                        className="absolute right-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                                        aria-label="Mostrar u ocultar clave"
                                    >
                                        {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Alcance de credencial (solo para administradores) */}
                            {isAdmin && (
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        Alcance de la configuración
                                    </label>
                                    <GeistSelect
                                        value={scope}
                                        onChange={val => setScope(val as 'user' | 'global')}
                                        className="w-full text-xs font-medium"
                                        options={[
                                            { value: 'user', label: 'Personal (Solo para mi cuenta de usuario)' },
                                            { value: 'global', label: 'Institucional (Aplica como configuración global para todos los docentes)' }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={savingConfig}
                                className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                                {savingConfig ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                <span>Guardar configuración</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
