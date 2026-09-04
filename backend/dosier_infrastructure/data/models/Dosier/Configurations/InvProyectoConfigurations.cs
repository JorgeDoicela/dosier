using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace dosier_infrastructure.data.models.Configurations;

public class DocProyectoConfiguration : IEntityTypeConfiguration<DocProyecto>
{
    public void Configure(EntityTypeBuilder<DocProyecto> entity)
    {
        entity.HasKey(e => e.IdProyecto).HasName("PRIMARY");
        entity.ToTable("doc_proyectos");
        entity.Property(e => e.IdProyecto).HasColumnName("idProyecto");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired().HasConversion<string>();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.IdConvocatoria).HasColumnName("idConvocatoria");
        entity.Property(e => e.CodigoInstitucional).HasColumnName("codigoInstitucional").HasMaxLength(50);
        entity.HasIndex(e => e.CodigoInstitucional).IsUnique();
        entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(500).IsRequired();
        entity.Property(e => e.IdGrupo).HasColumnName("idGrupo");
        entity.Property(e => e.TieneGrupo).HasColumnName("tieneGrupo").HasColumnType("tinyint(1)").HasDefaultValueSql("'0'").HasSentinel(false);
        entity.Property(e => e.FechaPresentacion).HasColumnName("fechaPresentacion");
        entity.Property(e => e.FechaInicio).HasColumnName("fechaInicio");
        entity.Property(e => e.FechaFin).HasColumnName("fechaFin");
        entity.Property(e => e.TiempoEjecucion).HasColumnName("tiempoEjecucion").HasMaxLength(100);
        entity.Property(e => e.Estado).HasColumnName("estado").HasColumnType("varchar(50)").HasMaxLength(50).HasDefaultValueSql("'Borrador'");
        entity.Property(e => e.MetadataCacesJson).HasColumnName("metadataCacesJson").HasColumnType("json");
        entity.Property(e => e.Activo).HasColumnName("activo").HasColumnType("tinyint(1)").HasDefaultValueSql("'1'").HasSentinel(true);
        entity.Property(e => e.Eliminado).HasColumnName("eliminado").HasColumnType("tinyint(1)").HasDefaultValueSql("'0'").HasSentinel(false);
        entity.Property(e => e.FechaEliminacion).HasColumnName("fechaEliminacion");
        entity.Property(e => e.EliminadoPorUsuarioId).HasColumnName("eliminadoPorUsuarioId");
        entity.Property(e => e.FechaRegistro).HasColumnName("fechaRegistro").HasDefaultValueSql("CURRENT_TIMESTAMP");
        entity.Property(e => e.FechaModificacion).HasColumnName("fechaModificacion").HasDefaultValueSql("CURRENT_TIMESTAMP").ValueGeneratedOnAddOrUpdate();
        entity.Property(e => e.AutoExtendDeadlines).HasColumnName("autoExtendDeadlines").HasColumnType("tinyint(1)").HasDefaultValue(false);
        entity.Property(e => e.AutoExtendDays).HasColumnName("autoExtendDays").HasColumnType("int").HasDefaultValue(7);
        entity.Property(e => e.FechaLimiteSubsanacion).HasColumnName("fechaLimiteSubsanacion");

        entity.HasOne(d => d.IdConvocatoriaNavigation).WithMany(p => p.Proyectos).HasForeignKey(d => d.IdConvocatoria).OnDelete(DeleteBehavior.SetNull).HasConstraintName("fk_proy_conv");
        entity.HasOne(d => d.IdGrupoNavigation).WithMany(p => p.DocProyectos).HasForeignKey(d => d.IdGrupo).OnDelete(DeleteBehavior.SetNull).HasConstraintName("fk_proy_grupo");
    }
}

public class DocTrazabilidadProyectoConfiguration : IEntityTypeConfiguration<DocTrazabilidadProyecto>
{
    public void Configure(EntityTypeBuilder<DocTrazabilidadProyecto> entity)
    {
        entity.HasKey(e => e.IdTrazabilidad).HasName("PRIMARY");
        entity.ToTable("doc_trazabilidad_proyectos");
        entity.Property(e => e.IdTrazabilidad).HasColumnName("idTrazabilidad");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired().HasConversion<string>();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.IdProyecto).HasColumnName("idProyecto");
        entity.Property(e => e.IdUsuario).HasColumnName("idUsuario");
        entity.Property(e => e.EstadoAnterior).HasColumnName("estadoAnterior").HasMaxLength(50).IsRequired();
        entity.Property(e => e.EstadoNuevo).HasColumnName("estadoNuevo").HasMaxLength(50).IsRequired();
        entity.Property(e => e.Observacion).HasColumnName("observacion").HasColumnType("text");
        entity.Property(e => e.FechaTransicion).HasColumnName("fechaTransicion").HasDefaultValueSql("CURRENT_TIMESTAMP");
        entity.Property(e => e.HashAnterior).HasColumnName("hashAnterior").HasMaxLength(100);
        entity.Property(e => e.HashActual).HasColumnName("hashActual").HasMaxLength(100);

        entity.HasOne(d => d.IdProyectoNavigation).WithMany().HasForeignKey(d => d.IdProyecto).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_trazabilidad_proyecto");
    }
}

public class DocProyectoCarreraConfiguration : IEntityTypeConfiguration<DocProyectoCarrera>
{
    public void Configure(EntityTypeBuilder<DocProyectoCarrera> entity)
    {
        entity.HasKey(e => e.IdProyectoCarrera).HasName("PRIMARY");
        entity.ToTable("doc_proyectos_carreras");
        entity.Property(e => e.IdProyectoCarrera).HasColumnName("idProyectoCarrera");
        entity.Property(e => e.IdProyecto).HasColumnName("idProyecto");
        entity.Property(e => e.IdCarrera).HasColumnName("idCarrera");
        entity.Property(e => e.Modalidad).HasColumnName("modalidad").HasMaxLength(100);

        entity.HasOne(d => d.IdProyectoNavigation).WithMany(p => p.DocProyectosCarreras).HasForeignKey(d => d.IdProyecto).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_pc_proyecto");
        entity.HasOne(d => d.IdCarreraNavigation).WithMany().HasForeignKey(d => d.IdCarrera).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_pc_carrera");
    }
}

public class DocProyectoParticipanteConfiguration : IEntityTypeConfiguration<DocProyectoParticipante>
{
    public void Configure(EntityTypeBuilder<DocProyectoParticipante> entity)
    {
        entity.HasKey(e => e.IdParticipante).HasName("PRIMARY");
        entity.ToTable("doc_proyecto_participantes");
        entity.Property(e => e.IdParticipante).HasColumnName("idParticipante");
        entity.Property(e => e.IdProyecto).HasColumnName("idProyecto");
        entity.Property(e => e.IdUsuario).HasColumnName("idUsuario");
        entity.Property(e => e.TipoParticipante).HasColumnName("tipoParticipante").HasMaxLength(20).HasDefaultValue("Docente");
        entity.Property(e => e.EsDirector).HasColumnName("esDirector").HasColumnType("tinyint(1)").HasDefaultValueSql("'0'").HasSentinel(false);
        entity.Property(e => e.Rol).HasColumnName("rol").HasMaxLength(100);
        entity.Property(e => e.NivelAcademico).HasColumnName("nivelAcademico").HasMaxLength(150);
        entity.Property(e => e.Telefono).HasColumnName("telefono").HasMaxLength(20);
        entity.Property(e => e.HorasSemanales).HasColumnName("horasSemanales").HasPrecision(4, 1);
        entity.Property(e => e.Activo).HasColumnName("activo").HasColumnType("tinyint(1)").HasDefaultValueSql("'1'").HasSentinel(false);
        entity.Property(e => e.FechaInicio).HasColumnName("fecha_inicio").HasColumnType("datetime");
        entity.Property(e => e.FechaFin).HasColumnType("datetime").HasColumnName("fecha_fin");
        entity.Property(e => e.MotivoCambio).HasColumnName("motivo_change").HasMaxLength(150); // wait: let's verify if it's "motivo_cambio" or "motivo_change" from original code:
        // Line 337: entity.Property(e => e.MotivoCambio).HasColumnName("motivo_cambio").HasMaxLength(150);
        entity.Property(e => e.MotivoCambio).HasColumnName("motivo_cambio").HasMaxLength(150);

        entity.HasOne(d => d.IdProyectoNavigation).WithMany(p => p.DocProyectoParticipantes).HasForeignKey(d => d.IdProyecto).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_part_proyecto");
        entity.HasOne(d => d.IdUsuarioNavigation).WithMany().HasForeignKey(d => d.IdUsuario).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_part_usuario");
    }
}

public class DocObjetivoProyectoConfiguration : IEntityTypeConfiguration<DocObjetivoProyecto>
{
    public void Configure(EntityTypeBuilder<DocObjetivoProyecto> entity)
    {
        entity.HasKey(e => e.IdObjetivo).HasName("PRIMARY");
        entity.ToTable("doc_objetivos_proyecto");
        entity.Property(e => e.IdObjetivo).HasColumnName("idObjetivo");
        entity.Property(e => e.IdProyecto).HasColumnName("idProyecto");
        entity.Property(e => e.EsGeneral).HasColumnName("esGeneral").HasColumnType("tinyint(1)").HasDefaultValueSql("'0'").HasSentinel(false);
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasColumnType("text").IsRequired();
        entity.Property(e => e.Orden).HasColumnName("orden");

        entity.HasOne(d => d.IdProyectoNavigation).WithMany(p => p.DocObjetivosProyecto).HasForeignKey(d => d.IdProyecto).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_obj_proyecto");
    }
}

public class DocCronogramaConfiguration : IEntityTypeConfiguration<DocCronograma>
{
    public void Configure(EntityTypeBuilder<DocCronograma> entity)
    {
        entity.HasKey(e => e.IdActividad).HasName("PRIMARY");
        entity.ToTable("doc_cronograma");
        entity.Property(e => e.IdActividad).HasColumnName("idActividad");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.IdProyecto).HasColumnName("idProyecto");
        entity.Property(e => e.IdObjetivo).HasColumnName("idObjetivo");
        entity.Property(e => e.NumeroActividad).HasColumnName("numeroActividad");
        entity.Property(e => e.Descripcion).HasColumnName("descripcion").HasColumnType("text").IsRequired();
        entity.Property(e => e.RecursosNecesarios).HasColumnName("recursosNecesarios").HasColumnType("text");
        entity.Property(e => e.FechaInicioPrevista).HasColumnName("fechaInicioPrevista");
        entity.Property(e => e.FechaFinPrevista).HasColumnName("fechaFinPrevista");
        entity.Property(e => e.Progreso).HasColumnName("progreso").HasPrecision(5, 2).HasDefaultValueSql("'0.00'");
        entity.Property(e => e.Ponderacion).HasColumnName("ponderacion").HasPrecision(5, 2).HasDefaultValueSql("'0.00'");
        entity.Property(e => e.EsEntregableCaces).HasColumnName("esEntregableCaces").HasColumnType("tinyint(1)").HasDefaultValueSql("'0'").HasSentinel(false);
        entity.Property(e => e.IdActividadPadre).HasColumnName("idActividadPadre");
        entity.Property(e => e.ColorHex).HasColumnName("colorHex").HasMaxLength(7).HasDefaultValueSql("'#0070f3'");

        entity.HasOne(d => d.IdProyectoNavigation).WithMany(p => p.DocCronogramas).HasForeignKey(d => d.IdProyecto).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_cron_proyecto");
        entity.HasOne(d => d.IdObjetivoNavigation).WithMany(p => p.DocCronogramas).HasForeignKey(d => d.IdObjetivo).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_cron_objetivo");
        entity.HasOne(d => d.IdActividadPadreNavigation).WithMany(p => p.InverseIdActividadPadreNavigation).HasForeignKey(d => d.IdActividadPadre).OnDelete(DeleteBehavior.SetNull).HasConstraintName("fk_cron_padre");
    }
}

public class DocBibliografiaProyectoConfiguration : IEntityTypeConfiguration<DocBibliografiaProyecto>
{
    public void Configure(EntityTypeBuilder<DocBibliografiaProyecto> entity)
    {
        entity.HasKey(e => e.IdBibliografia).HasName("PRIMARY");
        entity.ToTable("doc_bibliografia_proyecto");
        entity.Property(e => e.IdBibliografia).HasColumnName("idBibliografia");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.IdProyecto).HasColumnName("idProyecto");
        entity.Property(e => e.CitaApa).HasColumnName("citaAPA").HasColumnType("text").IsRequired();
        entity.Property(e => e.Doi).HasColumnName("doi").HasMaxLength(100);
        entity.Property(e => e.Isbn).HasColumnName("isbn").HasMaxLength(20);
        entity.Property(e => e.Autores).HasColumnName("autores").HasColumnType("text");
        entity.Property(e => e.AnioPublicacion).HasColumnName("anioPublicacion");
        entity.Property(e => e.TituloFuente).HasColumnName("tituloFuente").HasColumnType("text");
        entity.Property(e => e.Url).HasColumnName("url").HasMaxLength(512);

        entity.HasOne(d => d.IdProyectoNavigation).WithMany(p => p.DocBibliografiasProyecto).HasForeignKey(d => d.IdProyecto).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_bib_proyecto");
    }
}

public class DocProyectoDocumentoAdjuntoConfiguration : IEntityTypeConfiguration<DocProyectoDocumentoAdjunto>
{
    public void Configure(EntityTypeBuilder<DocProyectoDocumentoAdjunto> entity)
    {
        entity.HasKey(e => e.IdDocAdj).HasName("PRIMARY");
        entity.ToTable("doc_proyectos_documentos_adjuntos");
        entity.Property(e => e.IdDocAdj).HasColumnName("idDocAdj");
        entity.Property(e => e.Uuid).HasColumnName("uuid").HasMaxLength(36).IsRequired();
        entity.HasIndex(e => e.Uuid).IsUnique();
        entity.Property(e => e.IdProyecto).HasColumnName("idProyecto");
        entity.Property(e => e.NombreArchivo).HasColumnName("nombreArchivo").HasMaxLength(255).IsRequired();
        entity.Property(e => e.RutaArchivo).HasColumnName("rutaArchivo").HasMaxLength(512).IsRequired();
        entity.Property(e => e.FechaSubida).HasColumnName("fechaSubida").HasDefaultValueSql("CURRENT_TIMESTAMP");

        entity.HasOne(d => d.IdProyectoNavigation).WithMany(p => p.DocumentosAdjuntos).HasForeignKey(d => d.IdProyecto).OnDelete(DeleteBehavior.Cascade).HasConstraintName("fk_docadj_proyecto");
    }
}
