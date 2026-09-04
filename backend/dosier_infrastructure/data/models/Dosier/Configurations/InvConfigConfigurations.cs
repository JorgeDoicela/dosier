using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace dosier_infrastructure.data.models.Configurations;

public class DocConfigWorkflowConfiguration : IEntityTypeConfiguration<DocConfigWorkflow>
{
    public void Configure(EntityTypeBuilder<DocConfigWorkflow> entity)
    {
        entity.HasKey(e => e.IdWorkflow).HasName("PRIMARY");
        entity.ToTable("doc_config_workflow");
        entity.Property(e => e.EstadoOrigen).HasMaxLength(50).IsRequired();
        entity.Property(e => e.EstadoDestino).HasMaxLength(50).IsRequired();
        entity.Property(e => e.ContabilizaCargaHoraria).HasColumnName("contabilizaCargaHoraria").HasColumnType("tinyint(1)").HasDefaultValue(false);
        entity.Property(e => e.EsEstadoFinal).HasColumnName("esEstadoFinal").HasColumnType("tinyint(1)").HasDefaultValue(false);
        entity.Property(e => e.EtiquetaUi).HasColumnName("etiquetaUi").HasMaxLength(80);
        entity.Property(e => e.ColorHex).HasColumnName("colorHex").HasMaxLength(7);
    }
}
