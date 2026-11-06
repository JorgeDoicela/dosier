using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;
using dosier_infrastructure.Academico;
using dosier_infrastructure.data.models;

namespace dosier_tests.Academico;

public class PeriodoInstitucionalResolverTests
{
    private static DosierContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<DosierContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new DosierContext(options);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "PeriodoInstitucional")]
    public async Task GetPeriodosInstitucionales_GarantizaUnicoActivo_YAislaConduccion()
    {
        var dbName = nameof(GetPeriodosInstitucionales_GarantizaUnicoActivo_YAislaConduccion);
        await using var context = CreateInMemoryContext(dbName);

        // 1. Arrange: Períodos mezclados de instituto y conducción con flags legados activo=1
        context.Periodos.AddRange(
            // Conducción (debe excluirse totalmente)
            new Periodo
            {
                IdPeriodo = "ENC2027",
                Detalle = "ENERO - JULIO 2027 CONDUCCION",
                EsConduccion = 1,
                EsInstituto = 0,
                Periodoactivoinstituto = 0,
                Activo = true,
                FechaInicial = new DateOnly(2027, 1, 9)
            },
            // Período activo oficial del instituto
            new Periodo
            {
                IdPeriodo = "OCT2026",
                Detalle = "OCTUBRE 2026 - MARZO 2027",
                EsConduccion = 0,
                EsInstituto = 1,
                Periodoactivoinstituto = 1,
                Activo = true,
                FechaInicial = new DateOnly(2026, 10, 2)
            },
            // Período anterior del instituto (concluido)
            new Periodo
            {
                IdPeriodo = "ABR2026",
                Detalle = "ABRIL - SEPTIEMBRE 2026",
                EsConduccion = 0,
                EsInstituto = 1,
                Periodoactivoinstituto = 0,
                Activo = true,
                FechaInicial = new DateOnly(2026, 4, 27)
            },
            // Período histórico de 2022 que tenía activo=1 por error humano en SIGAFI
            new Periodo
            {
                IdPeriodo = "OCT2022",
                Detalle = "OCTUBRE 2022 - MARZO 2023",
                EsConduccion = 0,
                EsInstituto = 1,
                Periodoactivoinstituto = 0,
                Activo = true, // Flag legado que antes causaba el bug
                FechaInicial = new DateOnly(2022, 10, 1)
            }
        );
        await context.SaveChangesAsync();

        var resolver = new PeriodoInstitucionalResolver(context, NullLogger<PeriodoInstitucionalResolver>.Instance);

        // 2. Act
        var periodos = await resolver.GetPeriodosInstitucionalesAsync();
        var activo = await resolver.GetPeriodoActivoAsync();
        var idActivo = await resolver.GetIdPeriodoActivoAsync();

        // 3. Assert
        // Aislamiento de Conducción: No debe existir ENC2027
        Assert.DoesNotContain(periodos, p => p.IdPeriodo == "ENC2027");

        // Exactamente 3 períodos institucionales
        Assert.Equal(3, periodos.Count);

        // Invariante de Único Activo: Solo uno tiene EsActivo == true
        var activos = periodos.Where(p => p.EsActivo).ToList();
        Assert.Single(activos);
        Assert.Equal("OCT2026", activos.First().IdPeriodo);

        // OCT2022 NO debe ser activo a pesar de tener activo = 1 en la BD
        var oct2022 = periodos.First(p => p.IdPeriodo == "OCT2022");
        Assert.False(oct2022.EsActivo);

        // El período activo resuelto debe ser OCT2026
        Assert.NotNull(activo);
        Assert.Equal("OCT2026", activo.IdPeriodo);
        Assert.Equal("OCT2026", idActivo);
    }
}

