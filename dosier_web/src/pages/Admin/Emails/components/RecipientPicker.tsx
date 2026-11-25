import React, { useState, useEffect, useCallback, useRef } from 'react';
import { emailService } from '../../../../services/emailService';
import { Users, CheckCircle2, Loader2, Search, ChevronDown, X } from 'lucide-react';
import type { Carrera, EmailEngineScope, PeriodoAcademicoItem } from '../emailEngineTypes';
import EmailGroupSelector from './EmailGroupSelector';

export interface SelectedPerson {
    idUsuario?: number;
    nombre: string;
    email: string;
    tipo: string;
    carrera?: string;
}

export const USER_TYPES = [
    { value: 'DOCENTE', label: 'Docente' },
    { value: 'ADMINISTRATIVO', label: 'Autoridades y Personal Administrativo' }
];

export const ROLE_OPTIONS = [
    { value: 'DOSIER_DOCENTE', label: 'Docentes' },
    { value: 'DOSIER_COORD_CARRERA', label: 'Coordinadores de Carrera' },
    { value: 'DOSIER_COORD_ACAD', label: 'Coordinación Académica' },
    { value: 'DOSIER_VICERRECTOR', label: 'Vicerrectorado Académico' },
    { value: 'DOSIER_ADMIN', label: 'Administradores DOSIER' }
];

export const TYPE_BADGE: Record<string, string> = {
    DOCENTE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    ADMINISTRATIVO: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    ESTUDIANTE: 'bg-green-500/10 text-green-600 dark:text-green-400'
};

export interface RecipientPickerProps {
    scope: EmailEngineScope;
    carreras: Carrera[];
    periodos: PeriodoAcademicoItem[];
    selected: SelectedPerson[];
    onSelected: (people: SelectedPerson[]) => void;
    broadcastRole: string;
    onBroadcastRole: (role: string) => void;
    broadcastCarreraId: string;
    onBroadcastCarreraId: (id: string) => void;
    selectedCarreraIds: number[];
    onSelectedCarreraIds: React.Dispatch<React.SetStateAction<number[]>>;
    selectedModalidadIds: number[];
    onSelectedModalidadIds: React.Dispatch<React.SetStateAction<number[]>>;
    selectedPeaEstado: string;
    onSelectedPeaEstado: (estado: string) => void;
    selectedPeriodoFiltro: string;
    onSelectedPeriodoFiltro: (periodoId: string) => void;
}

const mapApiUserToPerson = (u: Record<string, unknown>): SelectedPerson => ({
    idUsuario: (u.id_usuario ?? u.idUsuario) as number | undefined,
    nombre: String(u.nombre_completo ?? u.nombreCompleto ?? u.nombre ?? 'Sin nombre').trim(),
    email: String(u.email ?? u.email_institucional ?? '').trim(),
    tipo: String(u.type ?? u.tipo ?? 'DOCENTE'),
    carrera: String(u.departamento ?? u.carrera ?? u.cargo_instituto ?? '').trim()
});

const personKey = (p: SelectedPerson) =>
    p.idUsuario
        ? `usr-${p.idUsuario}-${p.tipo}`
        : `name-${p.nombre.toLowerCase().replace(/\s+/g, '-')}-${p.tipo}`;

/** Puede enviarse si tiene correo visible o cuenta DOSIER (idUsuario). */
const canSelectPerson = (p: SelectedPerson) =>
    Boolean(p.email?.includes('@')) || (p.idUsuario != null && p.idUsuario > 0);

export const RecipientPicker: React.FC<RecipientPickerProps> = ({
    scope, carreras, periodos, selected, onSelected,
    broadcastRole, onBroadcastRole,
    broadcastCarreraId, onBroadcastCarreraId,
    selectedCarreraIds, onSelectedCarreraIds,
    selectedModalidadIds, onSelectedModalidadIds,
    selectedPeaEstado, onSelectedPeaEstado,
    selectedPeriodoFiltro, onSelectedPeriodoFiltro
}) => {
    const [mode, setMode] = useState<'personas' | 'difusion'>('personas');
    const [query, setQuery] = useState('');
    const [filterType, setFilterType] = useState('DOCENTE');
    const [filterCarreraId, setFilterCarreraId] = useState('');
    const [results, setResults] = useState<SelectedPerson[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const allowedRoleOptions = ROLE_OPTIONS.filter(r =>
        scope.isGlobalScope || scope.allowedBroadcastRoles.includes(r.value)
    );

    const availableUserTypes = scope.isGlobalScope
        ? USER_TYPES
        : USER_TYPES.filter(t => t.value === 'DOCENTE');

    // Si es Coordinador de Carrera y activa grupos, preseleccionar rol Docente y carrera única automáticamente
    useEffect(() => {
        if (!scope.isGlobalScope && mode === 'difusion') {
            if (!broadcastRole && allowedRoleOptions.length > 0) {
                onBroadcastRole(allowedRoleOptions[0].value);
            }
            if (carreras.length === 1 && selectedCarreraIds.length === 0) {
                onSelectedCarreraIds([carreras[0].idCarrera]);
            }
        }
    }, [scope.isGlobalScope, mode, carreras, selectedCarreraIds.length, onSelectedCarreraIds, broadcastRole, onBroadcastRole, allowedRoleOptions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchUsers = useCallback(async (q: string, type: string, carreraId: string) => {
        setSearching(true);
        setSearchError(null);
        try {
            const raw = await emailService.searchRecipients({
                search: q.trim() || undefined,
                type: type || undefined,
                carreraId: carreraId || undefined,
                limit: 50
            });
            const mapped = (Array.isArray(raw) ? raw : []).map((u) =>
                mapApiUserToPerson(u as unknown as Record<string, unknown>)
            );
            mapped.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
            setResults(mapped);
        } catch {
            setResults([]);
            setSearchError('No se pudo cargar la nómina de destinatarios.');
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(
            () => searchUsers(query, filterType, filterCarreraId),
            query.trim() ? 280 : 80
        );
        return () => clearTimeout(debounceRef.current);
    }, [query, filterType, filterCarreraId, searchUsers]);

    const add = (p: SelectedPerson) => {
        if (!canSelectPerson(p)) return;
        const key = personKey(p);
        if (!selected.some(s => personKey(s) === key)) {
            onSelected([...selected, p]);
        }
    };

    const remove = (p: SelectedPerson) => {
        const targetKey = personKey(p);
        onSelected(selected.filter(s => personKey(s) !== targetKey));
    };

    const hasGroupSelection = Boolean(
        broadcastRole ||
        broadcastCarreraId ||
        selectedCarreraIds.length > 0 ||
        selectedModalidadIds.length > 0 ||
        selectedPeaEstado
    );

    const totalDestinatarios =
        selected.length > 0
            ? `${selected.length} persona${selected.length > 1 ? 's' : ''}`
            : hasGroupSelection
                ? 'grupo segmentado'
                : 'ninguno';

    return (
        <div className="space-y-3 p-4 bg-surface rounded-xl border border-border-thin shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-text-main uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={12} className="text-brand" /> Destinatarios
                </span>
                <span className="text-[9px] text-text-dim">
                    {totalDestinatarios}
                </span>
            </div>

            {/* Mode tabs — Riel plano Modern Enterprise Docs */}
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" aria-label="Modo de selección de destinatarios">
                    {(['personas', 'difusion'] as const).map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className={`pb-2 pt-0.5 px-0.5 text-xs transition-colors cursor-pointer border-b-2 whitespace-nowrap ${mode === m
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                                }`}
                        >
                            {m === 'personas' ? 'Personas específicas' : 'Grupos y segmentación'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ── MODO PERSONAS ── */}
            {mode === 'personas' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[8px] font-semibold text-text-dim uppercase tracking-wider">Tipo</label>
                            <select
                                className="input-vercel !py-1.5 text-xs w-full"
                                value={filterType}
                                onChange={e => {
                                    setFilterType(e.target.value);
                                    setIsOpen(true);
                                }}
                            >
                                {scope.isGlobalScope && <option value="">Todos los tipos</option>}
                                {availableUserTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-semibold text-text-dim uppercase tracking-wider">Carrera</label>
                            <select
                                className="input-vercel !py-1.5 text-xs w-full"
                                value={filterCarreraId}
                                onChange={e => {
                                    setFilterCarreraId(e.target.value);
                                    setIsOpen(true);
                                }}
                            >
                                <option value="">Todas</option>
                                {carreras.map(c => (
                                    <option key={c.idCarrera} value={c.idCarrera.toString()}>{c.carrera1}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Buscador y Selector 2-en-1 */}
                    <div className="space-y-1 relative" ref={containerRef}>
                        <label className="text-[8px] font-semibold text-text-dim uppercase tracking-wider">
                            Buscar y seleccionar persona
                        </label>
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim" />
                            <input
                                type="text"
                                className="input-vercel !pl-7 !pr-8 !py-2 text-xs w-full cursor-text font-sans"
                                placeholder={searching ? "Cargando..." : "Escriba nombre o correo para buscar..."}
                                value={query}
                                onFocus={() => setIsOpen(true)}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setIsOpen(true);
                                }}
                            />
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {searching && (
                                    <Loader2 size={11} className="text-text-dim animate-spin" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="text-text-dim hover:text-text-main transition-colors cursor-pointer focus:outline-none"
                                >
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Dropdown flotante 2 en 1 (Fondo 100% sólido) */}
                        {isOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-950 border border-border-thin rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-border-thin animate-fade-in">
                                {searchError && (
                                    <div className="p-3 text-[10px] text-error text-center">{searchError}</div>
                                )}
                                {!searchError && results.length === 0 ? (
                                    <div className="p-3 text-[10px] text-text-dim text-center italic">
                                        {searching ? "Buscando..." : "No se encontraron personas con esos filtros"}
                                    </div>
                                ) : (
                                    results.map(p => {
                                        const key = personKey(p);
                                        const alreadyAdded = selected.some(s => personKey(s) === key);
                                        const selectable = canSelectPerson(p);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                disabled={alreadyAdded || !selectable}
                                                onClick={() => {
                                                    add(p);
                                                    setIsOpen(false);
                                                    setQuery(''); // Limpia el buscador para la siguiente selección
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${alreadyAdded || !selectable
                                                    ? 'opacity-45 cursor-not-allowed'
                                                    : 'hover:bg-brand/5'
                                                    }`}
                                            >
                                                <div className="w-6 h-6 rounded-full bg-brand/15 flex items-center justify-center text-[9px] font-semibold text-brand shrink-0">
                                                    {p.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-semibold text-text-main truncate">{p.nombre}</div>
                                                    <div className="text-[9px] text-text-dim font-mono truncate">
                                                        {p.email || (p.idUsuario ? 'Correo desde cuenta DOSIER' : 'Sin correo registrado')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-text-dim font-mono">
                                                        {USER_TYPES.find(t => t.value === p.tipo)?.label ?? p.tipo}
                                                    </span>
                                                    {alreadyAdded && <CheckCircle2 size={13} className="text-emerald-500" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chips de personas seleccionadas */}
                    {selected.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {selected.map(p => (
                                <div
                                    key={personKey(p)}
                                    className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-200/90 dark:border-zinc-800 bg-surface text-xs max-w-full"
                                    title={p.email || 'Correo desde cuenta DOSIER'}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] shrink-0" />
                                    <span className="font-medium text-text-main truncate max-w-[130px]">{p.nombre}</span>
                                    <span className="text-[10px] text-text-dim font-mono truncate hidden sm:block max-w-[120px]">
                                        {p.email}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => remove(p)}
                                        className="text-text-dim hover:text-rose-500 transition-colors ml-0.5 cursor-pointer shrink-0"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => onSelected([])}
                                className="text-[8px] text-text-dim hover:text-error transition-colors px-1 cursor-pointer"
                            >
                                Limpiar todo
                            </button>
                        </div>
                    )}

                </div>
            )}

            {/* ── MODO GRUPOS Y SEGMENTACIÓN ── */}
            {mode === 'difusion' && (
                <EmailGroupSelector
                    scope={scope}
                    carreras={carreras}
                    periodos={periodos}
                    broadcastRole={broadcastRole}
                    onBroadcastRole={onBroadcastRole}
                    selectedCarreraIds={selectedCarreraIds}
                    onSelectedCarreraIds={onSelectedCarreraIds}
                    selectedModalidadIds={selectedModalidadIds}
                    onSelectedModalidadIds={onSelectedModalidadIds}
                    selectedPeaEstado={selectedPeaEstado}
                    onSelectedPeaEstado={onSelectedPeaEstado}
                    selectedPeriodoFiltro={selectedPeriodoFiltro}
                    onSelectedPeriodoFiltro={onSelectedPeriodoFiltro}
                />
            )}
        </div>
    );
};

export default RecipientPicker;
