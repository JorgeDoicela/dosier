using dosier_application.Signatures;

namespace dosier_infrastructure.Signatures.Subservices;

public interface ISignatureVerificationSubservice
{
    Task<IEnumerable<SignatureRecordDto>> GetByDocumentAsync(string documentoUuid);
    Task<SignatureVerificationDto> VerifyAsync(string firmaCode);
}
