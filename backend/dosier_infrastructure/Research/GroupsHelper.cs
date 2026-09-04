using System;
using System.Linq;
using dosier_application.Research.Dtos;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Research
{
    public static class GroupsHelper
    {
        public static GroupDto MapToDto(DosierContext context, DocGrupoInvestigacion g)
        {
            return new GroupDto
            {
                IdGrupo = g.IdGrupo,
                Uuid = g.Uuid,
                Nombre = g.Nombre,
                Siglas = g.Siglas,
                TipoGrupo = g.TipoGrupo,
                IdDominio = null,
                IdCoordinador = g.IdCoordinador,
                IdProfesorCoordinador = g.IdCoordinadorNavigation?.IdSigafi,
                NombreCoordinador = g.IdCoordinadorNavigation?.Nombre,
                ObjetivoGeneral = g.ObjetivoGeneral,
                Mision = g.Mision,
                Vision = g.Vision,
                ResolucionAprobacion = g.ResolucionAprobacion,
                FechaCreacion = g.FechaCreacion,
                CategoriaConsolidacion = g.CategoriaConsolidacion,
                Activo = g.Activo ?? false,
                Estado = g.Estado,
                LinkWhatsapp = g.LinkWhatsapp,
                FotoUrl = g.FotoUrl,
                TelefonoCoordinador = !string.IsNullOrEmpty(g.TelefonoCoordinador)
                    ? g.TelefonoCoordinador
                    : GetUserPhoneFromCatalog(context, g.IdCoordinadorNavigation?.IdSigafi, g.IdCoordinadorNavigation?.TablaSigafi),
                LineasIds = new List<int>(),
                CarrerasIds = g.IdCarreras.Select(c => c.IdCarrera).ToList(),
                LineasNombres = new List<string>(),
                CarrerasNombres = g.IdCarreras.Select(c => c.Carrera1 ?? string.Empty).Where(n => !string.IsNullOrEmpty(n)).ToList(),
                TeacherMemberCedulas = g.DocGruposMiembros
                    .Where(m => m.Activo == true && m.IdUsuarioNavigation != null && m.IdUsuarioNavigation.TablaSigafi == "profesor" && !string.IsNullOrEmpty(m.IdUsuarioNavigation.IdSigafi))
                    .Select(m => m.IdUsuarioNavigation.IdSigafi.Trim())
                    .ToList()
            };
        }

        public static string GetUserPhoneFromCatalog(DosierContext context, string? idSigafi, string? tablaSigafi)
        {
            if (string.IsNullOrEmpty(idSigafi)) return string.Empty;
            var sigafiTrim = idSigafi.Trim();
            string phone = string.Empty;
            if (tablaSigafi == "profesor")
            {
                var prof = context.Profesores.FirstOrDefault(p => p.IdProfesor == sigafiTrim);
                phone = prof != null ? (prof.Celular ?? prof.Telefono ?? string.Empty) : string.Empty;
            }
            else if (tablaSigafi == "alumno")
            {
                var alum = context.Alumnos.FirstOrDefault(a => a.IdAlumno == sigafiTrim);
                phone = alum != null ? (alum.Celular ?? alum.Telefono ?? string.Empty) : string.Empty;
            }

            if (string.IsNullOrEmpty(phone)) return string.Empty;
            phone = phone.Trim();
            if (phone.Length == 9 && phone.StartsWith("9"))
            {
                phone = "0" + phone;
            }
            return phone;
        }
    }
}
