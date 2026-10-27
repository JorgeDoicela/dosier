using HandlebarsDotNet;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Globalization;
using System.Linq;
using Dosier.Domain.Common.Documents;
using System.Collections.Generic;

namespace Dosier.Infrastructure.Common.Documents.Engine
{
    /// <summary>
    /// Motor de renderizado de DOSIER Builder (usando Handlebars.Net).
    /// Sintaxis: {{ variable_en_snake_case }} — compatible con el estándar Handlebars/Mustache.
    /// </summary>
    public partial class HandlebarsTemplateEngine
    {
        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            WriteIndented = false,
            // Importante: serializar nulls para que Handlebars no falle
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never
        };

        private readonly IHandlebars _handlebars;

        public HandlebarsTemplateEngine()
        {
            _handlebars = Handlebars.Create();
            RegisterCustomHelpers(_handlebars);
        }

        private static readonly object _compileLock = new();

        public async Task<string> RenderAsync(
            string templateHtml,
            object data,
            Dictionary<string, object?>? extraVariables = null,
            bool isBlindMode = false)
        {
            if (!string.IsNullOrEmpty(templateHtml))
            {
                if (templateHtml.Contains("#if_eq"))
                {
                    templateHtml = System.Text.RegularExpressions.Regex.Replace(
                        templateHtml,
                        @"\{\{\#if_eq\s+([^}]+)\}\}",
                        "{{#if (eq $1)}}"
                    );
                    templateHtml = templateHtml.Replace("{{/if_eq}}", "{{/if}}");
                }

                // Normalizar sintaxis con pipes (ej: {{ data.project_title | default: data.certificate_title }}) a {{default data.project_title data.certificate_title}}
                if (templateHtml.Contains("| default:"))
                {
                    templateHtml = System.Text.RegularExpressions.Regex.Replace(
                        templateHtml,
                        @"\{\{\s*([^}|]+)\s*\|\s*default:\s*([^}]+)\s*\}\}",
                        m =>
                        {
                            var left = m.Groups[1].Value.Trim();
                            var right = m.Groups[2].Value.Replace("| default:", " ").Trim();
                            return $"{{{{default {left} {right}}}}}";
                        }
                    );
                }

                // Normalizar bucles legados Scriban/Liquid {{ for inv in ... }} a Handlebars {{#each ...}}
                if (templateHtml.Contains("{{ for "))
                {
                    templateHtml = System.Text.RegularExpressions.Regex.Replace(
                        templateHtml,
                        @"\{\{\s*for\s+\w+\s+in\s+([^\}|]+)(?:\|\|[^\}]+)?\s*\}\}",
                        "{{#each $1}}"
                    );
                    templateHtml = System.Text.RegularExpressions.Regex.Replace(
                        templateHtml,
                        @"\{\{\s*end\s*\}\}",
                        "{{/each}}"
                    );
                }
            }

            HandlebarsTemplate<object, object> compiled;
            string rendered;

            lock (_compileLock)
            {
                try
                {
                    compiled = _handlebars.Compile(templateHtml);
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException(
                        $"Error al compilar plantilla DOSIER: {ex.Message}", ex);
                }

                var context = BuildContext(data, extraVariables, isBlindMode);
                rendered = compiled(context);
            }

            return await Task.FromResult(rendered);
        }

        private static bool IsEmptyValue(object? val)
        {
            if (val == null) return true;
            if (val is string s) return string.IsNullOrWhiteSpace(s);
            if (val is int i) return i == 0;
            if (val is long l) return l == 0;
            if (val is double d) return d == 0;
            if (val is decimal dec) return dec == 0;
            if (val is System.Collections.ICollection c) return c.Count == 0;
            return false;
        }

        private static object? CleanElement(JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.Object)
            {
                var dict = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
                var keyCaseMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

                foreach (var prop in element.EnumerateObject())
                {
                    var name = prop.Name;
                    var val = prop.Value;
                    object? cleanedVal;

                    if (val.ValueKind == JsonValueKind.String)
                    {
                        var strVal = val.GetString()?.Trim();
                        if (!string.IsNullOrEmpty(strVal) &&
                            ((strVal.StartsWith("[") && strVal.EndsWith("]")) ||
                              (strVal.StartsWith("{") && strVal.EndsWith("}"))))
                        {
                            try
                            {
                                using var nestedDoc = JsonDocument.Parse(strVal);
                                cleanedVal = CleanElement(nestedDoc.RootElement);
                            }
                            catch
                            {
                                cleanedVal = strVal;
                            }
                        }
                        else
                        {
                            cleanedVal = CleanElement(val);
                        }
                    }
                    else
                    {
                        cleanedVal = CleanElement(val);
                    }

                    if (dict.TryGetValue(name, out var existingVal))
                    {
                        bool isExistingEmpty = IsEmptyValue(existingVal);
                        bool isNewEmpty = IsEmptyValue(cleanedVal);

                        if (isExistingEmpty && !isNewEmpty)
                        {
                            dict[name] = cleanedVal;
                            keyCaseMap[name] = name;
                        }
                        else if (!isExistingEmpty && isNewEmpty)
                        {
                            // Conservar existingVal
                        }
                        else
                        {
                            if (!string.IsNullOrEmpty(name) && keyCaseMap.TryGetValue(name, out var currentKey) && !string.IsNullOrEmpty(currentKey))
                            {
                                if (char.IsUpper(name[0]) && !char.IsUpper(currentKey[0]))
                                {
                                    keyCaseMap[name] = name;
                                }
                            }
                        }
                    }
                    else
                    {
                        dict[name] = cleanedVal;
                        keyCaseMap[name] = name;
                    }
                }

                var result = new Dictionary<string, object?>();
                foreach (var kvp in dict)
                {
                    var properKey = keyCaseMap.TryGetValue(kvp.Key, out var k) ? k : kvp.Key;
                    result[properKey] = kvp.Value;
                }
                return result;
            }
            else if (element.ValueKind == JsonValueKind.Array)
            {
                var list = new List<object?>();
                foreach (var item in element.EnumerateArray())
                {
                    list.Add(CleanElement(item));
                }
                return list;
            }
            else
            {
                return ToNativeType(element);
            }
        }

        public static string CleanAndNormalizeJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return json;

            // 1. Sanear errores comunes de "[object Object]"
            json = System.Text.RegularExpressions.Regex.Replace(
                json,
                @"\""([a-zA-Z0-9_]+)\""\s*:\s*\""\[object Object\]\""",
                "\"$1\":null",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );

            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind != JsonValueKind.Object)
                {
                    return json;
                }

                var cleaned = CleanElement(doc.RootElement);
                return JsonSerializer.Serialize(cleaned);
            }
            catch
            {
                return json;
            }
        }

        private Dictionary<string, object?> BuildContext(
            object data,
            Dictionary<string, object?>? extraVariables,
            bool isBlindMode)
        {
            // 1. Serializar el DTO a JSON
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            
            // Clean Yjs stringified nested values in the main JSON
            json = CleanAndNormalizeJson(json);
            
            // 2. Parsear a JsonDocument para navegar recursivamente
            using var doc = JsonDocument.Parse(json);
            var dict = ToNativeType(doc.RootElement) as Dictionary<string, object?> 
                       ?? new Dictionary<string, object?>();

            // 3. Fusionar datos y contenidos colaborativos en la raíz del contexto (resiliencia para campos dinámicos y directo en plantillas)
            if (dict.TryGetValue("data", out var dataVal) && dataVal is Dictionary<string, object?> nestedData)
            {
                foreach (var kv in nestedData)
                {
                    if (!dict.ContainsKey(kv.Key))
                    {
                        dict[kv.Key] = kv.Value;
                    }
                }
            }

            if (dict.TryGetValue("contenidocolaborativo", out var coworkVal) && coworkVal is Dictionary<string, object?> nestedCowork)
            {
                foreach (var kv in nestedCowork)
                {
                    // El contenido colaborativo editado puede sobrescribir datos base si coexisten
                    dict[kv.Key] = kv.Value;
                }
            }

            // Sincronizar alias de claves (PascalCase <-> snake_case) para resiliencia en plantillas Handlebars/Scriban
            void SyncKeyAlias(string k1, string k2)
            {
                object? val = null;
                bool IsValid(object? o) => o switch {
                    null => false,
                    string s => !string.IsNullOrWhiteSpace(s),
                    System.Collections.ICollection c => c.Count > 0,
                    _ => true
                };

                if (dict.TryGetValue(k1, out var v1) && IsValid(v1))
                {
                    val = v1;
                }
                else if (dict.TryGetValue(k2, out var v2) && IsValid(v2))
                {
                    val = v2;
                }

                if (val != null)
                {
                    dict[k1] = val;
                    dict[k2] = val;
                }
            }

            SyncKeyAlias("ObjetivoGeneral", "objetivo_general");
            SyncKeyAlias("ObjetivosEspecificos", "objetivos_especificos");
            SyncKeyAlias("Antecedentes", "antecedentes");
            SyncKeyAlias("DescripcionProyecto", "descripcion_proyecto");
            SyncKeyAlias("Justificacion", "justificacion");
            SyncKeyAlias("MarcoTeorico", "marco_teorico");
            SyncKeyAlias("Metodologia", "metodologia");
            SyncKeyAlias("Evaluacion", "evaluacion");
            SyncKeyAlias("Cronograma", "cronograma");
            SyncKeyAlias("FechaInicio", "fecha_inicio");
            SyncKeyAlias("FechaFin", "fecha_fin");
            SyncKeyAlias("FechaPresentacion", "fecha_presentacion");
            SyncKeyAlias("Titulo", "proyecto_titulo");
            SyncKeyAlias("titulo", "proyecto_titulo");
            SyncKeyAlias("title", "proyecto_titulo");
            SyncKeyAlias("DirectorProyecto", "director_nombre");
            SyncKeyAlias("director_proyecto", "director_nombre");
            SyncKeyAlias("Carrera", "director_carrera");
            SyncKeyAlias("carrera", "director_carrera");
            SyncKeyAlias("LineaInvestigacion", "linea_investigacion");
            SyncKeyAlias("SublineaInvestigacion", "sublinea_investigacion");
            SyncKeyAlias("sublinea", "sublinea_investigacion");
            SyncKeyAlias("TipoInvestigacion", "tipo_investigacion");
            SyncKeyAlias("tipo", "tipo_investigacion");
            SyncKeyAlias("Dominio", "dominio");
            SyncKeyAlias("dominio_academico", "dominio");
            SyncKeyAlias("Programa", "programa");
            SyncKeyAlias("ProgramaInvestigacion", "programa");
            SyncKeyAlias("programa_investigacion", "programa");
            SyncKeyAlias("GrupoInvestigacion", "grupo_investigacion");
            SyncKeyAlias("GrupoInvestigacionNombre", "grupo_investigacion");
            SyncKeyAlias("grupo_investigacion_nombre", "grupo_investigacion");
            SyncKeyAlias("CampoAmplio", "campo_amplio");
            SyncKeyAlias("CampoEspecifico", "campo_especifico");
            SyncKeyAlias("CampoDetallado", "campo_detallado");
            SyncKeyAlias("TiempoEjecucion", "duracion_meses");
            SyncKeyAlias("tiempo_ejecucion", "duracion_meses");
            SyncKeyAlias("ActividadesEjecutadas", "actividades_ejecutadas");
            SyncKeyAlias("ActividadesNoPrevistas", "actividades_no_previstas");
            SyncKeyAlias("Obstaculos", "obstaculos");
            SyncKeyAlias("EstadoEjecucion", "estado_ejecucion");
            SyncKeyAlias("DescripcionFaseActual", "descripcion_fase_actual");
            SyncKeyAlias("ObservacionesDirector", "observaciones_director");
            SyncKeyAlias("ObservacionesCoordinador", "observaciones_coordinador");

            // Subsecciones de Redacción de Informe Final (resiliencia bidireccional PascalCase <-> snake_case <-> sec_* <-> CACES legacy)
            SyncKeyAlias("Indice", "indice");
            SyncKeyAlias("Indice", "sec_indice");
            SyncKeyAlias("indice", "sec_indice");

            SyncKeyAlias("Resumen", "resumen");
            SyncKeyAlias("Resumen", "sec_resumen");
            SyncKeyAlias("resumen", "resumen_ejecutivo");
            SyncKeyAlias("sec_resumen", "resumen_ejecutivo");

            SyncKeyAlias("Introduccion", "introduccion");
            SyncKeyAlias("Introduccion", "sec_introduccion");
            SyncKeyAlias("introduccion", "sec_introduccion");

            SyncKeyAlias("Objetivos", "objetivos");
            SyncKeyAlias("Objetivos", "sec_objetivos");
            SyncKeyAlias("objetivos", "cumplimiento_objetivos");
            SyncKeyAlias("sec_objetivos", "cumplimiento_objetivos");

            SyncKeyAlias("Fundamentos", "fundamentos");
            SyncKeyAlias("Fundamentos", "sec_fundamentos");
            SyncKeyAlias("fundamentos", "sec_fundamentos");

            SyncKeyAlias("Metodos", "metodos");
            SyncKeyAlias("Metodos", "sec_metodos");
            SyncKeyAlias("metodos", "sec_metodos");

            SyncKeyAlias("Resultados", "resultados");
            SyncKeyAlias("Resultados", "sec_resultados");
            SyncKeyAlias("resultados", "sec_resultados");

            SyncKeyAlias("Impactos", "impactos");
            SyncKeyAlias("Impactos", "sec_impactos");
            SyncKeyAlias("impactos", "impacto_final");
            SyncKeyAlias("sec_impactos", "impacto_final");

            SyncKeyAlias("Transferencia", "transferencia");
            SyncKeyAlias("Transferencia", "sec_transferencia");
            SyncKeyAlias("transferencia", "transferencia_conocimiento");
            SyncKeyAlias("sec_transferencia", "transferencia_conocimiento");

            SyncKeyAlias("InformeFinanciero", "informe_financiero");
            SyncKeyAlias("InformeFinanciero", "sec_informe_financiero");
            SyncKeyAlias("informe_financiero", "sec_informe_financiero");

            SyncKeyAlias("Conclusiones", "conclusiones");
            SyncKeyAlias("Conclusiones", "sec_conclusiones");
            SyncKeyAlias("conclusiones", "sec_conclusiones");

            SyncKeyAlias("Recomendaciones", "recomendaciones");
            SyncKeyAlias("Recomendaciones", "sec_recomendaciones");
            SyncKeyAlias("recomendaciones", "sec_recomendaciones");

            SyncKeyAlias("Bibliografia", "bibliografia");
            SyncKeyAlias("Bibliografia", "sec_bibliografia");
            SyncKeyAlias("bibliografia", "bibliografia_final");
            SyncKeyAlias("sec_bibliografia", "bibliografia_final");

            SyncKeyAlias("Anexos", "anexos");
            SyncKeyAlias("Anexos", "sec_anexos");
            SyncKeyAlias("anexos", "sec_anexos");

            // Aliases curriculares de PEA_OFICIAL (resiliencia bidireccional)
            SyncKeyAlias("NombreAsignatura", "titulo");
            SyncKeyAlias("NombreAsignatura", "nombre_asignatura");
            SyncKeyAlias("CodigoAsignatura", "codigo_asignatura");
            SyncKeyAlias("CodigoAsignatura", "codigo");
            SyncKeyAlias("CodigoCarrera", "codigo_carrera");
            SyncKeyAlias("CodigoCarrera", "codigo_cases");
            SyncKeyAlias("CodigoCarrera", "codigoCases");
            SyncKeyAlias("CodigoCarrera", "alias_carrera");
            SyncKeyAlias("CodigoCarrera", "aliasCarrera");
            SyncKeyAlias("Carrera", "carrera");
            SyncKeyAlias("Periodo", "periodo");
            SyncKeyAlias("DocenteElaborador", "docente_elaborador");
            SyncKeyAlias("DocenteElaborador", "docente");
            SyncKeyAlias("TotalHorasAsignatura", "total_horas_asignatura");
            SyncKeyAlias("TotalHorasAsignatura", "horas_totales");
            SyncKeyAlias("Creditos", "creditos");
            SyncKeyAlias("HorasContactoDocente", "horas_contacto_docente");
            SyncKeyAlias("HorasPracticoExperimental", "horas_practico_experimental");
            SyncKeyAlias("HorasAutonomo", "horas_autonomo");
            SyncKeyAlias("ObjetivoAsignatura", "objetivo_asignatura");
            SyncKeyAlias("MetodologiaEnsenanza", "metodologia_ensenanza");
            SyncKeyAlias("RecursosDidacticos", "recursos_didacticos");
            SyncKeyAlias("EvaluacionAprendizaje", "evaluacion_aprendizaje");
            SyncKeyAlias("UnidadOrganizacion", "unidad_organizacion");
            SyncKeyAlias("Nivel", "nivel");
            SyncKeyAlias("Nivel", "Semestre");
            SyncKeyAlias("Nivel", "semestre");
            SyncKeyAlias("Nivel", "semestre_nivel");
            SyncKeyAlias("RdaCarrera", "rda_carrera");
            SyncKeyAlias("ResultadosAprendizaje", "resultados_aprendizaje");
            SyncKeyAlias("BibliografiaBasica", "bibliografia_basica");
            SyncKeyAlias("BibliografiaConsulta", "bibliografia_consulta");

            // Sincronización dinámica de alias para cualquier propiedad no listada explícitamente
            var currentKeys = dict.Keys.ToList();
            foreach (var key in currentKeys)
            {
                if (dict.TryGetValue(key, out var val) && val != null && !string.IsNullOrWhiteSpace(val.ToString()))
                {
                    var snake = System.Text.RegularExpressions.Regex.Replace(key, @"([A-Z])", "_$1").ToLower().TrimStart('_');
                    if (!dict.ContainsKey(snake) || dict[snake] == null || string.IsNullOrWhiteSpace(dict[snake]?.ToString()))
                    {
                        dict[snake] = val;
                    }
                    var pascalKey = key.Length > 0 && char.IsLower(key[0]) 
                        ? char.ToUpper(key[0]) + key.Substring(1)
                        : key;
                    if (!dict.ContainsKey(pascalKey) || dict[pascalKey] == null || string.IsNullOrWhiteSpace(dict[pascalKey]?.ToString()))
                    {
                        dict[pascalKey] = val;
                    }
                }
            }

            // ── Normalización de colecciones para plantillas oficiales (PEA_OFICIAL) ──
            NormalizePeaCollections(dict);


            // Variables globales del sistema (siempre disponibles en cualquier plantilla)
            var ecuadorCulture = new CultureInfo("es-EC");
            dict["fecha_emision"] = DateTime.Now.ToString("dd 'de' MMMM 'de' yyyy", ecuadorCulture);
            dict["fecha_emision_corta"] = DateTime.Now.ToString("dd/MM/yyyy");
            dict["hora_emision"] = DateTime.Now.ToString("HH:mm");
            dict["anio_actual"] = DateTime.Now.Year.ToString();
            dict["es_doble_ciego"] = isBlindMode;
            dict["ciudad"] = "Quito";
            dict["pais"] = "Ecuador";
            dict["institucion"] = "DOSIER - Sistema de Portafolio Docente ISTPET";

            // Variables extra pasadas por el controlador/servicio (normalizadas a snake_case)
            if (extraVariables != null)
            {
                foreach (var kv in extraVariables)
                {
                    if (kv.Value != null)
                    {
                        var extraJson = JsonSerializer.Serialize(kv.Value, _jsonOptions);
                        var normalizedExtraJson = CleanAndNormalizeJson(extraJson);
                        using var extraDoc = JsonDocument.Parse(normalizedExtraJson);
                        dict[kv.Key] = ToNativeType(extraDoc.RootElement);
                    }
                    else
                    {
                        dict[kv.Key] = null;
                    }
                }
            }

            // Enmascarar datos personales en modo doble ciego (LOPDP + Peer Review)
            if (isBlindMode)
                ApplyBlindMask(dict);

            return dict;
        }

        /// <summary>
        /// Convierte una cadena en PascalCase o camelCase a snake_case (ej: LineaInvestigacion -> linea_investigacion).
        /// Esto es fundamental porque la UI del Frontend utiliza nombres de propiedades en PascalCase
        /// para el guardado de metadata, mientras que los archivos de plantilla HTML oficiales (como ProyectoInvestigacion.html)
        /// esperan variables en formato snake_case según el estándar Handlebars.
        /// </summary>
        private static string ToSnakeCase(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;
            var sb = new System.Text.StringBuilder();
            for (int i = 0; i < text.Length; i++)
            {
                char c = text[i];
                if (i > 0 && char.IsUpper(c))
                {
                    if (text[i - 1] != '_')
                    {
                        sb.Append('_');
                    }
                }
                sb.Append(char.ToLower(c));
            }
            return sb.ToString();
        }

        /// <summary>
        /// Convierte recursivamente un JsonElement a tipos nativos de C# (Dictionary, List, string, etc.)
        /// Esto es CRÍTICO porque Handlebars.Net no sabe navegar objetos JsonElement directamente.
        /// </summary>
        private static object? ToNativeType(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    var dict = new Dictionary<string, object?>();
                    foreach (var prop in element.EnumerateObject())
                    {
                        var value = ToNativeType(prop.Value);
                        
                        // 0. Guardar la clave exacta original (ej: MultiSec_block-1785266742689_0)
                        dict[prop.Name] = value;

                        // 1. Guardar la versión en minúsculas (ej: lineainvestigacion) para retrocompatibilidad
                        //    con plantillas antiguas o dinámicas que accedan a la propiedad sin guiones bajos.
                        dict[prop.Name.ToLower()] = value;

                        // 2. Guardar la versión en snake_case (ej: linea_investigacion) para que coincida con las
                        //    etiquetas de las plantillas oficiales y los bucles/iteradores (como {{#each recursos_necesarios}}).
                        var snakeKey = ToSnakeCase(prop.Name);
                        if (!dict.ContainsKey(snakeKey))
                        {
                            dict[snakeKey] = value;
                        }
                    }
                    return dict;

                case JsonValueKind.Array:
                    var list = new List<object?>();
                    foreach (var item in element.EnumerateArray())
                    {
                        list.Add(ToNativeType(item));
                    }
                    return list;

                case JsonValueKind.String:
                    return element.GetString();

                case JsonValueKind.Number:
                    if (element.TryGetInt64(out long l)) return l;
                    if (element.TryGetDouble(out double d)) return d;
                    return element.GetDecimal();

                case JsonValueKind.True:
                    return true;

                case JsonValueKind.False:
                    return false;

                case JsonValueKind.Null:
                default:
                    return null;
            }
        }

        /// <summary>
        /// Enmascara datos de identidad personal conforme a:
        /// - LOPDP (Art. 26 - Datos sensibles en procesos de evaluación institucional)
        /// - RRA CES (Doble anonimización para preservación de imparcialidad)
        /// </summary>
        private static void ApplyBlindMask(Dictionary<string, object?> data)
        {
            var fieldsToMask = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "nombre", "nombres", "apellido", "apellidos", "nombre_completo",
                "cedula", "correo", "email", "telefono", "celular",
                "autor", "investigador", "docente",
                "nombre_investigador", "nombre_director", "nombre_revisor",
                "nombre_autor", "cedula_autor", "nombre_tutor", "nombre_rector",
                "director_proyecto", "directorproyecto", "nombre_director_firma",
                "nombre_coordinador_firma", "director_nombre", "coordinador_nombre",
                "responsable",
                "carrera", "carreras_coejecutoras", "programa", "grupo_investigacion", "grupo_investigacion_nombre"
            };

            // El título del proyecto no debe ser anonimizado según el CACES, ya que es fundamental para evaluar coherencia e impacto.

            ApplyBlindMaskRecursive(data, fieldsToMask);
        }

        private static void ApplyBlindMaskRecursive(object? obj, HashSet<string> fieldsToMask)
        {
            if (obj == null) return;

            if (obj is Dictionary<string, object?> dict)
            {
                var keys = new List<string>(dict.Keys);
                foreach (var key in keys)
                {
                    var val = dict[key];
                    if (fieldsToMask.Contains(key))
                    {
                        dict[key] = "[ RESERVADO — PROCESO DOBLE CIEGO ]";
                    }
                    else
                    {
                        ApplyBlindMaskRecursive(val, fieldsToMask);
                    }
                }
            }
            else if (obj is System.Collections.IList list)
            {
                foreach (var item in list)
                {
                    ApplyBlindMaskRecursive(item, fieldsToMask);
                }
            }
        }

        private static System.Collections.IEnumerable? GetEnumerableProperty(object? item, params string[] keys)
        {
            if (item == null || item.GetType().Name == "UndefinedBindingResult") return null;

            if (item is System.Collections.IEnumerable directEnum && !(item is string) && !(item is System.Collections.IDictionary))
            {
                return directEnum;
            }

            if (item is Dictionary<string, object?> dict)
            {
                foreach (var k in keys)
                {
                    if (dict.TryGetValue(k, out var val) && val is System.Collections.IEnumerable en && !(val is string))
                        return en;
                    var lowerK = k.ToLower();
                    if (dict.TryGetValue(lowerK, out var valLower) && valLower is System.Collections.IEnumerable enLower && !(valLower is string))
                        return enLower;
                }
            }
            else if (item is System.Collections.IDictionary idict)
            {
                foreach (var k in keys)
                {
                    if (idict.Contains(k) && idict[k] is System.Collections.IEnumerable en && !(idict[k] is string))
                        return en;
                    var lowerK = k.ToLower();
                    if (idict.Contains(lowerK) && idict[lowerK] is System.Collections.IEnumerable enLower && !(idict[lowerK] is string))
                        return enLower;
                }
            }
            else if (item is JsonElement elem && elem.ValueKind == JsonValueKind.Object)
            {
                foreach (var k in keys)
                {
                    if (elem.TryGetProperty(k, out var prop) && prop.ValueKind == JsonValueKind.Array)
                        return prop.EnumerateArray().Select(ToNativeType).ToList();
                    if (elem.TryGetProperty(k.ToLower(), out var propLower) && propLower.ValueKind == JsonValueKind.Array)
                        return propLower.EnumerateArray().Select(ToNativeType).ToList();
                }
            }
            else
            {
                var type = item.GetType();
                foreach (var k in keys)
                {
                    var prop = type.GetProperty(k, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                    if (prop != null)
                    {
                        var val = prop.GetValue(item);
                        if (val is System.Collections.IEnumerable en && !(val is string))
                            return en;
                    }
                }
            }
            return null;
        }

        private static string GetProperty(object? item, string key)
        {
            if (item == null || item.GetType().Name == "UndefinedBindingResult") return string.Empty;
            if (item is Dictionary<string, object?> dict)
            {
                if (dict.TryGetValue(key, out var val))
                    return val?.ToString() ?? string.Empty;
                if (dict.TryGetValue(key.ToLower(), out var valLower))
                    return valLower?.ToString() ?? string.Empty;
            }
            if (item is System.Collections.IDictionary idict)
            {
                if (idict.Contains(key)) return idict[key]?.ToString() ?? string.Empty;
                var lowerKey = key.ToLower();
                if (idict.Contains(lowerKey)) return idict[lowerKey]?.ToString() ?? string.Empty;
            }
            var type = item.GetType();
            var prop = type.GetProperty(key, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
            if (prop != null)
            {
                return prop.GetValue(item)?.ToString() ?? string.Empty;
            }
            return string.Empty;
        }

        private static Dictionary<string, object?> CreateCaseInsensitiveDictionary(Dictionary<string, object?>? source)
        {
            var dict = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            if (source != null)
            {
                foreach (var kvp in source)
                {
                    dict[kvp.Key] = kvp.Value;
                }
            }
            return dict;
        }

        private static void NormalizePeaCollections(Dictionary<string, object?> dict)
        {
            // 1. Normalizar Unidades
            if (dict.TryGetValue("Unidades", out var rawUnidades) || dict.TryGetValue("unidades", out rawUnidades))
            {
                if (rawUnidades is System.Collections.IEnumerable enumUnidades && !(rawUnidades is string))
                {
                    var normalizedList = new List<Dictionary<string, object?>>();
                    int uIdx = 1;
                    foreach (var item in enumUnidades)
                    {
                        var uDict = item as Dictionary<string, object?> ?? new Dictionary<string, object?>();
                        if (item is JsonElement je && je.ValueKind == JsonValueKind.Object)
                        {
                            uDict = ToNativeType(je) as Dictionary<string, object?> ?? uDict;
                        }

                        int num = uIdx;
                        if (uDict.TryGetValue("num", out var nVal) && int.TryParse(nVal?.ToString(), out var nParsed)) num = nParsed;
                        else if (uDict.TryGetValue("Numero", out var nVal2) && int.TryParse(nVal2?.ToString(), out var nParsed2)) num = nParsed2;
                        else if (uDict.TryGetValue("NumeroUnidad", out var nVal3) && int.TryParse(nVal3?.ToString(), out var nParsed3)) num = nParsed3;

                        string rawTitulo = uDict.GetValueOrDefault("titulo")?.ToString()
                            ?? uDict.GetValueOrDefault("Titulo")?.ToString()
                            ?? uDict.GetValueOrDefault("NombreUnidad")?.ToString()
                            ?? uDict.GetValueOrDefault("nombre_unidad")?.ToString()
                            ?? "";

                        string cleanTitulo = rawTitulo.Trim();
                        if (System.Text.RegularExpressions.Regex.IsMatch(cleanTitulo, $@"^Unidad\s*{num}$", System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                        {
                            cleanTitulo = "";
                        }
                        else
                        {
                            cleanTitulo = System.Text.RegularExpressions.Regex.Replace(cleanTitulo, $@"^Unidad\s*{num}\s*[:\-]?\s*", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();
                        }

                        string encabezadoUnidad = string.IsNullOrWhiteSpace(cleanTitulo)
                            ? $"UNIDAD {num}:"
                            : $"UNIDAD {num}: {cleanTitulo}";
                        string titulo = cleanTitulo;

                        int cd = Convert.ToInt32(uDict.GetValueOrDefault("horasCD") ?? uDict.GetValueOrDefault("HorasCD") ?? uDict.GetValueOrDefault("HorasDocencia") ?? 0);
                        int ape = Convert.ToInt32(uDict.GetValueOrDefault("horasAPE") ?? uDict.GetValueOrDefault("HorasAPE") ?? uDict.GetValueOrDefault("HorasPracticoExp") ?? 0);
                        int ta = Convert.ToInt32(uDict.GetValueOrDefault("horasTA") ?? uDict.GetValueOrDefault("HorasTA") ?? uDict.GetValueOrDefault("HorasAutonomo") ?? 0);
                        int total = cd + ape + ta;
                        if (uDict.TryGetValue("horasTotal", out var ht) && int.TryParse(ht?.ToString(), out var htVal) && htVal > 0) total = htVal;
                        else if (uDict.TryGetValue("TotalHoras", out var th) && int.TryParse(th?.ToString(), out var thVal) && thVal > 0) total = thVal;
                        else if (uDict.TryGetValue("TotalHorasUnidad", out var thu) && int.TryParse(thu?.ToString(), out var thuVal) && thuVal > 0) total = thuVal;

                        string contenidos = uDict.GetValueOrDefault("contenidos")?.ToString()
                            ?? uDict.GetValueOrDefault("Contenidos")?.ToString()
                            ?? uDict.GetValueOrDefault("DescripcionSubtemas")?.ToString()
                            ?? "";

                        if (string.IsNullOrWhiteSpace(contenidos) && uDict.TryGetValue("Temas", out var temasObj) && temasObj is System.Collections.IEnumerable enumTemas)
                        {
                            var temasLines = new List<string>();
                            foreach (var tm in enumTemas)
                            {
                                string tTit = GetProperty(tm, "TituloTema");
                                if (string.IsNullOrWhiteSpace(tTit)) tTit = GetProperty(tm, "titulo");
                                string tDesc = GetProperty(tm, "DescripcionSubtemas");
                                if (string.IsNullOrWhiteSpace(tDesc)) tDesc = GetProperty(tm, "descripcion");
                                if (!string.IsNullOrWhiteSpace(tTit)) temasLines.Add(string.IsNullOrWhiteSpace(tDesc) ? tTit : $"{tTit}: {tDesc}");
                            }
                            if (temasLines.Count > 0) contenidos = string.Join("\n", temasLines);
                        }

                        var normU = CreateCaseInsensitiveDictionary(uDict);
                        normU["Numero"] = num;
                        normU["num"] = num;
                        normU["NumeroUnidad"] = num;
                        normU["Titulo"] = titulo;
                        normU["titulo"] = titulo;
                        normU["NombreUnidad"] = titulo;
                        normU["nombre"] = titulo;
                        normU["nombre_unidad"] = titulo;
                        normU["EncabezadoUnidad"] = encabezadoUnidad;
                        normU["encabezado_unidad"] = encabezadoUnidad;
                        normU["TituloCompleto"] = encabezadoUnidad;
                        normU["titulo_completo"] = encabezadoUnidad;
                        normU["TotalHoras"] = total;
                        normU["totalHoras"] = total;
                        normU["TotalHorasUnidad"] = total;
                        normU["HorasCD"] = cd;
                        normU["horasCD"] = cd;
                        normU["HorasDocencia"] = cd;
                        normU["HorasAPE"] = ape;
                        normU["horasAPE"] = ape;
                        normU["HorasPracticoExp"] = ape;
                        normU["HorasTA"] = ta;
                        normU["horasTA"] = ta;
                        normU["HorasAutonomo"] = ta;
                        normU["Contenidos"] = contenidos;
                        normU["contenidos"] = contenidos;

                        normalizedList.Add(normU);
                        uIdx++;
                    }
                    dict["Unidades"] = normalizedList;
                    dict["unidades"] = normalizedList;
                }
            }

            // 2. Normalizar ActividadesPracticas
            if (dict.TryGetValue("ActividadesPracticas", out var rawPracticas) || dict.TryGetValue("actividades_practicas", out rawPracticas))
            {
                if (rawPracticas is System.Collections.IEnumerable enumPracticas && !(rawPracticas is string))
                {
                    var normalizedList = new List<Dictionary<string, object?>>();
                    int prIdx = 1;
                    foreach (var item in enumPracticas)
                    {
                        var pDict = item as Dictionary<string, object?> ?? new Dictionary<string, object?>();
                        if (item is JsonElement je && je.ValueKind == JsonValueKind.Object)
                        {
                            pDict = ToNativeType(je) as Dictionary<string, object?> ?? pDict;
                        }

                        string unidad = pDict.GetValueOrDefault("unidad")?.ToString()
                            ?? pDict.GetValueOrDefault("Unidad")?.ToString()
                            ?? $"Unidad {prIdx}";

                        string nombre = pDict.GetValueOrDefault("nombre")?.ToString()
                            ?? pDict.GetValueOrDefault("Nombre")?.ToString()
                            ?? pDict.GetValueOrDefault("NombrePractica")?.ToString()
                            ?? pDict.GetValueOrDefault("nombre_practica")?.ToString()
                            ?? "";

                        string caracterizacion = pDict.GetValueOrDefault("caracterizacion")?.ToString()
                            ?? pDict.GetValueOrDefault("Caracterizacion")?.ToString()
                            ?? "";

                        string esc = pDict.GetValueOrDefault("escenario")?.ToString() ?? pDict.GetValueOrDefault("Escenario")?.ToString() ?? "";
                        string prod = pDict.GetValueOrDefault("producto")?.ToString() ?? pDict.GetValueOrDefault("Producto")?.ToString() ?? "";
                        if (string.IsNullOrWhiteSpace(caracterizacion) && (!string.IsNullOrWhiteSpace(esc) || !string.IsNullOrWhiteSpace(prod)))
                        {
                            caracterizacion = string.Join(" | ", new[] { esc, prod }.Where(s => !string.IsNullOrWhiteSpace(s)));
                        }

                        string nombreCaract = !string.IsNullOrWhiteSpace(nombre)
                            ? nombre
                            : (!string.IsNullOrWhiteSpace(caracterizacion) ? caracterizacion : "---");

                        var normP = CreateCaseInsensitiveDictionary(pDict);
                        normP["Unidad"] = unidad;
                        normP["unidad"] = unidad;
                        normP["Nombre"] = nombre;
                        normP["nombre"] = nombre;
                        normP["NombrePractica"] = nombre;
                        normP["Caracterizacion"] = caracterizacion;
                        normP["caracterizacion"] = caracterizacion;
                        normP["NombreCaracterizacion"] = nombreCaract;
                        normP["nombre_caracterizacion"] = nombreCaract;

                        normalizedList.Add(normP);
                        prIdx++;
                    }
                    dict["ActividadesPracticas"] = normalizedList;
                    dict["actividades_practicas"] = normalizedList;
                }
            }

            // 3. Normalizar Evaluaciones
            if (dict.TryGetValue("Evaluaciones", out var rawEval) || dict.TryGetValue("evaluaciones", out rawEval))
            {
                if (rawEval is System.Collections.IEnumerable enumEval && !(rawEval is string))
                {
                    var normalizedList = new List<Dictionary<string, object?>>();
                    int eIdx = 1;
                    foreach (var item in enumEval)
                    {
                        var eDict = item as Dictionary<string, object?> ?? new Dictionary<string, object?>();
                        if (item is JsonElement je && je.ValueKind == JsonValueKind.Object)
                        {
                            eDict = ToNativeType(je) as Dictionary<string, object?> ?? eDict;
                        }

                        string nota = eDict.GetValueOrDefault("nota")?.ToString()
                            ?? eDict.GetValueOrDefault("Nota")?.ToString()
                            ?? eDict.GetValueOrDefault("Denominacion")?.ToString()
                            ?? eDict.GetValueOrDefault("denominacion")?.ToString()
                            ?? $"Evaluación {eIdx}";

                        string tipo = eDict.GetValueOrDefault("tipo")?.ToString()
                            ?? eDict.GetValueOrDefault("Tipo")?.ToString()
                            ?? eDict.GetValueOrDefault("TipoEvaluacion")?.ToString()
                            ?? eDict.GetValueOrDefault("tipo_evaluacion")?.ToString()
                            ?? "Actividades evaluativas";

                        string calif = eDict.GetValueOrDefault("calificacion")?.ToString()
                            ?? eDict.GetValueOrDefault("Calificacion")?.ToString()
                            ?? eDict.GetValueOrDefault("CalificacionMaxima")?.ToString()
                            ?? eDict.GetValueOrDefault("calificacion_maxima")?.ToString()
                            ?? "10,00";

                        var normE = CreateCaseInsensitiveDictionary(eDict);
                        normE["Nota"] = nota;
                        normE["nota"] = nota;
                        normE["Denominacion"] = nota;
                        normE["Tipo"] = tipo;
                        normE["tipo"] = tipo;
                        normE["TipoEvaluacion"] = tipo;
                        normE["Calificacion"] = calif;
                        normE["calificacion"] = calif;
                        normE["CalificacionMaxima"] = calif;

                        normalizedList.Add(normE);
                        eIdx++;
                    }
                    dict["Evaluaciones"] = normalizedList;
                    dict["evaluaciones"] = normalizedList;
                }
            }

            // 4. Normalizar Prerrequisitos
            if (dict.TryGetValue("Prerrequisitos", out var rawPrerreq) || dict.TryGetValue("prerrequisitos", out rawPrerreq))
            {
                if (rawPrerreq is System.Collections.IEnumerable enumPrerreq && !(rawPrerreq is string))
                {
                    var normalizedList = new List<Dictionary<string, object?>>();
                    foreach (var item in enumPrerreq)
                    {
                        var pDict = item as Dictionary<string, object?> ?? new Dictionary<string, object?>();
                        if (item is JsonElement je && je.ValueKind == JsonValueKind.Object)
                        {
                            pDict = ToNativeType(je) as Dictionary<string, object?> ?? pDict;
                        }

                        string asig = pDict.GetValueOrDefault("Asignatura")?.ToString()
                            ?? pDict.GetValueOrDefault("asignatura")?.ToString()
                            ?? pDict.GetValueOrDefault("NombreAsignatura")?.ToString()
                            ?? pDict.GetValueOrDefault("nombre_asignatura")?.ToString()
                            ?? "---";

                        string obs = pDict.GetValueOrDefault("Observacion")?.ToString()
                            ?? pDict.GetValueOrDefault("observacion")?.ToString()
                            ?? "";

                        var normPr = CreateCaseInsensitiveDictionary(pDict);
                        normPr["Asignatura"] = asig;
                        normPr["asignatura"] = asig;
                        normPr["NombreAsignatura"] = asig;
                        normPr["Observacion"] = obs;
                        normPr["observacion"] = obs;

                        normalizedList.Add(normPr);
                    }
                    dict["Prerrequisitos"] = normalizedList;
                    dict["prerrequisitos"] = normalizedList;
                }
            }

            // 5. Normalizar Firmas y Autoridades
            if (dict.TryGetValue("FirmasResponsabilidad", out var rawFirmas) || dict.TryGetValue("firmas_responsabilidad", out rawFirmas))
            {
                var fDict = rawFirmas as Dictionary<string, object?>;
                if (rawFirmas is JsonElement je && je.ValueKind == JsonValueKind.Object)
                {
                    fDict = ToNativeType(je) as Dictionary<string, object?>;
                }

                if (fDict != null)
                {
                    void SetIfEmpty(string targetKey, string sourceKey)
                    {
                        if ((!dict.ContainsKey(targetKey) || string.IsNullOrWhiteSpace(dict[targetKey]?.ToString())) &&
                            fDict.TryGetValue(sourceKey, out var sVal) && !string.IsNullOrWhiteSpace(sVal?.ToString()))
                        {
                            dict[targetKey] = sVal;
                            var snake = ToSnakeCase(targetKey);
                            dict[snake] = sVal;
                        }
                    }

                    SetIfEmpty("DocenteElaborador", "DocenteNombre");
                    SetIfEmpty("CoordinadorCarrera", "CoordinadorNombre");
                    SetIfEmpty("CoordinadorAcademico", "CoordinadorAcadNombre");
                    SetIfEmpty("Vicerrector", "VicerrectorNombre");
                    SetIfEmpty("FechaElaborado", "DocenteFecha");
                    SetIfEmpty("FechaRevisadoCarrera", "CoordinadorFecha");
                    SetIfEmpty("FechaRevisadoAcademico", "CoordinadorAcadFecha");
                    SetIfEmpty("FechaAprobado", "VicerrectorFecha");
                }
            }

            // Normalización y generación de bloques visuales de firma para PEA
            string? docenteCode = dict.GetValueOrDefault("FirmaElaboradoDocente")?.ToString() ?? dict.GetValueOrDefault("firma_elaborado_docente")?.ToString();
            if (!string.IsNullOrEmpty(docenteCode) && (!dict.ContainsKey("firma_docente_base64") || string.IsNullOrWhiteSpace(dict["firma_docente_base64"]?.ToString())))
            {
                dict["firma_docente_base64"] = @"<div style=""height: 42px; width: 100%;""></div>";
            }

            string? coordCode = dict.GetValueOrDefault("FirmaRevisadoCoord")?.ToString() ?? dict.GetValueOrDefault("firma_revisado_coord")?.ToString();
            if (!string.IsNullOrEmpty(coordCode) && (!dict.ContainsKey("firma_coordinador_carrera_base64") || string.IsNullOrWhiteSpace(dict["firma_coordinador_carrera_base64"]?.ToString())))
            {
                dict["firma_coordinador_carrera_base64"] = @"<div style=""height: 42px; width: 100%;""></div>";
            }

            string? acadCode = dict.GetValueOrDefault("FirmaRevisadoAcad")?.ToString() ?? dict.GetValueOrDefault("firma_revisado_acad")?.ToString();
            if (!string.IsNullOrEmpty(acadCode) && (!dict.ContainsKey("firma_coordinador_academico_base64") || string.IsNullOrWhiteSpace(dict["firma_coordinador_academico_base64"]?.ToString())))
            {
                dict["firma_coordinador_academico_base64"] = @"<div style=""height: 42px; width: 100%;""></div>";
            }

            string? viceCode = dict.GetValueOrDefault("FirmaAprobadoVicerrector")?.ToString() ?? dict.GetValueOrDefault("firma_aprobado_vicerrector")?.ToString();
            if (!string.IsNullOrEmpty(viceCode) && (!dict.ContainsKey("firma_vicerrector_base64") || string.IsNullOrWhiteSpace(dict["firma_vicerrector_base64"]?.ToString())))
            {
                dict["firma_vicerrector_base64"] = @"<div style=""height: 42px; width: 100%;""></div>";
            }

            // 6. Normalizar Bibliografías
            if ((!dict.ContainsKey("BibliografiaBasica") || string.IsNullOrWhiteSpace(dict["BibliografiaBasica"]?.ToString())) &&
                (dict.TryGetValue("Bibliografias", out var rawBib) || dict.TryGetValue("bibliografias", out rawBib)) &&
                rawBib is System.Collections.IEnumerable enumBib && !(rawBib is string))
            {
                var basicas = new List<string>();
                var complementarias = new List<string>();
                foreach (var b in enumBib)
                {
                    string tipo = GetProperty(b, "TipoBibliografia");
                    if (string.IsNullOrWhiteSpace(tipo)) tipo = GetProperty(b, "tipo_bibliografia");
                    string cita = GetProperty(b, "CitaCompletaApa");
                    if (string.IsNullOrWhiteSpace(cita)) cita = GetProperty(b, "cita_completa_apa");
                    if (string.IsNullOrWhiteSpace(cita))
                    {
                        string autor = GetProperty(b, "Autor");
                        string tit = GetProperty(b, "TituloLibro");
                        cita = $"{autor} {tit}".Trim();
                    }

                    if (!string.IsNullOrWhiteSpace(cita))
                    {
                        if (string.Equals(tipo, "Basica", StringComparison.OrdinalIgnoreCase)) basicas.Add(cita);
                        else complementarias.Add(cita);
                    }
                }

                if (basicas.Count > 0)
                {
                    dict["BibliografiaBasica"] = string.Join("<br/>", basicas);
                    dict["bibliografia_basica"] = dict["BibliografiaBasica"];
                }
                if (complementarias.Count > 0 && (!dict.ContainsKey("BibliografiaConsulta") || string.IsNullOrWhiteSpace(dict["BibliografiaConsulta"]?.ToString())))
                {
                    dict["BibliografiaConsulta"] = string.Join("<br/>", complementarias);
                    dict["bibliografia_consulta"] = dict["BibliografiaConsulta"];
                }
            }

            // 7. Normalizar Código de Carrera (resiliencia institucional CACES / SIGAFI)
            string? codCarrera = dict.GetValueOrDefault("CodigoCarrera")?.ToString()
                ?? dict.GetValueOrDefault("codigo_carrera")?.ToString()
                ?? dict.GetValueOrDefault("codigo_cases")?.ToString()
                ?? dict.GetValueOrDefault("codigoCases")?.ToString()
                ?? dict.GetValueOrDefault("alias_carrera")?.ToString()
                ?? dict.GetValueOrDefault("aliasCarrera")?.ToString();

            if (string.IsNullOrWhiteSpace(codCarrera) || codCarrera == "---")
            {
                string? carreraNombre = dict.GetValueOrDefault("Carrera")?.ToString()
                    ?? dict.GetValueOrDefault("carrera")?.ToString()
                    ?? dict.GetValueOrDefault("NombreCarrera")?.ToString()
                    ?? dict.GetValueOrDefault("nombre_carrera")?.ToString();

                if (!string.IsNullOrWhiteSpace(carreraNombre))
                {
                    var normCarrera = carreraNombre.Trim().ToUpperInvariant();
                    if (normCarrera.Contains("GASTRONOM")) codCarrera = "GAS";
                    else if (normCarrera.Contains("SOFTWARE")) codCarrera = "SOF";
                    else if (normCarrera.Contains("DEPORTIV") || normCarrera.Contains("ENTRENAMIENTO")) codCarrera = "DEP";
                    else if (normCarrera.Contains("AUTOMOTRIZ") || normCarrera.Contains("MECANICA") || normCarrera.Contains("MECÁNICA")) codCarrera = "MCA";
                    else if (normCarrera.Contains("TRIBUTAR") || normCarrera.Contains("CONTABILIDAD")) codCarrera = "CTA";
                    else if (normCarrera.Contains("TALENTO") || normCarrera.Contains("HUMANO")) codCarrera = "ATH";
                    else if (normCarrera.Contains("GRAFICO") || normCarrera.Contains("GRÁFICO")) codCarrera = "DGF";
                    else if (normCarrera.Contains("INICIAL")) codCarrera = "EBI";
                    else if (normCarrera.Contains("MARKETING")) codCarrera = "MKT";
                    else if (normCarrera.Contains("INCLUSIVA")) codCarrera = "EIN";
                    else if (normCarrera.Contains("BASICA") || normCarrera.Contains("BÁSICA")) codCarrera = "EBA";
                    else if (normCarrera.Contains("TELECOMUNICACION") || normCarrera.Contains("REDES")) codCarrera = "RDT";
                    else if (normCarrera.Contains("ELECTRONIC") || normCarrera.Contains("ELECTRÓNIC")) codCarrera = "ELT";
                    else if (normCarrera.Length >= 3) codCarrera = normCarrera.Substring(0, 3);
                }
            }

            if (!string.IsNullOrWhiteSpace(codCarrera))
            {
                dict["CodigoCarrera"] = codCarrera.Trim();
                dict["codigo_carrera"] = codCarrera.Trim();
            }
        }
    }
}
