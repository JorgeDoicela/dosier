using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using dosier_domain.Curriculum.Entities;

namespace dosier_infrastructure.data.models.Configurations
{
    public class DocSilaboConfiguration : IEntityTypeConfiguration<DocSilabo>
    {
        public void Configure(EntityTypeBuilder<DocSilabo> builder)
        {
            builder.ToTable("doc_silabo");
            builder.HasKey(e => e.IdSilabo);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPeriodo).IsRequired().HasMaxLength(7);
            builder.Property(e => e.PorcentajeDocencia).HasColumnType("decimal(5,2)");
            builder.Property(e => e.PorcentajePractico).HasColumnType("decimal(5,2)");
            builder.Property(e => e.PorcentajeAutonomo).HasColumnType("decimal(5,2)");
            builder.Property(e => e.HorasSemanaDocencia).HasColumnType("decimal(4,1)");
            builder.Property(e => e.HorasSemanaPractico).HasColumnType("decimal(4,1)");
            builder.Property(e => e.HorasSemanaAutonomo).HasColumnType("decimal(4,1)");

            builder.HasMany(e => e.Semanas)
                   .WithOne(s => s.Silabo)
                   .HasForeignKey(s => s.IdSilabo)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Adaptaciones)
                   .WithOne(a => a.Silabo)
                   .HasForeignKey(a => a.IdSilabo)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocSilaboSemanaConfiguration : IEntityTypeConfiguration<DocSilaboSemana>
    {
        public void Configure(EntityTypeBuilder<DocSilaboSemana> builder)
        {
            builder.ToTable("doc_silabo_semanas");
            builder.HasKey(e => e.IdSemana);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);

            builder.HasOne(e => e.Unidad)
                   .WithMany()
                   .HasForeignKey(e => e.IdUnidad)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }

    public class DocSilaboAdaptacionConfiguration : IEntityTypeConfiguration<DocSilaboAdaptacion>
    {
        public void Configure(EntityTypeBuilder<DocSilaboAdaptacion> builder)
        {
            builder.ToTable("doc_silabo_adaptaciones");
            builder.HasKey(e => e.IdAdaptacion);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.TipoNecesidad).IsRequired().HasMaxLength(150);
        }
    }
}
