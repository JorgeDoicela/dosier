/**
 * @file RenderInformeAcompDatosInformativos.tsx
 * @description 1. DATOS INFORMATIVOS del Informe de Acompañamiento Académico de Carrera 2026.
 * Renderizador interactivo y fiel al formato oficial institucional ISTPET.
 */

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

export interface InformeAcompBlockProps {
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}

export const RenderInformeAcompDatosInformativos: React.FC<InformeAcompBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};

    const documentTitle = c.informeTitulo || 'INFORME DE ACOMPAÑAMIENTO ACADÉMICO DE CARRERA';
    const sectionTitle = c.sectionTitle || title || '1.  Datos informativos:';

    const [isEditing, setIsEditing] = useState(false);
    const [draftTitle, setDraftTitle] = useState(documentTitle);
    const [coordinador, setCoordinador] = useState(c.informeCoordinador || '');
    const [carrera, setCarrera] = useState(c.informeCarrera || '');
    const [periodo, setPeriodo] = useState(c.informePeriodo || '');
    const [parcial, setParcial] = useState(c.informeParcial || 'Parcial 1/ Modular');
    const [reportaA, setReportaA] = useState(c.informeReportaA || 'UNIDAD ACADÉMICA');
    const [fechaPresentacion, setFechaPresentacion] = useState(c.informeFechaPresentacion || '');

    const handleSave = () => {
        if (!blockId || !onUpdateConfig) return;
        onUpdateConfig(blockId, 'informeTitulo', draftTitle);
        onUpdateConfig(blockId, 'informeCoordinador', coordinador);
        onUpdateConfig(blockId, 'informeCarrera', carrera);
        onUpdateConfig(blockId, 'informePeriodo', periodo);
        onUpdateConfig(blockId, 'informeParcial', parcial);
        onUpdateConfig(blockId, 'informeReportaA', reportaA);
        onUpdateConfig(blockId, 'informeFechaPresentacion', fechaPresentacion);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setDraftTitle(documentTitle);
        setCoordinador(c.informeCoordinador || '');
        setCarrera(c.informeCarrera || '');
        setPeriodo(c.informePeriodo || '');
        setParcial(c.informeParcial || 'Parcial 1/ Modular');
        setReportaA(c.informeReportaA || 'UNIDAD ACADÉMICA');
        setFechaPresentacion(c.informeFechaPresentacion || '');
        setIsEditing(false);
    };

    return (
        <div className="w-full bg-white text-slate-900 font-sans text-sm">
            {/* Cabecera del bloque con acción de edición */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Bloque 1 · Datos Informativos Oficiales
                </span>
                {!isEditing ? (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar Datos
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0070f3] hover:bg-blue-600 rounded transition-colors shadow-sm"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            {/* Título Principal Centrado */}
            <div className="text-center my-4">
                {isEditing ? (
                    <input
                        type="text"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="w-full text-center text-base font-bold text-slate-950 uppercase border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="INFORME DE ACOMPAÑAMIENTO ACADÉMICO DE CARRERA"
                    />
                ) : (
                    <h1 className="text-base font-bold uppercase tracking-tight text-black">
                        {draftTitle}
                    </h1>
                )}
            </div>

            {/* Subtítulo Sección 1 */}
            <div className="mb-3">
                <h2 className="text-sm font-bold text-black">
                    {sectionTitle}
                </h2>
            </div>

            {/* Lista viñeteada de datos informativos */}
            <ul className="space-y-2 pl-4 list-disc marker:text-black">
                <li className="text-sm">
                    <span className="font-semibold text-black">Nombre del coordinador: </span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={coordinador}
                            onChange={(e) => setCoordinador(e.target.value)}
                            placeholder="Nombre y apellido del coordinador"
                            className="ml-2 px-2 py-0.5 border border-slate-300 rounded text-sm w-72 focus:outline-none focus:border-blue-500"
                        />
                    ) : (
                        <span className="text-slate-800">{coordinador || '_______________________________________'}</span>
                    )}
                </li>

                <li className="text-sm">
                    <span className="font-semibold text-black">Carrera: </span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={carrera}
                            onChange={(e) => setCarrera(e.target.value)}
                            placeholder="Carrera institucional"
                            className="ml-2 px-2 py-0.5 border border-slate-300 rounded text-sm w-72 focus:outline-none focus:border-blue-500"
                        />
                    ) : (
                        <span className="text-slate-800">{carrera || '_______________________________________'}</span>
                    )}
                </li>

                <li className="text-sm">
                    <span className="font-semibold text-black">Periodo académico: </span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={periodo}
                            onChange={(e) => setPeriodo(e.target.value)}
                            placeholder="Ej. ABRIL - SEPTIEMBRE 2026"
                            className="ml-2 px-2 py-0.5 border border-slate-300 rounded text-sm w-64 focus:outline-none focus:border-blue-500"
                        />
                    ) : (
                        <span className="text-slate-800">{periodo || '_______________________________________'}</span>
                    )}
                </li>

                <li className="text-sm">
                    <span className="font-semibold text-black">Parcial: </span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={parcial}
                            onChange={(e) => setParcial(e.target.value)}
                            placeholder="Parcial 1/ Modular"
                            className="ml-2 px-2 py-0.5 border border-red-300 text-red-600 font-semibold rounded text-sm w-56 focus:outline-none focus:border-red-500"
                        />
                    ) : (
                        <span className="font-bold text-red-600">{parcial || 'Parcial 1/ Modular'}</span>
                    )}
                </li>

                <li className="text-sm">
                    <span className="font-semibold text-black">Reporta a: </span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={reportaA}
                            onChange={(e) => setReportaA(e.target.value)}
                            placeholder="UNIDAD ACADÉMICA"
                            className="ml-2 px-2 py-0.5 border border-slate-300 rounded text-sm w-64 focus:outline-none focus:border-blue-500 uppercase"
                        />
                    ) : (
                        <span className="font-semibold text-black uppercase">{reportaA || 'UNIDAD ACADÉMICA'}</span>
                    )}
                </li>

                <li className="text-sm">
                    <span className="font-semibold text-black">Fecha de presentación del informe: </span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={fechaPresentacion}
                            onChange={(e) => setFechaPresentacion(e.target.value)}
                            placeholder="Ej. 18 de Noviembre de 2026"
                            className="ml-2 px-2 py-0.5 border border-slate-300 rounded text-sm w-64 focus:outline-none focus:border-blue-500"
                        />
                    ) : (
                        <span className="text-slate-800">{fechaPresentacion || '_______________________________________'}</span>
                    )}
                </li>
            </ul>
        </div>
    );
};
