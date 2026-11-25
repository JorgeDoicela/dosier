using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;
using dosier_application.Help.DTOs;
using dosier_infrastructure.Help;
using dosier_infrastructure.data.models;

namespace dosier_tests.Help;

public sealed class HelpVideosServiceTests : IDisposable
{
    private readonly string _tempUploadsRoot;
    private readonly DosierContext _context;
    private readonly HelpVideosService _service;

    public HelpVideosServiceTests()
    {
        _tempUploadsRoot = Path.Combine(Path.GetTempPath(), $"dosier_help_videos_test_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_tempUploadsRoot);

        var options = new DbContextOptionsBuilder<DosierContext>()
            .UseInMemoryDatabase($"HelpVideosDb_{Guid.NewGuid():N}")
            .Options;

        _context = new DosierContext(options);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Support:UploadsRootPath"] = _tempUploadsRoot
            })
            .Build();

        _service = new HelpVideosService(_context, config);
    }

    [Fact]
    public async Task AddAndGetVideosByRoute_ShouldPersistInDocConfigGeneral_AndFilterByRole()
    {
        await _service.AddVideoAsync(new CreateHelpVideoRequest
        {
            RouteKey = "/dashboard",
            Title = "Video General",
            Url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            Duration = "02:30",
            Roles = new List<string>()
        });

        await _service.AddVideoAsync(new CreateHelpVideoRequest
        {
            RouteKey = "/dashboard",
            Title = "Solo Coordinación",
            Url = "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrSt/view",
            Roles = new List<string> { "coord_carrera" }
        });

        var forDocente = await _service.GetVideosByRouteAsync("/dashboard", new[] { "docente" });
        Assert.Single(forDocente);
        Assert.Equal("Video General", forDocente[0].Title);

        var forCoord = await _service.GetVideosByRouteAsync("/dashboard", new[] { "coord_carrera" });
        Assert.Equal(2, forCoord.Count);

        var configRow = await _context.DocConfigsGenerales
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Clave == "Help.Videos./dashboard");
        Assert.NotNull(configRow);
    }

    [Fact]
    public async Task UploadAndDeleteVideo_ShouldSaveAndRemovePhysicalFileAndConfigRow()
    {
        var bytes = Encoding.UTF8.GetBytes("fake-mp4-binary-payload");
        await using var ms = new MemoryStream(bytes);

        var created = await _service.AddVideoAsync(new CreateHelpVideoRequest
        {
            RouteKey = "/documentacion/workspace",
            Title = "Guía de Co-Redacción",
            Archivo = new HelpVideoUploadedFile
            {
                FileName = "tutorial.mp4",
                ContentType = "video/mp4",
                Length = bytes.Length,
                Stream = ms
            }
        });

        Assert.True(created.IsUploadedFile);
        Assert.False(string.IsNullOrWhiteSpace(created.FileName));
        Assert.StartsWith("/api/help/videos/media/", created.Url);

        var physicalPath = _service.ResolveUploadedVideoPath(created.FileName!);
        Assert.NotNull(physicalPath);
        Assert.True(File.Exists(physicalPath!));

        var deleted = await _service.DeleteVideoAsync("/documentacion/workspace", created.Id);
        Assert.True(deleted);
        Assert.False(File.Exists(physicalPath!));

        var remaining = await _service.GetAllVideosAsync();
        Assert.Empty(remaining);
    }

    [Fact]
    public async Task AddVideo_WithUnsupportedExtension_ShouldThrowInvalidOperationException()
    {
        var bytes = Encoding.UTF8.GetBytes("not-a-video");
        await using var ms = new MemoryStream(bytes);

        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
            await _service.AddVideoAsync(new CreateHelpVideoRequest
            {
                RouteKey = "/dashboard",
                Title = "Archivo inválido",
                Archivo = new HelpVideoUploadedFile
                {
                    FileName = "script.exe",
                    ContentType = "application/octet-stream",
                    Length = bytes.Length,
                    Stream = ms
                }
            }));
    }

    [Fact]
    public async Task UpdateAndReorderVideos_ShouldPersistMetadataAndNewOrder()
    {
        var first = await _service.AddVideoAsync(new CreateHelpVideoRequest
        {
            RouteKey = "/calendario",
            Title = "Paso 1",
            Url = "https://www.youtube.com/watch?v=aaaaaaaaaaa"
        });

        var second = await _service.AddVideoAsync(new CreateHelpVideoRequest
        {
            RouteKey = "/calendario",
            Title = "Paso 2",
            Url = "https://www.youtube.com/watch?v=bbbbbbbbbbb"
        });

        var updated = await _service.UpdateVideoAsync("/calendario", first.Id, new UpdateHelpVideoRequest
        {
            Title = "Paso 1 Actualizado",
            Description = "Nueva descripción",
            Duration = "03:15",
            Url = "https://vimeo.com/123456789",
            Roles = new List<string> { "docente" }
        });

        Assert.NotNull(updated);
        Assert.Equal("Paso 1 Actualizado", updated!.Title);
        Assert.Equal("03:15", updated.Duration);
        Assert.Equal("https://vimeo.com/123456789", updated.Url);
        Assert.Single(updated.Roles);

        var reordered = await _service.ReorderVideosAsync("/calendario", new[] { second.Id, first.Id });
        Assert.Equal(2, reordered.Count);
        Assert.Equal(second.Id, reordered[0].Id);
        Assert.Equal(1, reordered[0].Order);
        Assert.Equal(first.Id, reordered[1].Id);
        Assert.Equal(2, reordered[1].Order);
    }

    public void Dispose()
    {
        _context.Dispose();
        if (Directory.Exists(_tempUploadsRoot))
        {
            Directory.Delete(_tempUploadsRoot, recursive: true);
        }
    }
}
