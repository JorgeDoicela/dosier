import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { emailService } from '../../../../services/emailService';
import type {
    AudiencePreviewResult,
    Carrera,
    EmailEngineScope,
    PeriodoAcademicoItem
} from '../emailEngineTypes';
import { ROLE_OPTIONS } from './RecipientPicker';

const PEA_ESTADO_OPTIONS = [
    { value: '', label: 'Cualquier estado de PEA' },
    { value: 'Borrador', label: 'PEA en Borrador' },
    { value: 'Observado', label: 'PEA Observado (Subsanación)' },
    { value: 'EnRevision', label: 'PEA En Revisión' },
    { value: 'RevisadoCoord', label: 'PEA con Aval de Carrera' },
    { value: 'RevisadoAcad', label: 'PEA con Aval Académico' },
    { value: 'Aprobado', label: 'PEA Aprobado Oficialmente' }
];

export interface EmailGroupSelectorProps {
    scope: EmailEngineScope;
    carreras: Carrera[];
    periodos: PeriodoAcademicoItem[];
    broadcastRole: string;
    onBroadcastRole: (role: string) => void;
    selectedCarreraIds: number[];
    onSelectedCarreraIds: React.Dispatch<React.SetStateAction<number[]>>;
    selectedModalidadIds: number[];
    onSelectedModalidadIds: React.Dispatch<React.SetStateAction<number[]>>;
    selectedPeaEstado: string;
    onSelectedPeaEstado: (estado: string) => void;
    selectedPeriodoFiltro: string;
    onSelectedPeriodoFiltro: (periodoId: string) => void;
}

export const EmailGroupSelector: React.FC<EmailGroupSelectorProps> = ({
    scope,
    carreras,
    periodos,
    broadcastRole,
    onBroadcastRole,
    selectedCarreraIds,
    onSelectedCarreraIds,
    selectedModalidadIds,
    onSelectedModalidadIds,
    selectedPeaEstado,
    onSelectedPeaEstado,
    selectedPeriodoFiltro,
    onSelectedPeriodoFiltro
}) => {
    const [preview, setPreview] = useState<AudiencePreviewResult | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [showSample, setShowSample] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const allowedRoleOptions = useMemo(
        () => ROLE_OPTIONS.filter(r => scope.isGlobalScope || scope.allowedBroadcastRoles.includes(r.value)),
        [scope.isGlobalScope, scope.allowedBroadcastRoles]
    );

    // Carreras visibles: si se eligió una o más modalidades, destacar/filtrar las que pertenecen a esas modalidades
    const visibleCarreras = useMemo(() => {
        if (selectedModalidadIds.length === 0) return carreras;
        const allowedByMod = new Set<number>();
        scope.availableModalidades
            .filter(m => selectedModalidadIds.includes(m.idModalidad))
            .forEach(m => m.carreraIds.forEach(cid => allowedByMod.add(cid)));
        if (allowedByMod.size === 0) return carreras;
        return carreras.filter(c => allowedByMod.has(c.idCarrera));
    }, [carreras, selectedModalidadIds, scope.availableModalidades]);

    const hasAnyGroupCriteria = Boolean(
        broadcastRole ||
        selectedCarreraIds.length > 0 ||
        selectedModalidadIds.length > 0 ||
        selectedPeaEstado
    );

    // Previsualización en vivo del conteo de destinatarios
    useEffect(() => {
        clearTimeout(debounceRef.current);

        if (!hasAnyGroupCriteria) {
            setPreview(null);
            setPreviewError(null);
            setLoadingPreview(false);
            return;
        }

        setLoadingPreview(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await emailService.previewAudience({
                    target_role: broadcastRole || null,
                    target_carrera_ids: selectedCarreraIds,
                    target_modalidad_ids: selectedModalidadIds,
                    target_pea_estado: selectedPeaEstado || null,
                    target_periodo_id: selectedPeriodoFiltro || null
                });
                const total = res.total_recipients ?? res.totalRecipients ?? 0;
                const sample = (res.sample ?? []).map(s => ({
                    idUsuario: s.id_usuario ?? s.idUsuario ?? 0,
                    nombreCompleto: s.nombre_completo ?? s.nombreCompleto ?? 'Docente',
                    email: s.email
                }));
                setPreview({ totalRecipients: total, sample });
                setPreviewError(null);
            } catch (err: any) {
                setPreview(null);
                setPreviewError(err?.response?.data?.message || 'No se pudo calcular el alcance del grupo.');
            } finally {
                setLoadingPreview(false);
            }
        }, 260);

        return () => clearTimeout(debounceRef.current);
    }, [
        hasAnyGroupCriteria,
        broadcastRole,
        selectedCarreraIds,
        selectedModalidadIds,
        selectedPeaEstado,
        selectedPeriodoFiltro
    ]);

    const toggleModalidad = (idModalidad: number) => {
        onSelectedModalidadIds(prev => {
            const next = prev.includes(idModalidad)
                ? prev.filter(id => id !== idModalidad)
                : [...prev, idModalidad];

            // Limpiar carreras seleccionadas que ya no pertenezcan a las modalidades activas
            if (next.length > 0) {
                const validCarreras = new Set<number>();
                scope.availableModalidades
                    .filter(m => next.includes(m.idModalidad))
                    .forEach(m => m.carreraIds.forEach(cid => validCarreras.add(cid)));
                onSelectedCarreraIds(curr => curr.filter(cid => validCarreras.has(cid)));
            }
            return next;
        });
    };

    const toggleCarrera = (idCarrera: number) => {
        onSelectedCarreraIds(prev =>
            prev.includes(idCarrera) ? prev.filter(id => id !== idCarrera) : [...prev, idCarrera]
        );
    };

    const applyPreset = (preset: {
        role?: string;
        modalidadIds?: number[];
        carreraIds?: number[];
        peaEstado?: string;
    }) => {
        onBroadcastRole(preset.role ?? (scope.isGlobalScope ? '' : 'DOSIER_DOCENTE'));
        onSelectedModalidadIds(preset.modalidadIds ?? []);
        onSelectedCarreraIds(preset.carreraIds ?? (scope.isGlobalScope ? [] : scope.allowedCarreraIds));
        onSelectedPeaEstado(preset.peaEstado ?? '');
        onSelectedPeriodoFiltro('');
    };

    const clearGroupFilters = () => {
        onBroadcastRole(scope.isGlobalScope ? '' : 'DOSIER_DOCENTE');
        onSelectedModalidadIds([]);
        onSelectedCarreraIds([]);
        onSelectedPeaEstado('');
        onSelectedPeriodoFiltro('');
    };

    return (
        <div className="space-y-4">
            {/* Atajos rápidos de grupos */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                        Grupos rápidos
                    </span>
                    {hasAnyGroupCriteria && (
                        <button
                            type="button"
                            onClick={clearGroupFilters}
                            className="text-[11px] font-medium text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                            Limpiar criterios
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
                    {scope.availableModalidades.map(mod => {
                        const isActive =
                            selectedModalidadIds.length === 1 &&
                            selectedModalidadIds[0] === mod.idModalidad &&
                            selectedCarreraIds.length === 0 &&
                            !selectedPeaEstado;
                        return (
                            <button
                                key={mod.idModalidad}
                                type="button"
                                onClick={() =>
                                    applyPreset({
                                        role: 'DOSIER_DOCENTE',
                                        modalidadIds: [mod.idModalidad],
                                        carreraIds: []
                                    })
                                }
                                className={`text-xs transition-colors cursor-pointer underline-offset-4 ${
                                    isActive
                                        ? 'text-[#0070f3] dark:text-blue-400 font-semibold underline'
                                        : 'text-slate-600 dark:text-zinc-300 hover:text-[#0070f3] font-medium'
                                }`}
                            >
                                Carreras {mod.nombre}
                            </button>
                        );
                    })}
                    {scope.isGlobalScope && (
                        <button
                            type="button"
                            onClick={() => applyPreset({ role: 'DOSIER_COORD_CARRERA' })}
                            className={`text-xs transition-colors cursor-pointer underline-offset-4 ${
                                broadcastRole === 'DOSIER_COORD_CARRERA' && selectedModalidadIds.length === 0 && selectedCarreraIds.length === 0
                                    ? 'text-[#0070f3] dark:text-blue-400 font-semibold underline'
                                    : 'text-slate-600 dark:text-zinc-300 hover:text-[#0070f3] font-medium'
                            }`}
                        >
                            Coordinadores de Carrera
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => applyPreset({ role: 'DOSIER_DOCENTE', peaEstado: 'Observado' })}
                        className={`text-xs transition-colors cursor-pointer underline-offset-4 ${
                            selectedPeaEstado === 'Observado'
                                ? 'text-[#0070f3] dark:text-blue-400 font-semibold underline'
                                : 'text-slate-600 dark:text-zinc-300 hover:text-[#0070f3] font-medium'
                        }`}
                    >
                        Docentes con PEA Observado
                    </button>
                    {!scope.isGlobalScope && scope.allowedCarreraIds.length > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                applyPreset({
                                    role: 'DOSIER_DOCENTE',
                                    carreraIds: scope.allowedCarreraIds
                                })
                            }
                            className="text-xs text-slate-600 dark:text-zinc-300 hover:text-[#0070f3] font-medium transition-colors cursor-pointer"
                        >
                            Todos los docentes de mi carrera
                        </button>
                    )}
                </div>
            </div>

            {/* 1. Modalidad de estudio (multi-selección) */}
            {scope.availableModalidades.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border-thin">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                            Modalidad de estudio
                        </label>
                        {selectedModalidadIds.length > 0 && (
                            <span className="text-[11px] font-mono text-[#0070f3]">
                                {selectedModalidadIds.length} seleccionada{selectedModalidadIds.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {scope.availableModalidades.map(mod => {
                            const checked = selectedModalidadIds.includes(mod.idModalidad);
                            return (
                                <label
                                    key={mod.idModalidad}
                                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                        checked
                                            ? 'border-[#0070f3] bg-white dark:bg-zinc-900 text-text-main font-semibold'
                                            : 'border-border-thin bg-white dark:bg-zinc-950 text-text-dim hover:text-text-main'
                                    }`}
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleModalidad(mod.idModalidad)}
                                            className="rounded border-border-thin text-[#0070f3] focus:ring-[#0070f3] cursor-pointer"
                                        />
                                        <span className="truncate">{mod.nombre}</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-text-dim shrink-0">
                                        {mod.carreraIds.length} {mod.carreraIds.length === 1 ? 'carrera' : 'carreras'}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Carreras (multi-selección) */}
            <div className="space-y-2 pt-2 border-t border-border-thin">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                        Carreras {selectedModalidadIds.length > 0 ? '(filtradas por modalidad)' : ''}
                    </label>
                    <div className="flex items-center gap-3 text-[11px]">
                        <button
                            type="button"
                            onClick={() => onSelectedCarreraIds(visibleCarreras.map(c => c.idCarrera))}
                            className="text-slate-600 dark:text-zinc-300 hover:text-[#0070f3] font-medium cursor-pointer"
                        >
                            Seleccionar todas
                        </button>
                        {selectedCarreraIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onSelectedCarreraIds([])}
                                className="text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
                            >
                                Ninguna
                            </button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {visibleCarreras.map(c => {
                        const checked = selectedCarreraIds.includes(c.idCarrera);
                        return (
                            <label
                                key={c.idCarrera}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                                    checked
                                        ? 'border-[#0070f3] bg-white dark:bg-zinc-900 text-text-main font-medium'
                                        : 'border-border-thin bg-white dark:bg-zinc-950 text-text-dim hover:text-text-main'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleCarrera(c.idCarrera)}
                                    className="rounded border-border-thin text-[#0070f3] focus:ring-[#0070f3] shrink-0 cursor-pointer"
                                />
                                <span className="truncate" title={c.carrera1}>
                                    {c.carrera1}
                                </span>
                            </label>
                        );
                    })}
                    {visibleCarreras.length === 0 && (
                        <p className="text-xs text-text-dim col-span-2 py-2">
                            No hay carreras disponibles para las modalidades seleccionadas.
                        </p>
                    )}
                </div>
            </div>

            {/* 3. Rol y Estado de PEA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-thin">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                        Rol destinatario
                    </label>
                    <select
                        className="input-vercel !py-2 text-xs"
                        value={broadcastRole}
                        onChange={e => onBroadcastRole(e.target.value)}
                    >
                        {scope.isGlobalScope && <option value="">Todos los roles del grupo</option>}
                        {allowedRoleOptions.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                        Estado de PEA (opcional)
                    </label>
                    <select
                        className="input-vercel !py-2 text-xs"
                        value={selectedPeaEstado}
                        onChange={e => {
                            onSelectedPeaEstado(e.target.value);
                            if (!e.target.value) onSelectedPeriodoFiltro('');
                        }}
                    >
                        {PEA_ESTADO_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Período para el filtro de Estado de PEA */}
            {selectedPeaEstado && periodos.length > 0 && (
                <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                        Período académico del PEA (opcional)
                    </label>
                    <select
                        className="input-vercel !py-2 text-xs"
                        value={selectedPeriodoFiltro}
                        onChange={e => onSelectedPeriodoFiltro(e.target.value)}
                    >
                        <option value="">Todos los períodos</option>
                        {periodos.map(p => (
                            <option key={p.idPeriodo} value={p.idPeriodo}>
                                [{p.idPeriodo}] {p.detalle}{p.activo ? ' (Activo)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* 4. Previsualización en vivo de la audiencia */}
            {hasAnyGroupCriteria && (
                <div className="rounded-lg border border-border-thin bg-white dark:bg-zinc-950 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                            {loadingPreview ? (
                                <>
                                    <Loader2 size={13} className="animate-spin text-[#0070f3]" />
                                    <span className="text-text-dim">Calculando destinatarios del grupo...</span>
                                </>
                            ) : previewError ? (
                                <span className="text-rose-600 dark:text-rose-400 font-medium">{previewError}</span>
                            ) : preview ? (
                                <>
                                    <span
                                        className={`w-2 h-2 rounded-full shrink-0 ${
                                            preview.totalRecipients > 0 ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`}
                                    />
                                    <span className="font-semibold text-text-main">
                                        {preview.totalRecipients}{' '}
                                        {preview.totalRecipients === 1 ? 'destinatario' : 'destinatarios'}
                                    </span>
                                    <span className="text-text-dim">recibirán este correo</span>
                                </>
                            ) : null}
                        </div>

                        {preview && preview.sample.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowSample(v => !v)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0070f3] hover:underline cursor-pointer"
                            >
                                {showSample ? 'Ocultar lista' : 'Ver muestra'}
                                {showSample ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                        )}
                    </div>

                    {showSample && preview && preview.sample.length > 0 && (
                        <div className="pt-2 border-t border-border-thin divide-y divide-border-thin">
                            {preview.sample.map((person, idx) => (
                                <div key={`${person.email}-${idx}`} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                                    <span className="font-medium text-text-main truncate">{person.nombreCompleto}</span>
                                    <span className="font-mono text-[11px] text-text-dim truncate">{person.email}</span>
                                </div>
                            ))}
                            {preview.totalRecipients > preview.sample.length && (
                                <div className="pt-1.5 text-[11px] text-text-dim">
                                    y {preview.totalRecipients - preview.sample.length} destinatario(s) adicionales...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmailGroupSelector;
