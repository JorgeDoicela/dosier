using System;

namespace dosier_application.Security;

public class IpLockoutException : Exception
{
    public int SegundosRestantes { get; }

    public IpLockoutException(string message, int segundosRestantes) : base(message)
    {
        SegundosRestantes = segundosRestantes;
    }
}
