using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using dosier_domain.Curriculum.Entities;

namespace dosier_infrastructure.data.models.Configurations
{
    public class DocNormativaConfiguration : IEntityTypeConfiguration<DocNormativa>
    {
        public void Configure(EntityTypeBuilder<DocNormativa> builder)
        {
            builder.ToTable("doc_normativas");
            builder.HasKey(e => e.IdNormativa);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.OrganismoEmisor).IsRequired().HasMaxLength(20);
            builder.Property(e => e.TipoNormativa).IsRequired().HasMaxLength(100);
            builder.Property(e => e.CodigoResolucion).IsRequired().HasMaxLength(100);
            builder.Property(e => e.Titulo).IsRequired().HasMaxLength(500);
            builder.Property(e => e.ArchivoUrl).HasMaxLength(512);

            builder.HasIndex(e => new { e.OrganismoEmisor, e.Activo });
            builder.HasIndex(e => e.CodigoResolucion);

            builder.HasMany(e => e.Articulos)
                   .WithOne(a => a.Normativa)
                   .HasForeignKey(a => a.IdNormativa)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocNormativaArticuloConfiguration : IEntityTypeConfiguration<DocNormativaArticulo>
    {
        public void Configure(EntityTypeBuilder<DocNormativaArticulo> builder)
        {
            builder.ToTable("doc_normativa_articulos");
            builder.HasKey(e => e.IdArticulo);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.NumeroArticulo).IsRequired().HasMaxLength(50);
            builder.Property(e => e.Titulo).HasMaxLength(255);
            builder.Property(e => e.Contenido).IsRequired();

            builder.HasIndex(e => e.IdNormativa);
        }
    }

    public class DocModeloEducativoConfiguration : IEntityTypeConfiguration<DocModeloEducativo>
    {
        public void Configure(EntityTypeBuilder<DocModeloEducativo> builder)
        {
            builder.ToTable("doc_modelos_educativos");
            builder.HasKey(e => e.IdModelo);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.Codigo).IsRequired().HasMaxLength(50);
            builder.Property(e => e.Nombre).IsRequired().HasMaxLength(255);
            builder.Property(e => e.Version).IsRequired().HasMaxLength(20);
            builder.Property(e => e.ResolucionAprobacion).HasMaxLength(150);
            builder.Property(e => e.ArchivoUrl).HasMaxLength(512);

            builder.HasIndex(e => e.Codigo).IsUnique();

            builder.HasMany(e => e.Expedientes)
                   .WithOne(exp => exp.ModeloEducativo)
                   .HasForeignKey(exp => exp.IdModeloEducativo)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }

    public class DocProyectoCurricularConfiguration : IEntityTypeConfiguration<DocProyectoCurricular>
    {
        public void Configure(EntityTypeBuilder<DocProyectoCurricular> builder)
        {
            builder.ToTable("doc_proyectos_curriculares");
            builder.HasKey(e => e.IdProyectoCurricular);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.CodigoResolucionCes).HasMaxLength(100);
            builder.Property(e => e.NombreProyecto).IsRequired().HasMaxLength(255);
            builder.Property(e => e.Version).IsRequired().HasMaxLength(20);

            builder.HasIndex(e => new { e.IdCarrera, e.IdMalla });

            builder.HasMany(e => e.Expedientes)
                   .WithOne(exp => exp.ProyectoCurricular)
                   .HasForeignKey(exp => exp.IdProyectoCurricular)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }

    public class DocPerfilEgresoConfiguration : IEntityTypeConfiguration<DocPerfilEgreso>
    {
        public void Configure(EntityTypeBuilder<DocPerfilEgreso> builder)
        {
            builder.ToTable("doc_perfiles_egreso");
            builder.HasKey(e => e.IdPerfilEgreso);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.Version).IsRequired().HasMaxLength(20);
            builder.Property(e => e.DescripcionGeneral).IsRequired();

            builder.HasIndex(e => new { e.IdCarrera, e.IdMalla });

            builder.HasMany(e => e.Resultados)
                   .WithOne(r => r.PerfilEgreso)
                   .HasForeignKey(r => r.IdPerfilEgreso)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Expedientes)
                   .WithOne(exp => exp.PerfilEgreso)
                   .HasForeignKey(exp => exp.IdPerfilEgreso)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }

    public class DocPerfilEgresoResultadoConfiguration : IEntityTypeConfiguration<DocPerfilEgresoResultado>
    {
        public void Configure(EntityTypeBuilder<DocPerfilEgresoResultado> builder)
        {
            builder.ToTable("doc_perfil_egreso_resultados");
            builder.HasKey(e => e.IdResultadoPerfil);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.Codigo).IsRequired().HasMaxLength(50);
            builder.Property(e => e.Descripcion).IsRequired();

            builder.HasIndex(e => e.IdPerfilEgreso);

            builder.HasMany(e => e.AsignaturasRelacionadas)
                   .WithOne(a => a.ResultadoPerfil)
                   .HasForeignKey(a => a.IdResultadoPerfil)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocAsignaturaResultadoPerfilConfiguration : IEntityTypeConfiguration<DocAsignaturaResultadoPerfil>
    {
        public void Configure(EntityTypeBuilder<DocAsignaturaResultadoPerfil> builder)
        {
            builder.ToTable("doc_asignatura_resultado_perfil");
            builder.HasKey(e => e.IdRelacion);

            builder.Property(e => e.NivelAporte).IsRequired().HasMaxLength(20);

            builder.HasIndex(e => new { e.IdAsignatura, e.IdMalla, e.IdResultadoPerfil });
        }
    }

    public class DocExpedienteCurricularConfiguration : IEntityTypeConfiguration<DocExpedienteCurricular>
    {
        public void Configure(EntityTypeBuilder<DocExpedienteCurricular> builder)
        {
            builder.ToTable("doc_expedientes_curriculares");
            builder.HasKey(e => e.IdExpediente);

            builder.Property(e => e.Uuid).IsRequired().HasMaxLength(36);
            builder.Property(e => e.CodigoExpediente).HasMaxLength(100);
            builder.Property(e => e.IdPeriodo).IsRequired().HasMaxLength(7);
            builder.Property(e => e.Paralelo).HasMaxLength(20);
            builder.Property(e => e.IdDocenteResponsable).HasMaxLength(20);
            builder.Property(e => e.EstadoGeneral).IsRequired().HasMaxLength(20);
            builder.Property(e => e.SnapshotCurricularJson).HasColumnType("json");

            builder.HasIndex(e => new { e.IdPeriodo, e.IdAsignatura });
            builder.HasIndex(e => e.IdAsignacion);

            builder.HasOne(e => e.ProyectoCurricular)
                   .WithMany(p => p.Expedientes)
                   .HasForeignKey(e => e.IdProyectoCurricular)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(e => e.PerfilEgreso)
                   .WithMany(p => p.Expedientes)
                   .HasForeignKey(e => e.IdPerfilEgreso)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(e => e.ModeloEducativo)
                   .WithMany(m => m.Expedientes)
                   .HasForeignKey(e => e.IdModeloEducativo)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(e => e.Peas)
                   .WithOne(p => p.Expediente)
                   .HasForeignKey(p => p.IdExpediente)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
