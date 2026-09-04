using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Common.Notifications;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Common.Notifications
{
    public class EmailTemplateService : IEmailTemplateService
    {
        private readonly DosierContext _context;

        public EmailTemplateService(DosierContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmailTemplateDto>> GetTemplatesAsync()
        {
            var list = await _context.DocEmailTemplates
                .OrderByDescending(t => t.FechaCreado)
                .ToListAsync();

            return list.Select(MapToTemplateDto);
        }

        public async Task<EmailTemplateDto?> GetTemplateByIdAsync(int id)
        {
            var template = await _context.DocEmailTemplates.FindAsync(id);
            return template != null ? MapToTemplateDto(template) : null;
        }

        public async Task<EmailTemplateDto?> GetTemplateByCodigoAsync(string codigo)
        {
            var template = await _context.DocEmailTemplates
                .FirstOrDefaultAsync(t => t.Codigo == codigo);
            return template != null ? MapToTemplateDto(template) : null;
        }

        public async Task<EmailTemplateDto> CreateTemplateAsync(EmailTemplateDto dto)
        {
            var entity = new DocEmailTemplate
            {
                Uuid = string.IsNullOrEmpty(dto.Uuid) ? Guid.NewGuid().ToString() : dto.Uuid,
                Codigo = dto.Codigo,
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Asunto = dto.Asunto,
                CuerpoHtml = dto.CuerpoHtml,
                Activo = dto.Activo,
                FechaCreado = DateTime.UtcNow,
                FechaActualizado = DateTime.UtcNow
            };

            _context.DocEmailTemplates.Add(entity);
            await _context.SaveChangesAsync();
            
            return MapToTemplateDto(entity);
        }

        public async Task<EmailTemplateDto> UpdateTemplateAsync(EmailTemplateDto dto)
        {
            var entity = await _context.DocEmailTemplates.FindAsync(dto.IdEmailTemplate);
            if (entity == null) throw new KeyNotFoundException("Plantilla no encontrada");

            entity.Codigo = dto.Codigo;
            entity.Nombre = dto.Nombre;
            entity.Descripcion = dto.Descripcion;
            entity.Asunto = dto.Asunto;
            entity.CuerpoHtml = dto.CuerpoHtml;
            entity.Activo = dto.Activo;
            entity.FechaActualizado = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToTemplateDto(entity);
        }

        public async Task DeleteTemplateAsync(int id)
        {
            var template = await _context.DocEmailTemplates.FindAsync(id);
            if (template != null)
            {
                _context.DocEmailTemplates.Remove(template);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<EmailHistorialDto>> GetEmailHistoryAsync(int limit = 100)
        {
            var list = await _context.DocEmailHistorials
                .Include(h => h.IdUsuarioDestinatarioNavigation)
                .OrderByDescending(h => h.FechaEnvio)
                .Take(limit)
                .ToListAsync();

            return list.Select(MapToHistorialDto);
        }

        private EmailTemplateDto MapToTemplateDto(DocEmailTemplate entity)
        {
            return new EmailTemplateDto
            {
                IdEmailTemplate = entity.IdEmailTemplate,
                Uuid = entity.Uuid,
                Codigo = entity.Codigo,
                Nombre = entity.Nombre,
                Descripcion = entity.Descripcion,
                Asunto = entity.Asunto,
                CuerpoHtml = entity.CuerpoHtml,
                Activo = entity.Activo,
                FechaCreado = entity.FechaCreado,
                FechaActualizado = entity.FechaActualizado
            };
        }

        private EmailHistorialDto MapToHistorialDto(DocEmailHistorial entity)
        {
            return new EmailHistorialDto
            {
                IdEmailHistorial = entity.IdEmailHistorial,
                Uuid = entity.Uuid,
                Destinatario = entity.Destinatario,
                IdUsuarioDestinatario = entity.IdUsuarioDestinatario,
                NombreDestinatario = entity.IdUsuarioDestinatarioNavigation?.Nombre,
                Asunto = entity.Asunto,
                Cuerpo = entity.Cuerpo,
                Estado = entity.Estado,
                ErrorMensaje = entity.ErrorMensaje,
                FechaEnvio = entity.FechaEnvio,
                AdjuntosJson = entity.AdjuntosJson,
                MetadataJson = entity.MetadataJson
            };
        }
    }
}
