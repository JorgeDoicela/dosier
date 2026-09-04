using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace dosier_infrastructure.data.models.Configurations;

public class DocTipoConvocatoriaConfiguration : IEntityTypeConfiguration<DocTipoConvocatoria>
{
    public void Configure(EntityTypeBuilder<DocTipoConvocatoria> entity)
    {
        entity.HasKey(e => e.IdTipoConvocatoria).HasName("PRIMARY");
        entity.ToTable("doc_tipos_convocatoria");
        entity.Property(e => e.IdTipoConvocatoria).HasColumnName("idTipoConvocatoria");
        entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasMaxLength(255);
    }
}
