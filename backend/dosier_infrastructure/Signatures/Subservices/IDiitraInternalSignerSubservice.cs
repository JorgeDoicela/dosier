using dosier_application.Signatures;

namespace dosier_infrastructure.Signatures.Subservices;

public interface IDosierInternalSignerSubservice
{
    Task<SignatureResultDto> SignDocumentAsync(
        int idUsuario,
        string ipAddress,
        string userAgent,
        SignDocumentDto dto);
}
