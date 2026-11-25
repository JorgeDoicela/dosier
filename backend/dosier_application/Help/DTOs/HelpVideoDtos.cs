using System;
using System.Collections.Generic;
using System.IO;

namespace dosier_application.Help.DTOs;

public sealed class HelpVideoDto
{
    public string Id { get; set; } = string.Empty;
    public string RouteKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Duration { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsUploadedFile { get; set; }
    public string? FileName { get; set; }
    public List<string> Roles { get; set; } = new();
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class HelpVideoUploadedFile
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Length { get; set; }
    public Stream Stream { get; set; } = Stream.Null;
}

public sealed class CreateHelpVideoRequest
{
    public string RouteKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Duration { get; set; }
    public string? Url { get; set; }
    public List<string> Roles { get; set; } = new();
    public HelpVideoUploadedFile? Archivo { get; set; }
}

public sealed class UpdateHelpVideoRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Duration { get; set; }
    public string? Url { get; set; }
    public List<string> Roles { get; set; } = new();
}

public sealed class ReorderHelpVideosRequest
{
    public string RouteKey { get; set; } = string.Empty;
    public List<string> OrderedIds { get; set; } = new();
}
