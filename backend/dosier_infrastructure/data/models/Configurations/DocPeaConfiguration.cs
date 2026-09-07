using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using dosier_domain.Curriculum.Entities;

namespace dosier_infrastructure.data.models.Configurations
{
    public class DocPeaConfiguration : IEntityTypeConfiguration<DocPea>
    {
        public void Configure(EntityTypeBuilder<DocPea> builder)
        {
            builder.ToTable("doc_pea");
            builder.HasKey(e => e.IdPea);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPeriodo).IsRequired().HasMaxLength(7);
            builder.Property(e => e.Modalidad).IsRequired().HasMaxLength(50);
            builder.Property(e => e.Creditos).HasColumnType("decimal(4,2)");
            builder.Property(e => e.Paralelo).HasMaxLength(20);
            builder.Property(e => e.FuenteMalla).HasMaxLength(40);
            builder.Property(e => e.SnapshotCurricularJson).HasColumnType("json");
            builder.Property(e => e.EvaluacionAprendizaje).HasColumnType("text");
            builder.Property(e => e.FirmaElaboradoDocente).HasMaxLength(255);
            builder.Property(e => e.FirmaRevisadoCoord).HasMaxLength(255);
            builder.Property(e => e.FirmaRevisadoAcad).HasMaxLength(255);
            builder.Property(e => e.FirmaAprobadoVicerrector).HasMaxLength(255);
            builder.HasIndex(e => new { e.IdAsignacion, e.Version });
            builder.HasIndex(e => e.IdExpediente);

            builder.HasOne(e => e.Expediente)
                   .WithMany(exp => exp.Peas)
                   .HasForeignKey(e => e.IdExpediente)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(e => e.Unidades)
                   .WithOne(u => u.Pea)
                   .HasForeignKey(u => u.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.ResultadosAprendizaje)
                   .WithOne(r => r.Pea)
                   .HasForeignKey(r => r.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.ActividadesPracticas)
                   .WithOne(p => p.Pea)
                   .HasForeignKey(p => p.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Bibliografias)
                   .WithOne(b => b.Pea)
                   .HasForeignKey(b => b.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Silabos)
                   .WithOne(s => s.Pea)
                   .HasForeignKey(s => s.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Observaciones)
                   .WithOne(o => o.Pea)
                   .HasForeignKey(o => o.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Trazabilidades)
                   .WithOne(t => t.Pea)
                   .HasForeignKey(t => t.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocPeaUnidadConfiguration : IEntityTypeConfiguration<DocPeaUnidad>
    {
        public void Configure(EntityTypeBuilder<DocPeaUnidad> builder)
        {
            builder.ToTable("doc_pea_unidades");
            builder.HasKey(e => e.IdUnidad);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.NombreUnidad).IsRequired().HasMaxLength(255);

            builder.HasMany(e => e.Temas)
                   .WithOne(t => t.Unidad)
                   .HasForeignKey(t => t.IdUnidad)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocPeaTemaConfiguration : IEntityTypeConfiguration<DocPeaTema>
    {
        public void Configure(EntityTypeBuilder<DocPeaTema> builder)
        {
            builder.ToTable("doc_pea_temas");
            builder.HasKey(e => e.IdTema);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.TituloTema).IsRequired().HasMaxLength(255);
        }
    }

    public class DocPeaResultadoAprendizajeConfiguration : IEntityTypeConfiguration<DocPeaResultadoAprendizaje>
    {
        public void Configure(EntityTypeBuilder<DocPeaResultadoAprendizaje> builder)
        {
            builder.ToTable("doc_pea_resultados_aprendizaje");
            builder.HasKey(e => e.IdRda);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }

    public class DocPeaActividadPracticaConfiguration : IEntityTypeConfiguration<DocPeaActividadPractica>
    {
        public void Configure(EntityTypeBuilder<DocPeaActividadPractica> builder)
        {
            builder.ToTable("doc_pea_actividades_practicas");
            builder.HasKey(e => e.IdPractica);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.NombrePractica).IsRequired().HasMaxLength(255);
        }
    }

    public class DocPeaBibliografiaConfiguration : IEntityTypeConfiguration<DocPeaBibliografia>
    {
        public void Configure(EntityTypeBuilder<DocPeaBibliografia> builder)
        {
            builder.ToTable("doc_pea_bibliografia");
            builder.HasKey(e => e.IdBiblio);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
        }
    }

    public class DocPeaObservacionConfiguration : IEntityTypeConfiguration<DocPeaObservacion>
    {
        public void Configure(EntityTypeBuilder<DocPeaObservacion> builder)
        {
            builder.ToTable("doc_pea_observaciones");
            builder.HasKey(e => e.IdObservacion);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.RolObservador).IsRequired().HasMaxLength(50);
            builder.Property(e => e.SeccionAfectada).IsRequired().HasMaxLength(100);
            builder.Property(e => e.TextoObservacion).IsRequired();
            builder.Property(e => e.Estado).IsRequired().HasMaxLength(20);
        }
    }

    public class DocPeaTrazabilidadConfiguration : IEntityTypeConfiguration<DocPeaTrazabilidad>
    {
        public void Configure(EntityTypeBuilder<DocPeaTrazabilidad> builder)
        {
            builder.ToTable("doc_pea_trazabilidad");
            builder.HasKey(e => e.IdTrazabilidad);
            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.EstadoAnterior).IsRequired().HasMaxLength(50);
            builder.Property(e => e.EstadoNuevo).IsRequired().HasMaxLength(50);
            builder.Property(e => e.HashIntegridadSha256).HasMaxLength(64);
        }
    }
}
