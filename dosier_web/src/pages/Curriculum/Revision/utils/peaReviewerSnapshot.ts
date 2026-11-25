import type {
    AnalyzePeaReviewRequest,
    PeaAiReviewFocusMode
} from '../../../../services/peaAiService';
import type { ProjectDetail, SectionComment } from '../types/revisionTecnicaTypes';

export interface ReviewerFocusOption {
    value: PeaAiReviewFocusMode;
    label: string;
    promptLabel: string;
}

export const FOCUS_OPTIONS: ReviewerFocusOption[] = [
    {
        value: 'overview',
        label: 'Explicación integral del PEA',
        promptLabel: 'Explícame el proyecto PEA, su estructura pedagógica y coherencia general.'
    },
    {
        value: 'career_profile',
        label: 'Comparar con perfil de carrera',
        promptLabel: 'Compara este PEA con el perfil de egreso de la carrera, prerrequisitos de malla y RDAs.'
    },
    {
        value: 'hours_audit',
        label: 'Auditar horas, créditos y APE',
        promptLabel: 'Audita el cuadre matemático de horas (CD, APE, TA), créditos (48h) y prácticas experimentales.'
    }
];

export const stripHtmlClean = (val: unknown): string | undefined => {
    if (typeof val !== 'string') return undefined;
    const stripped = val.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return stripped.length > 0 && stripped !== '-' ? stripped : undefined;
};

export const normalizeClientSectionKey = (rawKey: string): string => {
    const k = (rawKey || '').trim();
    if (!k) return 'ObjetivoAsignatura';
    const lower = k.toLowerCase();
    if (lower.includes('general') || lower.includes('nombre') || lower.includes('hora') || lower.includes('credito') || lower === '1') return 'NombreAsignatura';
    if (lower.includes('objetivo') || lower === '2') return 'ObjetivoAsignatura';
    if (lower.includes('prerreq') || lower === '3') return 'Prerrequisitos';
    if (lower.includes('perfil') || lower.includes('career') || lower.includes('rdacarrera') || lower.includes('aporte') || lower === '4') return 'AportePerfilEgreso';
    if (lower.includes('resultado') || lower.includes('subject') || lower.includes('rda') || lower === '5') return 'ResultadosAprendizaje';
    if (lower.includes('contenido') || lower.includes('unidad') || lower.includes('content') || lower === '6') return 'Unidades';
    if (lower.includes('metodolog') || (lower.includes('recurso') && !lower.includes('pea_resources')) || lower === '7') return 'MetodologiaEnsenanza';
    if (lower.includes('practica') || lower.includes('ape') || lower.includes('actividad') || lower.includes('pea_resources') || lower === '8') return 'ActividadesPracticas';
    if (lower.includes('evaluac') || lower.includes('criterio') || lower === '9') return 'Evaluaciones';
    if (lower.includes('bibliog') || lower === '10') return 'Bibliografia';
    return k;
};

const normalizeTextForCompare = (text: string): string =>
    text.trim().toLowerCase().replace(/\s+/g, ' ');

export const isObservationAlreadyRegistered = (
    existingComments: Record<string, SectionComment[]> | undefined,
    sectionKey: string,
    observationText: string
): boolean => {
    if (!existingComments) return false;
    const canonical = normalizeClientSectionKey(sectionKey);
    const list = existingComments[canonical] || existingComments[sectionKey] || [];
    if (list.length === 0) return false;
    const target = normalizeTextForCompare(observationText);
    return list.some(c => normalizeTextForCompare(c.text || '') === target);
};

export const getPendingSectionObservationCount = (
    existingComments: Record<string, SectionComment[]> | undefined,
    sectionKey: string
): number => {
    if (!existingComments) return 0;
    const canonical = normalizeClientSectionKey(sectionKey);
    const list = existingComments[canonical] || existingComments[sectionKey] || [];
    return list.filter(c => c.status === 'Pendiente').length;
};

export const extractUnitContenidosClean = (u: Record<string, unknown>): string => {
    const raw = u.contenidos ?? u.Contenidos ?? u.temas ?? u.Temas ?? u['1'] ?? '';
    if (typeof raw === 'string') {
        const clean = stripHtmlClean(raw) || '';
        if (clean.toLowerCase() === 'contenidos y subtemas de aprendizaje') return '';
        return clean;
    }
    if (Array.isArray(raw)) {
        return raw
            .map((t: unknown) => {
                if (typeof t === 'string') return stripHtmlClean(t) || '';
                if (!t || typeof t !== 'object') return '';
                const rec = t as Record<string, unknown>;
                const titulo = stripHtmlClean(rec.TituloTema ?? rec.titulo_tema ?? rec.titulo ?? rec.nombre_tema ?? rec.nombre) || '';
                const desc = stripHtmlClean(rec.DescripcionSubtemas ?? rec.descripcion_subtemas ?? rec.descripcion ?? rec.subtemas) || '';
                const isPlaceholder = !titulo || titulo.toLowerCase() === 'contenidos y subtemas de aprendizaje';
                if (isPlaceholder && !desc) return '';
                if (!isPlaceholder && desc) return `${titulo}: ${desc}`;
                return desc || titulo;
            })
            .filter(Boolean)
            .join('; ');
    }
    return '';
};

export const buildReviewerSnapshotPayload = (
    docSnapshot: Record<string, unknown> | null | undefined,
    project: ProjectDetail
): Partial<AnalyzePeaReviewRequest> => {
    const snap = docSnapshot || {};

    const rawUnits = Array.isArray(snap.Unidades) ? (snap.Unidades as Record<string, unknown>[]) : [];
    const peaData = project?.peaData as Record<string, unknown> | undefined;
    const peaDbUnits = Array.isArray(peaData?.unidades) ? (peaData.unidades as Record<string, unknown>[]) : [];

    const currentUnidades = rawUnits
        .map((u, idx) => {
            const dbU = peaDbUnits[idx] || {};
            const cd = Number(u.horasCD ?? u.HorasCD ?? u.horasDocencia ?? u.HorasDocencia ?? u.horas_docencia ?? u.horasDocente ?? u['2'] ?? dbU.horasDocencia ?? dbU.horas_docencia ?? 0);
            const ape = Number(u.horasAPE ?? u.HorasAPE ?? u.horasPractica ?? u.horas_practica ?? u.horasPracticoExp ?? u.HorasPracticoExp ?? u.horas_practico_exp ?? u['3'] ?? dbU.horasPracticoExp ?? dbU.horas_practico_exp ?? 0);
            const ta = Number(u.horasTA ?? u.HorasTA ?? u.horasAutonomo ?? u.HorasAutonomo ?? u.horas_autonomo ?? u['4'] ?? dbU.horasAutonomo ?? dbU.horas_autonomo ?? 0);
            return {
                num: Number(u.num ?? u.Numero ?? u.numero ?? u.NumeroUnidad ?? u.numero_unidad ?? idx + 1),
                titulo: (stripHtmlClean(u.titulo ?? u.Titulo ?? u.nombre ?? u.NombreUnidad ?? u.nombre_unidad ?? u['0'] ?? '') || '').trim(),
                contenidos: extractUnitContenidosClean(u),
                horasCD: Number.isFinite(cd) ? cd : 0,
                horasAPE: Number.isFinite(ape) ? ape : 0,
                horasTA: Number.isFinite(ta) ? ta : 0
            };
        })
        .filter(u => u.titulo || u.contenidos);

    const rawPrereqs = Array.isArray(snap.Prerrequisitos) ? (snap.Prerrequisitos as Record<string, unknown>[]) : [];
    const currentPrerrequisitos = rawPrereqs
        .map(p => ({
            asignatura: (stripHtmlClean(p.asignatura ?? p.Asignatura ?? p.NombreAsignatura ?? p.nombre_asignatura ?? p['0'] ?? '') || '').trim(),
            observacion: (stripHtmlClean(p.observacion ?? p.Observacion ?? p.observaciones ?? p.Condicion ?? p.condicion ?? p['1'] ?? '') || '').trim()
        }))
        .filter(p => p.asignatura);

    const rawPracticas = Array.isArray(snap.ActividadesPracticas) ? (snap.ActividadesPracticas as Record<string, unknown>[]) : [];
    const currentActividadesPracticas = rawPracticas
        .map((p, idx) => {
            const rawHoras = p.horas ?? p.Horas ?? p.duracionHoras ?? p.DuracionHoras ?? p.duracion_horas ?? p['2'] ?? 0;
            const parsedHoras = Number(String(rawHoras).replace(',', '.'));
            return {
                unidad: Number(String(p.unidad ?? p.Unidad ?? p.numeroUnidad ?? p.NumeroUnidad ?? p.NumeroPractica ?? p.numeroPractica ?? p.numero_practica ?? idx + 1).replace(/\D/g, '')) || idx + 1,
                nombre: (stripHtmlClean(p.nombre ?? p.Nombre ?? p.nombrePractica ?? p.NombrePractica ?? p.nombre_practica ?? p.nombre_caracterizacion ?? p.NombreCaracterizacion ?? p.tema ?? p.Tema ?? p.descripcion ?? p['1'] ?? '') || '').trim(),
                horas: Number.isFinite(parsedHoras) && parsedHoras >= 0 ? parsedHoras : 0,
                escenario: (stripHtmlClean(p.escenario ?? p.Escenario ?? '') || '').trim(),
                producto: (stripHtmlClean(p.producto ?? p.Producto ?? '') || '').trim(),
                caracterizacion: (stripHtmlClean(p.caracterizacion ?? p.Caracterizacion ?? '') || '').trim()
            };
        })
        .filter(p => p.nombre);

    const rawEvals = Array.isArray(snap.Evaluaciones) ? (snap.Evaluaciones as Record<string, unknown>[]) : [];
    const currentEvaluaciones = rawEvals
        .map(e => {
            const rawCalif = e.calificacion ?? e.Calificacion ?? e.calificacionMaxima ?? e.CalificacionMaxima ?? e.calificacion_maxima ?? e.porcentaje ?? e.Porcentaje ?? e['2'] ?? 10;
            const parsedCalif = Number(String(rawCalif).replace(',', '.'));
            return {
                nota: (stripHtmlClean(e.nota ?? e.Nota ?? e.denominacion ?? e.Denominacion ?? e.criterio ?? e.Criterio ?? e['0'] ?? '') || '').trim(),
                tipo: (stripHtmlClean(e.tipo ?? e.Tipo ?? e.tipoEvaluacion ?? e.TipoEvaluacion ?? e.tipo_evaluacion ?? e.descripcion ?? e.Descripcion ?? e['1'] ?? '') || '').trim(),
                calificacion: Number.isFinite(parsedCalif) && parsedCalif > 0 ? parsedCalif : 10
            };
        })
        .filter(e => e.nota || e.tipo);

    const rawBibs = Array.isArray(snap.Bibliografias) ? (snap.Bibliografias as Record<string, unknown>[]) : [];
    const currentBibliografias = rawBibs
        .map(b => ({
            tipoBibliografia: String(b.tipoBibliografia ?? b.TipoBibliografia ?? b.tipo_bibliografia ?? 'Basica'),
            autor: (stripHtmlClean(b.autor ?? b.Autor ?? '') || '').trim(),
            tituloLibro: (stripHtmlClean(b.tituloLibro ?? b.TituloLibro ?? b.titulo_libro ?? '') || '').trim(),
            editorialCiudad: (stripHtmlClean(b.editorialCiudad ?? b.EditorialCiudad ?? b.editorial_ciudad ?? '') || '').trim(),
            citaCompletaApa: (stripHtmlClean(b.citaCompletaApa ?? b.CitaCompletaApa ?? b.cita_completa_apa ?? '') || '').trim()
        }))
        .filter(b => b.citaCompletaApa || b.tituloLibro);

    const rdaCarreraClean = (stripHtmlClean(snap.RdaCarrera) || '').replace(/\s+/g, '');
    let rdaAsigStr: string | undefined;
    if (typeof snap.ResultadosAprendizaje === 'string') {
        rdaAsigStr = stripHtmlClean(snap.ResultadosAprendizaje);
    } else if (Array.isArray(snap.ResultadosAprendizaje)) {
        const cleanedRdas = snap.ResultadosAprendizaje
            .filter((r: unknown) => {
                const rec = r as Record<string, unknown> | null;
                const tipo = String(rec?.tipoRda || rec?.TipoRda || rec?.tipo_rda || '').toLowerCase();
                return tipo !== 'carrera';
            })
            .map((r: unknown) => {
                const rec = r as Record<string, unknown> | null;
                const raw = stripHtmlClean(typeof r === 'string' ? r : (rec?.descripcion ?? rec?.Descripcion ?? rec?.texto ?? '')) || '';
                return raw.replace(/^rda\s*\d+\s*:\s*/i, '').trim();
            })
            .filter((t: string) => {
                if (!t || t === '-' || /^rda\s*[-#]?\s*\d*\s*:?$/i.test(t)) return false;
                if (rdaCarreraClean.length > 20 && t.replace(/\s+/g, '') === rdaCarreraClean) return false;
                return true;
            });
        rdaAsigStr = cleanedRdas.length > 0 ? cleanedRdas.join(' | ') : undefined;
    }

    const toOptionalNumber = (val: unknown): number | undefined => {
        if (val === undefined || val === null || val === '') return undefined;
        const n = Number(val);
        return Number.isFinite(n) ? n : undefined;
    };

    return {
        currentCreditos: toOptionalNumber(snap.Creditos ?? project.creditos),
        currentHorasCD: toOptionalNumber(snap.HorasContactoDocente ?? project.horas_docencia),
        currentHorasAPE: toOptionalNumber(snap.HorasPracticoExperimental ?? project.horas_practica),
        currentHorasTA: toOptionalNumber(snap.HorasAutonomo ?? project.horas_autonomo),
        currentTotalHoras: toOptionalNumber(snap.TotalHorasAsignatura ?? project.horas_totales),
        currentModalidad: String(snap.Modalidad ?? project.modalidad ?? '').trim() || undefined,
        currentUnidadOrganizacion: String(snap.UnidadOrganizacion ?? project.dominio ?? '').trim() || undefined,
        currentNivel: String(snap.Nivel ?? project.semestre_nivel ?? '').trim() || undefined,
        currentObjetivo: stripHtmlClean(snap.ObjetivoAsignatura ?? project.descripcion),
        currentPrerrequisitos: currentPrerrequisitos.length > 0 ? currentPrerrequisitos : undefined,
        currentRdaCarrera: stripHtmlClean(snap.RdaCarrera),
        currentResultadosAprendizaje: rdaAsigStr,
        currentUnidades: currentUnidades.length > 0 ? currentUnidades : undefined,
        currentMetodologiaEnsenanza: stripHtmlClean(snap.MetodologiaEnsenanza),
        currentRecursosDidacticos: stripHtmlClean(snap.RecursosDidacticos),
        currentActividadesPracticas: currentActividadesPracticas.length > 0 ? currentActividadesPracticas : undefined,
        currentEvaluaciones: currentEvaluaciones.length > 0 ? currentEvaluaciones : undefined,
        currentBibliografias: currentBibliografias.length > 0 ? currentBibliografias : undefined,
        currentBibliografiaBasica: stripHtmlClean(snap.BibliografiaBasica),
        currentBibliografiaConsulta: stripHtmlClean(snap.BibliografiaConsulta)
    };
};
