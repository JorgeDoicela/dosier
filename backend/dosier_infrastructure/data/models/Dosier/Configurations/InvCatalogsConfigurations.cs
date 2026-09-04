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

public class DocAgendaZonalConfiguration : IEntityTypeConfiguration<DocAgendaZonal>
{
    public void Configure(EntityTypeBuilder<DocAgendaZonal> entity)
    {
        entity.HasKey(e => e.IdAgendaZonal).HasName("PRIMARY");
        entity.ToTable("doc_agendas_zonales");
        entity.Property(e => e.IdAgendaZonal).HasColumnName("idAgendaZonal");
        entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(150).IsRequired();
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasMaxLength(255);
    }
}

public class DocOdsEjeConfiguration : IEntityTypeConfiguration<DocOdsEje>
{
    public void Configure(EntityTypeBuilder<DocOdsEje> entity)
    {
        entity.HasKey(e => e.IdEje).HasName("PRIMARY");
        entity.ToTable("doc_ods_ejes");
        entity.Property(e => e.IdEje).HasColumnName("idEje");
        entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
    }
}

public class DocOdsConfiguration : IEntityTypeConfiguration<DocOds>
{
    public void Configure(EntityTypeBuilder<DocOds> entity)
    {
        entity.HasKey(e => e.IdOds).HasName("PRIMARY");
        entity.ToTable("doc_ods");
        entity.Property(e => e.IdOds).HasColumnName("idOds");
        entity.Property(e => e.IdEje).HasColumnName("idEje");
        entity.Property(e => e.NumeroOds).HasColumnName("numeroOds");
        entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(255).IsRequired();

        entity.HasOne(d => d.IdEjeNavigation).WithMany(p => p.DocOds).HasForeignKey(d => d.IdEje).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_ods_eje");
    }
}

public class DocCatImpactoConfiguration : IEntityTypeConfiguration<DocCatImpacto>
{
    public void Configure(EntityTypeBuilder<DocCatImpacto> entity)
    {
        entity.HasKey(e => e.IdCatImpacto).HasName("PRIMARY");
        entity.ToTable("doc_cat_impactos");
        entity.Property(e => e.IdCatImpacto).HasColumnName("idCatImpacto");
        entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
    }
}

public class DocCatTipoEvidenciaConfiguration : IEntityTypeConfiguration<DocCatTipoEvidencia>
{
    public void Configure(EntityTypeBuilder<DocCatTipoEvidencia> entity)
    {
        entity.HasKey(e => e.IdTipoEvidencia).HasName("PRIMARY");
        entity.ToTable("doc_cat_tipo_evidencia");
        entity.Property(e => e.IdTipoEvidencia).HasColumnName("idTipoEvidencia");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasMaxLength(255);
        entity.Property(e => e.Extensiones).HasColumnName("extensiones").HasMaxLength(50).HasDefaultValueSql("'pdf,jpg,png,zip'");
        entity.Property(e => e.Activo).HasColumnName("activo").HasColumnType("tinyint(1)").HasDefaultValueSql("'1'");
    }
}

public class DocEntidadExternaConfiguration : IEntityTypeConfiguration<DocEntidadExterna>
{
    public void Configure(EntityTypeBuilder<DocEntidadExterna> entity)
    {
        entity.HasKey(e => e.IdEntidad).HasName("PRIMARY");
        entity.ToTable("doc_entidades_externas");
        entity.Property(e => e.IdEntidad).HasColumnName("idEntidad");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.Ruc).HasColumnName("ruc").HasMaxLength(13);
        entity.HasIndex(e => e.Ruc).IsUnique();
        entity.Property(e => e.RazonSocial).HasColumnName("razonSocial").HasMaxLength(255).IsRequired();
        entity.Property(e => e.Tipo).HasColumnName("tipo").HasColumnType("enum('Pública','Privada','ONG','Académica')").HasDefaultValueSql("'Privada'");
        entity.Property(e => e.Sector).HasColumnName("sector").HasMaxLength(100);
        entity.Property(e => e.ContactoNombre).HasColumnName("contactoNombre").HasMaxLength(150);
        entity.Property(e => e.ContactoEmail).HasColumnName("contactoEmail").HasMaxLength(150);
        entity.Property(e => e.Activo).HasColumnName("activo").HasColumnType("tinyint(1)").HasDefaultValueSql("'1'");
        entity.Property(e => e.FechaRegistro).HasColumnName("fechaRegistro").HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}

public class DocPndObjetivoConfiguration : IEntityTypeConfiguration<DocPndObjetivo>
{
    public void Configure(EntityTypeBuilder<DocPndObjetivo> entity)
    {
        entity.HasKey(e => e.IdObjetivoPnd).HasName("PRIMARY");
        entity.ToTable("doc_pnd_objetivos");
        entity.Property(e => e.IdObjetivoPnd).HasColumnName("idObjetivoPnd");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.Codigo).HasColumnName("codigo").HasMaxLength(20).IsRequired();
        entity.HasIndex(e => e.Codigo).IsUnique();
        entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(255).IsRequired();
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasColumnType("text");
        entity.Property(e => e.Activo).HasColumnName("activo").HasColumnType("tinyint(1)").HasDefaultValueSql("'1'").HasSentinel(true);
    }
}
