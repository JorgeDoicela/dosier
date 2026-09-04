using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using dosier_domain.Curriculum.Entities;

namespace dosier_infrastructure.data.models.Configurations
{
    public class DocGuiaEstudioConfiguration : IEntityTypeConfiguration<DocGuiaEstudio>
    {
        public void Configure(EntityTypeBuilder<DocGuiaEstudio> builder)
        {
            builder.ToTable("doc_guias_estudio");
            builder.HasKey(e => e.IdGuiaEstudio);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPeriodo).IsRequired().HasMaxLength(7);

            builder.HasMany(e => e.Unidades)
                   .WithOne(u => u.GuiaEstudio)
                   .HasForeignKey(u => u.IdGuiaEstudio)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocGuiaEstudioUnidadConfiguration : IEntityTypeConfiguration<DocGuiaEstudioUnidad>
    {
        public void Configure(EntityTypeBuilder<DocGuiaEstudioUnidad> builder)
        {
            builder.ToTable("doc_guias_estudio_unidades");
            builder.HasKey(e => e.IdGuiaUnidad);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.NombreUnidad).IsRequired().HasMaxLength(255);

            builder.HasMany(e => e.Temas)
                   .WithOne(t => t.GuiaUnidad)
                   .HasForeignKey(t => t.IdGuiaUnidad)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.PreguntasGuia)
                   .WithOne(p => p.GuiaUnidad)
                   .HasForeignKey(p => p.IdGuiaUnidad)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Glosarios)
                   .WithOne(g => g.GuiaUnidad)
                   .HasForeignKey(g => g.IdGuiaUnidad)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Actividades)
                   .WithOne(a => a.GuiaUnidad)
                   .HasForeignKey(a => a.IdGuiaUnidad)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Referencias)
                   .WithOne(r => r.GuiaUnidad)
                   .HasForeignKey(r => r.IdGuiaUnidad)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocGuiaEstudioTemaConfiguration : IEntityTypeConfiguration<DocGuiaEstudioTema>
    {
        public void Configure(EntityTypeBuilder<DocGuiaEstudioTema> builder)
        {
            builder.ToTable("doc_guias_estudio_temas");
            builder.HasKey(e => e.IdGuiaTema);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.NombreTema).IsRequired().HasMaxLength(255);

            builder.HasMany(e => e.Subtemas)
                   .WithOne(s => s.GuiaTema)
                   .HasForeignKey(s => s.IdGuiaTema)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocGuiaEstudioSubtemaConfiguration : IEntityTypeConfiguration<DocGuiaEstudioSubtema>
    {
        public void Configure(EntityTypeBuilder<DocGuiaEstudioSubtema> builder)
        {
            builder.ToTable("doc_guias_estudio_subtemas");
            builder.HasKey(e => e.IdGuiaSubtema);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.NumeroSubtema).IsRequired().HasMaxLength(20);
            builder.Property(e => e.TituloSubtema).IsRequired().HasMaxLength(255);
        }
    }

    public class DocGuiaEstudioPreguntaGuiaConfiguration : IEntityTypeConfiguration<DocGuiaEstudioPreguntaGuia>
    {
        public void Configure(EntityTypeBuilder<DocGuiaEstudioPreguntaGuia> builder)
        {
            builder.ToTable("doc_guias_estudio_preguntas_guia");
            builder.HasKey(e => e.IdPreguntaGuia);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }

    public class DocGuiaEstudioGlosarioConfiguration : IEntityTypeConfiguration<DocGuiaEstudioGlosario>
    {
        public void Configure(EntityTypeBuilder<DocGuiaEstudioGlosario> builder)
        {
            builder.ToTable("doc_guias_estudio_glosario");
            builder.HasKey(e => e.IdGlosario);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.Termino).IsRequired().HasMaxLength(150);
        }
    }

    public class DocGuiaEstudioActividadConfiguration : IEntityTypeConfiguration<DocGuiaEstudioActividad>
    {
        public void Configure(EntityTypeBuilder<DocGuiaEstudioActividad> builder)
        {
            builder.ToTable("doc_guias_estudio_actividades");
            builder.HasKey(e => e.IdActividad);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.TituloActividad).IsRequired().HasMaxLength(255);
        }
    }

    public class DocGuiaEstudioReferenciaConfiguration : IEntityTypeConfiguration<DocGuiaEstudioReferencia>
    {
        public void Configure(EntityTypeBuilder<DocGuiaEstudioReferencia> builder)
        {
            builder.ToTable("doc_guias_estudio_referencias");
            builder.HasKey(e => e.IdGuiaRef);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }
}
