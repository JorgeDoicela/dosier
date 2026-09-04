using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace dosier_infrastructure.data.models.Configurations;

public class DocConvocatoriaConfiguration : IEntityTypeConfiguration<DocConvocatoria>
{
    public void Configure(EntityTypeBuilder<DocConvocatoria> entity)
    {
        entity.HasKey(e => e.IdConvocatoria).HasName("PRIMARY");
        entity.ToTable("doc_convocatorias");
        entity.Property(e => e.IdConvocatoria).HasColumnName("idConvocatoria");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.CodigoConvocatoria).HasColumnName("codigoConvocatoria").HasMaxLength(30).IsRequired();
        entity.HasIndex(e => e.CodigoConvocatoria).IsUnique();
        entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(255).IsRequired();
        entity.Property(e => e.IdPeriodo).HasColumnName("idPeriodo").HasMaxLength(7).IsFixedLength().IsRequired();
        entity.Property(e => e.FechaApertura).HasColumnName("fechaApertura");
        entity.Property(e => e.FechaCierre).HasColumnName("fechaCierre");
        entity.Property(e => e.Anio).HasColumnName("anio").HasMaxLength(50).IsRequired();
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasColumnType("text");
        entity.Property(e => e.UrlBases).HasColumnName("urlBases").HasMaxLength(512);
        entity.Property(e => e.RequisitosMinimos).HasColumnName("requisitosMinimos").HasColumnType("text");
        entity.Property(e => e.IdTipoConvocatoria).HasColumnName("idTipoConvocatoria");
        entity.Property(e => e.Estado).HasColumnName("estado").HasColumnType("enum('Borrador','Abierta','Cerrada','Anulada')").HasDefaultValueSql("'Borrador'");
        entity.Property(e => e.Eliminado).HasColumnName("eliminado").HasColumnType("tinyint(1)").HasDefaultValueSql("'0'").HasSentinel(false);
        entity.Property(e => e.FechaEliminacion).HasColumnName("fechaEliminacion");
        entity.Property(e => e.EliminadoPorUsuarioId).HasColumnName("eliminadoPorUsuarioId");

        entity.HasOne(d => d.IdPeriodoNavigation).WithMany().HasForeignKey(d => d.IdPeriodo).OnDelete(DeleteBehavior.Restrict).HasConstraintName("fk_conv_periodo");
    }
}
