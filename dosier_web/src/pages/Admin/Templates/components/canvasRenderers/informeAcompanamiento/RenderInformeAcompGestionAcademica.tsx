/**
 * @file RenderInformeAcompGestionAcademica.tsx
 * @description 4. GESTIÓN ACADÉMICA DE LA CARRERA del Informe de Acompañamiento Académico 2026.
 * Bloque unificado e integral que contiene las 5 sub-secciones normadas:
 *   4.1. Reuniones de carrera
 *   4.2. Actividades realizadas por el coordinador de la carrera
 *   4.3. Estudiantes
 *   4.4. Gestión docente
 *   4.5. Observaciones
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type {
    ReunionCarreraConfig,
    ActividadCoordinadorRowItem,
    EstudianteNivelRowItem,
    GestionDocenteRowItem,
    AcompanamientoObservacionRowItem
} from '../../../types';

export interface RenderInformeAcompGestionAcademicaProps {
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}

const DEFAULT_REUNIONES: ReunionCarreraConfig = {
    horarioReunion: '',
    numeroReuniones: '',
    principalesAspectos: '',
    principalesAcuerdos: ''
};

const DEFAULT_ACTIVIDADES_COORD: ActividadCoordinadorRowItem[] = [
    { id: '1', actividad: '', productoEsperado: '', estado: '' },
    { id: '2', actividad: '', productoEsperado: '', estado: '' },
    { id: '3', actividad: '', productoEsperado: '', estado: '' },
    { id: '4', actividad: '', productoEsperado: '', estado: '' }
];

const DEFAULT_ESTUDIANTES_NIVEL: EstudianteNivelRowItem[] = [
    { id: '1', nivel: '1º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
    { id: '2', nivel: '2º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
    { id: '3', nivel: '3º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
    { id: '4', nivel: '4º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
    { id: '5', nivel: '5º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' }
];

const DEFAULT_GESTION_DOCENTE: GestionDocenteRowItem[] = [
    {
        id: '1',
        docente: '',
        horasContacto: '',
        evaPermanente: '',
        horasTutoria: '',
        estudiantesTutoria: '',
        horasVinculacion: '',
        horasInvestigacion: '',
        horasPracticas: '',
        horasTitulacion: '',
        asignaturas: '',
        estudiantesProblemasRendimiento: ''
    },
    {
        id: '2',
        docente: '',
        horasContacto: '',
        evaPermanente: '',
        horasTutoria: '',
        estudiantesTutoria: '',
        horasVinculacion: '',
        horasInvestigacion: '',
        horasPracticas: '',
        horasTitulacion: '',
        asignaturas: '',
        estudiantesProblemasRendimiento: ''
    },
    {
        id: '3',
        docente: '',
        horasContacto: '',
        evaPermanente: '',
        horasTutoria: '',
        estudiantesTutoria: '',
        horasVinculacion: '',
        horasInvestigacion: '',
        horasPracticas: '',
        horasTitulacion: '',
        asignaturas: '',
        estudiantesProblemasRendimiento: ''
    }
];

const DEFAULT_OBSERVACIONES: AcompanamientoObservacionRowItem[] = [
    { id: '1', estudiante: '', nivel: '1º', resultado: '' },
    { id: '2', estudiante: '', nivel: '2º', resultado: '' },
    { id: '3', estudiante: '', nivel: '3º', resultado: '' }
];

export const RenderInformeAcompGestionAcademica: React.FC<RenderInformeAcompGestionAcademicaProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.sectionTitle || title || '4.  Gestión Académica de la carrera';

    // Estado 4.1 Reuniones
    const [reuniones, setReuniones] = useState<ReunionCarreraConfig>(() => c.reuniones || DEFAULT_REUNIONES);

    // Estado 4.2 Actividades
    const [actividades, setActividades] = useState<ActividadCoordinadorRowItem[]>(() => {
        return Array.isArray(c.actividadesCoordinador) && c.actividadesCoordinador.length > 0
            ? c.actividadesCoordinador
            : DEFAULT_ACTIVIDADES_COORD;
    });

    // Estado 4.3 Estudiantes
    const [estudiantes, setEstudiantes] = useState<EstudianteNivelRowItem[]>(() => {
        return Array.isArray(c.estudiantesNivel) && c.estudiantesNivel.length > 0
            ? c.estudiantesNivel
            : DEFAULT_ESTUDIANTES_NIVEL;
    });

    // Estado 4.4 Gestión docente
    const [docentes, setDocentes] = useState<GestionDocenteRowItem[]>(() => {
        return Array.isArray(c.gestionDocentes) && c.gestionDocentes.length > 0
            ? c.gestionDocentes
            : DEFAULT_GESTION_DOCENTE;
    });

    // Estado 4.5 Observaciones
    const [observaciones, setObservaciones] = useState<AcompanamientoObservacionRowItem[]>(() => {
        return Array.isArray(c.observaciones) && c.observaciones.length > 0
            ? c.observaciones
            : DEFAULT_OBSERVACIONES;
    });

    useEffect(() => {
        if (c.reuniones) setReuniones(c.reuniones);
        if (Array.isArray(c.actividadesCoordinador)) setActividades(c.actividadesCoordinador);
        if (Array.isArray(c.estudiantesNivel)) setEstudiantes(c.estudiantesNivel);
        if (Array.isArray(c.gestionDocentes)) setDocentes(c.gestionDocentes);
        if (Array.isArray(c.observaciones)) setObservaciones(c.observaciones);
    }, [c]);

    const notifyUpdate = (key: string, val: any) => {
        if (blockId && onUpdateConfig) {
            onUpdateConfig(blockId, key, val);
        }
    };

    // Handlers 4.1
    const handleReunionChange = (field: keyof ReunionCarreraConfig, value: string) => {
        const next = { ...reuniones, [field]: value };
        setReuniones(next);
        notifyUpdate('reuniones', next);
    };

    // Handlers 4.2
    const handleActividadChange = (id: string, field: keyof ActividadCoordinadorRowItem, value: string) => {
        const next = actividades.map((a) => (a.id === id ? { ...a, [field]: value } : a));
        setActividades(next);
        notifyUpdate('actividadesCoordinador', next);
    };
    const handleAddActividad = () => {
        const next = [...actividades, { id: String(Date.now()), actividad: '', productoEsperado: '', estado: '' }];
        setActividades(next);
        notifyUpdate('actividadesCoordinador', next);
    };
    const handleRemoveActividad = (id: string) => {
        if (actividades.length <= 1) return;
        const next = actividades.filter((a) => a.id !== id);
        setActividades(next);
        notifyUpdate('actividadesCoordinador', next);
    };

    // Handlers 4.3
    const handleEstudianteCell = (id: string, field: keyof EstudianteNivelRowItem, value: string) => {
        const next = estudiantes.map((e) => (e.id === id ? { ...e, [field]: value } : e));
        setEstudiantes(next);
        notifyUpdate('estudiantesNivel', next);
    };
    const handleAddEstudianteRow = () => {
        const next = [...estudiantes, {
            id: String(Date.now()),
            nivel: `${estudiantes.length + 1}º Nivel`,
            matriculados: '',
            retirados: '',
            problemasAsistencia: '',
            problemasRendimiento: '',
            noRindieronExamen: '',
            bienestarInstitucional: '',
            becados: ''
        }];
        setEstudiantes(next);
        notifyUpdate('estudiantesNivel', next);
    };
    const handleRemoveEstudianteRow = (id: string) => {
        if (estudiantes.length <= 1) return;
        const next = estudiantes.filter((e) => e.id !== id);
        setEstudiantes(next);
        notifyUpdate('estudiantesNivel', next);
    };

    // Handlers 4.4
    const handleDocenteCell = (id: string, field: keyof GestionDocenteRowItem, value: string) => {
        const next = docentes.map((d) => (d.id === id ? { ...d, [field]: value } : d));
        setDocentes(next);
        notifyUpdate('gestionDocentes', next);
    };
    const handleAddDocenteRow = () => {
        const next = [...docentes, {
            id: String(Date.now()),
            docente: '',
            horasContacto: '',
            evaPermanente: '',
            horasTutoria: '',
            estudiantesTutoria: '',
            horasVinculacion: '',
            horasInvestigacion: '',
            horasPracticas: '',
            horasTitulacion: '',
            asignaturas: '',
            estudiantesProblemasRendimiento: ''
        }];
        setDocentes(next);
        notifyUpdate('gestionDocentes', next);
    };
    const handleRemoveDocenteRow = (id: string) => {
        if (docentes.length <= 1) return;
        const next = docentes.filter((d) => d.id !== id);
        setDocentes(next);
        notifyUpdate('gestionDocentes', next);
    };

    // Handlers 4.5
    const handleObservacionCell = (id: string, field: keyof AcompanamientoObservacionRowItem, value: string) => {
        const next = observaciones.map((o) => (o.id === id ? { ...o, [field]: value } : o));
        setObservaciones(next);
        notifyUpdate('observaciones', next);
    };
    const handleAddObservacionRow = () => {
        const next = [...observaciones, { id: String(Date.now()), estudiante: '', nivel: '', resultado: '' }];
        setObservaciones(next);
        notifyUpdate('observaciones', next);
    };
    const handleRemoveObservacionRow = (id: string) => {
        if (observaciones.length <= 1) return;
        const next = observaciones.filter((o) => o.id !== id);
        setObservaciones(next);
        notifyUpdate('observaciones', next);
    };

    return (
        <div className="w-full bg-white text-slate-900 font-sans text-xs space-y-6">
            {/* Título Principal Sección 4 */}
            <div className="pb-1 border-b border-black">
                <h2 className="text-sm font-bold text-black uppercase tracking-tight">
                    {sectionTitle}
                </h2>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4.1. REUNIONES DE CARRERA */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-black italic">
                    4.1.  Reuniones de carrera
                </h3>
                <div className="border border-black overflow-hidden">
                    <table className="w-full border-collapse border border-black text-xs">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="w-[45%] font-semibold p-2 border-r border-black bg-slate-50/70 text-slate-900">
                                    Horario de reunión de la carrera:
                                </td>
                                <td className="p-1">
                                    <input
                                        type="text"
                                        value={reuniones.horarioReunion || ''}
                                        onChange={(e) => handleReunionChange('horarioReunion', e.target.value)}
                                        placeholder="Ej. Miércoles 14:00 - 16:00"
                                        className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="w-[45%] font-semibold p-2 border-r border-black bg-slate-50/70 text-slate-900">
                                    Numero de reuniones de carrera realizadas en este parcial o módulo:
                                </td>
                                <td className="p-1">
                                    <input
                                        type="text"
                                        value={reuniones.numeroReuniones || ''}
                                        onChange={(e) => handleReunionChange('numeroReuniones', e.target.value)}
                                        placeholder="Ej. 4 reuniones"
                                        className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="w-[45%] font-semibold p-2 border-r border-black bg-slate-50/70 text-slate-900 align-top">
                                    Principales aspectos tratados en las reuniones:
                                </td>
                                <td className="p-1">
                                    <textarea
                                        rows={2}
                                        value={reuniones.principalesAspectos || ''}
                                        onChange={(e) => handleReunionChange('principalesAspectos', e.target.value)}
                                        placeholder="Aspectos curriculares, avance de PEA, seguimiento tutorial..."
                                        className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 resize-none"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="w-[45%] font-semibold p-2 border-r border-black bg-slate-50/70 text-slate-900 align-top">
                                    Principales acuerdos o consensos:
                                </td>
                                <td className="p-1">
                                    <textarea
                                        rows={2}
                                        value={reuniones.principalesAcuerdos || ''}
                                        onChange={(e) => handleReunionChange('principalesAcuerdos', e.target.value)}
                                        placeholder="Acuerdos adoptados por el colectivo docente..."
                                        className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 resize-none"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4.2. ACTIVIDADES REALIZADAS POR EL COORDINADOR */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-black italic">
                        4.2.  Actividades realizadas por el coordinador de la carrera
                    </h3>
                    <button
                        type="button"
                        onClick={handleAddActividad}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-[#0070f3] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        Agregar Actividad
                    </button>
                </div>
                <div className="border border-black overflow-hidden">
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                            <tr className="bg-white text-black font-bold">
                                <th className="border border-black px-2.5 py-1.5 text-left w-[40%]">Actividad</th>
                                <th className="border border-black px-2.5 py-1.5 text-left w-[40%]">Producto esperado o evidencia</th>
                                <th className="border border-black px-2.5 py-1.5 text-center w-[20%]">Estado</th>
                                <th className="border border-black px-1 py-1 w-[28px] text-center print:hidden bg-slate-50"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {actividades.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={item.actividad}
                                            onChange={(e) => handleActividadChange(item.id, 'actividad', e.target.value)}
                                            placeholder="Descripción de la actividad..."
                                            className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={item.productoEsperado}
                                            onChange={(e) => handleActividadChange(item.id, 'productoEsperado', e.target.value)}
                                            placeholder="Evidencia o entregable..."
                                            className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={item.estado}
                                            onChange={(e) => handleActividadChange(item.id, 'estado', e.target.value)}
                                            placeholder="Cumplido / En proceso"
                                            className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 font-medium"
                                        />
                                    </td>
                                    <td className="border border-black p-0 text-center print:hidden bg-slate-50/50">
                                        {actividades.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveActividad(item.id)}
                                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4.3. ESTUDIANTES */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-black italic">
                        4.3.  Estudiantes
                    </h3>
                    <button
                        type="button"
                        onClick={handleAddEstudianteRow}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-[#0070f3] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        Agregar Nivel
                    </button>
                </div>
                <div className="border border-black overflow-x-auto">
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-white text-black font-bold">
                                <th className="border border-black p-1 text-center w-[12%]">Nivel</th>
                                <th className="border border-black p-1 text-center w-[13%]">Número de estudiantes matriculados</th>
                                <th className="border border-black p-1 text-center w-[13%]">Número de estudiantes retirados o que desertaron oficialmente</th>
                                <th className="border border-black p-1 text-center w-[12%]">Número de estudiantes con problemas de asistencia</th>
                                <th className="border border-black p-1 text-center w-[12%]">Número de estudiantes con problemas de rendimiento</th>
                                <th className="border border-black p-1 text-center w-[13%]">Número de estudiantes que no rindieron el examen parcial</th>
                                <th className="border border-black p-1 text-center w-[13%]">Número de casos con acompañamiento de Bienestar Institucional</th>
                                <th className="border border-black p-1 text-center w-[12%]">Número de estudiantes becados</th>
                                <th className="border border-black p-0.5 w-[24px] text-center print:hidden bg-slate-50"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors text-center">
                                    <td className="border border-black p-1 font-semibold text-slate-900">
                                        <input
                                            type="text"
                                            value={row.nivel}
                                            onChange={(e) => handleEstudianteCell(row.id, 'nivel', e.target.value)}
                                            className="w-full text-center text-[11px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded font-semibold text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={row.matriculados}
                                            onChange={(e) => handleEstudianteCell(row.id, 'matriculados', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-center text-[11px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={row.retirados}
                                            onChange={(e) => handleEstudianteCell(row.id, 'retirados', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-center text-[11px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={row.problemasAsistencia}
                                            onChange={(e) => handleEstudianteCell(row.id, 'problemasAsistencia', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-center text-[11px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={row.problemasRendimiento}
                                            onChange={(e) => handleEstudianteCell(row.id, 'problemasRendimiento', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-center text-[11px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={row.noRindieronExamen}
                                            onChange={(e) => handleEstudianteCell(row.id, 'noRindieronExamen', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-center text-[11px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={row.bienestarInstitucional}
                                            onChange={(e) => handleEstudianteCell(row.id, 'bienestarInstitucional', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-center text-[11px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={row.becados}
                                            onChange={(e) => handleEstudianteCell(row.id, 'becados', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-center text-[11px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-0 text-center print:hidden bg-slate-50/50">
                                        {estudiantes.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEstudianteRow(row.id)}
                                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4.4. GESTIÓN DOCENTE */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-black italic">
                        4.4.  Gestión docente
                    </h3>
                    <button
                        type="button"
                        onClick={handleAddDocenteRow}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-[#0070f3] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        Agregar Docente
                    </button>
                </div>
                <div className="border border-black overflow-x-auto">
                    <table className="w-full border-collapse border border-black text-[10px]">
                        <thead>
                            <tr className="bg-white text-black font-bold">
                                <th className="border border-black p-1 text-left w-[14%]">Nómina de docentes</th>
                                <th className="border border-black p-1 text-center w-[8%]">Cumplimiento de horas de contacto con el docente</th>
                                <th className="border border-black p-1 text-center w-[9%]">Cumple e manera permanente con los indicadores de gestión docente del EVA</th>
                                <th className="border border-black p-1 text-center w-[8%]">Cumplimiento de horas de tutoría académica</th>
                                <th className="border border-black p-1 text-center w-[8%]">Total de estudiantes atendidos en tutoría académica</th>
                                <th className="border border-black p-1 text-center w-[8%]">Cumplimiento de horas de vinculación</th>
                                <th className="border border-black p-1 text-center w-[8%]">Cumplimiento de horas de Investigación</th>
                                <th className="border border-black p-1 text-center w-[8%]">Cumplimiento de horas de prácticas-pre profesionales</th>
                                <th className="border border-black p-1 text-center w-[8%]">Cumplimiento de horas de tutorías de titulación.</th>
                                <th className="border border-black p-1 text-left w-[13%]">Asignaturas que imparte</th>
                                <th className="border border-black p-1 text-center w-[8%]">Número de estudiantes que presentan problemas de rendimiento en la Asignatura</th>
                                <th className="border border-black p-0.5 w-[22px] text-center print:hidden bg-slate-50"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {docentes.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors align-top">
                                    <td className="border border-black p-1 font-semibold text-slate-900">
                                        <textarea
                                            rows={2}
                                            value={row.docente}
                                            onChange={(e) => handleDocenteCell(row.id, 'docente', e.target.value)}
                                            placeholder="Docente..."
                                            className="w-full p-1 text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded font-semibold text-slate-800 resize-none"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={row.horasContacto}
                                            onChange={(e) => handleDocenteCell(row.id, 'horasContacto', e.target.value)}
                                            placeholder="100%"
                                            className="w-full text-center text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={row.evaPermanente}
                                            onChange={(e) => handleDocenteCell(row.id, 'evaPermanente', e.target.value)}
                                            placeholder="Sí"
                                            className="w-full text-center text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={row.horasTutoria}
                                            onChange={(e) => handleDocenteCell(row.id, 'horasTutoria', e.target.value)}
                                            placeholder="100%"
                                            className="w-full text-center text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={row.estudiantesTutoria}
                                            onChange={(e) => handleDocenteCell(row.id, 'estudiantesTutoria', e.target.value)}
                                            placeholder="0"
                                            className="w-full text-center text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={row.horasVinculacion}
                                            onChange={(e) => handleDocenteCell(row.id, 'horasVinculacion', e.target.value)}
                                            placeholder="-"
                                            className="w-full text-center text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={row.horasInvestigacion}
                                            onChange={(e) => handleDocenteCell(row.id, 'horasInvestigacion', e.target.value)}
                                            placeholder="-"
                                            className="w-full text-center text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={row.horasPracticas}
                                            onChange={(e) => handleDocenteCell(row.id, 'horasPracticas', e.target.value)}
                                            placeholder="-"
                                            className="w-full text-center text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <input
                                            type="text"
                                            value={row.horasTitulacion}
                                            onChange={(e) => handleDocenteCell(row.id, 'horasTitulacion', e.target.value)}
                                            placeholder="-"
                                            className="w-full text-center text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            rows={2}
                                            value={row.asignaturas}
                                            onChange={(e) => handleDocenteCell(row.id, 'asignaturas', e.target.value)}
                                            placeholder="- Materia 1\n- Materia 2"
                                            className="w-full p-1 text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded resize-none"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        <textarea
                                            rows={2}
                                            value={row.estudiantesProblemasRendimiento}
                                            onChange={(e) => handleDocenteCell(row.id, 'estudiantesProblemasRendimiento', e.target.value)}
                                            placeholder="- 2\n- 0"
                                            className="w-full text-center p-1 text-[10px] bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded resize-none"
                                        />
                                    </td>
                                    <td className="border border-black p-0 text-center print:hidden bg-slate-50/50 pt-2">
                                        {docentes.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDocenteRow(row.id)}
                                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4.5. OBSERVACIONES */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-black italic">
                        4.5.  Observaciones:
                    </h3>
                    <button
                        type="button"
                        onClick={handleAddObservacionRow}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-[#0070f3] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        Agregar Observación
                    </button>
                </div>
                <div className="border border-black overflow-hidden">
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                            <tr className="bg-white text-black font-bold">
                                <th className="border border-black px-2.5 py-1.5 text-left w-[35%]">Estudiante</th>
                                <th className="border border-black px-2.5 py-1.5 text-center w-[15%]">Nivel</th>
                                <th className="border border-black px-2.5 py-1.5 text-left w-[50%]">Resultado del acompañamiento</th>
                                <th className="border border-black px-1 py-1 w-[28px] text-center print:hidden bg-slate-50"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {observaciones.map((obs) => (
                                <tr key={obs.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="border border-black p-1">
                                        <input
                                            type="text"
                                            value={obs.estudiante}
                                            onChange={(e) => handleObservacionCell(obs.id, 'estudiante', e.target.value)}
                                            placeholder="Nombres y apellidos del estudiante..."
                                            className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                        />
                                    </td>
                                    <td className="border border-black p-1 text-center font-semibold">
                                        <input
                                            type="text"
                                            value={obs.nivel}
                                            onChange={(e) => handleObservacionCell(obs.id, 'nivel', e.target.value)}
                                            placeholder="1º"
                                            className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 font-semibold"
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            rows={2}
                                            value={obs.resultado}
                                            onChange={(e) => handleObservacionCell(obs.id, 'resultado', e.target.value)}
                                            placeholder="Resultado obtenido del acompañamiento tutorial..."
                                            className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 resize-none"
                                        />
                                    </td>
                                    <td className="border border-black p-0 text-center print:hidden bg-slate-50/50">
                                        {observaciones.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveObservacionRow(obs.id)}
                                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
