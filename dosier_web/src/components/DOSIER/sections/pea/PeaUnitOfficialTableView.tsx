import React from 'react';

export interface PeaUnitOfficialItem {
    num?: number;
    titulo?: string;
    horasCD?: number | string;
    horasAPE?: number | string;
    horasTA?: number | string;
    horasTotal?: number | string;
    contenidos?: string | string[];
}

export interface ParsedTopicLine {
    raw: string;
    type: 'theme' | 'subtopic' | 'text';
    numberPrefix?: string;
    text: string;
}

export function parseUnitContenidos(contenidos?: string | string[]): ParsedTopicLine[] {
    if (!contenidos) return [];
    const text = Array.isArray(contenidos) ? contenidos.join('\n') : String(contenidos);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    return lines.map(line => {
        // Tema principal (ej: "Tema 1: Introducción a los Sistemas Web", "Tema 1 - ...", "UNIDAD 1...")
        const themeMatch = line.match(/^(tema\s*\d+|unidad\s*\d+)[\s:.\-]+(.*)$/i);
        if (themeMatch) {
            return {
                raw: line,
                type: 'theme',
                numberPrefix: themeMatch[1],
                text: themeMatch[2].trim()
            };
        }

        // Subtema numerado (ej: "1.1 ¿Qué son los Sistemas Web?", "1.2.1 ...")
        const subtopicMatch = line.match(/^(\d+(?:\.\d+)+)[\s:.\-]+(.*)$/);
        if (subtopicMatch) {
            return {
                raw: line,
                type: 'subtopic',
                numberPrefix: subtopicMatch[1],
                text: subtopicMatch[2].trim()
            };
        }

        // Viñeta estándar (ej: "- Introducción", "• Desarrollo...")
        const bulletMatch = line.match(/^[-•*]\s*(.*)$/);
        if (bulletMatch) {
            return {
                raw: line,
                type: 'subtopic',
                numberPrefix: '•',
                text: bulletMatch[1].trim()
            };
        }

        return {
            raw: line,
            type: 'text',
            text: line
        };
    });
}

export interface PeaUnitOfficialTableViewProps {
    unidad: PeaUnitOfficialItem;
    index?: number;
}

export const PeaUnitOfficialTableView: React.FC<PeaUnitOfficialTableViewProps> = ({
    unidad,
    index = 0
}) => {
    const unitNum = Number(unidad.num ?? index + 1);
    const rawTit = String(unidad.titulo || '').trim();
    const cleanTit = rawTit.replace(new RegExp(`^unidad\\s*${unitNum}[:.\\-\\s]*`, 'i'), '').trim();

    const cd = Number(unidad.horasCD ?? 0);
    const ape = Number(unidad.horasAPE ?? 0);
    const ta = Number(unidad.horasTA ?? 0);
    const total = Number(unidad.horasTotal ?? (cd + ape + ta));

    const parsedLines = parseUnitContenidos(unidad.contenidos);

    return (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs font-sans text-xs">
            {/* 1. Cabecera de la Unidad (Título y Total de horas) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-100/90 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
                <div className="font-bold uppercase tracking-wide text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="text-[#0070f3] dark:text-blue-400 font-extrabold shrink-0">
                        UNIDAD {unitNum}:
                    </span>
                    <span className="truncate" title={cleanTit || `Unidad ${unitNum}`}>
                        {cleanTit || `Contenidos de Aprendizaje ${unitNum}`}
                    </span>
                </div>
                <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 shrink-0">
                    Total de horas por unidad: <strong className="font-mono text-slate-900 dark:text-zinc-100 font-bold ml-1">{total}h</strong>
                </div>
            </div>

            {/* 2. Fila Reglamentaria de Horas (3 columnas oficiales: CD, APE, TA) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 text-[11px]">
                <div className="px-3 py-1.5 flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span>Horas contacto con el docente:</span>
                    <strong className="font-mono text-slate-900 dark:text-zinc-200 font-semibold ml-1">{cd}h</strong>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span>Horas Práctico-experimental:</span>
                    <strong className="font-mono text-slate-900 dark:text-zinc-200 font-semibold ml-1">{ape}h</strong>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span>Horas de aprendizaje autónomo:</span>
                    <strong className="font-mono text-slate-900 dark:text-zinc-200 font-semibold ml-1">{ta}h</strong>
                </div>
            </div>

            {/* 3. Desglose Estructurado de Temas y Subtemas (El bloque crece naturalmente, sin scroll interno) */}
            <div className="divide-y divide-slate-100 dark:divide-zinc-850">
                {parsedLines.length === 0 ? (
                    <div className="px-3.5 py-3 text-slate-400 dark:text-zinc-500 italic text-[11px]">
                        Sin temas ni subtemas detallados en esta unidad.
                    </div>
                ) : (
                    parsedLines.map((item, lIdx) => {
                        if (item.type === 'theme') {
                            return (
                                <div
                                    key={lIdx}
                                    className="px-3.5 py-1.5 bg-slate-100/50 dark:bg-zinc-900/50 font-bold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-2 border-b border-slate-200/50 dark:border-zinc-800/60"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] shrink-0" />
                                    <span>
                                        {item.numberPrefix ? `${item.numberPrefix}: ` : ''}{item.text}
                                    </span>
                                </div>
                            );
                        }
                        if (item.type === 'subtopic') {
                            return (
                                <div
                                    key={lIdx}
                                    className="pl-7 pr-3.5 py-1 text-[11px] text-slate-700 dark:text-zinc-300 flex items-start gap-2 hover:bg-slate-50/60 dark:hover:bg-zinc-900/30 transition-colors"
                                >
                                    <span className="font-mono font-medium text-slate-500 dark:text-zinc-400 shrink-0">
                                        {item.numberPrefix}
                                    </span>
                                    <span className="flex-1 leading-relaxed">{item.text}</span>
                                </div>
                            );
                        }
                        return (
                            <div
                                key={lIdx}
                                className="pl-7 pr-3.5 py-1 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed"
                            >
                                {item.text}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
