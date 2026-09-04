using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Dosier.Application.Research;
using Dosier.Application.Research.Dtos;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;

namespace dosier_infrastructure.Research.Subservices
{
    public class ProjectWizardClassificationSubservice : IProjectWizardClassificationSubservice
    {
        private readonly DosierContext _context;
        private readonly IProjectTeamService _teamService;

        public ProjectWizardClassificationSubservice(
            DosierContext context,
            IProjectTeamService teamService)
        {
            _context = context;
            _teamService = teamService;
        }

        public async Task<SyncResult?> SyncResearchGroupAndAssociativeAsync(DocProyecto project, ProyectoDto dto)
        {
            bool isAssociative = dto.TieneGrupoInvestigacion == true ||
                                 dto.GrupoInvestigacionTipo == "SI" ||
                                 dto.GrupoInvestigacionTipo == "si";

            if (isAssociative)
            {
                var groupUuid = dto.GrupoInvestigacionUuid ?? dto.GrupoInvestigacion ?? dto.GrupoInvestigacionNombre;
                if (string.IsNullOrWhiteSpace(groupUuid))
                {
                    return new SyncResult
                    {
                        Success = false,
                        Message = "Para proyectos asociativos debe seleccionar un grupo de investigación aprobado."
                    };
                }

                var approvedGroup = await ProjectHelper.ResolveApprovedGroupAsync(_context, groupUuid);
                if (approvedGroup == null)
                {
                    return new SyncResult
                    {
                        Success = false,
                        Message = "El grupo seleccionado no existe o no está aprobado/activo."
                    };
                }

                project.TieneGrupo = true;
                project.IdGrupo = approvedGroup.IdGrupo;
                dto.GrupoInvestigacion = approvedGroup.Nombre;
                dto.GrupoInvestigacionUuid = approvedGroup.Uuid;
                dto.TieneGrupoInvestigacion = true;
                dto.GrupoInvestigacionTipo = "SI";
                dto.GrupoInvestigacionNombre = approvedGroup.Nombre;

                dto.Investigadores = await _teamService.BuildProjectInvestigadoresFromGroupAsync(approvedGroup.IdGrupo, project.IdProyecto, dto.Investigadores);
            }
            else
            {
                project.TieneGrupo = false;
                project.IdGrupo = null;
                dto.GrupoInvestigacion = null;
                dto.GrupoInvestigacionUuid = null;
                dto.TieneGrupoInvestigacion = false;
                dto.GrupoInvestigacionTipo = "NO";
                dto.GrupoInvestigacionNombre = null;
            }

            return null;
        }

        public async Task<SyncResult?> SyncConvocatoriaAndObjectivesPndAsync(DocProyecto project, ProyectoDto dto)
        {
            if (dto.IdConvocatoria.HasValue && dto.IdConvocatoria.Value > 0)
            {
                if (project.IdConvocatoria != dto.IdConvocatoria.Value)
                {
                    var conv = await _context.DocConvocatorias.FirstOrDefaultAsync(c => c.IdConvocatoria == dto.IdConvocatoria.Value);
                    if (conv != null)
                    {
                        var today = DateOnly.FromDateTime(DateTime.Today);
                        if (conv.FechaCierre < today)
                        {
                            return new SyncResult
                            {
                                Success = false,
                                Message = $"La convocatoria \"{conv.Titulo}\" cerró el {conv.FechaCierre:dd/MM/yyyy} y no acepta nuevas postulaciones."
                            };
                        }
                    }
                }
                project.IdConvocatoria = dto.IdConvocatoria.Value;
            }
            else
            {
                project.IdConvocatoria = null;
            }

            project.IdObjetivoPnd = (dto.IdObjetivoPnd.HasValue && dto.IdObjetivoPnd.Value > 0) ? dto.IdObjetivoPnd.Value : null;
            return null;
        }

        public async Task SyncProgramAndTypesAsync(DocProyecto project, ProyectoDto dto)
        {
            // Entidad Aliada & TRL
            project.IdEntidadAliada = (dto.IdEntidadAliada.HasValue && dto.IdEntidadAliada.Value > 0) ? dto.IdEntidadAliada.Value : null;
            project.TrlInicial = (sbyte?)(dto.TrlInicial ?? 1);
            project.TrlActual = (sbyte?)(dto.TrlActual ?? 1);
            project.TrlMeta = (sbyte?)(dto.TrlMeta ?? 1);

            project.MetadataCacesJson = System.Text.Json.JsonSerializer.Serialize(dto);
            project.FechaModificacion = DateTime.Now;
            await Task.CompletedTask;
        }

        public async Task SyncAcademicDomainAndCareersAsync(DocProyecto project, ProyectoDto dto)
        {
            // Carreras
            await _teamService.SyncProjectCarrerasAsync(project.IdProyecto, dto.IdCarrera, dto.Investigadores);
        }

        public async Task SyncGroupMembersAndCreatorAsync(DocProyecto project, ProyectoDto dto, string? creatorUserIdRef, bool isOversightUser)
        {
            // Sincronización automática de miembros de grupo
            if (project.TieneGrupo == true && project.IdGrupo.HasValue)
            {
                var groupMembers = await _context.DocGruposMiembros
                    .Include(m => m.IdUsuarioNavigation)
                    .Where(m => m.IdGrupo == project.IdGrupo.Value && m.Activo != false)
                    .ToListAsync();

                if (dto.Investigadores == null)
                {
                    dto.Investigadores = new List<InvestigadorDto>();
                }

                foreach (var member in groupMembers)
                {
                    var user = member.IdUsuarioNavigation;
                    if (user == null) continue;

                    var alreadyAdded = dto.Investigadores.Any(i => !string.IsNullOrEmpty(i.Cedula) && i.Cedula.Trim() == user.IdSigafi.Trim());
                    if (!alreadyAdded)
                    {
                        var phone = await ProjectHelper.GetUserPhoneFromCatalogAsync(_context, user.IdSigafi, user.TablaSigafi);
                        dto.Investigadores.Add(new InvestigadorDto
                        {
                            Nombre = user.Nombre,
                            Cedula = user.IdSigafi,
                            Email = user.EmailInstitucional ?? user.IdSigafi ?? "",
                            Rol = member.Rol ?? "Co-Investigador",
                            NivelAcademico = user.TablaSigafi == "alumno" ? "Pregrado" : "Tercer Nivel",
                            Telefono = phone,
                            Activo = true,
                            FechaInicio = DateTime.Now,
                            EsDirector = member.Rol?.Contains("Director", StringComparison.OrdinalIgnoreCase) == true
                        });
                    }
                }

                project.MetadataCacesJson = System.Text.Json.JsonSerializer.Serialize(dto);
            }

            // Sincronización de Equipo
            if (dto.Investigadores != null && dto.Investigadores.Count > 0)
            {
                await _teamService.SyncInvestigadoresAsync(project.IdProyecto, dto.Investigadores, isFromWizard: true);
            }

            // Auto-vincular al creador como Director
            if (!string.IsNullOrEmpty(creatorUserIdRef))
            {
                var internalUser = await _context.Users.FirstOrDefaultAsync(u => u.IdSigafi == creatorUserIdRef);
                if (internalUser != null && !isOversightUser)
                {
                    var isLinked = await _context.DocProyectoParticipantes.AnyAsync(pp => pp.IdProyecto == project.IdProyecto && pp.IdUsuario == internalUser.IdUsuario);

                    if (!isLinked)
                    {
                        var phone = await ProjectHelper.GetUserPhoneFromCatalogAsync(_context, internalUser.IdSigafi, internalUser.TablaSigafi);
                        if (internalUser.TablaSigafi == "alumno")
                        {
                            _context.DocProyectoParticipantes.Add(new DocProyectoParticipante
                            {
                                IdProyecto = project.IdProyecto,
                                IdUsuario = internalUser.IdUsuario,
                                TipoParticipante = "Alumno",
                                Rol = "Semillerista",
                                NivelAcademico = "Pregrado",
                                Telefono = phone,
                                EsDirector = false,
                                Activo = true,
                                FechaInicio = DateTime.Now
                            });
                        }
                        else
                        {
                            _context.DocProyectoParticipantes.Add(new DocProyectoParticipante
                            {
                                IdProyecto = project.IdProyecto,
                                IdUsuario = internalUser.IdUsuario,
                                TipoParticipante = "Docente",
                                Rol = "Director de Proyecto",
                                NivelAcademico = "Tercer Nivel",
                                Telefono = phone,
                                EsDirector = true,
                                Activo = true,
                                FechaInicio = DateTime.Now
                            });
                        }
                    }
                }
            }
        }
    }
}
