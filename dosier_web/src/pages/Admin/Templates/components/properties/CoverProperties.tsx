import React, { useState, useEffect } from 'react';
import {
    Type,
    Image as ImageIcon,
    Sparkles,
    Upload,
    Trash2,
    RotateCcw,
    GraduationCap,
    Calendar,
    Building2,
    SlidersHorizontal,
    FileText,
    Italic
} from 'lucide-react';
import type { DocumentBlock } from '../../types';

interface CoverPropertiesProps {
    activeBlock: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
    inputCls: string;
    selectCls: string;
}

const DEFAULT_POS: Record<string, { x: number; y: number }> = {
    institution: { x: 10, y: 13 },
    logo: { x: 10, y: 3 },
    title: { x: 10, y: 32 },
    tema: { x: 10, y: 46 },
    carrera: { x: 10, y: 70 },
    periodo: { x: 10, y: 80 },
};

const TITLE_PRESETS = [
    'PROYECTO DE INVESTIGACIÓN',
    'INFORME FINAL DEL PROYECTO DE INVESTIGACIÓN',
    'INFORME DE AVANCE DE INVESTIGACIÓN',
    'REPORTE DE ANALÍTICAS DE INVESTIGACIÓN',
];

import { ColorPickerField } from './SharedColorPicker';

const LabeledField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-text-dim block uppercase tracking-wider">{label}</label>
        {children}
    </div>
);

const FontSizeControl: React.FC<{
    label?: string;
    value: number;
    min: number;
    max: number;
    onChange: (val: number) => void;
}> = ({ label = 'Tamaño:', value, min, max, onChange }) => (
    <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-[9px] font-semibold text-text-dim uppercase tracking-wider shrink-0">{label}</span>
        <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={e => onChange(parseInt(e.target.value) || min)}
            className="flex-1 h-1 rounded accent-foreground cursor-pointer"
        />
        <div className="flex items-center bg-surface border border-border rounded px-1.5 py-0.5 focus-within:border-foreground transition-all shrink-0">
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={e => {
                    const parsed = parseInt(e.target.value);
                    if (!isNaN(parsed)) {
                        onChange(Math.max(min, Math.min(max, parsed)));
                    }
                }}
                className="w-7 text-[9px] font-mono text-foreground font-bold text-right bg-transparent outline-none p-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[8px] font-mono text-text-dim select-none ml-0.5">pt</span>
        </div>
    </div>
);

export const CoverProperties: React.FC<CoverPropertiesProps> = ({
    activeBlock,
    onUpdateConfig,
    inputCls,
    selectCls: _selectCls
}) => {
    const config = (activeBlock.config || {}) as any;
    const [activeTab, setActiveTab] = useState<'institution' | 'title' | 'tema' | 'carrera' | 'periodo'>('institution');
    const [openPosControls, setOpenPosControls] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Inicializar posiciones por defecto si no existen
        const updates: Record<string, any> = {};
        Object.entries(DEFAULT_POS).forEach(([key, pos]) => {
            const xKey = `x${key.charAt(0).toUpperCase() + key.slice(1)}`;
            const yKey = `y${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (config[xKey] === undefined) updates[xKey] = pos.x;
            if (config[yKey] === undefined) updates[yKey] = pos.y;
        });
        if (Object.keys(updates).length > 0) {
            Object.entries(updates).forEach(([k, v]) => onUpdateConfig(activeBlock.id, k, v));
        }
    }, [activeBlock.id]);

    // Quick logos oficiales
    const quickLogos = [
        { label: 'ISTPET Color', url: '/logo_istpet_negro.png' },
        { label: 'ISTPET Blanco', url: '/logo_istpet_blanco.png' },
        { label: 'Logo Reducido', url: '/logo_negro.png' },
    ];

    // Renderizador de control de posición
    const renderPositionControl = (xKey: string, yKey: string, defPos: { x: number; y: number }, label = 'Ajuste de posición (X, Y)') => {
        const xVal: number = config[xKey] ?? defPos.x;
        const yVal: number = config[yKey] ?? defPos.y;
        const isOpen = openPosControls[`${xKey}_${yKey}`] ?? false;

        return (
            <div className="pt-3 border-t border-border space-y-2.5">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setOpenPosControls(prev => ({ ...prev, [`${xKey}_${yKey}`]: !isOpen }))}
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-text-dim hover:text-foreground transition-colors cursor-pointer"
                    >
                        <SlidersHorizontal size={11} />
                        <span>{label}</span>
                        <span className="font-mono text-[9px] text-primary/80">({xVal}%, {yVal}%)</span>
                    </button>
                    {(xVal !== defPos.x || yVal !== defPos.y) && (
                        <button
                            type="button"
                            onClick={() => {
                                onUpdateConfig(activeBlock.id, xKey, defPos.x);
                                onUpdateConfig(activeBlock.id, yKey, defPos.y);
                            }}
                            className="flex items-center gap-1 text-[9px] text-text-dim hover:text-primary transition-colors cursor-pointer"
                            title="Restablecer posición por defecto"
                        >
                            <RotateCcw size={10} />
                            Reset
                        </button>
                    )}
                </div>

                {isOpen && (
                    <div className="p-3 bg-surface border border-border rounded-lg space-y-3 animate-fade-in">
                        {/* Control X (Horizontal) */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-text-dim">Posición Horizontal (X)</span>
                                <span className="font-mono font-bold text-foreground">{xVal}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="85"
                                    step="1"
                                    value={xVal}
                                    onChange={e => onUpdateConfig(activeBlock.id, xKey, Number(e.target.value))}
                                    className="flex-1 accent-primary h-1.5 bg-border rounded cursor-pointer"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="85"
                                    value={xVal}
                                    onChange={e => onUpdateConfig(activeBlock.id, xKey, Math.min(85, Math.max(0, Number(e.target.value))))}
                                    className="w-14 px-1.5 py-0.5 text-xs text-center border border-border rounded bg-surface font-mono"
                                />
                            </div>
                        </div>

                        {/* Control Y (Vertical) */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-text-dim">Posición Vertical (Y)</span>
                                <span className="font-mono font-bold text-foreground">{yVal}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="90"
                                    step="1"
                                    value={yVal}
                                    onChange={e => onUpdateConfig(activeBlock.id, yKey, Number(e.target.value))}
                                    className="flex-1 accent-primary h-1.5 bg-border rounded cursor-pointer"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="90"
                                    value={yVal}
                                    onChange={e => onUpdateConfig(activeBlock.id, yKey, Math.min(90, Math.max(0, Number(e.target.value))))}
                                    className="w-14 px-1.5 py-0.5 text-xs text-center border border-border rounded bg-surface font-mono"
                                />
                            </div>
                        </div>

                        {/* Presets de alineación rápida */}
                        <div className="flex items-center gap-1 pt-1">
                            <span className="text-[9px] text-text-dim">Preset X:</span>
                            {[
                                { label: 'Izq (5%)', x: 5 },
                                { label: 'Centro (10%)', x: 10 },
                                { label: 'Der (20%)', x: 20 },
                            ].map(p => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => onUpdateConfig(activeBlock.id, xKey, p.x)}
                                    className={`px-1.5 py-0.5 text-[9px] rounded border transition-colors cursor-pointer ${
                                        xVal === p.x
                                            ? 'bg-primary text-white border-primary font-bold'
                                            : 'border-border text-text-dim hover:text-foreground'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header del Bloque */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-foreground">Configuración de Portada</span>
            </div>

            {/* Sub-navegación por pestañas compacta */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-surface border border-border rounded-lg text-center select-none">
                {[
                    { id: 'institution', label: 'Inst.', icon: Building2, title: 'Institución / Logo' },
                    { id: 'title', label: 'Título', icon: Type, title: 'Título Principal' },
                    { id: 'tema', label: 'Tema', icon: FileText, title: 'Tema del Proyecto' },
                    { id: 'carrera', label: 'Carrera', icon: GraduationCap, title: 'Carrera' },
                    { id: 'periodo', label: 'Período', icon: Calendar, title: 'Período' },
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            title={tab.title}
                            className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                isActive
                                    ? 'bg-primary text-white font-bold shadow-xs'
                                    : 'text-text-dim hover:text-foreground hover:bg-surface-hover'
                            }`}
                        >
                            <Icon size={12} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Contenido de la pestaña activa */}
            <div className="space-y-4">
                {/* ── TAB 1: INSTITUCIÓN / LOGO ── */}
                {activeTab === 'institution' && (() => {
                    const isVisible = config.showInstitution !== false;
                    const instMode = config.institutionMode || 'text';
                    const instImage = config.institutionImage || '';
                    const instLogoHeight = Number(config.institutionLogoHeight || 48);
                    const instLogoInvert = Boolean(config.institutionLogoInvert);
                    const colorInstitution = config.colorInstitution || '#1e2a4a';
                    const institutionFontSize = Number(config.institutionFontSize || 11);
                    const institutionItalica = Boolean(config.institutionItalica);
                    const textVal = config.textoInstitucion || '';

                    return (
                        <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-foreground">Mostrar Institución</span>
                                <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={e => onUpdateConfig(activeBlock.id, 'showInstitution', e.target.checked)}
                                    className="w-4 h-4 accent-foreground rounded cursor-pointer"
                                />
                            </div>

                            {isVisible && (
                                <div className="space-y-3.5 pt-2 border-t border-border">
                                    {/* Selector de Modo */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-text-dim uppercase tracking-wider block">Formato de Presentación</label>
                                        <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-lg border border-border">
                                            {[
                                                { value: 'text', label: 'Insignia', icon: Type },
                                                { value: 'image', label: 'Logo', icon: ImageIcon },
                                                { value: 'hybrid', label: 'Ambos', icon: Sparkles },
                                            ].map(m => {
                                                const ModeIcon = m.icon;
                                                const isSel = instMode === m.value;
                                                return (
                                                    <button
                                                        key={m.value}
                                                        type="button"
                                                        onClick={() => onUpdateConfig(activeBlock.id, 'institutionMode', m.value)}
                                                        className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                                                            isSel
                                                                ? 'bg-foreground text-background shadow-xs'
                                                                : 'text-text-dim hover:text-foreground hover:bg-surface-hover'
                                                        }`}
                                                    >
                                                        <ModeIcon className="w-3 h-3" />
                                                        <span>{m.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Si tiene Logo */}
                                    {(instMode === 'image' || instMode === 'hybrid') && (
                                        <div className="space-y-2.5 p-3 rounded-lg bg-surface border border-border">
                                            {instImage ? (
                                                <div className="flex items-center gap-2.5 p-2 bg-surface-hover rounded-md border border-border">
                                                    <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded flex items-center justify-center p-1 border border-border shrink-0 overflow-hidden">
                                                        <img
                                                            src={instImage}
                                                            alt="Logo"
                                                            className="max-h-full max-w-full object-contain"
                                                            style={instLogoInvert ? { filter: 'brightness(0) invert(1)' } : undefined}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-semibold text-foreground truncate">Logo institucional cargado</div>
                                                        <div className="text-[9px] text-text-dim truncate">
                                                            {instImage.startsWith('data:') ? 'Imagen personalizada' : instImage}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => onUpdateConfig(activeBlock.id, 'institutionImage', '')}
                                                        className="p-1.5 text-text-dim hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                                                        title="Eliminar logo"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5">
                                                    <label className="border border-dashed border-border hover:border-foreground/40 rounded-lg p-3 text-center block cursor-pointer bg-surface hover:bg-surface-hover transition-all relative">
                                                        <input
                                                            type="file"
                                                            accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                                                            onChange={e => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        onUpdateConfig(activeBlock.id, 'institutionImage', reader.result as string);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        <div className="flex flex-col items-center justify-center gap-1 text-text-dim hover:text-foreground">
                                                            <Upload className="w-4 h-4 text-text-dim" />
                                                            <span className="text-[10px] font-semibold uppercase tracking-wider">Subir Archivo de Imagen</span>
                                                            <span className="text-[8px] opacity-70">PNG, JPG, SVG o WebP</span>
                                                        </div>
                                                    </label>

                                                    <div className="space-y-1">
                                                        <span className="text-[9px] text-text-dim block">Presets oficiales ISTPET:</span>
                                                        <div className="grid grid-cols-3 gap-1.5">
                                                            {quickLogos.map(q => (
                                                                <button
                                                                    key={q.url}
                                                                    type="button"
                                                                    onClick={() => onUpdateConfig(activeBlock.id, 'institutionImage', q.url)}
                                                                    className="p-1.5 rounded text-[9px] font-semibold border border-border bg-surface hover:bg-surface-hover hover:border-border-hover text-foreground truncate text-center transition-all cursor-pointer"
                                                                >
                                                                    {q.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {instImage && (
                                                <div className="space-y-2 pt-2 border-t border-border">
                                                    <div className="flex items-center justify-between text-[9px] text-text-dim">
                                                        <span>Altura del logo</span>
                                                        <div className="flex items-center bg-surface border border-border rounded px-1.5 py-0.5 focus-within:border-foreground transition-all">
                                                            <input
                                                                type="number"
                                                                min={20}
                                                                max={240}
                                                                value={instLogoHeight}
                                                                onChange={e => {
                                                                    const parsed = parseInt(e.target.value);
                                                                    if (!isNaN(parsed)) {
                                                                        onUpdateConfig(activeBlock.id, 'institutionLogoHeight', Math.max(20, Math.min(240, parsed)));
                                                                    }
                                                                }}
                                                                className="w-8 text-[9px] font-mono text-foreground font-bold text-right bg-transparent outline-none p-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <span className="text-[8px] font-mono text-text-dim select-none ml-0.5">px</span>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={20} max={240} step={2}
                                                        value={instLogoHeight}
                                                        onChange={e => onUpdateConfig(activeBlock.id, 'institutionLogoHeight', parseInt(e.target.value))}
                                                        className="w-full h-1.5 rounded accent-foreground cursor-pointer"
                                                    />
                                                </div>
                                            )}

                                            {renderPositionControl('xLogo', 'yLogo', DEFAULT_POS.logo, 'Ajuste de posición del Logo')}
                                        </div>
                                    )}

                                    {/* Si tiene Texto */}
                                    {(instMode === 'text' || instMode === 'hybrid') && (
                                        <div className="space-y-3 p-3 rounded-lg bg-surface border border-border">
                                            <LabeledField label="Texto Institucional">
                                                <input
                                                    type="text"
                                                    className={inputCls}
                                                    value={textVal}
                                                    onChange={e => onUpdateConfig(activeBlock.id, 'textoInstitucion', e.target.value)}
                                                    placeholder="Ej. INSTITUTO TECNOLÓGICO SUPERIOR TRAVERSARI"
                                                />
                                            </LabeledField>

                                            <ColorPickerField
                                                label="Color de Texto"
                                                value={colorInstitution}
                                                fallback="#1e2a4a"
                                                onChange={v => onUpdateConfig(activeBlock.id, 'colorInstitution', v)}
                                                inputCls={inputCls}
                                            />

                                            {/* Formato y Tamaño de Institución (Línea Compacta) */}
                                            <div className="flex items-center justify-between gap-2.5 pt-0.5">
                                                <FontSizeControl
                                                    value={institutionFontSize}
                                                    min={8}
                                                    max={36}
                                                    onChange={v => onUpdateConfig(activeBlock.id, 'institutionFontSize', v)}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => onUpdateConfig(activeBlock.id, 'institutionItalica', !institutionItalica)}
                                                    className={`p-1.5 rounded-md border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                                        institutionItalica
                                                            ? 'bg-foreground text-background border-foreground shadow-xs'
                                                            : 'bg-surface text-text-dim border-border hover:text-foreground hover:bg-surface-hover'
                                                    }`}
                                                    title="Texto en cursiva / itálica"
                                                >
                                                    <Italic className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {renderPositionControl('xInstitution', 'yInstitution', DEFAULT_POS.institution, 'Ajuste de posición del Texto')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ── TAB 2: TÍTULO DOCUMENTAL ── */}
                {activeTab === 'title' && (() => {
                    const isVisible = config.showTitle !== false;
                    const tituloSuperior = config.tituloSuperior || 'PROYECTO DE INVESTIGACIÓN';
                    const colorTitulo = config.colorTituloSuperior || '#1e2a4a';
                    const tituloFontSize = Number(config.tituloFontSize || 20);
                    const tituloItalica = Boolean(config.tituloItalica);

                    return (
                        <div className="space-y-4 font-sans">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <span className="text-[11px] font-bold text-foreground">Mostrar Título</span>
                                <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={e => onUpdateConfig(activeBlock.id, 'showTitle', e.target.checked)}
                                    className="w-4 h-4 accent-foreground rounded cursor-pointer"
                                />
                            </div>

                            {isVisible && (
                                <div className="space-y-3.5">
                                    <LabeledField label="Título / Tipo de Documento">
                                        <input
                                            type="text"
                                            className={inputCls}
                                            value={tituloSuperior}
                                            onChange={e => onUpdateConfig(activeBlock.id, 'tituloSuperior', e.target.value)}
                                            placeholder="PROYECTO DE INVESTIGACIÓN"
                                        />
                                    </LabeledField>
                                    <div className="space-y-1">
                                        <span className="text-[8px] text-text-dim block">Sugerencias rápidas:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {TITLE_PRESETS.map(preset => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => onUpdateConfig(activeBlock.id, 'tituloSuperior', preset)}
                                                    className="text-[8px] px-1.5 py-0.5 rounded border border-border bg-surface hover:bg-surface-hover text-text-dim hover:text-foreground transition-all cursor-pointer truncate max-w-full"
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <ColorPickerField
                                        label="Color del Título Documental"
                                        value={colorTitulo}
                                        fallback="#1e2a4a"
                                        onChange={v => onUpdateConfig(activeBlock.id, 'colorTituloSuperior', v)}
                                        inputCls={inputCls}
                                    />

                                    {/* Formato y Tamaño del Título (Línea Compacta) */}
                                    <div className="flex items-center justify-between gap-2.5 pt-0.5">
                                        <FontSizeControl
                                            value={tituloFontSize}
                                            min={12}
                                            max={48}
                                            onChange={v => onUpdateConfig(activeBlock.id, 'tituloFontSize', v)}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => onUpdateConfig(activeBlock.id, 'tituloItalica', !tituloItalica)}
                                            className={`p-1.5 rounded-md border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                                tituloItalica
                                                    ? 'bg-foreground text-background border-foreground shadow-xs'
                                                    : 'bg-surface text-text-dim border-border hover:text-foreground hover:bg-surface-hover'
                                            }`}
                                            title="Texto en cursiva / itálica"
                                        >
                                            <Italic className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {renderPositionControl('xTitle', 'yTitle', DEFAULT_POS.title, 'Ajuste de posición del Título')}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ── TAB 3: TEMA DEL PROYECTO ── */}
                {activeTab === 'tema' && (() => {
                    const showTemaProyecto = config.showTemaProyecto !== false;
                    const placeholderTema = config.placeholderTema || 'ESCRIBIR EL TEMA EN MAYÚSCULAS';
                    const colorTemaProyecto = config.colorTemaProyecto || '#1e2a4a';
                    const temaFontSize = Number(config.temaFontSize || 13);
                    const temaItalica = Boolean(config.temaItalica);

                    return (
                        <div className="space-y-4 font-sans">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <div>
                                    <span className="text-[11px] font-bold text-foreground block">Mostrar Tema del Proyecto</span>
                                    <span className="text-[8px] text-text-dim">Texto dinámico que completan los investigadores</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={showTemaProyecto}
                                    onChange={e => onUpdateConfig(activeBlock.id, 'showTemaProyecto', e.target.checked)}
                                    className="w-4 h-4 accent-foreground rounded cursor-pointer"
                                />
                            </div>

                            {showTemaProyecto && (
                                <div className="space-y-3.5">
                                    <LabeledField label="Texto Guía / Placeholder">
                                        <input
                                            type="text"
                                            className={inputCls}
                                            value={placeholderTema}
                                            onChange={e => onUpdateConfig(activeBlock.id, 'placeholderTema', e.target.value)}
                                            placeholder="ESCRIBIR EL TEMA EN MAYÚSCULAS"
                                        />
                                    </LabeledField>

                                    <ColorPickerField
                                        label="Color del Tema del Proyecto"
                                        value={colorTemaProyecto}
                                        fallback="#1e2a4a"
                                        onChange={v => onUpdateConfig(activeBlock.id, 'colorTemaProyecto', v)}
                                        inputCls={inputCls}
                                    />

                                    {/* Formato y Tamaño del Tema (Línea Compacta) */}
                                    <div className="flex items-center justify-between gap-2.5 pt-0.5">
                                        <FontSizeControl
                                            value={temaFontSize}
                                            min={10}
                                            max={36}
                                            onChange={v => onUpdateConfig(activeBlock.id, 'temaFontSize', v)}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => onUpdateConfig(activeBlock.id, 'temaItalica', !temaItalica)}
                                            className={`p-1.5 rounded-md border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                                temaItalica
                                                    ? 'bg-foreground text-background border-foreground shadow-xs'
                                                    : 'bg-surface text-text-dim border-border hover:text-foreground hover:bg-surface-hover'
                                            }`}
                                            title="Texto en cursiva / itálica"
                                        >
                                            <Italic className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {renderPositionControl('xTema', 'yTema', DEFAULT_POS.tema, 'Ajuste de posición del Tema')}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ── TAB 3: CARRERA / UNIDAD ── */}
                {activeTab === 'carrera' && (() => {
                    const isVisible = config.showCarrera !== false;
                    const prefijoCarrera = config.prefijoCarrera !== undefined ? config.prefijoCarrera : 'TECNOLOGÍA SUPERIOR EN';
                    const colorVal = config.colorCarrera || '#1e2a4a';
                    const carreraFontSize = Number(config.carreraFontSize || 11);
                    const carreraItalica = Boolean(config.carreraItalica);

                    const carreraPrefixPresets = [
                        'TECNOLOGÍA SUPERIOR EN',
                        'CARRERA DE',
                        'CARRERA:',
                        ''
                    ];

                    return (
                        <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-foreground">Mostrar Carrera</span>
                                <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={e => onUpdateConfig(activeBlock.id, 'showCarrera', e.target.checked)}
                                    className="w-4 h-4 accent-foreground rounded cursor-pointer"
                                />
                            </div>

                            {isVisible && (
                                <div className="space-y-3 pt-2 border-t border-border">
                                    {/* Prefijo Institucional */}
                                    <div className="space-y-1.5">
                                        <LabeledField label="Prefijo Institucional (Opcional)">
                                            <input
                                                type="text"
                                                className={inputCls}
                                                value={prefijoCarrera}
                                                onChange={e => onUpdateConfig(activeBlock.id, 'prefijoCarrera', e.target.value)}
                                                placeholder="Ej. TECNOLOGÍA SUPERIOR EN"
                                            />
                                        </LabeledField>
                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                            {carreraPrefixPresets.map(p => (
                                                <button
                                                    key={p || 'none'}
                                                    type="button"
                                                    onClick={() => onUpdateConfig(activeBlock.id, 'prefijoCarrera', p)}
                                                    className={`text-[8px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                                                        prefijoCarrera === p
                                                            ? 'bg-foreground text-background border-foreground font-bold'
                                                            : 'bg-surface border-border text-text-dim hover:text-foreground hover:bg-surface-hover'
                                                    }`}
                                                >
                                                    {p || 'Sin prefijo'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color de Texto */}
                                    <ColorPickerField
                                        label="Color de Texto de Carrera"
                                        value={colorVal}
                                        fallback="#1e2a4a"
                                        onChange={v => onUpdateConfig(activeBlock.id, 'colorCarrera', v)}
                                        inputCls={inputCls}
                                    />

                                    {/* Formato y Tamaño de Carrera (Línea Compacta) */}
                                    <div className="flex items-center justify-between gap-2.5 pt-0.5">
                                        <FontSizeControl
                                            value={carreraFontSize}
                                            min={9}
                                            max={32}
                                            onChange={v => onUpdateConfig(activeBlock.id, 'carreraFontSize', v)}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => onUpdateConfig(activeBlock.id, 'carreraItalica', !carreraItalica)}
                                            className={`p-1.5 rounded-md border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                                carreraItalica
                                                    ? 'bg-foreground text-background border-foreground shadow-xs'
                                                    : 'bg-surface text-text-dim border-border hover:text-foreground hover:bg-surface-hover'
                                            }`}
                                            title="Texto en cursiva / itálica"
                                        >
                                            <Italic className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {renderPositionControl('xCarrera', 'yCarrera', DEFAULT_POS.carrera)}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ── TAB 4: PERIODO ACADÉMICO ── */}
                {activeTab === 'periodo' && (() => {
                    const isVisible = config.showPeriodo !== false;
                    const prefijoPeriodo = config.prefijoPeriodo !== undefined ? config.prefijoPeriodo : 'PERIODO ACADÉMICO';
                    const colorVal = config.colorPeriodo || '#475569';
                    const periodoFontSize = Number(config.periodoFontSize || 10);
                    const periodoItalica = Boolean(config.periodoItalica);

                    const periodoPrefixPresets = [
                        'PERIODO ACADÉMICO',
                        'SEMESTRE',
                        'PERIODO:',
                        ''
                    ];

                    return (
                        <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-foreground">Mostrar Periodo</span>
                                <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={e => onUpdateConfig(activeBlock.id, 'showPeriodo', e.target.checked)}
                                    className="w-4 h-4 accent-foreground rounded cursor-pointer"
                                />
                            </div>

                            {isVisible && (
                                <div className="space-y-3 pt-2 border-t border-border">
                                    {/* Prefijo de Periodo */}
                                    <div className="space-y-1.5">
                                        <LabeledField label="Prefijo de Periodo (Opcional)">
                                            <input
                                                type="text"
                                                className={inputCls}
                                                value={prefijoPeriodo}
                                                onChange={e => onUpdateConfig(activeBlock.id, 'prefijoPeriodo', e.target.value)}
                                                placeholder="Ej. PERIODO ACADÉMICO"
                                            />
                                        </LabeledField>
                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                            {periodoPrefixPresets.map(p => (
                                                <button
                                                    key={p || 'none'}
                                                    type="button"
                                                    onClick={() => onUpdateConfig(activeBlock.id, 'prefijoPeriodo', p)}
                                                    className={`text-[8px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                                                        prefijoPeriodo === p
                                                            ? 'bg-foreground text-background border-foreground font-bold'
                                                            : 'bg-surface border-border text-text-dim hover:text-foreground hover:bg-surface-hover'
                                                    }`}
                                                >
                                                    {p || 'Sin prefijo'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color de Texto */}
                                    <ColorPickerField
                                        label="Color de Texto de Periodo"
                                        value={colorVal}
                                        fallback="#475569"
                                        onChange={v => onUpdateConfig(activeBlock.id, 'colorPeriodo', v)}
                                        inputCls={inputCls}
                                    />

                                    {/* Formato y Tamaño de Periodo (Línea Compacta) */}
                                    <div className="flex items-center justify-between gap-2.5 pt-0.5">
                                        <FontSizeControl
                                            value={periodoFontSize}
                                            min={8}
                                            max={28}
                                            onChange={v => onUpdateConfig(activeBlock.id, 'periodoFontSize', v)}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => onUpdateConfig(activeBlock.id, 'periodoItalica', !periodoItalica)}
                                            className={`p-1.5 rounded-md border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                                periodoItalica
                                                    ? 'bg-foreground text-background border-foreground shadow-xs'
                                                    : 'bg-surface text-text-dim border-border hover:text-foreground hover:bg-surface-hover'
                                            }`}
                                            title="Texto en cursiva / itálica"
                                        >
                                            <Italic className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {renderPositionControl('xPeriodo', 'yPeriodo', DEFAULT_POS.periodo)}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
