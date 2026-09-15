import React from 'react';
import { GraduationCap, Clock, BookOpen, Layers, UserCheck } from 'lucide-react';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

interface PeaGeneralSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaGeneralSection: React.FC<PeaGeneralSectionProps> = ({
    formData,
    cowork,
    onUpdate,
    readOnly = false,
    config
}) => {
    const c = config || {};
    const displayTitle = c.title || 'a) DATOS GENERALES DE LA ASIGNATURA';
    const defaultHeaderBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const borderStyle = c.borderStyle || 'solid';
    const isNoBorder = borderStyle === 'none';

    const tableBorderCss = isNoBorder ? 'border-0' : 'border border-border-thin';
    const cellBorderCss = isNoBorder ? 'border-b border-border-thin' : 'border-r border-border-thin';
    const rowBorderCss = 'border-b border-border-thin';

    const resolveBg = (variant?: string) => {
        if (variant === 'banner_gold') return '#c4a857';
        if (variant === 'banner_emerald') return '#065f46';
        if (variant === 'banner_navy') return '#1e2a4a';
        if (variant && (variant.startsWith('#') || variant.startsWith('rgb') || variant.startsWith('hsl'))) return variant;
        return defaultHeaderBg;
    };

    const customFields: any[] = Array.isArray(c.customFields) ? c.customFields : [];
    const items: { id: string; render: () => React.ReactNode }[] = [];

    // 1. ASIGNATURA
    if (c.showAsignatura !== false) {
        const variant = c.variant_showAsignatura || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);
        const label = c.customLabel_showAsignatura || 'Nombre de la Asignatura';

        items.push({
            id: 'showAsignatura',
            render: () => (
                <tr key="showAsignatura" className={rowBorderCss}>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[28%]`} style={{ backgroundColor: bg, color: fg }}>
                        <span>{label}:</span>
                    </td>
                    <td colSpan={3} className="p-2.5 bg-surface align-middle">
                        <CoWorkField
                            name="NombreAsignatura"
                            cowork={cowork}
                            type="text"
                            placeholder="Nombre de la asignatura (ej. Programación Web Avanzada)"
                            readOnly={readOnly}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-1.5 text-xs text-text-main font-semibold outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('NombreAsignatura', val)}
                        />
                    </td>
                </tr>
            )
        });
    }

    // 2. CARRERA Y CÓDIGO
    if (c.showCarrera !== false) {
        const variant = c.variant_showCarrera || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);
        const labelCarrera = c.customLabel_showCarrera || 'Carrera Institucional';

        items.push({
            id: 'showCarrera',
            render: () => (
                <tr key="showCarrera" className={rowBorderCss}>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[28%]`} style={{ backgroundColor: bg, color: fg }}>
                        <span>{labelCarrera}:</span>
                    </td>
                    <td className={`p-2.5 bg-surface align-middle ${cellBorderCss}`}>
                        <CoWorkField
                            name="Carrera"
                            cowork={cowork}
                            type="text"
                            placeholder="Carrera a la que pertenece"
                            readOnly={readOnly}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-1.5 text-xs text-text-main font-medium outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('Carrera', val)}
                        />
                    </td>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[18%]`} style={{ backgroundColor: bg, color: fg }}>
                        CÓDIGO:
                    </td>
                    <td className="p-2.5 bg-surface align-middle">
                        <CoWorkField
                            name="CodigoAsignatura"
                            cowork={cowork}
                            type="text"
                            placeholder="Código normado (ej. DS-301)"
                            readOnly={readOnly}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-1.5 text-xs text-text-main font-mono outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('CodigoAsignatura', val)}
                        />
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

        items.push({
            id: 'showNivelModalidad',
            render: () => (
                <tr key="showNivelModalidad" className={rowBorderCss}>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[28%]`} style={{ backgroundColor: bg, color: fg }}>
                        <span>SEMESTRE / NIVEL:</span>
                    </td>
                    <td className={`p-2.5 bg-surface align-middle ${cellBorderCss}`}>
                        <CoWorkField
                            name="Nivel"
                            cowork={cowork}
                            type="text"
                            placeholder="Ej. Tercer Semestre"
                            readOnly={readOnly}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-1.5 text-xs text-text-main font-medium outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('Nivel', val)}
                        />
                    </td>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[18%]`} style={{ backgroundColor: bg, color: fg }}>
                        MODALIDAD:
                    </td>
                    <td className="p-2.5 bg-surface align-middle">
                        <CoWorkField
                            name="Modalidad"
                            cowork={cowork}
                            type="select"
                            options={[
                                { value: 'Presencial', label: 'Presencial' },
                                { value: 'Semipresencial', label: 'Semipresencial' },
                                { value: 'En Línea', label: 'En Línea' },
                                { value: 'Híbrida', label: 'Híbrida' },
                                { value: 'Dual', label: 'Dual' }
                            ]}
                            readOnly={readOnly}
                            onValueChange={(val) => onUpdate('Modalidad', val)}
                        />
                    </td>
                </tr>
            )
        });
    }

    // 4. UNIDAD DE ORGANIZACIÓN CURRICULAR
    if (c.showUnidadOrg !== false) {
        const variant = c.variant_showUnidadOrg || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);

        items.push({
            id: 'showUnidadOrg',
            render: () => (
                <tr key="showUnidadOrg" className={rowBorderCss}>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[28%]`} style={{ backgroundColor: bg, color: fg }}>
                        <span>UNIDAD DE ORGANIZACIÓN:</span>
                    </td>
                    <td className={`p-2.5 bg-surface align-middle ${cellBorderCss}`}>
                        <CoWorkField
                            name="UnidadOrganizacion"
                            cowork={cowork}
                            type="select"
                            options={[
                                { value: 'Unidad Básica', label: 'Unidad Básica' },
                                { value: 'Unidad Profesional', label: 'Unidad Profesional' },
                                { value: 'Unidad de Integración Curricular', label: 'Unidad de Integración Curricular' }
                            ]}
                            readOnly={readOnly}
                            onValueChange={(val) => onUpdate('UnidadOrganizacion', val)}
                        />
                    </td>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[18%]`} style={{ backgroundColor: bg, color: fg }}>
                        PERÍODO:
                    </td>
                    <td className="p-2.5 bg-surface align-middle">
                        <CoWorkField
                            name="Periodo"
                            cowork={cowork}
                            type="text"
                            placeholder="Ej. OCTUBRE 2025 - MARZO 2026"
                            readOnly={readOnly}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-1.5 text-xs text-text-main font-medium outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('Periodo', val)}
                        />
                    </td>
                </tr>
            )
        });
    }

    // 5. DOCENTE RESPONSABLE
    if (c.showDocente !== false) {
        const variant = c.variant_showDocente || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);

        items.push({
            id: 'showDocente',
            render: () => (
                <tr key="showDocente" className={rowBorderCss}>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[28%]`} style={{ backgroundColor: bg, color: fg }}>
                        <span>DOCENTE RESPONSABLE:</span>
                    </td>
                    <td colSpan={3} className="p-2.5 bg-surface align-middle">
                        <CoWorkField
                            name="DocenteElaborador"
                            cowork={cowork}
                            type="text"
                            placeholder="Nombre del docente titular responsable"
                            readOnly={readOnly}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-1.5 text-xs text-text-main font-semibold outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('DocenteElaborador', val)}
                        />
                    </td>
                </tr>
            )
        });
    }

    // CAMPOS CUSTOM DEFINIDOS EN EL EDITOR DE PLANTILLAS
    customFields.forEach((f) => {
        const fieldKey = f.fieldKey || f.id;
        const variant = f.variant || 'standard';
        const bg = resolveBg(variant);
        const fg = getContrastFg(bg);

        items.push({
            id: fieldKey,
            render: () => (
                <tr key={fieldKey} className={rowBorderCss}>
                    <td className={`p-2.5 font-bold text-[10px] uppercase ${cellBorderCss} align-middle w-[28%]`} style={{ backgroundColor: bg, color: fg }}>
                        <span>{f.label}:</span>
                    </td>
                    <td colSpan={3} className="p-2.5 bg-surface align-middle">
                        <CoWorkField
                            name={fieldKey}
                            cowork={cowork}
                            type="text"
                            placeholder={f.placeholder || `Ingrese ${f.label}`}
                            readOnly={readOnly}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-1.5 text-xs text-text-main outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate(fieldKey, val)}
                        />
                    </td>
                </tr>
            )
        });
    });

    // Ordenamiento dinámico según fieldsOrder de la plantilla
    const fieldsOrder: string[] = Array.isArray(c.fieldsOrder) ? c.fieldsOrder : [];
    const sortedItems = [...items].sort((a, b) => {
        const idxA = fieldsOrder.indexOf(a.id);
        const idxB = fieldsOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
    });

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            {/* ENCABEZADO DE SECCIÓN RESPETANDO CONFIGURACIÓN */}
            <div
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between shadow-xs"
                style={{ backgroundColor: defaultHeaderBg, color: getContrastFg(defaultHeaderBg) }}
            >
                <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    PEA Normado RRA Art. 21
                </span>
            </div>

            {/* TABLA PRINCIPAL DE METADATOS */}
            <div className={`overflow-hidden rounded-xl bg-surface ${tableBorderCss} shadow-xs`}>
                <table className="w-full text-left border-collapse">
                    <tbody>
                        {sortedItems.map((item) => item.render())}
                    </tbody>
                </table>
            </div>

            {/* SUB-TABLA NORMATIVA: ORGANIZACIÓN DE APRENDIZAJES Y CARGA HORARIA */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-text-dim px-1">
                    <Clock className="w-3.5 h-3.5 text-brand" />
                    <span>Organización de aprendizajes por modalidad (Horas normadas de la asignatura)</span>
                </div>

                <div className={`overflow-x-auto rounded-xl bg-surface ${tableBorderCss} shadow-xs`}>
                    <table className="w-full text-center border-collapse text-xs">
                        <thead>
                            <tr className="bg-bg-deep font-bold border-b border-border-thin text-text-dim text-[10px] uppercase tracking-wider">
                                <th className={`p-3 ${cellBorderCss}`}>Contacto Docente (CD)</th>
                                <th className={`p-3 ${cellBorderCss}`}>Práctico Experimental (APE)</th>
                                <th className={`p-3 ${cellBorderCss}`}>Trabajo Autónomo (TA)</th>
                                <th className={`p-3 ${cellBorderCss} bg-brand/5 text-brand font-black`}>Total Horas Asignatura</th>
                                <th className="p-3 bg-brand/10 text-brand font-black">Número de Créditos</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-surface">
                                <td className={`p-2.5 ${cellBorderCss}`}>
                                    <CoWorkField
                                        name="HorasContactoDocente"
                                        cowork={cowork}
                                        type="text"
                                        placeholder="0"
                                        readOnly={readOnly}
                                        className="w-full text-center font-bold text-text-main bg-bg-deep border border-border-thin rounded-lg py-1.5 text-xs outline-none focus:border-brand"
                                        onValueChange={(val) => onUpdate('HorasContactoDocente', Number(val) || 0)}
                                    />
                                </td>
                                <td className={`p-2.5 ${cellBorderCss}`}>
                                    <CoWorkField
                                        name="HorasPracticoExperimental"
                                        cowork={cowork}
                                        type="text"
                                        placeholder="0"
                                        readOnly={readOnly}
                                        className="w-full text-center font-bold text-text-main bg-bg-deep border border-border-thin rounded-lg py-1.5 text-xs outline-none focus:border-brand"
                                        onValueChange={(val) => onUpdate('HorasPracticoExperimental', Number(val) || 0)}
                                    />
                                </td>
                                <td className={`p-2.5 ${cellBorderCss}`}>
                                    <CoWorkField
                                        name="HorasAutonomo"
                                        cowork={cowork}
                                        type="text"
                                        placeholder="0"
                                        readOnly={readOnly}
                                        className="w-full text-center font-bold text-text-main bg-bg-deep border border-border-thin rounded-lg py-1.5 text-xs outline-none focus:border-brand"
                                        onValueChange={(val) => onUpdate('HorasAutonomo', Number(val) || 0)}
                                    />
                                </td>
                                <td className={`p-2.5 ${cellBorderCss} bg-brand/5`}>
                                    <CoWorkField
                                        name="TotalHorasAsignatura"
                                        cowork={cowork}
                                        type="text"
                                        placeholder="0"
                                        readOnly={readOnly}
                                        className="w-full text-center font-black text-brand bg-surface border border-brand/30 rounded-lg py-1.5 text-sm outline-none focus:border-brand"
                                        onValueChange={(val) => onUpdate('TotalHorasAsignatura', Number(val) || 0)}
                                    />
                                </td>
                                <td className="p-2.5 bg-brand/10">
                                    <CoWorkField
                                        name="Creditos"
                                        cowork={cowork}
                                        type="text"
                                        placeholder="0"
                                        readOnly={readOnly}
                                        className="w-full text-center font-black text-brand bg-surface border border-brand/30 rounded-lg py-1.5 text-sm outline-none focus:border-brand"
                                        onValueChange={(val) => onUpdate('Creditos', Number(val) || 0)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
