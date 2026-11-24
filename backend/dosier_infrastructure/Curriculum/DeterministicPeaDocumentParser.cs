using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using dosier_application.Curriculum.Dtos;

namespace dosier_infrastructure.Curriculum
{
    /// <summary>
    /// Parser determinista offline para documentos curriculares (PEA / Sílabo) del ISTPET.
    /// Soporta tanto tablas OpenXML (.docx) delimitadas por '|' como texto y tablas espaciales
    /// extraídas de PDFs digitales (.pdf) sin delimitadores explícitos.
    /// </summary>
    public static class DeterministicPeaDocumentParser
    {
        private enum PeaSectionKind
        {
            General,
            Objetivo,
            Prerrequisitos,
            RdaCarrera,
            RdaAsignatura,
            Contenidos,
            Metodologia,
            Recursos,
            Practicas,
            Evaluacion,
            Bibliografia,
            Firmas
        }

        private static readonly (PeaSectionKind Kind, Regex Pattern)[] SectionMatchers =
        {
            (PeaSectionKind.General, new Regex(@"^(?:[a1][\)\.\-]\s*)?(?:datos\s+generales(?:\s+de\s+la\s+asignatura)?|informaci[oó]n\s+general)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Objetivo, new Regex(@"^(?:[b2][\)\.\-]\s*)?objetivo(?:\s+general|\s+educativo)?(?:\s+de\s+la\s+asignatura)?\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Prerrequisitos, new Regex(@"^(?:[c3][\)\.\-]\s*)?prerrequisitos?(?:\s+y\s+correquisitos?)?\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.RdaCarrera, new Regex(@"^(?:[d4][\)\.\-]\s*)?(?:resultados?|logros?)\s+de\s+aprendizaje\s+(?:de\s+la\s+carrera|del\s+perfil\s+de\s+egreso)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.RdaAsignatura, new Regex(@"^(?:[e5][\)\.\-]\s*)?(?:resultados?|logros?)\s+de\s+aprendizaje\s+de\s+la\s+asignatura\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Contenidos, new Regex(@"^(?:[f6][\)\.\-]\s*)?(?:contenidos?\s+de\s+ense[ñn]anza|contenidos?\s+tem[aá]ticos?|contenido\s+program[aá]tico|unidades?\s+(?:tem[aá]ticas?|de\s+estudio)(?:\s+y\s+sus\s+contenidos)?)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Metodologia, new Regex(@"^(?:[g7][\)\.\-]\s*)?(?:metodolog[ií]a(?:\s+de\s+ense[ñn]anza)?|estrategias?\s+metodol[oó]gicas?)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Recursos, new Regex(@"^recursos?\s+(?:did[aá]cticos?(?:\s*[\/\-]\s*informatizaci[oó]n\s+del\s+aprendizaje)?|para\s+el\s+aprendizaje)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Practicas, new Regex(@"^(?:[h8][\)\.\-]\s*)?(?:actividades?\s+pr[aá]cticas(?:\s+experimentales)?|pr[aá]cticas?\s+de\s+aplicaci[oó]n)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Evaluacion, new Regex(@"^(?:[i9][\)\.\-]\s*)?(?:evaluaci[oó]n\s+del\s+aprendizaje|sistema\s+de\s+evaluaci[oó]n)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Bibliografia, new Regex(@"^(?:[j][\)\.\-]\s*|10[\)\.\-]\s*)?(?:bibliograf[ií]a|referencias?\s+bibliogr[aá]ficas?|fuentes?\s+de\s+consulta)(?!\s+(?:b[aá]sica|de\s+consulta|complementaria)\b)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)),
            (PeaSectionKind.Firmas, new Regex(@"^(?:[k][\)\.\-]\s*|11[\)\.\-]\s*)?(?:firmas?\s+de\s+responsabilidad|elaborado\s+por|revisado\s+por)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled))
        };

        private static readonly Regex PageMarkerRegex = new(@"^---\s*P[ÁA]GINA\s+\d+\s*---$", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex PageFooterRegex = new(@"^(?:p[áa]g(?:ina)?\.?\s*\d+(?:\s*(?:de|\/)\s*\d+)?|page\s+\d+(?:\s*of\s*\d+)?)$", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex TableTagRegex = new(@"^\[(?:FIN\s+)?TABLA(?:\s+DOCUMENTAL)?\]$", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex MultiSpaceColumnSplitRegex = new(@"(?:\t+|\s{2,})", RegexOptions.Compiled);

        /// <summary>
        /// Analiza el texto digital extraído y mapea sus secciones al DTO oficial del PEA.
        /// </summary>
        public static PeaStructuredDraftDto Parse(string extractedText)
        {
            var draft = new PeaStructuredDraftDto();
            if (string.IsNullOrWhiteSpace(extractedText))
            {
                return draft;
            }

            var sections = SliceSections(extractedText);

            if (sections.TryGetValue(PeaSectionKind.General, out var generalLines))
            {
                ParseGeneralData(generalLines, draft);
            }
            else
            {
                var headerLines = extractedText
                    .Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries)
                    .Take(60)
                    .ToList();
                ParseGeneralData(headerLines, draft);
            }

            if (sections.TryGetValue(PeaSectionKind.Objetivo, out var objLines))
            {
                draft.ObjetivoAsignatura = ParseFlowParagraphsToHtml(objLines);
            }

            if (sections.TryGetValue(PeaSectionKind.Prerrequisitos, out var prereqLines))
            {
                draft.Prerrequisitos = ParsePrerrequisitos(prereqLines);
            }

            if (sections.TryGetValue(PeaSectionKind.RdaCarrera, out var rdaCarLines))
            {
                var raw = JoinCleanLines(rdaCarLines);
                draft.RdaCarrera = PeaDocumentExtractorService.NormalizeRdaToHtml(raw);
            }

            if (sections.TryGetValue(PeaSectionKind.RdaAsignatura, out var rdaAsigLines))
            {
                var raw = JoinCleanLines(rdaAsigLines);
                draft.ResultadosAprendizaje = PeaDocumentExtractorService.NormalizeRdaToHtml(raw);
            }

            if (sections.TryGetValue(PeaSectionKind.Contenidos, out var contLines))
            {
                draft.Unidades = ParseUnidades(contLines);
            }

            if (sections.TryGetValue(PeaSectionKind.Metodologia, out var metLines))
            {
                ParseMetodologiaYRecursosInline(metLines, sections, out var onlyMetLines);
                draft.MetodologiaEnsenanza = ParseFlowParagraphsToHtml(onlyMetLines);
            }

            if (sections.TryGetValue(PeaSectionKind.Recursos, out var recLines))
            {
                draft.RecursosDidacticos = ParseResourcesToHtml(recLines);
            }

            if (sections.TryGetValue(PeaSectionKind.Practicas, out var pracLines))
            {
                draft.ActividadesPracticas = ParseActividadesPracticas(pracLines, draft.Unidades.Count);
            }

            if (sections.TryGetValue(PeaSectionKind.Evaluacion, out var evalLines))
            {
                draft.Evaluaciones = ParseEvaluaciones(evalLines);
            }

            if (sections.TryGetValue(PeaSectionKind.Bibliografia, out var bibLines))
            {
                draft.Bibliografias = ParseBibliografias(bibLines);
            }

            return draft;
        }

        private static Dictionary<PeaSectionKind, List<string>> SliceSections(string text)
        {
            var result = new Dictionary<PeaSectionKind, List<string>>();
            var lines = text.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            PeaSectionKind? current = null;

            foreach (var rawLine in lines)
            {
                string trimmed = rawLine.Trim();
                if (string.IsNullOrWhiteSpace(trimmed) ||
                    PageMarkerRegex.IsMatch(trimmed) ||
                    PageFooterRegex.IsMatch(trimmed) ||
                    TableTagRegex.IsMatch(trimmed))
                {
                    continue;
                }

                // Caso especial de tabla de 2 columnas en g): "METODOLOGÍA DE ENSEÑANZA | RECURSOS DIDÁCTICOS" (con '|' o espacios múltiples)
                var cols = SplitTableColumns(trimmed);
                if (cols.Count >= 2 &&
                    Regex.IsMatch(cols[0], @"metodolog[ií]a(?:\s+de\s+ense[ñn]anza)?", RegexOptions.IgnoreCase) &&
                    Regex.IsMatch(cols[1], @"recursos?\s+did[aá]cticos?", RegexOptions.IgnoreCase))
                {
                    current = PeaSectionKind.Metodologia;
                    EnsureSectionList(result, PeaSectionKind.Metodologia);
                    EnsureSectionList(result, PeaSectionKind.Recursos);
                    continue;
                }

                string candidate = trimmed.Contains('|')
                    ? trimmed.Split('|')[0].Trim()
                    : trimmed;

                var matched = MatchSectionHeader(candidate, out string trailingContent);
                if (matched.HasValue)
                {
                    current = matched.Value;
                    if (current == PeaSectionKind.Firmas)
                    {
                        break;
                    }

                    EnsureSectionList(result, current.Value);
                    if (!string.IsNullOrWhiteSpace(trailingContent))
                    {
                        result[current.Value].Add(trailingContent);
                    }
                    continue;
                }

                if (current.HasValue && current.Value != PeaSectionKind.Firmas)
                {
                    result[current.Value].Add(trimmed);
                }
            }

            return result;
        }

        private static void EnsureSectionList(Dictionary<PeaSectionKind, List<string>> dict, PeaSectionKind kind)
        {
            if (!dict.ContainsKey(kind))
            {
                dict[kind] = new List<string>();
            }
        }

        private static PeaSectionKind? MatchSectionHeader(string candidate, out string trailingContent)
        {
            trailingContent = string.Empty;
            if (candidate.Length > 150) return null;

            foreach (var (kind, pattern) in SectionMatchers)
            {
                var m = pattern.Match(candidate);
                if (m.Success)
                {
                    string rest = candidate.Substring(m.Length).Trim().TrimStart(':', '-', '.').Trim();
                    bool hasExplicitSectionPrefix = Regex.IsMatch(candidate, @"^(?:[a-k]|\d{1,2})[\)\.\-]\s+", RegexOptions.IgnoreCase);
                    if (rest.Length > 80 && !hasExplicitSectionPrefix)
                    {
                        continue;
                    }

                    trailingContent = rest;
                    return kind;
                }
            }

            return null;
        }

        private static void ParseGeneralData(List<string> lines, PeaStructuredDraftDto draft)
        {
            // Normalizar líneas uniendo pares clave-valor que quedaron en líneas separadas (ej. "MODALIDAD:\nPresencial")
            var normalizedTokens = new List<string>();
            for (int i = 0; i < lines.Count; i++)
            {
                var cols = SplitTableColumns(lines[i]);
                foreach (var col in cols)
                {
                    if (col.EndsWith(':') && i + 1 < lines.Count && !lines[i + 1].Contains(':'))
                    {
                        var nextCols = SplitTableColumns(lines[i + 1]);
                        if (nextCols.Count > 0)
                        {
                            normalizedTokens.Add($"{col} {nextCols[0]}");
                            continue;
                        }
                    }
                    normalizedTokens.Add(col);
                }
            }

            string fullBlock = string.Join("\n", normalizedTokens);

            var modMatch = Regex.Match(fullBlock, @"(?i)modalidad(?:\s+de\s+estudio)?\s*[:\-]\s*([^\r\n\|]+)");
            if (modMatch.Success)
            {
                string rawMod = modMatch.Groups[1].Value.Trim();
                if (rawMod.Contains("Presencial", StringComparison.OrdinalIgnoreCase))
                    draft.Modalidad = rawMod.Contains("Semi", StringComparison.OrdinalIgnoreCase) ? "Semipresencial" : "Presencial";
                else if (rawMod.Contains("Línea", StringComparison.OrdinalIgnoreCase) || rawMod.Contains("Linea", StringComparison.OrdinalIgnoreCase))
                    draft.Modalidad = "En Línea";
                else if (rawMod.Contains("Híbrida", StringComparison.OrdinalIgnoreCase) || rawMod.Contains("Hibrida", StringComparison.OrdinalIgnoreCase))
                    draft.Modalidad = "Híbrida";
                else if (rawMod.Contains("Dual", StringComparison.OrdinalIgnoreCase))
                    draft.Modalidad = "Dual";
                else if (rawMod.Length <= 40)
                    draft.Modalidad = rawMod;
            }

            var unitMatch = Regex.Match(fullBlock, @"(?i)unidad\s+de\s+organizaci[oó]n(?:\s+curricular)?\s*[:\-]\s*([^\r\n\|]+)");
            if (unitMatch.Success)
            {
                string rawU = unitMatch.Groups[1].Value.Trim();
                string uUpper = rawU.ToUpperInvariant();
                if (uUpper.Contains("PROFESIONAL")) draft.UnidadOrganizacion = "Unidad Profesional";
                else if (uUpper.Contains("BASIC") || uUpper.Contains("BÁSIC") || uUpper.Contains("TRONCO")) draft.UnidadOrganizacion = "Unidad Básica";
                else if (uUpper.Contains("INTEGRA") || uUpper.Contains("TITULA")) draft.UnidadOrganizacion = "Unidad de Integración Curricular";
                else if (rawU.Length <= 60) draft.UnidadOrganizacion = rawU;
            }

            var semMatch = Regex.Match(fullBlock, @"(?i)(?:semestre|nivel|per[ií]odo\s+acad[eé]mico\s+nivel)\s*[:\-]\s*([^\r\n\|]+)");
            if (semMatch.Success)
            {
                string rawSem = semMatch.Groups[1].Value.Trim();
                if (rawSem.Length <= 40 && !IsNoiseValue(rawSem))
                    draft.Semestre = rawSem;
            }

            var codMatch = Regex.Match(fullBlock, @"(?i)c[oó]digo(?:\s+de)?\s+carrera\s*[:\-]\s*([A-Z0-9\-]{2,15})");
            if (codMatch.Success)
            {
                draft.CodigoCarrera = codMatch.Groups[1].Value.Trim().ToUpperInvariant();
            }

            var credMatch = Regex.Match(fullBlock, @"(?i)cr[eé]ditos\s*[:\-]\s*(\d+(?:[\.,]\d+)?)");
            if (credMatch.Success && TryParseDecimal(credMatch.Groups[1].Value, out decimal credVal) && credVal > 0)
            {
                draft.Creditos = credVal;
            }

            draft.TotalHorasAsignatura = ExtractIntFromRegex(fullBlock, @"(?i)(?:total\s+(?:de\s+)?horas(?:\s+de\s+la\s+asignatura)?|n[uú]mero\s+de\s+horas)\s*[:\-]\s*(\d+)");
            draft.HorasContactoDocente = ExtractIntFromRegex(fullBlock, @"(?i)horas\s+(?:de\s+)?contacto(?:\s+con\s+el)?\s+docente\s*[:\-]\s*(\d+)");
            draft.HorasPracticoExperimental = ExtractIntFromRegex(fullBlock, @"(?i)horas\s+(?:de\s+)?(?:aprendizaje\s+)?pr[aá]ctico[\s\-]+experimental\s*[:\-]\s*(\d+)");
            draft.HorasAutonomo = ExtractIntFromRegex(fullBlock, @"(?i)horas\s+(?:de\s+)?(?:aprendizaje|trabajo)\s+aut[oó]nomo\s*[:\-]\s*(\d+)");
        }

        private static List<PeaDraftPrerrequisitoDto> ParsePrerrequisitos(List<string> lines)
        {
            var list = new List<PeaDraftPrerrequisitoDto>();
            foreach (var line in lines)
            {
                if (IsTableHeaderOrEmptyRow(line, "asignatura", "prerrequisito", "prerrequisitos", "observaciones", "observacion", "código", "codigo", "ninguno", "n/a"))
                {
                    continue;
                }

                var cells = SplitTableColumns(line).Where(c => !IsNoiseValue(c)).ToList();
                if (cells.Count >= 2)
                {
                    list.Add(new PeaDraftPrerrequisitoDto
                    {
                        Asignatura = StripBulletPrefix(cells[0]),
                        Observacion = cells[1]
                    });
                }
                else if (cells.Count == 1)
                {
                    string clean = StripBulletPrefix(cells[0]);
                    if (clean.Length >= 3)
                    {
                        list.Add(new PeaDraftPrerrequisitoDto
                        {
                            Asignatura = clean,
                            Observacion = "Haber cursado y aprobado la asignatura según malla curricular"
                        });
                    }
                }
            }
            return list;
        }

        private static List<PeaDraftUnidadDto> ParseUnidades(List<string> lines)
        {
            var units = new List<PeaDraftUnidadDto>();
            var unitStartRegex = new Regex(@"(?i)(?:^|\|\s*)(?:unidad\s*(?:tem[aá]tica|de\s*estudio)?|bloque|m[oó]dulo)\s*(\d+|[IVX]+)\s*[:\.\-]?\s*(.*)$");

            PeaDraftUnidadDto? currentUnit = null;
            var currentTopics = new List<string>();
            int nextUnitIdx = 1;

            void FlushCurrentUnit()
            {
                if (currentUnit == null) return;
                string rawContenidos = string.Join("\n", currentTopics).Trim();
                rawContenidos = PeaDocumentExtractorService.CleanContenidosOrphanNumbers(rawContenidos);
                currentUnit.Contenidos = rawContenidos;
                currentUnit.Titulo = PeaDocumentExtractorService.CompleteTruncatedUnitTitle(currentUnit.Titulo, rawContenidos, currentUnit.Num);
                units.Add(currentUnit);
                currentTopics.Clear();
            }

            foreach (var line in lines)
            {
                if (IsTableHeaderOrEmptyRow(line, "unidades de estudio", "contenidos", "horas contacto", "total de horas", "horas de aprendizaje"))
                {
                    continue;
                }

                var m = unitStartRegex.Match(line);
                if (m.Success)
                {
                    FlushCurrentUnit();
                    int unitNum = ParseUnitNumber(m.Groups[1].Value, nextUnitIdx);
                    nextUnitIdx = unitNum + 1;

                    string rest = m.Groups[2].Value.Trim();
                    var cols = SplitTableColumns(rest);
                    string titlePart = cols.Count > 0 ? cols[0] : rest;
                    string inlineExtra = cols.Count > 1 ? string.Join(" | ", cols.Skip(1)) : string.Empty;

                    // Detectar si al final de la línea vienen 3 o 4 números de horas en columna PDF (ej. "Fundamentos Web | 10 | 10 | 10 | 30")
                    string cleanTitle = Regex.Replace(titlePart, @"^[:\.\-\s]+", string.Empty).Trim();
                    currentUnit = new PeaDraftUnidadDto
                    {
                        Num = unitNum,
                        Titulo = string.IsNullOrWhiteSpace(cleanTitle) ? $"Unidad Temática {unitNum}" : cleanTitle
                    };

                    if (!string.IsNullOrWhiteSpace(inlineExtra))
                    {
                        if (!TryApplyInlineUnitHours(inlineExtra, currentUnit))
                        {
                            TryApplyTrailingNumericColumnsHours(cols.Skip(1).ToList(), currentUnit);
                        }
                    }
                    continue;
                }

                if (currentUnit == null)
                {
                    continue;
                }

                if (TryApplyInlineUnitHours(line, currentUnit))
                {
                    continue;
                }

                var topicCells = SplitTableColumns(line)
                    .Where(c => !IsNoiseValue(c) && !Regex.IsMatch(c, @"^\d{1,2}$"))
                    .ToList();

                // Si las últimas 3 o 4 columnas son números de horas (fila de resumen de unidad), aplicarlas
                if (topicCells.Count >= 3 && TryApplyTrailingNumericColumnsHours(topicCells, currentUnit))
                {
                    var textOnly = topicCells.Take(topicCells.Count - (topicCells.Count >= 4 && decimal.TryParse(topicCells[^4], out _) ? 4 : 3)).ToList();
                    if (textOnly.Count == 0) continue;
                    topicCells = textOnly;
                }

                string topicText = string.Join(" - ", topicCells).Replace(" / ", "\n").Trim();
                if (!string.IsNullOrWhiteSpace(topicText))
                {
                    currentTopics.Add(topicText);
                }
            }

            FlushCurrentUnit();
            return units;
        }

        private static bool TryApplyTrailingNumericColumnsHours(List<string> cols, PeaDraftUnidadDto unit)
        {
            var numbers = new List<decimal>();
            for (int i = cols.Count - 1; i >= 0 && numbers.Count < 4; i--)
            {
                if (TryParseDecimal(cols[i], out decimal val) && val >= 0 && val <= 300)
                {
                    numbers.Insert(0, val);
                }
                else
                {
                    break;
                }
            }

            if (numbers.Count == 3)
            {
                unit.HorasCD = numbers[0];
                unit.HorasAPE = numbers[1];
                unit.HorasTA = numbers[2];
                return true;
            }

            if (numbers.Count == 4 && Math.Abs((numbers[0] + numbers[1] + numbers[2]) - numbers[3]) < 0.01m)
            {
                unit.HorasCD = numbers[0];
                unit.HorasAPE = numbers[1];
                unit.HorasTA = numbers[2];
                return true;
            }

            return false;
        }

        private static bool TryApplyInlineUnitHours(string text, PeaDraftUnidadDto unit)
        {
            bool matched = false;
            var cdMatch = Regex.Match(text, @"(?i)(?:horas?\s+(?:de\s+)?contacto(?:\s+con\s+el)?\s+docente|\bCD\b)\s*[:\-]?\s*(\d+(?:[\.,]\d+)?)");
            if (cdMatch.Success && TryParseDecimal(cdMatch.Groups[1].Value, out decimal cd))
            {
                unit.HorasCD = cd;
                matched = true;
            }

            var apeMatch = Regex.Match(text, @"(?i)(?:horas?\s+(?:de\s+)?pr[aá]ctico[\s\-]+experimental|\bAPE\b)\s*[:\-]?\s*(\d+(?:[\.,]\d+)?)");
            if (apeMatch.Success && TryParseDecimal(apeMatch.Groups[1].Value, out decimal ape))
            {
                unit.HorasAPE = ape;
                matched = true;
            }

            var taMatch = Regex.Match(text, @"(?i)(?:horas?\s+(?:de\s+)?(?:aprendizaje|trabajo)\s+aut[oó]nomo|\bTA\b)\s*[:\-]?\s*(\d+(?:[\.,]\d+)?)");
            if (taMatch.Success && TryParseDecimal(taMatch.Groups[1].Value, out decimal ta))
            {
                unit.HorasTA = ta;
                matched = true;
            }

            if (!matched)
            {
                var totalMatch = Regex.Match(text, @"(?i)total\s+(?:de\s+)?horas(?:\s+por\s+unidad)?\s*[:\-]?\s*(\d+(?:[\.,]\d+)?)");
                if (totalMatch.Success && TryParseDecimal(totalMatch.Groups[1].Value, out decimal tot) && tot > 0)
                {
                    decimal third = Math.Floor((tot / 3m) * 100m) / 100m;
                    unit.HorasCD = third;
                    unit.HorasAPE = third;
                    unit.HorasTA = tot - third - third;
                    matched = true;
                }
            }

            return matched;
        }

        private static void ParseMetodologiaYRecursosInline(
            List<string> metLines,
            Dictionary<PeaSectionKind, List<string>> sections,
            out List<string> onlyMetLines)
        {
            onlyMetLines = new List<string>();
            bool hasSeparateRecursos = sections.ContainsKey(PeaSectionKind.Recursos) && sections[PeaSectionKind.Recursos].Count > 0;

            foreach (var line in metLines)
            {
                var cells = SplitTableColumns(line);
                if (cells.Count >= 2)
                {
                    if (!IsNoiseValue(cells[0]))
                    {
                        onlyMetLines.Add(cells[0]);
                    }
                    if (!hasSeparateRecursos && !IsNoiseValue(cells[1]))
                    {
                        EnsureSectionList(sections, PeaSectionKind.Recursos);
                        sections[PeaSectionKind.Recursos].Add(cells[1]);
                    }
                }
                else
                {
                    onlyMetLines.Add(line);
                }
            }
        }

        private static List<PeaDraftActividadPracticaDto> ParseActividadesPracticas(List<string> lines, int totalUnits)
        {
            var list = new List<PeaDraftActividadPracticaDto>();
            int idx = 1;

            foreach (var line in lines)
            {
                if (IsTableHeaderOrEmptyRow(line, "unidad", "nombre de la práctica", "caracterización", "caracterizacion", "escenario", "producto"))
                {
                    continue;
                }

                var cells = SplitTableColumns(line).Where(c => !IsNoiseValue(c)).ToList();
                if (cells.Count >= 2 && Regex.IsMatch(cells[0], @"^\d+(?:\s*[,;\-y]\s*\d+)*$"))
                {
                    string unidadStr = cells[0];
                    string desc = string.Join(" - ", cells.Skip(1));
                    int unidadNum = ExtractFirstInt(unidadStr, ((idx - 1) % Math.Max(1, totalUnits)) + 1);

                    list.Add(new PeaDraftActividadPracticaDto
                    {
                        Unidad = unidadNum,
                        UnidadTexto = unidadStr,
                        Nombre = desc,
                        Caracterizacion = desc,
                        Horas = 2m
                    });
                    idx++;
                    continue;
                }

                // Caso PDF sin tabulador/doble espacio: "1 Construcción de..." o "1, 2 Despliegue..."
                var inlinePracticeMatch = Regex.Match(line, @"^(\d+(?:\s*,\s*\d+)*)\s+(.{8,})$");
                if (inlinePracticeMatch.Success && !Regex.IsMatch(line, @"^\d+\.\d+"))
                {
                    string unidadStr = inlinePracticeMatch.Groups[1].Value.Trim();
                    string desc = inlinePracticeMatch.Groups[2].Value.Trim();
                    int unidadNum = ExtractFirstInt(unidadStr, ((idx - 1) % Math.Max(1, totalUnits)) + 1);

                    list.Add(new PeaDraftActividadPracticaDto
                    {
                        Unidad = unidadNum,
                        UnidadTexto = unidadStr,
                        Nombre = desc,
                        Caracterizacion = desc,
                        Horas = 2m
                    });
                    idx++;
                    continue;
                }

                // Continuación de línea de una práctica previa en PDF
                string clean = StripBulletPrefix(line.Replace("|", " ").Trim());
                if (IsNoiseValue(clean)) continue;

                if (list.Count > 0 && !line.Contains('|') && !Regex.IsMatch(line, @"^(?:[-•*]|\d+[\.\)])\s+"))
                {
                    var last = list[^1];
                    last.Nombre = $"{last.Nombre} {clean}".Trim();
                    last.Caracterizacion = last.Nombre;
                }
                else if (clean.Length >= 8)
                {
                    int unidadNum = ((idx - 1) % Math.Max(1, totalUnits)) + 1;
                    list.Add(new PeaDraftActividadPracticaDto
                    {
                        Unidad = unidadNum,
                        UnidadTexto = unidadNum.ToString(),
                        Nombre = clean,
                        Caracterizacion = clean,
                        Horas = 2m
                    });
                    idx++;
                }
            }

            return list;
        }

        private static List<PeaDraftEvaluacionDto> ParseEvaluaciones(List<string> lines)
        {
            var list = new List<PeaDraftEvaluacionDto>();

            foreach (var line in lines)
            {
                if (IsTableHeaderOrEmptyRow(line, "nota", "tipo de evaluación", "tipo de evaluacion", "calificación", "calificacion", "total"))
                {
                    continue;
                }

                var cells = SplitTableColumns(line).Where(c => !IsNoiseValue(c)).ToList();
                if (cells.Count >= 2)
                {
                    string nota = cells[0];
                    if (nota.Equals("TOTAL", StringComparison.OrdinalIgnoreCase)) continue;

                    string tipo = cells.Count >= 2 ? cells[1] : string.Empty;
                    decimal calif = 10m;
                    if (cells.Count >= 3 && TryParseDecimal(Regex.Replace(cells[^1], @"[^\d\.,]", ""), out decimal parsed) && parsed > 0)
                    {
                        calif = parsed;
                    }

                    list.Add(new PeaDraftEvaluacionDto
                    {
                        Nota = nota,
                        Tipo = tipo,
                        Calificacion = calif
                    });
                    continue;
                }

                // Caso PDF de una sola línea sin tabulador: "FRECUENTE Actividades autónomas 3.00"
                var pdfEvalMatch = Regex.Match(line, @"(?i)^(FRECUENTE|PARCIAL|FINAL|GESTI[ÓO]N\s+FORMATIVA|GESTI[ÓO]N\s+PR[ÁA]CTICA|EXAMEN(?:\s+FINAL)?)\s+(.+?)\s+(\d+(?:[\.,]\d+)?)$");
                if (pdfEvalMatch.Success && TryParseDecimal(pdfEvalMatch.Groups[3].Value, out decimal pdfCalif))
                {
                    list.Add(new PeaDraftEvaluacionDto
                    {
                        Nota = pdfEvalMatch.Groups[1].Value.Trim(),
                        Tipo = pdfEvalMatch.Groups[2].Value.Trim(),
                        Calificacion = pdfCalif > 0 ? pdfCalif : 10m
                    });
                }
            }

            return list;
        }

        private static List<PeaDraftBibliografiaDto> ParseBibliografias(List<string> lines)
        {
            var list = new List<PeaDraftBibliografiaDto>();
            string currentTipo = "Basica";

            foreach (var line in lines)
            {
                if (Regex.IsMatch(line, @"(?i)^bibliograf[ií]a\s+b[aá]sica\b"))
                {
                    currentTipo = "Basica";
                    string rest = Regex.Replace(line, @"(?i)^bibliograf[ií]a\s+b[aá]sica\s*[:\-]?\s*", "").Trim();
                    if (!string.IsNullOrWhiteSpace(rest) && !IsNoiseValue(rest))
                    {
                        AppendOrAddBibliografia(list, currentTipo, rest, forceNew: true);
                    }
                    continue;
                }

                if (Regex.IsMatch(line, @"(?i)^bibliograf[ií]a\s+(?:de\s+)?(?:consulta|complementaria)\b"))
                {
                    currentTipo = "Consulta";
                    string rest = Regex.Replace(line, @"(?i)^bibliograf[ií]a\s+(?:de\s+)?(?:consulta|complementaria)\s*[:\-]?\s*", "").Trim();
                    if (!string.IsNullOrWhiteSpace(rest) && !IsNoiseValue(rest))
                    {
                        AppendOrAddBibliografia(list, currentTipo, rest, forceNew: true);
                    }
                    continue;
                }

                string cleanedLine = line.Replace("|", " ").Trim();
                var parts = cleanedLine.Split(new[] { " / " }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var p in parts)
                {
                    string rawPart = p.Trim();
                    bool startsAsNewEntry =
                        Regex.IsMatch(rawPart, @"^(?:[-•*]|\d+[\.\)\-])\s+") ||
                        Regex.IsMatch(rawPart, @"^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+,\s*[A-ZÁÉÍÓÚÑ]\.");

                    string entry = StripBulletPrefix(rawPart);
                    if (!IsNoiseValue(entry) && entry.Length >= 4)
                    {
                        AppendOrAddBibliografia(list, currentTipo, entry, forceNew: startsAsNewEntry);
                    }
                }
            }

            // Descartar fragmentos sueltos demasiado cortos que no conformen una referencia real
            return list.Where(b => b.CitaCompletaApa.Length >= 10).ToList();
        }

        private static void AppendOrAddBibliografia(List<PeaDraftBibliografiaDto> list, string tipo, string text, bool forceNew)
        {
            if (!forceNew && list.Count > 0 && list[^1].TipoBibliografia == tipo)
            {
                var last = list[^1];
                bool textLooksLikeStandaloneCitation = Regex.IsMatch(text, @"\(\d{4}\)") || text.Length >= 55;
                bool prevLooksIncomplete = !last.CitaCompletaApa.EndsWith('.')
                    || char.IsLower(text[0])
                    || text.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                    || !textLooksLikeStandaloneCitation;

                if (prevLooksIncomplete)
                {
                    last.CitaCompletaApa = $"{last.CitaCompletaApa} {text}".Trim();
                    last.TituloLibro = last.CitaCompletaApa;
                    return;
                }
            }

            list.Add(new PeaDraftBibliografiaDto
            {
                TipoBibliografia = tipo,
                TituloLibro = text,
                CitaCompletaApa = text
            });
        }

        private static string ParseFlowParagraphsToHtml(List<string> lines)
        {
            var rawSegments = lines
                .Select(l => l.Replace("|", " ").Replace(" / ", "\n").Trim())
                .SelectMany(l => l.Split('\n', StringSplitOptions.RemoveEmptyEntries))
                .Select(l => l.Trim())
                .Where(l => !string.IsNullOrWhiteSpace(l) && !IsNoiseValue(l))
                .ToList();

            if (rawSegments.Count == 0) return string.Empty;

            // Reunir líneas partidas por ancho de página en PDF cuando una línea no termina en puntuación de cierre
            var paragraphs = new List<string>();
            foreach (var seg in rawSegments)
            {
                bool startsBulletOrTitle = Regex.IsMatch(seg, @"^(?:[-•*]|\d+[\.\)]|[A-ZÁÉÍÓÚÑ][^:]{2,55}:)");
                if (paragraphs.Count > 0 && !startsBulletOrTitle)
                {
                    string prev = paragraphs[^1];
                    if (!prev.EndsWith('.') && !prev.EndsWith(':') && !prev.EndsWith(';'))
                    {
                        paragraphs[^1] = $"{prev} {seg}";
                        continue;
                    }
                }
                paragraphs.Add(seg);
            }

            return string.Join("", paragraphs.Select(p => $"<p>{PeaDocumentExtractorService.EscapeBasicHtml(p)}</p>"));
        }

        private static string ParseResourcesToHtml(List<string> lines)
        {
            var items = new List<string>();
            foreach (var line in lines)
            {
                var splitParts = SplitTableColumns(line)
                    .SelectMany(c => c.Split(new[] { " / ", "\n", ";" }, StringSplitOptions.RemoveEmptyEntries));

                foreach (var part in splitParts)
                {
                    string clean = StripBulletPrefix(part.Trim());
                    if (!string.IsNullOrWhiteSpace(clean) && !IsNoiseValue(clean))
                    {
                        items.Add(clean);
                    }
                }
            }

            if (items.Count == 0) return string.Empty;
            if (items.Count == 1) return $"<p>{PeaDocumentExtractorService.EscapeBasicHtml(items[0])}</p>";
            return $"<ul>{string.Join("", items.Select(i => $"<li>{PeaDocumentExtractorService.EscapeBasicHtml(i)}</li>"))}</ul>";
        }

        private static string JoinCleanLines(List<string> lines)
        {
            return string.Join("\n", lines
                .Select(l => l.Replace("|", " ").Replace(" / ", "\n").Trim())
                .Where(l => !string.IsNullOrWhiteSpace(l) && !IsNoiseValue(l)));
        }

        private static List<string> SplitTableColumns(string line)
        {
            if (string.IsNullOrWhiteSpace(line)) return new List<string>();

            if (line.Contains('|'))
            {
                return line.Split('|').Select(c => c.Trim()).Where(c => !string.IsNullOrWhiteSpace(c)).ToList();
            }

            return MultiSpaceColumnSplitRegex.Split(line)
                .Select(c => c.Trim())
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .ToList();
        }

        private static bool IsTableHeaderOrEmptyRow(string line, params string[] headerTokens)
        {
            string lower = line.ToLowerInvariant().Trim();
            if (IsNoiseValue(lower)) return true;

            int matches = headerTokens.Count(token => lower.Contains(token));
            if (matches >= 2) return true;

            var cols = SplitTableColumns(line);
            if (cols.Count > 0)
            {
                string firstCell = cols[0].TrimEnd(':').ToLowerInvariant();
                if (headerTokens.Any(token => firstCell == token))
                {
                    return true;
                }
            }

            return false;
        }

        private static bool IsNoiseValue(string value)
        {
            string trimmed = value.Trim();
            return string.IsNullOrWhiteSpace(trimmed) ||
                   trimmed == "---" ||
                   trimmed == "-" ||
                   trimmed.Equals("ninguno", StringComparison.OrdinalIgnoreCase) ||
                   trimmed.Equals("n/a", StringComparison.OrdinalIgnoreCase) ||
                   trimmed.Equals("no aplica", StringComparison.OrdinalIgnoreCase);
        }

        private static string StripBulletPrefix(string line)
        {
            return Regex.Replace(line, @"^(?:[-•*]|\d+[\.\)\-])\s*", string.Empty).Trim();
        }

        private static int ParseUnitNumber(string raw, int fallback)
        {
            if (int.TryParse(raw, out int num) && num > 0) return num;
            return raw.ToUpperInvariant() switch
            {
                "I" => 1,
                "II" => 2,
                "III" => 3,
                "IV" => 4,
                "V" => 5,
                "VI" => 6,
                "VII" => 7,
                "VIII" => 8,
                _ => fallback
            };
        }

        private static int ExtractIntFromRegex(string text, string pattern)
        {
            var m = Regex.Match(text, pattern);
            return m.Success && int.TryParse(m.Groups[1].Value, out int val) ? val : 0;
        }

        private static int ExtractFirstInt(string text, int fallback)
        {
            var m = Regex.Match(text, @"\d+");
            return m.Success && int.TryParse(m.Value, out int val) && val > 0 ? val : fallback;
        }

        private static bool TryParseDecimal(string raw, out decimal value)
        {
            return decimal.TryParse(raw.Replace(',', '.'), NumberStyles.Any, CultureInfo.InvariantCulture, out value);
        }
    }
}
