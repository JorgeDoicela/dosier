using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Curriculum
{
    public class NormativaService : INormativaService
    {
        private readonly DosierContext _context;

        public NormativaService(DosierContext context)
        {
            _context = context;
        }

        public async Task<List<NormativaDto>> GetNormativasVigentesAsync(string? organismo = null)
        {
            var query = _context.DocNormativas
                .AsNoTracking()
                .Include(n => n.Articulos.OrderBy(a => a.Orden))
                .Where(n => n.Activo);

            if (!string.IsNullOrWhiteSpace(organismo))
            {
                query = query.Where(n => n.OrganismoEmisor == organismo);
            }

            var list = await query.OrderBy(n => n.OrganismoEmisor).ThenBy(n => n.CodigoResolucion).ToListAsync();

            return list.Select(n => new NormativaDto
            {
                IdNormativa = n.IdNormativa,
                Uuid = n.Uuid,
                OrganismoEmisor = n.OrganismoEmisor,
                TipoNormativa = n.TipoNormativa,
                CodigoResolucion = n.CodigoResolucion,
                Titulo = n.Titulo,
                Descripcion = n.Descripcion,
                FechaEmision = n.FechaEmision,
                FechaVigencia = n.FechaVigencia,
                ArchivoUrl = n.ArchivoUrl,
                Activo = n.Activo,
                Articulos = n.Articulos.Select(a => new NormativaArticuloDto
                {
                    IdArticulo = a.IdArticulo,
                    Uuid = a.Uuid,
                    IdNormativa = a.IdNormativa,
                    CodigoResolucion = n.CodigoResolucion,
                    OrganismoEmisor = n.OrganismoEmisor,
                    NumeroArticulo = a.NumeroArticulo,
                    Titulo = a.Titulo,
                    Contenido = a.Contenido,
                    RequisitoCurricular = a.RequisitoCurricular,
                    Orden = a.Orden
                }).ToList()
            }).ToList();
        }

        public async Task<List<NormativaArticuloDto>> GetChecklistCurricularAsync(string? organismo = null)
        {
            var query = _context.DocNormativaArticulos
                .AsNoTracking()
                .Include(a => a.Normativa)
                .Where(a => a.Normativa != null && a.Normativa.Activo);

            if (!string.IsNullOrWhiteSpace(organismo))
            {
                query = query.Where(a => a.Normativa!.OrganismoEmisor == organismo);
            }

            var articulos = await query.OrderBy(a => a.Normativa!.OrganismoEmisor)
                                       .ThenBy(a => a.Orden)
                                       .ToListAsync();

            return articulos.Select(a => new NormativaArticuloDto
            {
                IdArticulo = a.IdArticulo,
                Uuid = a.Uuid,
                IdNormativa = a.IdNormativa,
                CodigoResolucion = a.Normativa?.CodigoResolucion ?? string.Empty,
                OrganismoEmisor = a.Normativa?.OrganismoEmisor ?? string.Empty,
                NumeroArticulo = a.NumeroArticulo,
                Titulo = a.Titulo,
                Contenido = a.Contenido,
                RequisitoCurricular = a.RequisitoCurricular,
                Orden = a.Orden
            }).ToList();
        }

        public async Task<ModeloEducativoDto?> GetModeloEducativoVigenteAsync()
        {
            var modelo = await _context.DocModelosEducativos
                .AsNoTracking()
                .Where(m => m.Activo)
                .OrderByDescending(m => m.FechaVigenciaDesde)
                .FirstOrDefaultAsync();

            if (modelo == null) return null;

            return new ModeloEducativoDto
            {
                IdModelo = modelo.IdModelo,
                Uuid = modelo.Uuid,
                Codigo = modelo.Codigo,
                Nombre = modelo.Nombre,
                Version = modelo.Version,
                ResolucionAprobacion = modelo.ResolucionAprobacion,
                Descripcion = modelo.Descripcion,
                FechaVigenciaDesde = modelo.FechaVigenciaDesde,
                FechaVigenciaHasta = modelo.FechaVigenciaHasta,
                ArchivoUrl = modelo.ArchivoUrl,
                Activo = modelo.Activo
            };
        }
    }
}
