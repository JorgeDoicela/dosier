using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using dosier_domain.Signatures;

namespace dosier_infrastructure.data.models;

/// <summary>
/// Registro inmutable de una firma DOSIER o FirmaEC ejecutada sobre un documento.
/// Mapeado a: doc_documentos_firmas
/// IMPORTANTE: Nunca se eliminan registros — solo se marcan como revocados.
/// </summary>
[Table("doc_documentos_firmas")]
public class DocDocumentoFirma
{
    [Key]
    [Column("idFirma")]
    public int IdFirma { get; set; }

    [Column("uuid")]
    public string Uuid { get; set; } = Guid.NewGuid().ToString();

    [Column("documento_uuid")]
    public string DocumentoUuid { get; set; } = string.Empty;

    [Column("firmante_id")]
    public string FirmanteId { get; set; } = string.Empty;

    [Column("firmante_rol")]
    public string FirmanteRol { get; set; } = string.Empty;

    [Column("fecha_firma")]
    public DateTime FechaFirma { get; set; } = DateTime.UtcNow;

    /// <summary>FirmaEC = certificado .p12 PAdES | DOSIER = firma institucional propia</summary>
    [Column("tipo_firma")]
    public string TipoFirma { get; set; } = "DOSIER";

    /// <summary>Código legible estampado en el PDF. Ej: DFRM-2026-A1B2C3D4</summary>
    [Column("firma_code")]
    public string? FirmaCode { get; set; }

    /// <summary>Prueba criptográfica de autenticidad: HMAC-SHA256(docHash:userUuid:timestamp:code, secret)</summary>
    [Column("hmac_hash")]
    public string? HmacHash { get; set; }

    /// <summary>SHA-256 del PDF en el momento exacto de la firma. Detecta manipulaciones posteriores.</summary>
    [Column("doc_hash")]
    public string? DocHash { get; set; }

    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [Column("user_agent")]
    public string? UserAgent { get; set; }

    /// <summary>JSON con metadatos del certificado .p12 (para FirmaEC) o snapshot del perfil DOSIER.</summary>
    [Column("firma_metadata")]
    public string? FirmaMetadata { get; set; }

    [Column("archivo_pdf_firmado")]
    public string? ArchivoPdfFirmado { get; set; }

    [Column("es_valida")]
    public bool EsValida { get; set; } = true;

    [Column("revocada_en")]
    public DateTime? RevocadaEn { get; set; }

    [Column("motivo_revocacion")]
    public string? MotivoRevocacion { get; set; }
}
