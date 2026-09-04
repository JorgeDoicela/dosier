using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Dosier.Application.Research.Dtos;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;

namespace dosier_infrastructure.Research.Subservices
{
    public class ProjectWizardComponentsSubservice : IProjectWizardComponentsSubservice
    {
        private readonly DosierContext _context;
        private readonly IProjectWizardCoreSubservice _coreSubservice;

        public ProjectWizardComponentsSubservice(
            DosierContext context,
            IProjectWizardCoreSubservice coreSubservice)
        {
            _context = context;
            _coreSubservice = coreSubservice;
        }

        private List<string> ParseObjetivosHtml(List<string>? objetivos)
        {
            var result = new List<string>();
            if (objetivos == null) return result;

            foreach (var item in objetivos)
            {
                if (string.IsNullOrWhiteSpace(item)) continue;

                if (item.Contains("<li") || item.Contains("<p"))
                {
                    string cleaned = item.Replace("<ul>", "").Replace("</ul>", "").Replace("<ol>", "").Replace("</ol>", "");

                    var matches = System.Text.RegularExpressions.Regex.Matches(cleaned, @"<(li|p)[^>]*>(.*?)<\/\1>", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    if (matches.Count > 0)
                    {
                        foreach (System.Text.RegularExpressions.Match match in matches)
                        {
                            var text = System.Text.RegularExpressions.Regex.Replace(match.Groups[2].Value, @"<[^>]*>", "").Trim();
                            text = System.Net.WebUtility.HtmlDecode(text);
                            text = System.Text.RegularExpressions.Regex.Replace(text, @"^[a-zA-Z0-9\-\.\)]+\s*[-–—]?\s*", "").Trim();

                            if (!string.IsNullOrWhiteSpace(text))
                            {
                                result.Add(text);
                            }
                        }
                    }
                    else
                    {
                        var cleanText = System.Text.RegularExpressions.Regex.Replace(item, @"<[^>]*>", "").Trim();
                        cleanText = System.Net.WebUtility.HtmlDecode(cleanText);
                        cleanText = System.Text.RegularExpressions.Regex.Replace(cleanText, @"^[a-zA-Z0-9\-\.\)]+\s*[-–—]?\s*", "").Trim();
                        if (!string.IsNullOrWhiteSpace(cleanText))
                        {
                            result.Add(cleanText);
                        }
                    }
                }
                else
                {
                    var text = System.Text.RegularExpressions.Regex.Replace(item, @"^[a-zA-Z0-9\-\.\)]+\s*[-–—]?\s*", "").Trim();
                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        result.Add(text);
                    }
                }
            }

            return result;
        }

        public async Task<List<int>> SyncObjetivosAsync(int projectId, string? objetivoGeneral, List<string>? objetivos)
        {
            var generalOpt = await _context.DocObjetivosProyecto.FirstOrDefaultAsync(o => o.IdProyecto == projectId && o.EsGeneral);

            string descGeneral = !string.IsNullOrWhiteSpace(objetivoGeneral) ? objetivoGeneral : "Objetivo General por definir";
            if (descGeneral.Contains("<"))
            {
                descGeneral = System.Text.RegularExpressions.Regex.Replace(descGeneral, @"<[^>]*>", "").Trim();
                descGeneral = System.Net.WebUtility.HtmlDecode(descGeneral);
            }

            if (generalOpt != null)
            {
                generalOpt.Descripcion = descGeneral;
            }
            else
            {
                generalOpt = new DocObjetivoProyecto
                {
                    IdProyecto = projectId,
                    Descripcion = descGeneral,
                    EsGeneral = true,
                    Orden = 0
                };
                _context.DocObjetivosProyecto.Add(generalOpt);
            }
            await _coreSubservice.SaveChangesWithConcurrencyResolutionAsync();
            int generalId = generalOpt.IdObjetivo;

            var ids = new List<int> { generalId };

            var parsedObjetivos = ParseObjetivosHtml(objetivos);
            if (parsedObjetivos.Count > 0)
            {
                var old = _context.DocObjetivosProyecto.Where(o => o.IdProyecto == projectId && !o.EsGeneral);
                _context.DocObjetivosProyecto.RemoveRange(old);

                int orden = 1;
                foreach (var obj in parsedObjetivos)
                {
                    _context.DocObjetivosProyecto.Add(new DocObjetivoProyecto
                    {
                        IdProyecto = projectId,
                        Descripcion = obj,
                        EsGeneral = false,
                        Orden = orden++
                    });
                }

                await _coreSubservice.SaveChangesWithConcurrencyResolutionAsync();

                var creadosIds = await _context.DocObjetivosProyecto
                    .Where(o => o.IdProyecto == projectId && !o.EsGeneral)
                    .OrderBy(o => o.Orden)
                    .Select(o => o.IdObjetivo)
                    .ToListAsync();

                ids.AddRange(creadosIds);
            }

            return ids;
        }

        public async Task SyncCronogramaAsync(int projectId, List<int> objetivosCreadosIds, List<ActividadCronogramaDto>? cronograma)
        {
            if (cronograma == null) return;

            var oldActivities = await _context.DocCronogramas
                .Where(c => c.IdProyecto == projectId)
                .ToListAsync();

            _context.DocCronogramas.RemoveRange(oldActivities);

            int defaultObjetivoId = objetivosCreadosIds.FirstOrDefault();

            foreach (var act in cronograma)
            {
                if (string.IsNullOrWhiteSpace(act.Actividad)) continue;

                int dbObjetivoId = defaultObjetivoId;
                if (act.IdObjetivo.HasValue && objetivosCreadosIds.Count > 0)
                {
                    int index = act.IdObjetivo.Value;
                    if (index >= 0 && index < objetivosCreadosIds.Count)
                    {
                        dbObjetivoId = objetivosCreadosIds[index];
                    }
                }

                var nuevaAct = new DocCronograma
                {
                    IdProyecto = projectId,
                    IdObjetivo = dbObjetivoId,
                    NumeroActividad = act.Numero,
                    Descripcion = act.Actividad,
                    RecursosNecesarios = act.RecursosNecesarios,
                    Responsable = act.Responsable,
                    Entregable = act.Entregable,
                    Ponderacion = act.Ponderacion,
                    EsEntregableCaces = act.EsEntregableCaces ?? false,
                    FechaInicioPrevista = ProjectHelper.ParseDateOnly(act.FechaInicioPrevista),
                    FechaFinPrevista = ProjectHelper.ParseDateOnly(act.FechaFinPrevista)
                };

                _context.DocCronogramas.Add(nuevaAct);
            }
        }

        public async Task SyncBibliografiaAsync(int projectId, List<string>? biblio)
        {
            if (biblio == null) return;

            var existing = await _context.DocBibliografiasProyecto
                .Where(b => b.IdProyecto == projectId)
                .ToListAsync();

            var newCitas = biblio
                .Where(b => !string.IsNullOrWhiteSpace(b))
                .Select(b => b.Trim())
                .ToHashSet();

            var toDelete = existing.Where(e => !newCitas.Contains(e.CitaApa.Trim())).ToList();
            _context.DocBibliografiasProyecto.RemoveRange(toDelete);

            var existingCitas = existing.Select(e => e.CitaApa.Trim()).ToHashSet();
            foreach (var b in biblio)
            {
                if (string.IsNullOrWhiteSpace(b) || existingCitas.Contains(b.Trim())) continue;
                _context.DocBibliografiasProyecto.Add(new DocBibliografiaProyecto
                {
                    IdProyecto = projectId,
                    CitaApa = b
                });
            }
        }
    }
}
