using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace dosier_infrastructure.data.models.Configurations;

public class DocFeedbackReporteConfiguration : IEntityTypeConfiguration<DocFeedbackReporte>
{
    public void Configure(EntityTypeBuilder<DocFeedbackReporte> entity)
    {
        entity.HasKey(e => e.IdFeedback).HasName("PRIMARY");
        entity.ToTable("doc_feedback_reportes");

        entity.Property(e => e.IdFeedback).HasColumnName("idFeedback");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique().HasDatabaseName("uq_doc_feedback_uuid");

        entity.Property(e => e.IdUsuario).HasColumnName("idUsuario");
        entity.HasIndex(e => e.IdUsuario).HasDatabaseName("idx_doc_feedback_usuario");

        entity.Property(e => e.Cedula).HasColumnName("cedula").HasMaxLength(20);
        entity.Property(e => e.NombreUsuario).HasColumnName("nombreUsuario").HasMaxLength(255).IsRequired();
        entity.Property(e => e.RolUsuario).HasColumnName("rolUsuario").HasMaxLength(50).IsRequired();
        entity.Property(e => e.Tipo).HasColumnName("tipo").HasMaxLength(30).HasDefaultValue("SUGERENCIA");
        entity.HasIndex(e => e.Tipo).HasDatabaseName("idx_doc_feedback_tipo");

        entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(200).IsRequired();
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasColumnType("text").IsRequired();
        entity.Property(e => e.RutaOrigen).HasColumnName("rutaOrigen").HasMaxLength(255);
        entity.Property(e => e.ArchivosAdjuntosJson).HasColumnName("archivosAdjuntosJson").HasColumnType("json");
        entity.Property(e => e.ConversacionJson).HasColumnName("conversacionJson").HasColumnType("json");
        entity.Property(e => e.Estado).HasColumnName("estado").HasMaxLength(30).HasDefaultValue("PENDIENTE");
        entity.HasIndex(e => e.Estado).HasDatabaseName("idx_doc_feedback_estado");

        entity.Property(e => e.ObservacionAdmin).HasColumnName("observacionAdmin").HasColumnType("text");
        entity.Property(e => e.FechaCreacion).HasColumnName("fechaCreacion").HasDefaultValueSql("CURRENT_TIMESTAMP");
        entity.Property(e => e.FechaActualizacion).HasColumnName("fechaActualizacion");
    }
}
