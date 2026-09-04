using dosier_application.Signatures;

namespace dosier_infrastructure.Signatures.Subservices;

public interface ISignatureRevocationSubservice
{
    Task<bool> RevokeAsync(int idUsuarioSolicitante, RevokeSignatureDto dto, bool esAdmin = false);
}
