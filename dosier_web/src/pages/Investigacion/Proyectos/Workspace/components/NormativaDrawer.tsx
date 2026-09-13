import React, { useState, useEffect, useMemo } from 'react';
import {
    Scale,
    X,
    Search,
    BookOpen,
    CheckCircle2,
    Shield,
    ExternalLink,
    FileText,
    Award,
    ChevronDown,
    ChevronUp,
    RefreshCw
} from 'lucide-react';
import {
    getNormativas,
    getChecklistCurricular,
    getModeloEducativo
} from '../../../../../services/normativaService';
import type {
    NormativaDto,
    NormativaArticuloDto,
    ModeloEducativoDto
} from '../../../../../services/normativaService';

interface NormativaDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NormativaDrawer: React.FC<NormativaDrawerProps> = ({ isOpen, onClose }) => {
    const [normativas, setNormativas] = useState<NormativaDto[]>([]);
    const [checklist, setChecklist] = useState<NormativaArticuloDto[]>([]);
    const [modeloEducativo, setModeloEducativo] = useState<ModeloEducativoDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrganismo, setSelectedOrganismo] = useState<'TODOS' | 'CES' | 'CACES' | 'MED'>('TODOS');
    const [expandedArticuloId, setExpandedArticuloId] = useState<number | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [normList, checkList, med] = await Promise.all([
                getNormativas(),
                getChecklistCurricular(),
                getModeloEducativo()
            ]);
            setNormativas(normList);
            setChecklist(checkList);
            setModeloEducativo(med);
        } catch (err) {
            console.error('[DOSIER] Error cargando normativas institucionales:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const filteredChecklist = useMemo(() => {
        return checklist.filter(art => {
            const matchesOrg =
                selectedOrganismo === 'TODOS' ||
                art.organismoEmisor.toUpperCase() === selectedOrganismo;
            const matchesQuery =
                !searchQuery.trim() ||
                art.numeroArticulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (art.titulo && art.titulo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                art.contenido.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (art.requisitoCurricular && art.requisitoCurricular.toLowerCase().includes(searchQuery.toLowerCase())) ||
                art.codigoResolucion.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesOrg && matchesQuery;
        });
    }, [checklist, selectedOrganismo, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay 100% sólido sin transparencias translúcidas ni blur */}
            <div
                className="fixed inset-0 bg-black/70 transition-opacity animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel lateral deslizable con fondo 100% sólido (blanco en claro, zinc-950 en oscuro) */}
            <div
                className="relative z-10 w-full max-w-xl bg-white dark:bg-zinc-950 border-l border-border-thin shadow-2xl flex flex-col h-full overflow-hidden animate-slide-left"
                role="dialog"
                aria-modal="true"
            >
                {/* Cabecera del Drawer */}
                <div className="p-5 border-b border-border-thin bg-surface flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                            <Scale size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-text-main tracking-tight">
                                    Marco Normativo y Acreditación
                                </h3>
                                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                                    ISTPET
                                </span>
                            </div>
                            <p className="text-xs text-text-dim mt-0.5">
                                Consulta inalterable de resoluciones CES, CACES y lineamientos PEA
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={loadData}
                            disabled={loading}
                            className="p-1.5 rounded-lg text-text-dim hover:text-text-main hover:bg-surface-hover transition-colors"
                            title="Recargar normativas"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-text-dim hover:text-text-main hover:bg-surface-hover transition-colors"
                            title="Cerrar panel"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="p-4 border-b border-border-thin bg-surface/50 space-y-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por artículo, resolución o palabra clave..."
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-surface border border-border-thin text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <button
                            type="button"
                            onClick={() => setSelectedOrganismo('TODOS')}
                            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                                selectedOrganismo === 'TODOS'
                                    ? 'bg-brand text-white'
                                    : 'bg-surface text-text-dim hover:text-text-main border border-border-thin'
                            }`}
                        >
                            Todos ({checklist.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedOrganismo('CES')}
                            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                                selectedOrganismo === 'CES'
                                    ? 'bg-brand text-white'
                                    : 'bg-surface text-text-dim hover:text-text-main border border-border-thin'
                            }`}
                        >
                            CES (Régimen Académico)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedOrganismo('CACES')}
                            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                                selectedOrganismo === 'CACES'
                                    ? 'bg-brand text-white'
                                    : 'bg-surface text-text-dim hover:text-text-main border border-border-thin'
                            }`}
                        >
                            CACES (Evaluación IST)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedOrganismo('MED')}
                            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                                selectedOrganismo === 'MED'
                                    ? 'bg-brand text-white'
                                    : 'bg-surface text-text-dim hover:text-text-main border border-border-thin'
                            }`}
                        >
                            Modelo Educativo
                        </button>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="py-16 text-center space-y-3">
                            <div className="w-8 h-8 mx-auto border-2 border-brand border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-text-dim">Cargando marco normativo vigente...</p>
                        </div>
                    ) : selectedOrganismo === 'MED' ? (
                        /* Vista de Modelo Educativo */
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-border-thin bg-surface space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 font-semibold">
                                        {modeloEducativo?.codigo || 'MED-ISTPET-2024'}
                                    </span>
                                    <span className="text-[10px] text-text-dim font-mono">
                                        Versión {modeloEducativo?.version || '2.0'}
                                    </span>
                                </div>
                                <h4 className="text-sm font-semibold text-text-main">
                                    {modeloEducativo?.nombre || 'Modelo Educativo Pedagógico Institucional ISTPET'}
                                </h4>
                                <p className="text-xs text-text-dim leading-relaxed">
                                    {modeloEducativo?.descripcion ||
                                        'Documento rector que define los principios pedagógicos, metodologías activas y el sistema de evaluación del Instituto Superior Tecnológico Nelson Torres.'}
                                </p>
                                <div className="pt-2 border-t border-border-thin flex items-center justify-between text-[11px] text-text-dim">
                                    <span>Resolución: {modeloEducativo?.resolucionAprobacion || 'RES-OCS-2024-004'}</span>
                                    <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                                        <CheckCircle2 size={13} />
                                        Vigente
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : filteredChecklist.length === 0 ? (
                        <div className="py-16 text-center space-y-2">
                            <FileText size={32} className="mx-auto text-text-dim opacity-50" />
                            <p className="text-xs text-text-main font-medium">No se encontraron artículos normativos</p>
                            <p className="text-[11px] text-text-dim">Prueba ajustando el filtro o la búsqueda</p>
                        </div>
                    ) : (
                        /* Lista de Artículos y Requisitos para el PEA */
                        <div className="space-y-3">
                            {filteredChecklist.map((art) => {
                                const isExpanded = expandedArticuloId === art.idArticulo;
                                const isCes = art.organismoEmisor === 'CES';

                                return (
                                    <div
                                        key={art.idArticulo || art.uuid}
                                        className="rounded-xl border border-border-thin bg-surface hover:border-brand/40 transition-colors overflow-hidden"
                                    >
                                        <div
                                            className="p-3.5 cursor-pointer flex items-start justify-between gap-3 select-none"
                                            onClick={() => setExpandedArticuloId(isExpanded ? null : art.idArticulo)}
                                        >
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                                            isCes
                                                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                                : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                        }`}
                                                    >
                                                        {art.organismoEmisor} • {art.numeroArticulo}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-text-dim">
                                                        {art.codigoResolucion}
                                                    </span>
                                                </div>
                                                <h5 className="text-xs font-semibold text-text-main">
                                                    {art.titulo || art.numeroArticulo}
                                                </h5>
                                            </div>

                                            <button
                                                type="button"
                                                className="text-text-dim hover:text-text-main mt-1 shrink-0"
                                                aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                                            >
                                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                            </button>
                                        </div>

                                        {/* Requisito Concreto para el Checklist del PEA */}
                                        {art.requisitoCurricular && (
                                            <div className="px-3.5 pb-3">
                                                <div className="p-2.5 rounded-lg bg-brand/5 border border-brand/15 text-[11px] text-text-main leading-relaxed flex items-start gap-2">
                                                    <CheckCircle2 size={14} className="text-brand shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-semibold text-brand block mb-0.5">
                                                            Criterio de Verificación Microcurricular:
                                                        </span>
                                                        {art.requisitoCurricular}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Contenido Legal Completo Expandido */}
                                        {isExpanded && (
                                            <div className="px-3.5 pb-3.5 pt-1 border-t border-border-thin/60 bg-surface/50 space-y-2 text-xs text-text-dim leading-relaxed">
                                                <span className="text-[10px] font-semibold text-text-main uppercase tracking-wider block">
                                                    Texto Oficial de la Resolución
                                                </span>
                                                <p className="text-[11.5px] italic text-text-dim">
                                                    "{art.contenido}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pie del Drawer con indicador de acreditación */}
                <div className="p-4 border-t border-border-thin bg-surface flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-text-dim">
                        <Shield size={14} className="text-emerald-500" />
                        <span className="text-[11px]">Acreditación CACES / RRA Vigente</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-border-thin text-text-main text-xs font-medium hover:bg-surface-hover transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NormativaDrawer;
