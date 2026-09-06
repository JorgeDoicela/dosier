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
            dto.TieneGrupoInvestigacion = false;
            dto.GrupoInvestigacion = null;
            dto.GrupoInvestigacionUuid = null;
            dto.GrupoInvestigacionTipo = "NO";
            dto.GrupoInvestigacionNombre = null;
            await Task.CompletedTask;
            return null;
        }

        public async Task<SyncResult?> SyncConvocatoriaAndObjectivesPndAsync(DocProyecto project, ProyectoDto dto)
        {
            await Task.CompletedTask;
            return null;
        }

        public async Task SyncProgramAndTypesAsync(DocProyecto project, ProyectoDto dto)
        {
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
