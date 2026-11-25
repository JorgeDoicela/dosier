namespace dosier_application.Calendario;

public record CalendarioCarreraDto(
    int IdCarrera,
    string Nombre
);

public record CalendarioEventoDto(
    string IdEventoCalendario,
    string Uuid,
    string Titulo,
    string? Descripcion,
    string CategoriaGlobal,
    string Subcategoria,
    DateOnly FechaInicio,
    DateOnly? FechaFin,
    bool EsTodoElDia,
    string? ColorHex,
    int? IdEntidadOrigen,
    string? UuidEntidadOrigen,
    string TipoEntidadOrigen,
    string? UrlAccion,
    string? RolesVisibles,
    bool EsPrivado,
    string Prioridad,
    string Estado,
    int? CreadoPor,
    int? AlertaDias,
    bool RecurrenciaAnual,
    int? IdCarrera = null,
    string? NombreCarrera = null,
    string? NombreDocente = null,
    bool PuedeGestionar = false
);

public record EventoNormativoDto(
    string? Uuid,
    string Titulo,
    string? Descripcion,
    string TipoEvento,
    DateOnly? FechaInicio,
    DateOnly? FechaFin,
    bool EsTodoElDia,
    bool RecurrenciaAnual,
    DateOnly? RecurrenciaHasta,
    string? RolesVisibles,
    string? ModuloOrigen,
    string? UrlAccion,
    string? ColorHex,
    int? AlertaDias,
    bool Activo,
    bool EsPrivado,
    string Prioridad,
    string Estado,
    // Notas Rápidas — campos extendidos
    string? NotaDetalle = null,
    int? OrdenBandeja = null,
    int? IdCarrera = null
);

/// <summary>Payload para reordenar notas en la bandeja Inbox.</summary>
public record ReordenarBandejaItem(string Uuid, int Orden);

public interface ICalendarioService
{
    /// <summary>Obtiene las carreras del instituto accesibles para el usuario según su rol y asignación académica.</summary>
    Task<IEnumerable<CalendarioCarreraDto>> GetCarrerasUsuarioAsync(int idUsuario, string rolUsuario);

    /// <summary>Obtiene todos los eventos del rango indicado, filtrados por rol, carreras del usuario, filtro opcional de carrera y idUsuario.</summary>
    Task<IEnumerable<CalendarioEventoDto>> GetEventosAsync(DateOnly desde, DateOnly hasta, string rolUsuario, int idUsuario, int? idCarreraFiltro = null);

    // ── CRUD normativos y personales ──────────────────────────────────────────────
    Task<IEnumerable<EventoNormativoDto>> GetNormativosAsync();
    Task<string> CreateNormativoAsync(EventoNormativoDto dto, int idUsuarioAdmin);
    Task<bool> UpdateNormativoAsync(string uuid, EventoNormativoDto dto);
    Task<bool> DeleteNormativoAsync(string uuid);

    /// <summary>Crea un evento de usuario validando permisos de alcance (Personal, Carrera, Instituto).</summary>
    Task<(string? Uuid, bool Forbidden)> CreateUsuarioEventoAsync(EventoNormativoDto dto, int idUsuario, string rolUsuario);

    /// <summary>Obtiene las notas adhesivas/rápidas sin programar del usuario, ordenadas por OrdenBandeja.</summary>
    Task<IEnumerable<EventoNormativoDto>> GetStickyNotesAsync(int idUsuario);

    /// <summary>Devuelve un evento del Kanban a la bandeja Inbox (limpia FechaInicio, estado = Inbox).</summary>
    Task<bool> DevolverAInboxAsync(string uuid, int idUsuario);

    /// <summary>Reordena las notas de la bandeja actualizando OrdenBandeja en batch.</summary>
    Task ReordenarBandejaAsync(IEnumerable<ReordenarBandejaItem> items, int idUsuario);

    /// <summary>Resuelve el IdUsuario interno a partir del IdSigafi o identificador de sesión.</summary>
    Task<int?> ResolveUserIdBySigafiAsync(string idSigafi);

    /// <summary>Actualiza un evento validando permisos del solicitante. Retorna null si no existe, false si no tiene permisos, true si se actualizó con éxito.</summary>
    Task<bool?> UpdateUsuarioEventoAsync(string uuid, EventoNormativoDto dto, int idUsuario, string rolUsuario = "");

    /// <summary>Elimina un evento validando permisos del solicitante. Retorna null si no existe, false si no tiene permisos, true si se eliminó con éxito.</summary>
    Task<bool?> DeleteUsuarioEventoAsync(string uuid, int idUsuario, string rolUsuario = "");

    /// <summary>Llamado por el job diario: envía alertas por email de eventos próximos.</summary>
    Task ProcesarAlertasDiariasAsync();
}
