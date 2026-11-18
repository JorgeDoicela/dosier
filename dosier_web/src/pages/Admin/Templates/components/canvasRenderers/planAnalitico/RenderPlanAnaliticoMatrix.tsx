/**
 * @file RenderPlanAnaliticoMatrix.tsx
 * @description 4. METODOLOGÍA, CONTENIDOS, RESULTADOS DE APRENDIZAJE del Formato Plan Analítico 2026.
 * Matriz curricular de 19 semanas con desglose de Organización del Aprendizaje (Docencia, Práctico, Autónomo),
 * distribución de horas, RDAs y evaluaciones parciales/finales.
 */

import React, { useState } from 'react';
import { Pencil, Check, X, Plus, Trash2, Award } from 'lucide-react';
import { resolveHeaderColor } from '../../properties/SharedColorPicker';
import type { PlanAnaliticoBlockProps } from './RenderPlanAnaliticoGeneral';

export interface MatrixThemeRow {
    id: string;
    tema: string;
    semana: string | number;
    docencia: string;
    practico: string;
    autonomo: string;
    rdaId: string;
    calificacion: string;
    isEvaluation?: boolean;
    evalCode?: string;
}

export interface MatrixUnit {
    id: string;
    unitNumber: number;
    unitTitle: string;
    sectionTitle: string;
    rows: MatrixThemeRow[];
}

interface HoursConfig {
    docenciaHoras: string | number;
    practicoHoras: string | number;
    autonomoHoras: string | number;
    totalHoras: string | number;
    docenciaSemana: string | number;
    practicoSemana: string | number;
    autonomoSemana: string | number;
}

const DEFAULT_HOURS: HoursConfig = {
    docenciaHoras: '64',
    practicoHoras: '32',
    autonomoHoras: '64',
    totalHoras: '160',
    docenciaSemana: '4',
    practicoSemana: '2',
    autonomoSemana: '4'
};

const DEFAULT_UNITS: MatrixUnit[] = [
    {
        id: 'unit-1',
        unitNumber: 1,
        unitTitle: 'UNIDAD 1.',
        sectionTitle: 'ACTIVIDADES Y ESTRATEGIAS DE APRENDIZAJE',
        rows: [
            { id: 'u1-t1', tema: 'Tema 1: Fundamentos teóricos y normativos', semana: '1', docencia: 'Clase magistral interactiva y formulación de casos.', practico: 'Configuración inicial de entorno de desarrollo.', autonomo: 'Lectura comprensiva de la guía conceptual.', rdaId: '1', calificacion: '' },
            { id: 'u1-t2', tema: 'Tema 2: Modelado arquitectónico conceptual', semana: '2', docencia: 'Taller guiado de diagramación de procesos.', practico: 'Diseño estructurado de casos de uso.', autonomo: 'Resolución de cuestionario en plataforma.', rdaId: '1', calificacion: '' },
            { id: 'u1-t3', tema: 'Tema 3: Análisis de requerimientos funcionales', semana: '3', docencia: 'Método de casos y debate en grupos pequeños.', practico: 'Elaboración de matriz de especificación técnica.', autonomo: 'Redacción de informe técnico preliminar.', rdaId: '1', calificacion: '' },
            { id: 'u1-t4', tema: 'Tema 4: Validación y prototipado rápido', semana: '4', docencia: 'Demostración práctica orientada a resultados.', practico: 'Construcción de prototipo funcional interactivo.', autonomo: 'Preparación de entrega de avance.', rdaId: '1', calificacion: '' },
            { id: 'u1-t5', tema: 'Tema 5: Integración de componentes iniciales', semana: '5', docencia: 'Aprendizaje Basado en Problemas (ABP).', practico: 'Pruebas de conectividad y despliegue local.', autonomo: 'Revisión bibliográfica institucional.', rdaId: '1', calificacion: '' },
            { id: 'u1-t6', tema: 'Tema 6: Criterios de calidad e integridad', semana: '6', docencia: 'Exposición dialogada y análisis crítico.', practico: 'Inspección de código y validación estática.', autonomo: 'Ajuste de observaciones formativas.', rdaId: '1', calificacion: '' },
            { id: 'u1-t7', tema: 'Tema 7: Revisión de avance y retroalimentación', semana: '7', docencia: 'Sesión de retroalimentación individual y grupal.', practico: 'Alineación de entregables y rúbrica.', autonomo: 'Consolidación de evidencias de aprendizaje.', rdaId: '1', calificacion: '' },
            { id: 'u1-t8', tema: 'Tema 8: Consolidación formativa del parcial', semana: '8', docencia: 'Síntesis conceptual y resolución de dudas.', practico: 'Simulación experimental de evaluación.', autonomo: 'Estudio autónomo previo al examen.', rdaId: '1', calificacion: '' },
            { id: 'u1-eval1', tema: 'Evaluación Primer Parcial', semana: '9', docencia: '', practico: '', autonomo: 'E.1', rdaId: '1', calificacion: 'E.1:', isEvaluation: true, evalCode: 'E.1' }
        ]
    },
    {
        id: 'unit-2',
        unitNumber: 2,
        unitTitle: 'UNIDAD 2.',
        sectionTitle: 'ACTIVIDADES Y ESTRATEGIAS DE APRENDIZAJE',
        rows: [
            { id: 'u2-t9', tema: 'Tema 9: Desarrollo técnico avanzado y servicios', semana: '10', docencia: 'Clase interactiva sobre patrones de diseño.', practico: 'Implementación de servicios RESTful.', autonomo: 'Lectura de estándares RFC institucionales.', rdaId: '2', calificacion: '' },
            { id: 'u2-t10', tema: 'Tema 10: Persistencia de datos y transaccionalidad', semana: '11', docencia: 'Taller de optimización de consultas SQL.', practico: 'Modelado y migración de base de datos.', autonomo: 'Ejercicios prácticos en repositorio.', rdaId: '2', calificacion: '' },
            { id: 'u2-t11', tema: 'Tema 11: Seguridad, autenticación y RBAC', semana: '12', docencia: 'Análisis de vulnerabilidades comunes OWASP.', practico: 'Configuración de JWT y control de acceso.', autonomo: 'Reporte de pruebas de penetración.', rdaId: '2', calificacion: '' },
            { id: 'u2-t12', tema: 'Tema 12: Pruebas unitarias e integración continua', semana: '13', docencia: 'Demostración de testing automatizado.', practico: 'Desarrollo de suite de pruebas unitarias.', autonomo: 'Documentación técnica de cobertura.', rdaId: '2', calificacion: '' },
            { id: 'u2-t13', tema: 'Tema 13: Despliegue en entornos productivos', semana: '14', docencia: 'Principios de DevOps y contenedores.', practico: 'Despliegue contenerizado en servidor.', autonomo: 'Configuración de variables de entorno.', rdaId: '2', calificacion: '' }
        ]
    },
    {
        id: 'unit-3',
        unitNumber: 3,
        unitTitle: 'UNIDAD 3.',
        sectionTitle: 'ACTIVIDADES Y ESTRATEGIAS DE APRENDIZAJE',
        rows: [
            { id: 'u3-t14', tema: 'Tema 14: Integración del proyecto integrador', semana: '15', docencia: 'Acompañamiento tutorial de proyecto.', practico: 'Integración frontend y backend completa.', autonomo: 'Redacción del artículo / memoria técnica.', rdaId: '3', calificacion: '' },
            { id: 'u3-t15', tema: 'Tema 15: Pruebas de carga y auditoría de calidad', semana: '16', docencia: 'Evaluación de rendimiento y buenas prácticas.', practico: 'Ejecución de auditorías de rendimiento.', autonomo: 'Corrección de observaciones del tutor.', rdaId: '3', calificacion: '' },
            { id: 'u3-t16', tema: 'Tema 16: Preparación de sustentación técnica', semana: '17', docencia: 'Pautas de comunicación técnica y defensa.', practico: 'Simulación de defensa oral con rúbrica.', autonomo: 'Preparación de diapositivas y demo.', rdaId: '3', calificacion: '' },
            { id: 'u3-t17', tema: 'Tema 17: Sustentación y cierre de cátedra', semana: '18', docencia: 'Jornada colegiada de sustentación.', practico: 'Demostración del software en vivo.', autonomo: 'Entrega final del repositorio oficial.', rdaId: '3', calificacion: '' },
            { id: 'u3-eval2', tema: 'Evaluación Segundo Parcial', semana: '18', docencia: '', practico: '', autonomo: 'E2.', rdaId: '2', calificacion: 'E.2:', isEvaluation: true, evalCode: 'E.2' },
            { id: 'u3-eval3', tema: 'Evaluación Final', semana: '19', docencia: '', practico: '', autonomo: 'E3.', rdaId: '3', calificacion: 'E.3:', isEvaluation: true, evalCode: 'E.3' }
        ]
    }
];

export const RenderPlanAnaliticoMatrix: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.title || title || '4.  METODOLOGÍA, CONTENIDOS, RESULTADOS DE APRENDIZAJE';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const weeksLabel = c.weeksLabel || '19 SEMANAS';

    const units: MatrixUnit[] = c.units && Array.isArray(c.units) && c.units.length > 0
        ? c.units
        : DEFAULT_UNITS;

    const hours: HoursConfig = c.hours || DEFAULT_HOURS;

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(sectionTitle);

    const [editingCell, setEditingCell] = useState<{ unitIdx: number; rowIdx: number; field: keyof MatrixThemeRow } | null>(null);
    const [cellDraft, setCellDraft] = useState('');

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || sectionTitle);
        }
        setIsEditingTitle(false);
    };

    const handleStartEditCell = (unitIdx: number, rowIdx: number, field: keyof MatrixThemeRow, initialValue: any) => {
        setEditingCell({ unitIdx, rowIdx, field });
        setCellDraft(String(initialValue ?? ''));
    };

    const handleSaveCell = () => {
        if (!editingCell) return;
        const { unitIdx, rowIdx, field } = editingCell;
        const updatedUnits = [...units];
        const targetRow = { ...updatedUnits[unitIdx].rows[rowIdx], [field]: cellDraft };
        updatedUnits[unitIdx].rows[rowIdx] = targetRow;

        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'units', updatedUnits);
        }
        setEditingCell(null);
    };

    const handleAddThemeRow = (unitIdx: number) => {
        const updatedUnits = [...units];
        const currentCount = updatedUnits.reduce((acc, u) => acc + u.rows.filter(r => !r.isEvaluation).length, 0);
        const newRow: MatrixThemeRow = {
            id: `row-${Date.now()}`,
            tema: `Tema ${currentCount + 1}: Nuevo contenido de cátedra`,
            semana: String(Math.min(19, currentCount + 1)),
            docencia: 'Descripción de la metodología a aplicar',
            practico: 'Descripción de la práctica experimental',
            autonomo: 'Tareas o actividades a evaluar',
            rdaId: '1',
            calificacion: ''
        };
        updatedUnits[unitIdx].rows.push(newRow);

        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'units', updatedUnits);
        }
    };

    const handleDeleteRow = (unitIdx: number, rowIdx: number) => {
        const updatedUnits = [...units];
        updatedUnits[unitIdx].rows.splice(rowIdx, 1);

        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'units', updatedUnits);
        }
    };

    const handleAddUnit = () => {
        const newUnitNumber = units.length + 1;
        const newUnit: MatrixUnit = {
            id: `unit-${Date.now()}`,
            unitNumber: newUnitNumber,
            unitTitle: `UNIDAD ${newUnitNumber}.`,
            sectionTitle: 'ACTIVIDADES Y ESTRATEGIAS DE APRENDIZAJE',
            rows: [
                {
                    id: `u${newUnitNumber}-t1`,
                    tema: `Tema: Contenido introductorio de Unidad ${newUnitNumber}`,
                    semana: String(Math.min(19, newUnitNumber * 4)),
                    docencia: 'Metodología propuesta',
                    practico: 'Práctica asociada',
                    autonomo: 'Actividad autónoma',
                    rdaId: '1',
                    calificacion: ''
                }
            ]
        };
        const updated = [...units, newUnit];
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'units', updated);
        }
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-3 font-sans select-text">
            {/* Título de la Sección 4 en Azul Cursiva Negrita */}
            <div className="group relative">
                {isEditingTitle ? (
                    <div className="flex items-center gap-2 max-w-xl">
                        <input
                            type="text"
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            className="w-full px-2 py-1 text-sm font-bold italic text-blue-800 border border-blue-500 rounded"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleSaveTitle}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditingTitle(false)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2">
                        <h3 className="text-sm font-bold italic tracking-wide text-blue-800">
                            {sectionTitle}
                        </h3>
                        <button
                            type="button"
                            onClick={() => {
                                setTitleDraft(sectionTitle);
                                setIsEditingTitle(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-opacity"
                            title="Editar título de sección"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Contenedor con Scroll Horizontal Responsivo para la Matriz Editorial */}
            <div className="w-full border border-black overflow-x-auto bg-white custom-scrollbar shadow-xs">
                <table className="w-full min-w-[960px] border-collapse text-xs text-black">
                    {/* Encabezado Oficial en Azul Marino Institucional */}
                    <thead>
                        <tr style={{ backgroundColor: headerBg }} className="text-white font-bold text-center">
                            {/* Columna 1: Contenidos */}
                            <th
                                rowSpan={3}
                                className="w-[26%] p-2.5 border-r border-b border-black align-middle font-bold tracking-wide text-[11px]"
                            >
                                CONTENIDOS<br />(UNIDADES Y TEMAS)
                            </th>

                            {/* Columna 2: 19 Semanas */}
                            <th
                                rowSpan={3}
                                className="w-[5%] p-1.5 border-r border-b border-black align-middle font-bold tracking-wider text-[10px]"
                            >
                                <span className="inline-block transform -rotate-90 whitespace-nowrap">
                                    {weeksLabel}
                                </span>
                            </th>

                            {/* Columnas 3, 4, 5 Agrupadas: Organización del Aprendizaje */}
                            <th
                                colSpan={3}
                                className="w-[50%] p-1.5 border-r border-b border-black align-middle font-bold tracking-wide text-xs"
                            >
                                ORGANIZACIÓN DEL APRENDIZAJE
                            </th>

                            {/* Columna 6: Total 100% */}
                            <th
                                className="w-[7%] p-1.5 border-r border-b border-black align-middle font-bold text-[10px]"
                            >
                                TOTAL<br />100%
                            </th>

                            {/* Columna 7: ID RDAs */}
                            <th
                                rowSpan={3}
                                className="w-[6%] p-1.5 border-r border-b border-black align-middle font-bold text-[9px] leading-tight"
                            >
                                <span className="inline-block transform -rotate-90 whitespace-nowrap">
                                    ID RESULTADOS DE APRENDIZAJE<br />DE LA ASIGNATURA
                                </span>
                            </th>

                            {/* Columna 8: Calificación */}
                            <th
                                rowSpan={3}
                                className="w-[6%] p-1.5 border-b border-black align-middle font-bold text-[9px] leading-tight"
                            >
                                <span className="inline-block transform -rotate-90 whitespace-nowrap">
                                    CALIFICACIÓN DE ACTIVIDADES<br />EVALUATIVAS
                                </span>
                            </th>
                        </tr>

                        {/* Fila 2 de Cabecera: Subtítulos de Organización */}
                        <tr style={{ backgroundColor: headerBg }} className="text-white font-bold text-center text-[10px]">
                            <th className="w-[17%] p-1.5 border-r border-b border-black align-middle font-bold">
                                DOCENCIA
                                <div className="font-normal text-[9px] text-blue-100 mt-0.5">
                                    Descripción de la Metodología a aplicar
                                </div>
                            </th>
                            <th className="w-[16%] p-1.5 border-r border-b border-black align-middle font-bold">
                                PRÁCTICO EXPERIMENTAL
                                <div className="font-normal text-[9px] text-blue-100 mt-0.5">
                                    Descripción de la práctica
                                </div>
                            </th>
                            <th className="w-[17%] p-1.5 border-r border-b border-black align-middle font-bold">
                                ACTIVIDADES AUTÓNOMAS
                                <div className="font-normal text-[9px] text-blue-100 mt-0.5">
                                    Tareas o actividades a evaluar
                                </div>
                            </th>
                            {/* Sub-celda de Horas Total */}
                            <th className="p-1 border-r border-b border-black align-middle font-bold text-[9px] bg-slate-200 text-black">
                                HORAS
                            </th>
                        </tr>

                        {/* Fila 3 de Cabecera: Desglose de Horas y Horas Semana */}
                        <tr className="bg-slate-100/90 text-black font-semibold text-center text-[10px]">
                            <td className="p-1 border-r border-b border-black text-slate-700 bg-slate-200/60 font-mono">
                                {hours.docenciaHoras} hrs
                            </td>
                            <td className="p-1 border-r border-b border-black text-slate-700 bg-slate-200/60 font-mono">
                                {hours.practicoHoras} hrs
                            </td>
                            <td className="p-1 border-r border-b border-black text-slate-700 bg-slate-200/60 font-mono">
                                {hours.autonomoHoras} hrs
                            </td>
                            <td className="p-1 border-r border-b border-black font-bold font-mono bg-slate-200">
                                HORAS<br />SEMANA
                            </td>
                        </tr>
                    </thead>

                    {/* Cuerpo de la Tabla Dividido por Unidades Temáticas */}
                    <tbody>
                        {units.map((unit, unitIdx) => (
                            <React.Fragment key={unit.id || unitIdx}>
                                {/* Fila de Encabezado de Unidad: UNIDAD X. | ACTIVIDADES Y ESTRATEGIAS DE APRENDIZAJE */}
                                <tr className="border-t-2 border-black bg-slate-100/70 font-bold text-xs">
                                    <td className="p-1.5 border-r border-b border-black font-bold text-slate-900 tracking-wide">
                                        {unit.unitTitle}
                                    </td>
                                    <td className="p-1.5 border-r border-b border-black text-center bg-slate-100">
                                        {/* Columna Semana vacía en cabecera */}
                                    </td>
                                    <td colSpan={4} className="p-1.5 border-r border-b border-black text-center text-slate-900 tracking-wide">
                                        {unit.sectionTitle}
                                    </td>
                                    <td className="p-1.5 border-r border-b border-black text-center bg-slate-100">
                                        {/* RDA vacío en cabecera */}
                                    </td>
                                    <td className="p-1.5 border-b border-black text-center bg-slate-100">
                                        {/* Calificación vacía en cabecera */}
                                    </td>
                                </tr>

                                {/* Filas de Temas y Evaluaciones dentro de la Unidad */}
                                {unit.rows.map((row, rowIdx) => {
                                    const isEval = row.isEvaluation;
                                    const isCurrentCell = (field: keyof MatrixThemeRow) =>
                                        editingCell?.unitIdx === unitIdx &&
                                        editingCell?.rowIdx === rowIdx &&
                                        editingCell?.field === field;

                                    return (
                                        <tr
                                            key={row.id || rowIdx}
                                            className={`border-t border-black hover:bg-slate-50/50 group ${
                                                isEval ? 'bg-amber-50/40 font-semibold' : ''
                                            }`}
                                        >
                                            {/* Columna Tema / Evaluación */}
                                            <td className="p-1.5 border-r border-black align-middle leading-snug">
                                                {isCurrentCell('tema') ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={cellDraft}
                                                            onChange={(e) => setCellDraft(e.target.value)}
                                                            className="w-full px-1 py-0.5 text-xs border border-blue-500 rounded"
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={handleSaveCell} className="p-0.5 bg-emerald-600 text-white rounded">
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleStartEditCell(unitIdx, rowIdx, 'tema', row.tema)}
                                                        className="cursor-pointer hover:text-blue-700"
                                                    >
                                                        {isEval ? (
                                                            <span className="font-bold text-slate-900">{row.tema}</span>
                                                        ) : (
                                                            <span>{row.tema}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Columna Semana */}
                                            <td className="p-1.5 border-r border-black text-center align-middle font-mono font-bold">
                                                {isCurrentCell('semana') ? (
                                                    <div className="flex items-center gap-0.5">
                                                        <input
                                                            type="text"
                                                            value={cellDraft}
                                                            onChange={(e) => setCellDraft(e.target.value)}
                                                            className="w-8 px-1 py-0.5 text-xs border border-blue-500 rounded text-center"
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={handleSaveCell} className="p-0.5 bg-emerald-600 text-white rounded">
                                                            <Check className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        onClick={() => handleStartEditCell(unitIdx, rowIdx, 'semana', row.semana)}
                                                        className="cursor-pointer hover:text-blue-700"
                                                    >
                                                        {row.semana}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Columna Docencia */}
                                            <td className="p-1.5 border-r border-black align-middle leading-relaxed">
                                                {isEval ? (
                                                    <div className="text-center text-slate-300">-</div>
                                                ) : isCurrentCell('docencia') ? (
                                                    <div className="flex items-center gap-1">
                                                        <textarea
                                                            value={cellDraft}
                                                            onChange={(e) => setCellDraft(e.target.value)}
                                                            rows={2}
                                                            className="w-full p-1 text-xs border border-blue-500 rounded"
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={handleSaveCell} className="p-0.5 bg-emerald-600 text-white rounded">
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleStartEditCell(unitIdx, rowIdx, 'docencia', row.docencia)}
                                                        className="cursor-pointer hover:text-blue-700 text-slate-800"
                                                    >
                                                        {row.docencia || <span className="text-slate-400 italic">Clic para redactar...</span>}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Columna Práctico Experimental */}
                                            <td className="p-1.5 border-r border-black align-middle leading-relaxed">
                                                {isEval ? (
                                                    <div className="text-center text-slate-300">-</div>
                                                ) : isCurrentCell('practico') ? (
                                                    <div className="flex items-center gap-1">
                                                        <textarea
                                                            value={cellDraft}
                                                            onChange={(e) => setCellDraft(e.target.value)}
                                                            rows={2}
                                                            className="w-full p-1 text-xs border border-blue-500 rounded"
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={handleSaveCell} className="p-0.5 bg-emerald-600 text-white rounded">
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleStartEditCell(unitIdx, rowIdx, 'practico', row.practico)}
                                                        className="cursor-pointer hover:text-blue-700 text-slate-800"
                                                    >
                                                        {row.practico || <span className="text-slate-400 italic">Clic para redactar...</span>}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Columna Actividades Autónomas */}
                                            <td className="p-1.5 border-r border-black align-middle leading-relaxed">
                                                {isCurrentCell('autonomo') ? (
                                                    <div className="flex items-center gap-1">
                                                        <textarea
                                                            value={cellDraft}
                                                            onChange={(e) => setCellDraft(e.target.value)}
                                                            rows={2}
                                                            className="w-full p-1 text-xs border border-blue-500 rounded"
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={handleSaveCell} className="p-0.5 bg-emerald-600 text-white rounded">
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleStartEditCell(unitIdx, rowIdx, 'autonomo', row.autonomo)}
                                                        className={`cursor-pointer hover:text-blue-700 ${isEval ? 'font-bold text-center text-slate-900' : 'text-slate-800'}`}
                                                    >
                                                        {row.autonomo || <span className="text-slate-400 italic">Clic para redactar...</span>}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Columna Total / Espaciador */}
                                            <td className="p-1.5 border-r border-black text-center align-middle bg-slate-50/20">
                                                {/* Celda de enlace o horas si aplica */}
                                            </td>

                                            {/* Columna ID RDA */}
                                            <td className="p-1.5 border-r border-black text-center align-middle font-bold text-blue-800">
                                                {isCurrentCell('rdaId') ? (
                                                    <div className="flex items-center gap-0.5">
                                                        <input
                                                            type="text"
                                                            value={cellDraft}
                                                            onChange={(e) => setCellDraft(e.target.value)}
                                                            className="w-8 px-1 py-0.5 text-xs border border-blue-500 rounded text-center"
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={handleSaveCell} className="p-0.5 bg-emerald-600 text-white rounded">
                                                            <Check className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        onClick={() => handleStartEditCell(unitIdx, rowIdx, 'rdaId', row.rdaId)}
                                                        className="cursor-pointer hover:underline"
                                                    >
                                                        {row.rdaId}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Columna Calificación / Código Evaluativo */}
                                            <td className="p-1.5 text-center align-middle font-bold">
                                                {isCurrentCell('calificacion') ? (
                                                    <div className="flex items-center gap-0.5">
                                                        <input
                                                            type="text"
                                                            value={cellDraft}
                                                            onChange={(e) => setCellDraft(e.target.value)}
                                                            className="w-10 px-1 py-0.5 text-xs border border-blue-500 rounded text-center"
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={handleSaveCell} className="p-0.5 bg-emerald-600 text-white rounded">
                                                            <Check className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span
                                                            onClick={() => handleStartEditCell(unitIdx, rowIdx, 'calificacion', row.calificacion)}
                                                            className="cursor-pointer hover:underline text-slate-900"
                                                        >
                                                            {row.calificacion || '-'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRow(unitIdx, rowIdx)}
                                                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 transition-opacity"
                                                            title="Eliminar fila"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Barra de Acción por Unidad */}
                                <tr className="bg-slate-50 border-t border-dashed border-slate-300">
                                    <td colSpan={8} className="p-1 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleAddThemeRow(unitIdx)}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 rounded transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>Agregar Tema a {unit.unitTitle}</span>
                                        </button>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Barra Inferior: Añadir Nueva Unidad */}
            <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-500 italic">
                    Matriz oficial para 19 semanas de clase con evaluaciones parciales (E.1, E.2) y final (E.3).
                </span>
                <button
                    type="button"
                    onClick={handleAddUnit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0070f3] hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded transition-all cursor-pointer shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Nueva Unidad Temática</span>
                </button>
            </div>
        </div>
    );
};
