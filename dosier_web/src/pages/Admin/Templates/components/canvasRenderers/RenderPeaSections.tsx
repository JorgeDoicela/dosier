/**
 * @file RenderPeaSections.tsx
 * @description Renderizadores de lienzo A4 para los bloques curriculares oficiales del PEA (RRA Art. 21 / ISTPET).
 * 
 * Implementa el estándar de interactividad directa en el lienzo (Canvas):
 * - Píldora de controles flotante en hover (renderDirectControlsPill): mover arriba/abajo, renombrar in-situ, ciclo de colores, ocultar.
 * - Edición inline de títulos de sección y etiquetas sin necesidad de abrir el inspector lateral.
 * - Soporte para campos dinámicos y banners de agrupación.
 * - Paletas y tipografía Vercel Geist con fondos 100% sólidos.
 */

import React, { useState } from 'react';
import {
    ArrowUp,
    ArrowDown,
    Pencil,
    Check,
    EyeOff,
    Plus,
    GraduationCap,
    BookOpen,
    Target,
    Layers,
    Clock,
    Award,
    ShieldCheck,
    Library,
    CheckSquare
} from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../properties/SharedColorPicker';

// ─────────────────────────────────────────────────────────────────────────────
// 1. DATOS GENERALES Y CARGA HORARIA (PEA SECCIÓN A & B)
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaGeneralSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId, onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'a) DATOS GENERALES DE LA ASIGNATURA';
    const defaultHeaderBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const borderStyle = c.borderStyle || 'solid';
    const isNoBorder = borderStyle === 'none';

    const tableBorderCss = isNoBorder ? 'border-0' : 'border border-black';
    const cellBorderCss = isNoBorder ? 'border-b border-black' : 'border-r border-black';
    const rowBorderCss = 'border-b border-black';

    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<string>('');

    const resolveBg = (variant?: string, defaultColor = defaultHeaderBg) => {
        if (variant === 'banner_gold') return '#c4a857';
        if (variant === 'banner_emerald') return '#065f46';
        if (variant === 'banner_navy') return '#1e2a4a';
        if (variant && (variant.startsWith('#') || variant.startsWith('rgb') || variant.startsWith('hsl'))) return variant;
        return defaultColor;
    };

    const customFields: any[] = Array.isArray(c.customFields) ? c.customFields : [];

    const handleMoveDirect = (itemKey: string, direction: 'up' | 'down', currentActiveKeys: string[]) => {
        if (!onUpdateConfig || !blockId) return;
        const index = currentActiveKeys.indexOf(itemKey);
        if (index === -1) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentActiveKeys.length) return;

        const updatedOrder = [...currentActiveKeys];
        const [moved] = updatedOrder.splice(index, 1);
        updatedOrder.splice(targetIndex, 0, moved);

        onUpdateConfig(blockId, 'fieldsOrder', updatedOrder);
    };

    const handleCycleVariantDirect = (itemKey: string, isCustom = false) => {
        if (!onUpdateConfig || !blockId) return;
        const variants = ['standard', 'banner_gold', 'banner_navy', 'banner_emerald'];
        if (isCustom) {
            const updated = customFields.map(f => {
                if ((f.fieldKey || f.id) === itemKey) {
                    const currentIdx = variants.indexOf(f.variant || 'standard');
                    const nextVariant = variants[(currentIdx + 1) % variants.length];
                    return { ...f, variant: nextVariant };
                }
                return f;
            });
            onUpdateConfig(blockId, 'customFields', updated);
        } else {
            const current = c[`variant_${itemKey}`] || 'standard';
            const currentIdx = variants.indexOf(current);
            const nextVariant = variants[(currentIdx + 1) % variants.length];
            onUpdateConfig(blockId, `variant_${itemKey}`, nextVariant);
        }
    };

    const handleHideFieldDirect = (itemKey: string, isCustom = false) => {
        if (!onUpdateConfig || !blockId) return;
        if (isCustom) {
            const updated = customFields.filter(f => (f.fieldKey || f.id) !== itemKey);
            onUpdateConfig(blockId, 'customFields', updated);
        } else {
            onUpdateConfig(blockId, itemKey, false);
        }
    };

    const handleSaveLabelDirect = (itemKey: string, isCustom = false) => {
        if (!onUpdateConfig || !blockId) return;
        if (itemKey === 'section_title') {
            onUpdateConfig(blockId, 'title', editingText.trim() || 'a) DATOS GENERALES DE LA ASIGNATURA');
        } else if (isCustom) {
            const updated = customFields.map(f => {
                if ((f.fieldKey || f.id) === itemKey) {
                    return { ...f, label: editingText.trim() };
                }
                return f;
            });
            onUpdateConfig(blockId, 'customFields', updated);
        } else {
            onUpdateConfig(blockId, `customLabel_${itemKey}`, editingText.trim());
        }
        setEditingKey(null);
    };

    const handleQuickAddField = () => {
        if (!onUpdateConfig || !blockId) return;
        const newKey = `pea_custom_${Date.now().toString().slice(-4)}`;
        const newField = {
            fieldKey: newKey,
            label: 'NUEVO METADATO CURRICULAR',
            fieldType: 'text',
            colSpan: 1,
            variant: 'standard',
            placeholder: 'Información institucional...'
        };
        onUpdateConfig(blockId, 'customFields', [...customFields, newField]);
    };

    const renderDirectControlsPill = (
        itemKey: string,
        rawLabel: string,
        isFirst: boolean,
        isLast: boolean,
        variant: string,
        isCustom = false,
        allActiveKeys: string[]
    ) => {
        if (!onUpdateConfig) return null;
        return (
            <div
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover/row:opacity-100 transition-opacity absolute top-1 right-2 flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-md border border-slate-200 dark:border-slate-700 text-[8px] z-30 font-sans select-none"
            >
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleMoveDirect(itemKey, 'up', allActiveKeys); }}
                    disabled={isFirst}
                    className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 disabled:opacity-20 cursor-pointer transition-colors"
                    title="Mover arriba"
                >
                    <ArrowUp className="w-2.5 h-2.5" />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleMoveDirect(itemKey, 'down', allActiveKeys); }}
                    disabled={isLast}
                    className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 disabled:opacity-20 cursor-pointer transition-colors"
                    title="Mover abajo"
                >
                    <ArrowDown className="w-2.5 h-2.5" />
                </button>

                <span className="w-px h-2.5 bg-slate-200 dark:bg-slate-700 my-auto" />

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditingKey(itemKey);
                        setEditingText(rawLabel);
                    }}
                    className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-text-main cursor-pointer transition-colors"
                    title="Renombrar etiqueta"
                >
                    <Pencil className="w-2.5 h-2.5" />
                </button>

                <span className="w-px h-2.5 bg-slate-200 dark:bg-slate-700 my-auto" />

                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleCycleVariantDirect(itemKey, isCustom); }}
                    className={`px-1 py-0.2 text-[7.5px] font-bold rounded border transition-all cursor-pointer ${
                        variant === 'banner_gold'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : variant === 'banner_navy'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : variant === 'banner_emerald'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Cambiar color de celda"
                >
                    {variant === 'banner_gold' ? 'Dorado' : variant === 'banner_navy' ? 'Azul' : variant === 'banner_emerald' ? 'Verde' : 'Estándar'}
                </button>

                <span className="w-px h-2.5 bg-slate-200 dark:bg-slate-700 my-auto" />

                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleHideFieldDirect(itemKey, isCustom); }}
                    className="p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer transition-colors"
                    title="Ocultar campo"
                >
                    <EyeOff className="w-2.5 h-2.5" />
                </button>
            </div>
        );
    };

    interface PeaFieldItem {
        id: string;
        rawLabel: string;
        variant: string;
        isCustom?: boolean;
        render: (isFirst: boolean, isLast: boolean, allKeys: string[]) => React.ReactNode;
    }

    const items: PeaFieldItem[] = [];

    // 1. ASIGNATURA
    if (c.showAsignatura !== false) {
        const variant = c.variant_showAsignatura || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);
        const rawLabel = c.customLabel_showAsignatura || 'Nombre de la Asignatura';
        const labelDisplay = c.customLabel_showAsignatura ? `${c.customLabel_showAsignatura.trim()}:` : 'ASIGNATURA:';

        items.push({
            id: 'showAsignatura',
            rawLabel,
            variant,
            render: (isFirst, isLast, allKeys) => (
                <tr key="showAsignatura" className={`${rowBorderCss} group/row relative`}>
                    <td
                        className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle relative w-[28%]`}
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        {editingKey === 'showAsignatura' ? (
                            <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={e => setEditingText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveLabelDirect('showAsignatura'); if (e.key === 'Escape') setEditingKey(null); }}
                                    autoFocus
                                    className="bg-white text-slate-900 px-1 py-0.5 text-[8.5px] rounded outline-none font-bold w-full"
                                />
                                <button type="button" onClick={() => handleSaveLabelDirect('showAsignatura')} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                                    <Check className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <span>{labelDisplay}</span>
                        )}
                        {renderDirectControlsPill('showAsignatura', rawLabel, isFirst, isLast, variant, false, allKeys)}
                    </td>
                    <td colSpan={3} className="p-2 text-slate-800 font-bold bg-white align-middle text-[9px] uppercase tracking-wide">
                        [VINCULADO A SIGAFI — ASIGNATURA SELECCIONADA]
                    </td>
                </tr>
            )
        });
    }

    // 2. CÓDIGO Y CARRERA
    if (c.showCarrera !== false) {
        const variant = c.variant_showCarrera || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);
        const rawLabel = c.customLabel_showCarrera || 'Carrera / Unidad Académica';
        const labelDisplay = c.customLabel_showCarrera ? `${c.customLabel_showCarrera.trim()}:` : 'CARRERA:';

        items.push({
            id: 'showCarrera',
            rawLabel,
            variant,
            render: (isFirst, isLast, allKeys) => (
                <tr key="showCarrera" className={`${rowBorderCss} group/row relative`}>
                    <td
                        className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle relative w-[28%]`}
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        {editingKey === 'showCarrera' ? (
                            <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={e => setEditingText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveLabelDirect('showCarrera'); if (e.key === 'Escape') setEditingKey(null); }}
                                    autoFocus
                                    className="bg-white text-slate-900 px-1 py-0.5 text-[8.5px] rounded outline-none font-bold w-full"
                                />
                                <button type="button" onClick={() => handleSaveLabelDirect('showCarrera')} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                                    <Check className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <span>{labelDisplay}</span>
                        )}
                        {renderDirectControlsPill('showCarrera', rawLabel, isFirst, isLast, variant, false, allKeys)}
                    </td>
                    <td className={`p-2 text-slate-800 bg-white align-middle text-[8.5px] ${cellBorderCss}`}>
                        TECNOLOGÍA SUPERIOR EN [CARRERA VINCULADA]
                    </td>
                    <td className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle w-[18%]`} style={{ backgroundColor: bg, color: fg }}>
                        CÓDIGO ASIGNATURA:
                    </td>
                    <td className="p-2 text-slate-800 font-mono font-semibold bg-white align-middle text-[8.5px]">
                        ISTPET-ASIG-001
                    </td>
                </tr>
            )
        });
    }

    // 3. NIVEL Y MODALIDAD
    if (c.showNivelModalidad !== false) {
        const variant = c.variant_showNivelModalidad || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);
        const rawLabel = c.customLabel_showNivelModalidad || 'Nivel y Modalidad';

        items.push({
            id: 'showNivelModalidad',
            rawLabel,
            variant,
            render: (isFirst, isLast, allKeys) => (
                <tr key="showNivelModalidad" className={`${rowBorderCss} group/row relative`}>
                    <td
                        className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle relative w-[28%]`}
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        {editingKey === 'showNivelModalidad' ? (
                            <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={e => setEditingText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveLabelDirect('showNivelModalidad'); if (e.key === 'Escape') setEditingKey(null); }}
                                    autoFocus
                                    className="bg-white text-slate-900 px-1 py-0.5 text-[8.5px] rounded outline-none font-bold w-full"
                                />
                                <button type="button" onClick={() => handleSaveLabelDirect('showNivelModalidad')} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                                    <Check className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <span>SEMESTRE / NIVEL:</span>
                        )}
                        {renderDirectControlsPill('showNivelModalidad', rawLabel, isFirst, isLast, variant, false, allKeys)}
                    </td>
                    <td className={`p-2 text-slate-800 bg-white align-middle text-[8.5px] ${cellBorderCss}`}>
                        TERCER NIVEL
                    </td>
                    <td className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle w-[18%]`} style={{ backgroundColor: bg, color: fg }}>
                        MODALIDAD:
                    </td>
                    <td className="p-2 text-slate-800 bg-white align-middle text-[8.5px]">
                        Presencial (Paralelo: A)
                    </td>
                </tr>
            )
        });
    }

    // 4. UNIDAD DE ORGANIZACIÓN CURRICULAR Y PERÍODO
    if (c.showUnidadOrganizacion !== false) {
        const variant = c.variant_showUnidadOrganizacion || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);
        const rawLabel = c.customLabel_showUnidadOrganizacion || 'Unidad de Organización Curricular';

        items.push({
            id: 'showUnidadOrganizacion',
            rawLabel,
            variant,
            render: (isFirst, isLast, allKeys) => (
                <tr key="showUnidadOrganizacion" className={`${rowBorderCss} group/row relative`}>
                    <td
                        className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle relative w-[28%]`}
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        {editingKey === 'showUnidadOrganizacion' ? (
                            <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={e => setEditingText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveLabelDirect('showUnidadOrganizacion'); if (e.key === 'Escape') setEditingKey(null); }}
                                    autoFocus
                                    className="bg-white text-slate-900 px-1 py-0.5 text-[8.5px] rounded outline-none font-bold w-full"
                                />
                                <button type="button" onClick={() => handleSaveLabelDirect('showUnidadOrganizacion')} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                                    <Check className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <span>UNIDAD DE ORGANIZACIÓN:</span>
                        )}
                        {renderDirectControlsPill('showUnidadOrganizacion', rawLabel, isFirst, isLast, variant, false, allKeys)}
                    </td>
                    <td className={`p-2 text-slate-800 bg-white align-middle text-[8.5px] ${cellBorderCss}`}>
                        Unidad Profesional
                    </td>
                    <td className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle w-[18%]`} style={{ backgroundColor: bg, color: fg }}>
                        PERIODO ACADÉMICO:
                    </td>
                    <td className="p-2 text-slate-800 font-semibold bg-white align-middle text-[8.5px]">
                        2026-I
                    </td>
                </tr>
            )
        });
    }

    // 5. PRERREQUISITOS Y CORREQUISITOS
    if (c.showRequisitos !== false) {
        const variant = c.variant_showRequisitos || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);
        const rawLabel = c.customLabel_showRequisitos || 'Prerrequisitos y Correquisitos';

        items.push({
            id: 'showRequisitos',
            rawLabel,
            variant,
            render: (isFirst, isLast, allKeys) => (
                <tr key="showRequisitos" className={`${rowBorderCss} group/row relative`}>
                    <td
                        className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle relative w-[28%]`}
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        <span>PRERREQUISITOS:</span>
                        {renderDirectControlsPill('showRequisitos', rawLabel, isFirst, isLast, variant, false, allKeys)}
                    </td>
                    <td className={`p-2 text-slate-800 bg-white align-middle text-[8.5px] ${cellBorderCss}`}>
                        Ninguno / Asignaturas de nivel previo aprobadas
                    </td>
                    <td className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle w-[18%]`} style={{ backgroundColor: bg, color: fg }}>
                        CORREQUISITOS:
                    </td>
                    <td className="p-2 text-slate-800 bg-white align-middle text-[8.5px]">
                        No aplica
                    </td>
                </tr>
            )
        });
    }

    // 6. DOCENTE ELABORADOR
    if (c.showDocente !== false) {
        const variant = c.variant_showDocente || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);
        const rawLabel = c.customLabel_showDocente || 'Docente Responsable';

        items.push({
            id: 'showDocente',
            rawLabel,
            variant,
            render: (isFirst, isLast, allKeys) => (
                <tr key="showDocente" className={`${rowBorderCss} group/row relative`}>
                    <td
                        className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle relative w-[28%]`}
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        <span>DOCENTE RESPONSABLE:</span>
                        {renderDirectControlsPill('showDocente', rawLabel, isFirst, isLast, variant, false, allKeys)}
                    </td>
                    <td colSpan={3} className="p-2 text-slate-800 font-semibold bg-white align-middle text-[8.5px]">
                        Docente Asignado en Distributivo (Email: docente@istpet.edu.ec)
                    </td>
                </tr>
            )
        });
    }

    // Campos adicionales creados por el usuario en el canvas
    customFields.forEach(f => {
        const fieldKey = f.fieldKey || f.id;
        const variant = f.variant || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);

        items.push({
            id: fieldKey,
            rawLabel: f.label,
            variant,
            isCustom: true,
            render: (isFirst, isLast, allKeys) => (
                <tr key={fieldKey} className={`${rowBorderCss} group/row relative`}>
                    <td
                        className={`p-2 font-bold text-[8.5px] uppercase ${cellBorderCss} align-middle relative w-[28%]`}
                        style={{ backgroundColor: bg, color: fg }}
                    >
                        {editingKey === fieldKey ? (
                            <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={e => setEditingText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveLabelDirect(fieldKey, true); if (e.key === 'Escape') setEditingKey(null); }}
                                    autoFocus
                                    className="bg-white text-slate-900 px-1 py-0.5 text-[8.5px] rounded outline-none font-bold w-full"
                                />
                                <button type="button" onClick={() => handleSaveLabelDirect(fieldKey, true)} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                                    <Check className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <span>{f.label}:</span>
                        )}
                        {renderDirectControlsPill(fieldKey, f.label, isFirst, isLast, variant, true, allKeys)}
                    </td>
                    <td colSpan={3} className="p-2 text-slate-700 bg-white align-middle text-[8.5px] italic">
                        {f.placeholder || 'Campo institucional adicional'}
                    </td>
                </tr>
            )
        });
    });

    // Ordenamiento por fieldsOrder si existe
    const fieldsOrder: string[] = Array.isArray(c.fieldsOrder) ? c.fieldsOrder : [];
    const sortedItems = [...items].sort((a, b) => {
        const idxA = fieldsOrder.indexOf(a.id);
        const idxB = fieldsOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
    });

    const allKeys = sortedItems.map(it => it.id);

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* ENCABEZADO DE SECCIÓN CON EDICIÓN INLINE */}
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center justify-between transition-colors group relative cursor-pointer"
                style={{ backgroundColor: defaultHeaderBg, color: getContrastFg(defaultHeaderBg) }}
                onClick={(e) => {
                    e.stopPropagation();
                    setEditingKey('section_title');
                    setEditingText(displayTitle);
                }}
            >
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    {editingKey === 'section_title' ? (
                        <div className="flex items-center gap-1.5 select-text" onClick={e => e.stopPropagation()}>
                            <input
                                type="text"
                                value={editingText}
                                onChange={e => setEditingText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveLabelDirect('section_title'); if (e.key === 'Escape') setEditingKey(null); }}
                                autoFocus
                                className="bg-white text-slate-900 px-2 py-0.5 text-xs rounded font-bold uppercase tracking-wider outline-none"
                            />
                            <button type="button" onClick={() => handleSaveLabelDirect('section_title')} className="p-1 text-emerald-400 hover:text-emerald-300">
                                <Check className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
                    )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[9px] font-normal transition-opacity">
                    <span className="bg-black/20 px-1.5 py-0.5 rounded text-[8px] flex items-center gap-1">
                        <Pencil className="w-2.5 h-2.5" /> Clic para renombrar
                    </span>
                </div>
            </div>

            {/* TABLA DE METADATOS INSTITUCIONALES */}
            <table className={`w-full text-left border-collapse ${tableBorderCss}`}>
                <tbody>
                    {sortedItems.map((it, idx) => it.render(idx === 0, idx === sortedItems.length - 1, allKeys))}
                </tbody>
            </table>

            {/* SUB-TABLA NORMATIVA: ORGANIZACIÓN DE APRENDIZAJES POR MODALIDAD */}
            <div className="mt-2">
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    Organización de aprendizajes por modalidad (Número de horas destinadas a cada componente)
                </div>
                <table className={`w-full text-center border-collapse ${tableBorderCss} text-[8px]`}>
                    <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black text-slate-800">
                            <th className={`p-1.5 ${cellBorderCss}`}>Total horas de contacto docente</th>
                            <th className={`p-1.5 ${cellBorderCss}`}>Total horas de aprendizaje experimental</th>
                            <th className={`p-1.5 ${cellBorderCss}`}>Total horas de práctico autónomo</th>
                            <th className={`p-1.5 ${cellBorderCss} bg-slate-200`}>Número de horas de la asignatura</th>
                            <th className="p-1.5 bg-indigo-50 text-indigo-900">Número de créditos</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white font-semibold text-slate-700">
                            <td className={`p-2 ${cellBorderCss}`}>[Completar]</td>
                            <td className={`p-2 ${cellBorderCss}`}>[Completar]</td>
                            <td className={`p-2 ${cellBorderCss}`}>[Completar]</td>
                            <td className={`p-2 font-bold text-slate-900 bg-slate-50 ${cellBorderCss}`}>[Completar]</td>
                            <td className="p-2 font-bold text-indigo-900 bg-indigo-50/40">[Completar]</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* BOTÓN RÁPIDO DE ALTA DIRECTA EN LIENZO */}
            <div className="mt-2 flex items-center justify-end">
                <button
                    type="button"
                    onClick={handleQuickAddField}
                    className="flex items-center gap-1 px-2 py-1 text-[8.5px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors cursor-pointer"
                >
                    <Plus className="w-3 h-3" /> Añadir Metadato Curricular
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// b) OBJETIVO DE LA ASIGNATURA Y c) PRERREQUISITOS
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaCharacterizationSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId: _blockId, onUpdateConfig: _onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'b) OBJETIVO DE LA ASIGNATURA Y c) PRERREQUISITOS';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center gap-2"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <Target className="w-4 h-4 shrink-0" />
                <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
            </div>

            <div className="border border-black divide-y divide-black text-[8.5px]">
                {/* b) OBJETIVO DE LA ASIGNATURA */}
                <div className="p-2.5">
                    <span className="font-bold uppercase text-slate-800 block mb-1">b) OBJETIVO DE LA ASIGNATURA:</span>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                        [Completar: Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.]
                    </p>
                </div>

                {/* c) PRERREQUISITOS */}
                <div className="p-2.5">
                    <span className="font-bold uppercase text-slate-800 block mb-1">c) PRERREQUISITOS:</span>
                    <table className="w-full text-left border-collapse border border-black text-[8px]">
                        <thead>
                            <tr className="bg-slate-100 font-bold border-b border-black text-slate-800">
                                <th className="p-1.5 border-r border-black w-1/2">Asignatura</th>
                                <th className="p-1.5 w-1/2">Observación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                            <tr className="bg-white">
                                <td className="p-2 border-r border-black font-semibold text-slate-700">[Completar]</td>
                                <td className="p-2 italic text-slate-600">[Completar]</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// d) RESULTADOS DE APRENDIZAJE DE LA CARRERA Y e) DE LA ASIGNATURA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaCompetenciesRdaSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId: _blockId, onUpdateConfig: _onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'd) RESULTADOS DE APRENDIZAJE DE LA CARRERA Y e) DE LA ASIGNATURA';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center gap-2"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <Award className="w-4 h-4 shrink-0" />
                <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
            </div>

            <div className="border border-black divide-y divide-black text-[8.5px]">
                {/* d) RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA */}
                <div className="p-2.5">
                    <span className="font-bold uppercase text-slate-800 block mb-1">
                        d) RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA:
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                        <li>[Completar: Resultado de aprendizaje del perfil de egreso de la carrera]</li>
                        <li>[Completar: Resultado de aprendizaje del perfil de egreso de la carrera]</li>
                        <li>[Completar: Resultado de aprendizaje del perfil de egreso de la carrera]</li>
                    </ol>
                </div>

                {/* e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA */}
                <div className="p-2.5">
                    <span className="font-bold uppercase text-slate-800 block mb-1">
                        e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                        <li>[Completar: Resultado formativo 1 - Nivel cognitivo y procedimental]</li>
                        <li>[Completar: Resultado formativo 2 - Aplicación técnica en entornos reales]</li>
                        <li>[Completar: Resultado formativo 3 - Análisis y resolución de casos técnicos]</li>
                        <li>[Completar: Resultado formativo 4 - Evaluación, innovación o síntesis profesional]</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// f) CONTENIDOS DE ENSEÑANZA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaContentsSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId: _blockId, onUpdateConfig: _onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'f) CONTENIDOS DE ENSEÑANZA';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    const unidades = [
        {
            num: 1,
            titulo: 'Unidad 1: [Completar]',
            horasTotal: '[Completar]',
            horasCD: '[Completar]',
            horasAPE: '[Completar]',
            horasTA: '[Completar]',
            contenidos: [
                '1. [Completar]',
                '2. [Completar]',
                '3. [Completar]',
                '4. [Completar]',
                '5. [Completar]',
                '6. [Completar]'
            ]
        },
        {
            num: 2,
            titulo: 'Unidad 2: [Completar]',
            horasTotal: '[Completar]',
            horasCD: '[Completar]',
            horasAPE: '[Completar]',
            horasTA: '[Completar]',
            contenidos: [
                '1. [Completar]',
                '2. [Completar]',
                '3. [Completar]',
                '4. [Completar]',
                '5. [Completar]',
                '6. [Completar]'
            ]
        },
        {
            num: 3,
            titulo: 'Unidad 3: [Completar]',
            horasTotal: '[Completar]',
            horasCD: '[Completar]',
            horasAPE: '[Completar]',
            horasTA: '[Completar]',
            contenidos: [
                '1. [Completar]',
                '2. [Completar]',
                '3. [Completar]',
                '4. [Completar]',
                '5. [Completar]'
            ]
        }
    ];

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center justify-between"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
                </div>
            </div>

            <div className="space-y-3">
                {unidades.map(u => (
                    <div key={u.num} className="border border-black text-[8.5px]">
                        <div className="bg-slate-100 font-bold p-1.5 border-b border-black text-slate-900 uppercase">
                            ### {u.num}. {u.titulo}
                        </div>
                        <table className="w-full text-left border-collapse border-b border-black text-[8px]">
                            <thead>
                                <tr className="bg-slate-50 font-bold border-b border-black text-slate-800">
                                    <th className="p-1 border-r border-black w-2/3">Campo</th>
                                    <th className="p-1 w-1/3">Número de horas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                                <tr>
                                    <td className="p-1 border-r border-black font-semibold">Total de horas por unidad</td>
                                    <td className="p-1">{u.horasTotal}</td>
                                </tr>
                                <tr>
                                    <td className="p-1 border-r border-black">Horas de contacto con el docente</td>
                                    <td className="p-1">{u.horasCD}</td>
                                </tr>
                                <tr>
                                    <td className="p-1 border-r border-black">Horas de práctico-experimental</td>
                                    <td className="p-1">{u.horasAPE}</td>
                                </tr>
                                <tr>
                                    <td className="p-1 border-r border-black">Horas de aprendizaje autónomo</td>
                                    <td className="p-1">{u.horasTA}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="p-2 bg-white">
                            <span className="font-bold uppercase text-slate-800 block mb-1 text-[8px]">
                                Unidades de estudio y sus contenidos:
                            </span>
                            <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 text-[8px]">
                                {u.contenidos.map((c, idx) => (
                                    <li key={idx} className="italic text-slate-600">{c}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// g) METODOLOGÍA DE ENSEÑANZA Y RECURSOS DIDÁCTICOS
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaMethodologySection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId: _blockId, onUpdateConfig: _onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'g) METODOLOGÍA DE ENSEÑANZA Y RECURSOS DIDÁCTICOS';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center gap-2"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
            </div>

            <div className="border border-black divide-y divide-black text-[8.5px]">
                {/* ESTRATEGIAS METODOLÓGICAS */}
                <div className="p-2.5">
                    <span className="font-bold uppercase text-slate-800 block mb-1">Estrategias metodológicas:</span>
                    <blockquote className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 italic mb-2">
                        «En la propuesta pedagógica establecida en el Modelo Educativo del ISTPET se tiene la sig. metodología»
                    </blockquote>
                    <p className="text-slate-600 italic bg-white p-2 rounded border border-dashed border-slate-300">
                        [Completar: Descripción metodológica, aprendizaje basado en problemas, proyectos formativos y actividades colaborativas.]
                    </p>
                </div>

                {/* RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE */}
                <div className="p-2.5">
                    <span className="font-bold uppercase text-slate-800 block mb-1">Recursos didácticos / Informatización del aprendizaje:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        <li>Simuladores/realidad virtual: N/A.</li>
                        <li>Presentaciones de la asignatura.</li>
                        <li>Videos educativos.</li>
                        <li>Herramientas digitales: Kahoot!, Quizizz, Padlet, Socrative.</li>
                        <li>Entorno Virtual de Aprendizaje - Módulo Cuestionarios.</li>
                        <li>Documentos digitales independientes (PDF).</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// h) ACTIVIDADES PRÁCTICAS
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaResourcesSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId: _blockId, onUpdateConfig: _onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'h) ACTIVIDADES PRÁCTICAS';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center gap-2"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
            </div>

            <table className="w-full text-left border-collapse border border-black text-[8px]">
                <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black text-slate-800">
                        <th className="p-1.5 border-r border-black w-[25%]">Unidad</th>
                        <th className="p-1.5">Nombre de la práctica y caracterización de la actividad</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black text-slate-700">
                    <tr className="bg-white">
                        <td className="p-2 border-r border-black font-semibold text-slate-800">[Completar]</td>
                        <td className="p-2 italic text-slate-600">[Completar]</td>
                    </tr>
                    <tr className="bg-white">
                        <td className="p-2 border-r border-black font-semibold text-slate-800">[Completar]</td>
                        <td className="p-2 italic text-slate-600">[Completar]</td>
                    </tr>
                    <tr className="bg-white">
                        <td className="p-2 border-r border-black font-semibold text-slate-800">[Completar]</td>
                        <td className="p-2 italic text-slate-600">[Completar]</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// i) EVALUACIÓN DEL APRENDIZAJE
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaEvaluationSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId: _blockId, onUpdateConfig: _onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'i) EVALUACIÓN DEL APRENDIZAJE';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center gap-2"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
            </div>

            <table className="w-full text-left border-collapse border border-black text-[8px]">
                <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black text-slate-800">
                        <th className="p-1.5 border-r border-black w-[25%]">Notas</th>
                        <th className="p-1.5 border-r border-black w-[55%]">Tipo de evaluación</th>
                        <th className="p-1.5 text-center w-[20%]">Calificación</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black text-slate-700">
                    <tr className="bg-white">
                        <td className="p-2 border-r border-black font-semibold text-slate-900">Nota parcial 1</td>
                        <td className="p-2 border-r border-black">Actividades autónomas y práctico-experimentales (frecuentes)</td>
                        <td className="p-2 text-center font-bold text-slate-900">10</td>
                    </tr>
                    <tr className="bg-white">
                        <td className="p-2 border-r border-black font-semibold text-slate-900">Nota parcial 2</td>
                        <td className="p-2 border-r border-black">Evaluaciones sumativas de las unidades de estudio (parcial)</td>
                        <td className="p-2 text-center font-bold text-slate-900">10</td>
                    </tr>
                    <tr className="bg-white">
                        <td className="p-2 border-r border-black font-semibold text-slate-900">Evaluación final</td>
                        <td className="p-2 border-r border-black">Evaluación final de la asignatura (examen)</td>
                        <td className="p-2 text-center font-bold text-slate-900">10</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// j) BIBLIOGRAFÍA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaBibliographySection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId: _blockId, onUpdateConfig: _onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'j) BIBLIOGRAFÍA';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center gap-2"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <Library className="w-4 h-4 shrink-0" />
                <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
            </div>

            <div className="border border-black divide-y divide-black text-[8.5px]">
                <div className="p-2.5">
                    <span className="font-bold uppercase text-slate-800 block mb-1">Bibliografía básica:</span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                        <li>[Completar: Libro de texto base o guía oficial de la asignatura según normas APA 7ma edición]</li>
                        <li>[Completar: Texto de referencia institucional / Biblioteca virtual]</li>
                        <li>[Completar: Texto normativo o manual técnico aplicable]</li>
                    </ol>
                </div>
                <div className="p-2.5">
                    <span className="font-bold uppercase text-slate-800 block mb-1">Bibliografía de consulta:</span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                        <li>[Completar: Artículo científico o libro de consulta complementario]</li>
                        <li>[Completar: Recurso digital indexado o documentación técnica especializada]</li>
                        <li>[Completar: Base de datos académica o repositorio institucional]</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// k) FIRMAS DE RESPONSABILIDAD
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaSignaturesSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId: _blockId, onUpdateConfig: _onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'k) FIRMAS DE RESPONSABILIDAD';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1.5 px-3 mb-1 flex items-center justify-between"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[7.5px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                    Ley de Comercio Electrónico y Firmas Digitales
                </span>
            </div>

            <div className="grid grid-cols-4 border border-black divide-x divide-black text-center text-[7.5px]">
                {/* 1. ELABORADO (DOCENTE) */}
                <div className="p-2 flex flex-col justify-between h-[115px] bg-white">
                    <p className="font-bold uppercase text-slate-800">ELABORADO:</p>
                    <div className="my-auto py-1">
                        <div className="border border-dashed border-slate-300 rounded p-1 bg-slate-50 text-[7px] text-slate-500">
                            [Firma Digital]
                            <br />
                            <span className="font-semibold text-slate-700">[Completar]</span>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-1 text-[7px]">
                        <p className="font-bold text-slate-900">Cargo: Docente</p>
                        <p className="text-slate-500">Fecha: [Completar]</p>
                    </div>
                </div>

                {/* 2. REVISADO (COORDINADOR DE CARRERA) */}
                <div className="p-2 flex flex-col justify-between h-[115px] bg-white">
                    <p className="font-bold uppercase text-slate-800">REVISADO:</p>
                    <div className="my-auto py-1">
                        <div className="border border-dashed border-slate-300 rounded p-1 bg-slate-50 text-[7px] text-slate-500">
                            [Firma Digital]
                            <br />
                            <span className="font-semibold text-slate-700">[Completar]</span>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-1 text-[7px]">
                        <p className="font-bold text-slate-900">Cargo: Coordinador de Carrera</p>
                        <p className="text-slate-500">Fecha: [Completar]</p>
                    </div>
                </div>

                {/* 3. REVISADO (COORDINADOR ACADÉMICO) */}
                <div className="p-2 flex flex-col justify-between h-[115px] bg-white">
                    <p className="font-bold uppercase text-slate-800">REVISADO:</p>
                    <div className="my-auto py-1">
                        <div className="border border-dashed border-slate-300 rounded p-1 bg-slate-50 text-[7px] text-slate-500">
                            [Firma Digital]
                            <br />
                            <span className="font-semibold text-slate-700">[Completar]</span>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-1 text-[7px]">
                        <p className="font-bold text-slate-900">Cargo: Coordinador Académico</p>
                        <p className="text-slate-500">Fecha: [Completar]</p>
                    </div>
                </div>

                {/* 4. APROBADO (VICERRECTORADO) */}
                <div className="p-2 flex flex-col justify-between h-[115px] bg-white">
                    <p className="font-bold uppercase text-slate-800">APROBADO:</p>
                    <div className="my-auto py-1">
                        <div className="border border-dashed border-slate-300 rounded p-1 bg-slate-50 text-[7px] text-slate-500">
                            [Firma Digital]
                            <br />
                            <span className="font-semibold text-slate-700">[Completar]</span>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-1 text-[7px]">
                        <p className="font-bold text-slate-900">Cargo: Vicerrectorado</p>
                        <p className="text-slate-500">Fecha: [Completar]</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
