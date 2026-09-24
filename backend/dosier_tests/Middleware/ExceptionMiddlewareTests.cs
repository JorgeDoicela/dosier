using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using FluentValidation.Results;
using dosier_api.Middleware;

namespace dosier_tests.Middleware
{
    public class ExceptionMiddlewareTests
    {
        private readonly Mock<ILogger<ExceptionMiddleware>> _loggerMock = new();
        private readonly Mock<IHostEnvironment> _envMock = new();

        private DefaultHttpContext CreateHttpContext()
        {
            var context = new DefaultHttpContext();
            context.Response.Body = new MemoryStream();
            return context;
        }

        private async Task<string> ReadResponseBodyAsync(HttpContext context)
        {
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(context.Response.Body);
            return await reader.ReadToEndAsync();
        }

        [Fact]
        public async Task InvokeAsync_ValidationException_Returns400BadRequest()
        {
            var failures = new[] { new ValidationFailure("Codigo", "El código es obligatorio.") };
            RequestDelegate next = (ctx) => throw new ValidationException(failures);
            var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);
            var context = CreateHttpContext();

            await middleware.InvokeAsync(context);

            Assert.Equal(400, context.Response.StatusCode);
            var body = await ReadResponseBodyAsync(context);
            using var doc = JsonDocument.Parse(body);
            Assert.Equal(400, doc.RootElement.GetProperty("status_code").GetInt32());
            Assert.Equal("Error de validación en la solicitud.", doc.RootElement.GetProperty("message").GetString());
            Assert.True(doc.RootElement.GetProperty("errors").GetArrayLength() > 0);
        }

        [Fact]
        public async Task InvokeAsync_KeyNotFoundException_Returns404NotFound()
        {
            RequestDelegate next = (ctx) => throw new KeyNotFoundException("No se encontró el recurso solicitado.");
            var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);
            var context = CreateHttpContext();

            await middleware.InvokeAsync(context);

            Assert.Equal(404, context.Response.StatusCode);
            var body = await ReadResponseBodyAsync(context);
            using var doc = JsonDocument.Parse(body);
            Assert.Equal(404, doc.RootElement.GetProperty("status_code").GetInt32());
            Assert.Equal("No se encontró el recurso solicitado.", doc.RootElement.GetProperty("message").GetString());
        }

        [Fact]
        public async Task InvokeAsync_UnauthorizedAccessException_Returns401Unauthorized()
        {
            RequestDelegate next = (ctx) => throw new UnauthorizedAccessException("Credenciales inválidas o expiradas.");
            var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);
            var context = CreateHttpContext();

            await middleware.InvokeAsync(context);

            Assert.Equal(401, context.Response.StatusCode);
            var body = await ReadResponseBodyAsync(context);
            using var doc = JsonDocument.Parse(body);
            Assert.Equal(401, doc.RootElement.GetProperty("status_code").GetInt32());
            Assert.Equal("Credenciales inválidas o expiradas.", doc.RootElement.GetProperty("message").GetString());
        }

        [Fact]
        public async Task InvokeAsync_InvalidOperationException_Returns400BadRequest()
        {
            RequestDelegate next = (ctx) => throw new InvalidOperationException("Operación no permitida en el estado actual.");
            var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);
            var context = CreateHttpContext();

            await middleware.InvokeAsync(context);

            Assert.Equal(400, context.Response.StatusCode);
            var body = await ReadResponseBodyAsync(context);
            using var doc = JsonDocument.Parse(body);
            Assert.Equal(400, doc.RootElement.GetProperty("status_code").GetInt32());
            Assert.Equal("Operación no permitida en el estado actual.", doc.RootElement.GetProperty("message").GetString());
        }

        [Fact]
        public async Task InvokeAsync_ArgumentException_Returns400BadRequest()
        {
            RequestDelegate next = (ctx) => throw new ArgumentException("Parámetro inválido.");
            var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);
            var context = CreateHttpContext();

            await middleware.InvokeAsync(context);

            Assert.Equal(400, context.Response.StatusCode);
            var body = await ReadResponseBodyAsync(context);
            using var doc = JsonDocument.Parse(body);
            Assert.Equal(400, doc.RootElement.GetProperty("status_code").GetInt32());
            Assert.Equal("Parámetro inválido.", doc.RootElement.GetProperty("message").GetString());
        }

        [Fact]
        public async Task InvokeAsync_DbUpdateConcurrencyException_Returns409Conflict()
        {
            RequestDelegate next = (ctx) => throw new DbUpdateConcurrencyException();
            var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);
            var context = CreateHttpContext();

            await middleware.InvokeAsync(context);

            Assert.Equal(409, context.Response.StatusCode);
            var body = await ReadResponseBodyAsync(context);
            using var doc = JsonDocument.Parse(body);
            Assert.Equal(409, doc.RootElement.GetProperty("status_code").GetInt32());
            Assert.Contains("Conflicto de edición", doc.RootElement.GetProperty("message").GetString());
        }

        [Fact]
        public async Task InvokeAsync_GenericException_Returns500InternalServerError()
        {
            _envMock.Setup(e => e.EnvironmentName).Returns("Production");
            RequestDelegate next = (ctx) => throw new ApplicationException("Error catastrófico imprevisto.");
            var middleware = new ExceptionMiddleware(next, _loggerMock.Object, _envMock.Object);
            var context = CreateHttpContext();

            await middleware.InvokeAsync(context);

            Assert.Equal(500, context.Response.StatusCode);
            var body = await ReadResponseBodyAsync(context);
            using var doc = JsonDocument.Parse(body);
            Assert.Equal(500, doc.RootElement.GetProperty("status_code").GetInt32());
            Assert.Equal("Error interno del servidor.", doc.RootElement.GetProperty("message").GetString());
        }
    }
}
