using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

/// <summary>
/// [SISTEMA] Libro Diario de Gastos para monitoreo presupuestario en tiempo real
/// </summary>
public partial class DocGasto
{
    public int IdGasto { get; set; }
    public Guid Uuid { get; set; } = Guid.NewGuid();
    public int IdProyecto { get; set; }
    public int IdItem { get; set; } // Referencia al ítem del presupuesto
    public decimal Monto { get; set; }
    public DateOnly FechaGasto { get; set; }
    public string? NumeroFactura { get; set; }
    public string? Descripcion { get; set; }
    public int? IdEvidencia { get; set; } // Vinculación con la foto de la factura

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
    public virtual DocPresupuestoItem IdItemNavigation { get; set; } = null!;
    public virtual DocEvidencia? IdEvidenciaNavigation { get; set; }
}
