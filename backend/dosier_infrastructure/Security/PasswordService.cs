using dosier_application.Security;

namespace dosier_infrastructure.Security;

public class PasswordService : IPasswordService
{
    public PasswordVerificationResult VerifyPassword(string password, string hashedPasswordOrPlaintext)
    {
        if (string.IsNullOrEmpty(hashedPasswordOrPlaintext))
            return new PasswordVerificationResult { Success = false, NeedsRehash = false };

        if (IsBCryptHash(hashedPasswordOrPlaintext))
        {
            try
            {
                if (BCrypt.Net.BCrypt.Verify(password, hashedPasswordOrPlaintext))
                {
                    return new PasswordVerificationResult { Success = true, NeedsRehash = false };
                }
            }
            catch
            {
                // Si el hash BCrypt estaba corrupto, fallback a texto plano si coincide
                if (hashedPasswordOrPlaintext == password)
                {
                    return new PasswordVerificationResult { Success = true, NeedsRehash = true };
                }
            }
            return new PasswordVerificationResult { Success = false, NeedsRehash = false };
        }

        // Si no es formato BCrypt, es texto plano institucional (SIGAFI)
        if (hashedPasswordOrPlaintext == password)
        {
            return new PasswordVerificationResult { Success = true, NeedsRehash = true };
        }

        return new PasswordVerificationResult { Success = false, NeedsRehash = false };
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, 11);
    }

    public bool IsBCryptHash(string password)
    {
        if (string.IsNullOrEmpty(password)) return false;
        return password.Length == 60 && (password.StartsWith("$2a$") || password.StartsWith("$2b$") || password.StartsWith("$2y$"));
    }
}
