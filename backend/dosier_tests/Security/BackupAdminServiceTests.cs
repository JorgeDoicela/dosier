using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using dosier_application.Security;
using dosier_infrastructure.data.models;
using dosier_infrastructure.Security;

namespace dosier_tests.Security;

public class BackupAdminServiceTests
{
    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Backup")]
    public void GetDiskInfo_RetornaMetricasValidasDelServidor()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<DosierContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        using var context = new DosierContext(options);

        var inMemorySettings = new Dictionary<string, string?>
        {
            {"BackupSettings:DestinationFolder", "backups"}
        };
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var service = new BackupAdminService(context, configuration);

        // Act
        var diskInfo = service.GetDiskInfo();

        // Assert
        Assert.NotNull(diskInfo);
        Assert.False(string.IsNullOrWhiteSpace(diskInfo.DriveName));
        Assert.True(diskInfo.TotalSizeBytes > 0);
        Assert.True(diskInfo.FreeSizeBytes >= 0);
        Assert.True(diskInfo.UsedPercentage >= 0 && diskInfo.UsedPercentage <= 100);
    }
}
