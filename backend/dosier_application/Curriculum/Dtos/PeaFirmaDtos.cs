using System;

namespace dosier_application.Curriculum.Dtos
{
    public class FirmarPeaDto
    {
        public string? Password { get; set; }
        public string RolFirmante { get; set; } = "Docente"; // Docente, Coordinador, Vicerrector
        public string TipoFirma { get; set; } = "DOSIER"; // DOSIER (interna HMAC) o FirmaEC (P12)
        public string? CertificadoP12Base64 { get; set; }
        public string? ContraseniaP12 { get; set; }
        public string? Motivo { get; set; }
    }

    public class PeaFirmaResultadoDto
    {
        public bool Exito { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public string FirmaCode { get; set; } = string.Empty;
        public string DocHash { get; set; } = string.Empty;
        public string EstadoNuevo { get; set; } = string.Empty;
        public DateTime FechaFirma { get; set; }
        public string VerificationUrl { get; set; } = string.Empty;
    }
}
