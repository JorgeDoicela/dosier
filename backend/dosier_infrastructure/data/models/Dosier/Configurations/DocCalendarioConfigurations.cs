using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace dosier_infrastructure.data.models.Configurations;

public class DocCalendarioEventoNormativoConfiguration : IEntityTypeConfiguration<DocCalendarioEventoNormativo>
{
    public void Configure(EntityTypeBuilder<DocCalendarioEventoNormativo> entity)
    {
        entity.ToTable("doc_calendario_eventos_normativos");
        entity.HasKey(e => e.IdEvento);
        entity.Property(e => e.IdEvento).HasColumnName("idEvento");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(255).IsRequired();
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasColumnType("text");
        entity.Property(e => e.TipoEvento).HasColumnName("tipoEvento").HasMaxLength(50).HasDefaultValue("Normativo");
        entity.Property(e => e.FechaInicio).HasColumnName("fechaInicio");
        entity.Property(e => e.FechaFin).HasColumnName("fechaFin");
        entity.Property(e => e.EsTodoElDia).HasColumnName("esTodoElDia").HasDefaultValue(true);
        entity.Property(e => e.RecurrenciaAnual).HasColumnName("recurrenciaAnual").HasDefaultValue(false);
        entity.Property(e => e.RecurrenciaHasta).HasColumnName("recurrenciaHasta");
        entity.Property(e => e.RolesVisibles).HasColumnName("rolesVisibles").HasMaxLength(255);
        entity.Property(e => e.EsPrivado).HasColumnName("esPrivado").HasDefaultValue(true);
        entity.Property(e => e.Prioridad).HasColumnName("prioridad").HasMaxLength(15).HasDefaultValue("Media");
        entity.Property(e => e.Estado).HasColumnName("estado").HasMaxLength(20).HasDefaultValue("Pendiente");
        entity.Property(e => e.ModuloOrigen).HasColumnName("moduloOrigen").HasMaxLength(50);
        entity.Property(e => e.UrlAccion).HasColumnName("urlAccion").HasMaxLength(255);
        entity.Property(e => e.ColorHex).HasColumnName("colorHex").HasMaxLength(7).HasDefaultValue("#6B7280");
        entity.Property(e => e.AlertaDias).HasColumnName("alertaDias").HasDefaultValue(7);
        entity.Property(e => e.Activo).HasColumnName("activo").HasDefaultValue(true);
        entity.Property(e => e.CreadoPor).HasColumnName("creadoPor");
        entity.Property(e => e.FechaRegistro).HasColumnName("fechaRegistro").HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
        entity.Property(e => e.FechaModificacion).HasColumnName("fechaModificacion").HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        entity.Property(e => e.NotaDetalle).HasColumnName("notaDetalle").HasColumnType("text");
        entity.Property(e => e.OrdenBandeja).HasColumnName("ordenBandeja");
    }
}

public class DocIcalTokenConfiguration : IEntityTypeConfiguration<DocIcalToken>
{
    public void Configure(EntityTypeBuilder<DocIcalToken> entity)
    {
        entity.ToTable("doc_ical_tokens");
        entity.HasKey(e => e.IdToken);
        entity.Property(e => e.IdToken).HasColumnName("idToken");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.IdUsuario).HasColumnName("idUsuario").IsRequired();
        entity.HasIndex(e => e.IdUsuario).IsUnique();
        entity.Property(e => e.Token).HasColumnName("token").HasMaxLength(64).IsRequired();
        entity.HasIndex(e => e.Token).IsUnique();
        entity.Property(e => e.Activo).HasColumnName("activo").HasDefaultValue(true);
        entity.Property(e => e.FechaGenerado).HasColumnName("fechaGenerado").HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
        entity.Property(e => e.FechaUltimoUso).HasColumnName("fechaUltimoUso");
    }
}

public class DocCalendarioAlertaEnviadaConfiguration : IEntityTypeConfiguration<DocCalendarioAlertaEnviada>
{
    public void Configure(EntityTypeBuilder<DocCalendarioAlertaEnviada> entity)
    {
        entity.ToTable("doc_calendario_alertas_enviadas");
        entity.HasKey(e => e.IdAlerta);
        entity.Property(e => e.IdAlerta).HasColumnName("idAlerta");
        entity.Property(e => e.IdEventoCalendario).HasColumnName("idEventoCalendario").HasMaxLength(50).IsRequired();
        entity.Property(e => e.IdUsuario).HasColumnName("idUsuario").IsRequired();
        entity.Property(e => e.FechaEvento).HasColumnName("fechaEvento").IsRequired();
        entity.Property(e => e.FechaEnvio).HasColumnName("fechaEnvio").HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
        entity.HasIndex(e => new { e.IdEventoCalendario, e.IdUsuario, e.FechaEvento }).IsUnique().HasDatabaseName("uk_alerta");
    }
}
