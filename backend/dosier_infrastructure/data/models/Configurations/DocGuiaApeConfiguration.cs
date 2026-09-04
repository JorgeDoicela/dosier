using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using dosier_domain.Curriculum.Entities;

namespace dosier_infrastructure.data.models.Configurations
{
    public class DocGuiaApeConfiguration : IEntityTypeConfiguration<DocGuiaApe>
    {
        public void Configure(EntityTypeBuilder<DocGuiaApe> builder)
        {
            builder.ToTable("doc_guias_ape");
            builder.HasKey(e => e.IdGuiaApe);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPeriodo).IsRequired().HasMaxLength(7);
            builder.Property(e => e.CodigoFormato).IsRequired().HasMaxLength(50);
            builder.Property(e => e.VersionFormato).IsRequired().HasMaxLength(20);
            builder.Property(e => e.TituloPractica).IsRequired().HasMaxLength(500);

            builder.HasMany(e => e.Objetivos)
                   .WithOne(o => o.GuiaApe)
                   .HasForeignKey(o => o.IdGuiaApe)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.ResultadosAprendizaje)
                   .WithOne(r => r.GuiaApe)
                   .HasForeignKey(r => r.IdGuiaApe)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.CriteriosEvaluacion)
                   .WithOne(c => c.GuiaApe)
                   .HasForeignKey(c => c.IdGuiaApe)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.PreparacionPrevia)
                   .WithOne(p => p.GuiaApe)
                   .HasForeignKey(p => p.IdGuiaApe)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Procedimientos)
                   .WithOne(p => p.GuiaApe)
                   .HasForeignKey(p => p.IdGuiaApe)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Referencias)
                   .WithOne(r => r.GuiaApe)
                   .HasForeignKey(r => r.IdGuiaApe)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocGuiaApeObjetivoConfiguration : IEntityTypeConfiguration<DocGuiaApeObjetivo>
    {
        public void Configure(EntityTypeBuilder<DocGuiaApeObjetivo> builder)
        {
            builder.ToTable("doc_guias_ape_objetivos");
            builder.HasKey(e => e.IdObjetivo);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }

    public class DocGuiaApeRdaConfiguration : IEntityTypeConfiguration<DocGuiaApeRda>
    {
        public void Configure(EntityTypeBuilder<DocGuiaApeRda> builder)
        {
            builder.ToTable("doc_guias_ape_rdas");
            builder.HasKey(e => e.IdGuiaRda);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }

    public class DocGuiaApeCriterioConfiguration : IEntityTypeConfiguration<DocGuiaApeCriterio>
    {
        public void Configure(EntityTypeBuilder<DocGuiaApeCriterio> builder)
        {
            builder.ToTable("doc_guias_ape_criterios_evaluacion");
            builder.HasKey(e => e.IdCriterio);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.Puntaje).HasColumnType("decimal(4,2)");
        }
    }

    public class DocGuiaApePreparacionConfiguration : IEntityTypeConfiguration<DocGuiaApePreparacion>
    {
        public void Configure(EntityTypeBuilder<DocGuiaApePreparacion> builder)
        {
            builder.ToTable("doc_guias_ape_preparacion");
            builder.HasKey(e => e.IdPrep);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }

    public class DocGuiaApeProcedimientoConfiguration : IEntityTypeConfiguration<DocGuiaApeProcedimiento>
    {
        public void Configure(EntityTypeBuilder<DocGuiaApeProcedimiento> builder)
        {
            builder.ToTable("doc_guias_ape_procedimientos");
            builder.HasKey(e => e.IdProcedimiento);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }

    public class DocGuiaApeReferenciaConfiguration : IEntityTypeConfiguration<DocGuiaApeReferencia>
    {
        public void Configure(EntityTypeBuilder<DocGuiaApeReferencia> builder)
        {
            builder.ToTable("doc_guias_ape_referencias");
            builder.HasKey(e => e.IdReferencia);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }
}
