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

            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdExpediente).HasColumnName("idExpediente");
            builder.Property(e => e.IdCarrera).HasColumnName("idCarrera");
            builder.Property(e => e.IdAsignatura).HasColumnName("idAsignatura");
            builder.Property(e => e.IdPeriodo).HasColumnName("idPeriodo").IsRequired().HasMaxLength(7);
            builder.Property(e => e.IdAsignacion).HasColumnName("idAsignacion");
            builder.Property(e => e.IdMalla).HasColumnName("idMalla");
            builder.Property(e => e.IdDetalleMalla).HasColumnName("idDetalleMalla");
            builder.Property(e => e.IdNivel).HasColumnName("idNivel");
            builder.Property(e => e.IdModalidad).HasColumnName("idModalidad");
            builder.Property(e => e.IdSeccion).HasColumnName("idSeccion");
            builder.Property(e => e.Paralelo).HasColumnName("paralelo").HasMaxLength(20);
            builder.Property(e => e.FuenteMalla).HasColumnName("fuenteMalla").HasMaxLength(40);
            builder.Property(e => e.SnapshotCurricularJson).HasColumnName("snapshotCurricularJson").HasColumnType("json");
            builder.Property(e => e.IdDocenteElaborador).HasColumnName("idDocenteElaborador").HasMaxLength(20);
            builder.Property(e => e.Modalidad).HasColumnName("modalidad").IsRequired().HasMaxLength(50);
            builder.Property(e => e.UnidadOrganizacion).HasColumnName("unidadOrganizacion").HasMaxLength(100);
            builder.Property(e => e.SemestreNivel).HasColumnName("semestreNivel").HasMaxLength(20);
            builder.Property(e => e.TotalHorasAsignatura).HasColumnName("totalHorasAsignatura");
            builder.Property(e => e.Creditos).HasColumnName("creditos").HasColumnType("decimal(4,2)");
            builder.Property(e => e.HorasContactoDocente).HasColumnName("horasContactoDocente");
            builder.Property(e => e.HorasPracticoExperimental).HasColumnName("horasPracticoExperimental");
            builder.Property(e => e.HorasAutonomo).HasColumnName("horasAutonomo");
            builder.Property(e => e.ObjetivoAsignatura).HasColumnName("objetivoAsignatura").HasColumnType("text");
            builder.Property(e => e.MetodologiaEnsenanza).HasColumnName("metodologiaEnsenanza").HasColumnType("text");
            builder.Property(e => e.RecursosDidacticos).HasColumnName("recursosDidacticos").HasColumnType("text");
            builder.Property(e => e.EvaluacionAprendizaje).HasColumnName("evaluacionAprendizaje").HasColumnType("text");
            builder.Property(e => e.Estado).HasColumnName("estado");
            builder.Property(e => e.Version).HasColumnName("version");
            builder.Property(e => e.Activo).HasColumnName("activo");
            builder.Property(e => e.FechaCreacion).HasColumnName("fechaCreacion");
            builder.Property(e => e.FechaModificacion).HasColumnName("fechaModificacion");
            builder.Property(e => e.FirmaElaboradoDocente).HasColumnName("firmaElaboradoDocente").HasMaxLength(255);
            builder.Property(e => e.FechaElaborado).HasColumnName("fechaElaborado");
            builder.Property(e => e.FirmaRevisadoCoord).HasColumnName("firmaRevisadoCoord").HasMaxLength(255);
            builder.Property(e => e.FechaRevisadoCoord).HasColumnName("fechaRevisadoCoord");
            builder.Property(e => e.FirmaRevisadoAcad).HasColumnName("firmaRevisadoAcad").HasMaxLength(255);
            builder.Property(e => e.FechaRevisadoAcad).HasColumnName("fechaRevisadoAcad");
            builder.Property(e => e.FirmaAprobadoVicerrector).HasColumnName("firmaAprobadoVicerrector").HasMaxLength(255);
            builder.Property(e => e.FechaAprobado).HasColumnName("fechaAprobado");
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

            builder.HasMany(e => e.Observaciones)
                   .WithOne(o => o.Pea)
                   .HasForeignKey(o => o.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Trazabilidades)
                   .WithOne(t => t.Pea)
                   .HasForeignKey(t => t.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Prerrequisitos)
                   .WithOne(p => p.Pea)
                   .HasForeignKey(p => p.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Evaluaciones)
                   .WithOne(ev => ev.Pea)
                   .HasForeignKey(ev => ev.IdPea)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocPeaUnidadConfiguration : IEntityTypeConfiguration<DocPeaUnidad>
    {
        public void Configure(EntityTypeBuilder<DocPeaUnidad> builder)
        {
            builder.ToTable("doc_pea_unidades");
            builder.HasKey(e => e.IdUnidad);
            builder.Property(e => e.IdUnidad).HasColumnName("idUnidad");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.NumeroUnidad).HasColumnName("numeroUnidad");
            builder.Property(e => e.NombreUnidad).HasColumnName("nombreUnidad").IsRequired().HasMaxLength(255);
            builder.Property(e => e.TotalHorasUnidad).HasColumnName("totalHorasUnidad");
            builder.Property(e => e.HorasDocencia).HasColumnName("horasDocencia");
            builder.Property(e => e.HorasPracticoExp).HasColumnName("horasPracticoExp");
            builder.Property(e => e.HorasAutonomo).HasColumnName("horasAutonomo");
            builder.Property(e => e.Orden).HasColumnName("orden");

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
            builder.Property(e => e.IdTema).HasColumnName("idTema");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdUnidad).HasColumnName("idUnidad");
            builder.Property(e => e.NumeroTema).HasColumnName("numeroTema");
            builder.Property(e => e.TituloTema).HasColumnName("tituloTema").IsRequired().HasMaxLength(255);
            builder.Property(e => e.DescripcionSubtemas).HasColumnName("descripcionSubtemas").HasColumnType("text");
            builder.Property(e => e.Orden).HasColumnName("orden");

            builder.HasOne(e => e.Unidad)
                   .WithMany(u => u.Temas)
                   .HasForeignKey(e => e.IdUnidad)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class DocPeaResultadoAprendizajeConfiguration : IEntityTypeConfiguration<DocPeaResultadoAprendizaje>
    {
        public void Configure(EntityTypeBuilder<DocPeaResultadoAprendizaje> builder)
        {
            builder.ToTable("doc_pea_resultados_aprendizaje");
            builder.HasKey(e => e.IdRda);
            builder.Property(e => e.IdRda).HasColumnName("idRda");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.IdResultadoPerfil).HasColumnName("idResultadoPerfil");
            builder.Property(e => e.TipoRda).HasColumnName("tipoRda");
            builder.Property(e => e.CodigoRda).HasColumnName("codigoRda").HasMaxLength(20);
            builder.Property(e => e.Descripcion).HasColumnName("descripcion").HasColumnType("text");
            builder.Property(e => e.NivelDesarrollo).HasColumnName("nivelDesarrollo");
            builder.Property(e => e.Orden).HasColumnName("orden");

            builder.HasOne(e => e.PerfilResultado)
                   .WithMany()
                   .HasForeignKey(e => e.IdResultadoPerfil)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }

    public class DocPeaActividadPracticaConfiguration : IEntityTypeConfiguration<DocPeaActividadPractica>
    {
        public void Configure(EntityTypeBuilder<DocPeaActividadPractica> builder)
        {
            builder.ToTable("doc_pea_actividades_practicas");
            builder.HasKey(e => e.IdPractica);
            builder.Property(e => e.IdPractica).HasColumnName("idPractica");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.IdUnidad).HasColumnName("idUnidad");
            builder.Property(e => e.NumeroPractica).HasColumnName("numeroPractica");
            builder.Property(e => e.NombrePractica).HasColumnName("nombrePractica").IsRequired().HasMaxLength(255);
            builder.Property(e => e.Caracterizacion).HasColumnName("caracterizacion").HasColumnType("text");
            builder.Property(e => e.DuracionHoras).HasColumnName("duracionHoras");
            builder.Property(e => e.Orden).HasColumnName("orden");

            builder.HasOne(e => e.Unidad)
                   .WithMany(u => u.ActividadesPracticas)
                   .HasForeignKey(e => e.IdUnidad)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }

    public class DocPeaBibliografiaConfiguration : IEntityTypeConfiguration<DocPeaBibliografia>
    {
        public void Configure(EntityTypeBuilder<DocPeaBibliografia> builder)
        {
            builder.ToTable("doc_pea_bibliografia");
            builder.HasKey(e => e.IdBiblio);
            builder.Property(e => e.IdBiblio).HasColumnName("idBiblio");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.TipoBibliografia).HasColumnName("tipoBibliografia");
            builder.Property(e => e.Autor).HasColumnName("autor").HasMaxLength(255);
            builder.Property(e => e.Anio).HasColumnName("anio");
            builder.Property(e => e.TituloLibro).HasColumnName("tituloLibro").IsRequired().HasMaxLength(500);
            builder.Property(e => e.EditorialCiudad).HasColumnName("editorialCiudad").HasMaxLength(255);
            builder.Property(e => e.Isbn).HasColumnName("isbn").HasMaxLength(50);
            builder.Property(e => e.UrlRecurso).HasColumnName("urlRecurso").HasMaxLength(512);
            builder.Property(e => e.CitaCompletaApa).HasColumnName("citaCompletaApa").HasColumnType("text");
            builder.Property(e => e.Orden).HasColumnName("orden");
        }
    }

    public class DocPeaObservacionConfiguration : IEntityTypeConfiguration<DocPeaObservacion>
    {
        public void Configure(EntityTypeBuilder<DocPeaObservacion> builder)
        {
            builder.ToTable("doc_pea_observaciones");
            builder.HasKey(e => e.IdObservacion);
            builder.Property(e => e.IdObservacion).HasColumnName("idObservacion");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.IdUsuarioObservador).HasColumnName("idUsuarioObservador");
            builder.Property(e => e.RolObservador).HasColumnName("rolObservador").IsRequired().HasMaxLength(50);
            builder.Property(e => e.SeccionAfectada).HasColumnName("seccionAfectada").IsRequired().HasMaxLength(100);
            builder.Property(e => e.TextoObservacion).HasColumnName("textoObservacion").IsRequired();
            builder.Property(e => e.Estado).HasColumnName("estado").IsRequired().HasMaxLength(20);
            builder.Property(e => e.RespuestaDocente).HasColumnName("respuestaDocente");
            builder.Property(e => e.FechaObservacion).HasColumnName("fechaObservacion");
            builder.Property(e => e.FechaResolucion).HasColumnName("fechaResolucion");
        }
    }

    public class DocPeaTrazabilidadConfiguration : IEntityTypeConfiguration<DocPeaTrazabilidad>
    {
        public void Configure(EntityTypeBuilder<DocPeaTrazabilidad> builder)
        {
            builder.ToTable("doc_pea_trazabilidad");
            builder.HasKey(e => e.IdTrazabilidad);
            builder.Property(e => e.IdTrazabilidad).HasColumnName("idTrazabilidad");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.IdUsuario).HasColumnName("idUsuario");
            builder.Property(e => e.EstadoAnterior).HasColumnName("estadoAnterior").IsRequired().HasMaxLength(50);
            builder.Property(e => e.EstadoNuevo).HasColumnName("estadoNuevo").IsRequired().HasMaxLength(50);
            builder.Property(e => e.Motivo).HasColumnName("motivo");
            builder.Property(e => e.HashIntegridadSha256).HasColumnName("hashIntegridadSha256").HasMaxLength(64);
            builder.Property(e => e.FechaTransicion).HasColumnName("fechaTransicion");
        }
    }

    public class DocPeaPrerequisitoConfiguration : IEntityTypeConfiguration<DocPeaPrerequisito>
    {
        public void Configure(EntityTypeBuilder<DocPeaPrerequisito> builder)
        {
            builder.ToTable("doc_pea_prerrequisitos");
            builder.HasKey(e => e.IdPrerequisito);
            builder.Property(e => e.IdPrerequisito).HasColumnName("idPrerequisito");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.IdAsignaturaOrigen).HasColumnName("idAsignaturaOrigen");
            builder.Property(e => e.CodigoAsignatura).HasColumnName("codigoAsignatura").HasMaxLength(50);
            builder.Property(e => e.NombreAsignatura).HasColumnName("nombreAsignatura").IsRequired().HasMaxLength(255);
            builder.Property(e => e.Observacion).HasColumnName("observacion");
            builder.Property(e => e.Orden).HasColumnName("orden");
        }
    }

    public class DocPeaEvaluacionConfiguration : IEntityTypeConfiguration<DocPeaEvaluacion>
    {
        public void Configure(EntityTypeBuilder<DocPeaEvaluacion> builder)
        {
            builder.ToTable("doc_pea_evaluaciones");
            builder.HasKey(e => e.IdEvaluacion);
            builder.Property(e => e.IdEvaluacion).HasColumnName("idEvaluacion");
            builder.Property(e => e.Uuid).HasColumnName("uuid").IsRequired().HasMaxLength(36);
            builder.Property(e => e.IdPea).HasColumnName("idPea");
            builder.Property(e => e.Denominacion).HasColumnName("denominacion").IsRequired().HasMaxLength(100);
            builder.Property(e => e.TipoEvaluacion).HasColumnName("tipoEvaluacion").IsRequired();
            builder.Property(e => e.CalificacionMaxima).HasColumnName("calificacionMaxima").HasColumnType("decimal(4,1)");
            builder.Property(e => e.Orden).HasColumnName("orden");
        }
    }
}
