using dosier_application.Signatures;

namespace dosier_infrastructure.Signatures.Subservices;

public interface ISignatureProfileSubservice
{
    Task<UserSignatureProfileDto?> GetProfileAsync(int idUsuario);
    Task<UserSignatureProfileDto> UpsertProfileAsync(int idUsuario, UpdateSignatureProfileDto dto);
}
