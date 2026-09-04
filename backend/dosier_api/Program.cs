using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.Collaboration;
using dosier_infrastructure.Security;
using dosier_application.Research;
using dosier_infrastructure.Research;
using dosier_application.Common;
using dosier_api.Controllers;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
// DOSIER Document Engine
using Dosier.Infrastructure.Common.Documents.Engine;
using Dosier.Infrastructure.Common.Documents.Providers;
using Dosier.Application.Common.Documents;
using Dosier.Infrastructure.Common.Documents;
// DOSIER Firma
using dosier_application.Signatures;
using dosier_infrastructure.Signatures;
using System.Net;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpContextAccessor();

// 1. Configurar CORS dinámico (Para React, SignalR, móvil, red local y producción)
var frontendUrl = builder.Configuration["FrontendUrl"] ?? builder.Configuration["App:FrontendUrl"] ?? builder.Configuration["Email:FrontendUrl"];
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Dosier_policy", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin)) return false;

            if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
            {
                // 1. Permitir siempre localhost y 127.0.0.1 en cualquier puerto
                if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                    uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                // 2. Permitir solicitudes si provienen del mismo host u origen configurado en FrontendUrl
                if (!string.IsNullOrWhiteSpace(frontendUrl) &&
                    Uri.TryCreate(frontendUrl, UriKind.Absolute, out var frontUri))
                {
                    if (uri.Host.Equals(frontUri.Host, StringComparison.OrdinalIgnoreCase) ||
                        origin.TrimEnd('/').Equals(frontendUrl.TrimEnd('/'), StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }

                // 3. Permitir conexiones desde redes locales privadas (Wi-Fi, LAN, teléfonos u otras PCs)
                if (IPAddress.TryParse(uri.Host, out var ip))
                {
                    var bytes = ip.GetAddressBytes();
                    if (bytes.Length == 4)
                    {
                        // 192.168.x.x
                        if (bytes[0] == 192 && bytes[1] == 168) return true;
                        // 10.x.x.x
                        if (bytes[0] == 10) return true;
                        // 172.16.x.x - 172.31.x.x
                        if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return true;
                    }
                }
            }

            // 4. Permitir cualquier origen explícito listado en Cors:AllowedOrigins
            if (configuredOrigins.Any(o => o.TrimEnd('/').Equals(origin.TrimEnd('/'), StringComparison.OrdinalIgnoreCase)))
            {
                return true;
            }

            return false;
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials(); // Obligatorio para SignalR
    });
});

// 1.1 Configurar Autenticación JWT y Cookies (SSO Stateless Compartido)
var jwtSettings = builder.Configuration.GetSection("JWTSettings");
var secret = jwtSettings["Secret"] ?? "YOUR_JWT_SHARED_SECRET_KEY_CHANGE_IN_PRODUCTION";
var key = Encoding.UTF8.GetBytes(secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "auth_global_istpet",
        ValidAudience = jwtSettings["Audience"] ?? "all",
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };

    // Configuración para leer el JWT tanto desde cookie (DOSIER Local) como de Authorization Header (SSO Global)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["dosier_auth"];
            if (string.IsNullOrEmpty(context.Token))
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    context.Token = authHeader.Substring("Bearer ".Length).Trim();
                }
            }
            return Task.CompletedTask;
        }
    };
});

// 2. Configurar JSON en snake_case y FluentValidation
// ⚠️ ADVERTENCIA DE NOMENCLATURA (API-Frontend Binding):
// - El backend expone de forma global JSON serializado en `snake_case` (JsonNamingPolicy.SnakeCaseLower).
// - El frontend (React) consume estas propiedades directamente en `snake_case` (ej: `nombre_completo`).
// - NO cambie esta política global a camelCase sin realizar un refactor completo de las claves en el frontend.
// - Nota: Algunas propiedades dinámicas (ej. snapshots, esquemas Scriban) usan fallbacks locales en el
//   frontend (ej. `data_snapshot_json || dataSnapshotJson`) para tolerar discrepancias de serialización.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // 🔒 PRODUCTION-LOCK ACTIVADO 🔒
        // Activamos la validación automática para retornar 400 Bad Request en payloads inválidos.
        options.SuppressModelStateInvalidFilter = false;
    });

// Registrar todos los validadores del ensamblado de Application
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<dosier_application.Security.Validators.LoginRequestValidator>();

// Registrar MediatR para manejar Commands y Queries en dosier_application y dosier_infrastructure
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(
    typeof(dosier_application.Security.IAuthService).Assembly,
    typeof(dosier_infrastructure.Research.GroupsService).Assembly
));

// 3. Agregar SignalR con límites ampliados para soportar transporte de imágenes Base64 en CoWork
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 2 * 1024 * 1024; // 2 Megabytes (Seguridad DoS)
});

// Infrastructure Services
builder.Services.AddSingleton<dosier_application.Common.IAppUrlService, dosier_infrastructure.Common.AppUrlService>();
builder.Services.AddScoped<dosier_infrastructure.Security.IFirmaElectronicaService, dosier_infrastructure.Security.FirmaElectronicaService>();
builder.Services.AddScoped<IExternalAuthService, ExternalAuthService>();
builder.Services.AddScoped<dosier_application.Academico.IAsignaturasDocenteService, dosier_infrastructure.Academico.AsignaturasDocenteService>();

// DOSIER Firma
builder.Services.AddSingleton<SignatureHashService>();
builder.Services.AddSingleton<SignatureStamper>();
builder.Services.AddScoped<dosier_infrastructure.Signatures.Subservices.ISignatureProfileSubservice, dosier_infrastructure.Signatures.Subservices.SignatureProfileSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Signatures.Subservices.IDosierInternalSignerSubservice, dosier_infrastructure.Signatures.Subservices.DosierInternalSignerSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Signatures.Subservices.IP12SignatureSubservice, dosier_infrastructure.Signatures.Subservices.P12SignatureSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Signatures.Subservices.ISignatureVerificationSubservice, dosier_infrastructure.Signatures.Subservices.SignatureVerificationSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Signatures.Subservices.ISignatureRevocationSubservice, dosier_infrastructure.Signatures.Subservices.SignatureRevocationSubservice>();
builder.Services.AddScoped<IDosierSignatureService, DosierSignatureService>();
builder.Services.AddSingleton<IPasswordHasher<object>, PasswordHasher<object>>();

// Authorization Logic (PBAC)
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, PermissionHandler>();

builder.Services.AddAuthorization(options =>
{
    // Registrar automáticamente todas las constantes de Permissions como políticas
    var permissionFields = typeof(dosier_domain.Identity.Enums.Permissions)
        .GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.FlattenHierarchy)
        .Where(f => f.IsLiteral && !f.IsInitOnly);

    foreach (var field in permissionFields)
    {
        var permissionValue = field.GetValue(null)?.ToString();
        if (permissionValue != null)
        {
            options.AddPolicy(permissionValue, policy =>
                policy.Requirements.Add(new PermissionRequirement(permissionValue)));
        }
    }
});

// ── DOSIER Document Engine ──────────────────────────────────────
// Motor principal: genera, combina y audita todos los documentos institucionales
builder.Services.AddScoped<IDocumentEngine, DocumentEngine>();

// Proveedores de Bloques Dinámicos (Arquitectura de Plugins - Escaneo Automático)
var providerInterfaceType = typeof(IDocumentBlockProvider);
var providerTypes = typeof(Program).Assembly.GetTypes()
    .Where(t => providerInterfaceType.IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

foreach (var type in providerTypes)
{
    builder.Services.AddTransient(typeof(IDocumentBlockProvider), type);
}

builder.Services.AddScoped<IDocumentTemplateRepository, DocumentTemplateRepository>();
builder.Services.AddScoped<IDocumentAuditRepository, DocumentAuditRepository>();
builder.Services.AddScoped<Dosier.Application.Common.Documents.IDocumentInstanceService, Dosier.Infrastructure.Common.Documents.DocumentInstanceService>();
builder.Services.AddScoped<IDocumentDataOrchestrator, DocumentDataOrchestrator>();
builder.Services.AddScoped<IDocumentDataProvider, ProjectDocumentDataProvider>();
builder.Services.AddScoped<IDocumentDataProvider, Dosier.Infrastructure.Common.Documents.Providers.InformeAvanceDataProvider>();
builder.Services.AddSingleton<Dosier.Infrastructure.Common.Storage.IFileStorageService, Dosier.Infrastructure.Common.Storage.LocalFileStorageService>();
// ─────────────────────────────────────────────────────────────────────────────

// Application Services (Modular Monolith)
builder.Services.AddScoped<dosier_application.Security.ITokenService, dosier_infrastructure.Security.TokenService>();
builder.Services.AddScoped<dosier_application.Security.IPasswordService, dosier_infrastructure.Security.PasswordService>();
builder.Services.AddScoped<dosier_application.Security.IRbacService, dosier_infrastructure.Security.RbacService>();
builder.Services.AddScoped<dosier_application.Security.IMagicLinkService, dosier_infrastructure.Security.MagicLinkService>();
builder.Services.AddScoped<dosier_application.Security.IMicrosoftAuthService, dosier_infrastructure.Security.MicrosoftAuthService>();
builder.Services.AddScoped<dosier_application.Security.IPasswordRecoveryService, dosier_infrastructure.Security.PasswordRecoveryService>();
builder.Services.AddScoped<dosier_application.Security.IAuthService, dosier_infrastructure.Security.AuthService>();
builder.Services.AddScoped<dosier_application.Security.IAdminService, dosier_infrastructure.Security.AdminService>();
builder.Services.AddScoped<IResearchService, ProjectService>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectSecurityService, ProjectSecurityService>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectWizardService, ProjectWizardService>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectTeamChangeService, dosier_infrastructure.Research.ProjectTeamChangeService>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectTeamSyncService, dosier_infrastructure.Research.ProjectTeamSyncService>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectTeamService, ProjectTeamService>();
builder.Services.AddScoped<dosier_infrastructure.Research.Subservices.IProjectWizardCoreSubservice, dosier_infrastructure.Research.Subservices.ProjectWizardCoreSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Research.Subservices.IProjectWizardClassificationSubservice, dosier_infrastructure.Research.Subservices.ProjectWizardClassificationSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Research.Subservices.IProjectWizardComponentsSubservice, dosier_infrastructure.Research.Subservices.ProjectWizardComponentsSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Research.Subservices.IProjectLookupSubservice, dosier_infrastructure.Research.Subservices.ProjectLookupSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Research.Subservices.IProjectDetailSubservice, dosier_infrastructure.Research.Subservices.ProjectDetailSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Research.Subservices.IProjectDashboardSubservice, dosier_infrastructure.Research.Subservices.ProjectDashboardSubservice>();
builder.Services.AddScoped<dosier_infrastructure.Research.Subservices.IProjectActivitySubservice, dosier_infrastructure.Research.Subservices.ProjectActivitySubservice>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectQueryService, ProjectQueryService>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectOrchestrator, ProjectOrchestrator>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectSigningService, dosier_infrastructure.Research.ProjectSigningService>();
builder.Services.AddScoped<Dosier.Application.Research.IProjectExpensesService, dosier_infrastructure.Research.ProjectExpensesService>();
builder.Services.AddScoped<dosier_application.Common.Notifications.INotificationService, dosier_infrastructure.Common.Notifications.NotificationService>();
builder.Services.AddScoped<dosier_infrastructure.Common.Notifications.EmailMasterLayoutRenderer>();
builder.Services.AddScoped<dosier_infrastructure.Common.Notifications.IEmailTemplateService, dosier_infrastructure.Common.Notifications.EmailTemplateService>();
builder.Services.AddScoped<dosier_infrastructure.Common.Notifications.IEmailSenderSubservice, dosier_infrastructure.Common.Notifications.EmailSenderSubservice>();
builder.Services.AddScoped<dosier_application.Common.Notifications.IEmailEngineService, dosier_infrastructure.Common.Notifications.EmailEngineService>();
// Notificación Drivers
builder.Services.AddScoped<dosier_application.Common.Notifications.INotificationDriver, dosier_infrastructure.Common.Notifications.SignalRDriver>();
builder.Services.AddScoped<dosier_application.Common.Notifications.INotificationDriver, dosier_infrastructure.Common.Notifications.EmailDriver>();
builder.Services.AddScoped<dosier_application.Common.Notifications.INotificationDriver, dosier_infrastructure.Common.Notifications.PushDriver>();

builder.Services.AddScoped<dosier_application.Research.IInformeAvanceService, dosier_infrastructure.Research.InformeAvanceService>();
builder.Services.AddScoped<IConvocatoriaService, ConvocatoriaService>();
builder.Services.AddScoped<dosier_application.Research.IGroupsQueryService, GroupsQueryService>();
builder.Services.AddScoped<dosier_application.Research.IGroupsWorkflowService, GroupsWorkflowService>();
builder.Services.AddScoped<IGroupsService, GroupsService>();
builder.Services.AddScoped<dosier_application.Research.IGroupDocumentOrchestrator, dosier_infrastructure.Research.GroupDocumentOrchestrator>();
builder.Services.AddScoped<ICalendarioService, dosier_infrastructure.Research.CalendarioService>();
builder.Services.AddScoped<IAIAssistantService, AIAssistantService>();
builder.Services.AddScoped<Dosier.Application.Research.IWorkflowEngineService, Dosier.Infrastructure.Research.WorkflowEngineService>();
builder.Services.AddScoped<dosier_application.Security.IAuditService, dosier_infrastructure.Security.AuditService>();
builder.Services.AddScoped<dosier_application.Security.ILopdpService, dosier_infrastructure.Security.LopdpService>();

// Servicios Curriculares Oficiales ISTPET (Los 4 Documentos)
builder.Services.AddScoped<dosier_application.Curriculum.Interfaces.ICurriculumCatalogService, dosier_infrastructure.Curriculum.CurriculumCatalogService>();
builder.Services.AddScoped<dosier_application.Curriculum.Interfaces.IPeaService, dosier_infrastructure.Curriculum.PeaService>();
builder.Services.AddScoped<dosier_application.Curriculum.Interfaces.ISilaboService, dosier_infrastructure.Curriculum.SilaboService>();
builder.Services.AddScoped<dosier_application.Curriculum.Interfaces.IGuiaApeService, dosier_infrastructure.Curriculum.GuiaApeService>();
builder.Services.AddScoped<dosier_application.Curriculum.Interfaces.IGuiaEstudioService, dosier_infrastructure.Curriculum.GuiaEstudioService>();

builder.Services.AddSingleton<dosier_api.Services.BackupBackgroundService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<dosier_api.Services.BackupBackgroundService>());
builder.Services.AddSingleton<dosier_api.Services.CalendarioAlertasJob>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<dosier_api.Services.CalendarioAlertasJob>());
builder.Services.AddSingleton<dosier_api.Services.RecycleBinCleanupBackgroundService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<dosier_api.Services.RecycleBinCleanupBackgroundService>());
builder.Services.AddSingleton<dosier_api.Services.DocumentGarbageCollectorBackgroundService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<dosier_api.Services.DocumentGarbageCollectorBackgroundService>());
builder.Services.AddSingleton<dosier_api.Services.EmailBackgroundProcessorService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<dosier_api.Services.EmailBackgroundProcessorService>());
builder.Services.AddSingleton<dosier_api.Services.EmailBounceListenerService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<dosier_api.Services.EmailBounceListenerService>());

// 3. DATABASE CONNECTION
var connectionString = builder.Configuration.GetConnectionString("default_connection");


if (!string.IsNullOrEmpty(connectionString))
{
    // Usamos una versión fija para evitar que AutoDetect falle si la red parpadea
    var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
    builder.Services.AddDbContext<dosier_infrastructure.data.models.DosierContext>(options =>
        options.UseMySql(connectionString, serverVersion));
}

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddSwaggerGen(c =>
{
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Configurar soporte para JWT Bearer Token en la UI de Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando el esquema Bearer. Ejemplo: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-Seeder de Plantillas de Documentos y Vistas del Sistema (Sincronización Código ↔ MySQL)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<dosier_infrastructure.data.models.DosierContext>();
        var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        
        await DocumentTemplateSeeder.SeedTemplatesAsync(dbContext, env, logger);
        await CalendarioViewSeeder.EnsureCalendarioViewCreatedAsync(dbContext, logger);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "DOSIER Seeder: Error al sincronizar esquemas y plantillas al arrancar.");
    }
}

    // Use Global Exception Middleware
    app.UseMiddleware<dosier_api.Middleware.ExceptionMiddleware>();

    // 1. CORS debe ser lo primero, antes de cualquier redirección o autenticación
    app.UseCors("Dosier_policy");

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment() || true) // Habilitar Swagger siempre por ahora
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    // SignalR Hubs (Unificado)
    app.MapHub<CollaborationHub>("/hubs/collaboration");
    app.MapHub<dosier_infrastructure.Common.Notifications.Hubs.NotificationHub>("/hubs/notifications");

    app.MapGet("/api/ping", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.UseSwagger();
app.UseSwaggerUI();


app.Run();

