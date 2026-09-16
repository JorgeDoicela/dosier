# Multi-stage Dockerfile para DOSIER Backend (.NET 8 Web API)

# Etapa 1: Compilación y publicación
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de proyectos y solución para aprovechar la caché de Docker
COPY backend/dosier.sln ./backend/
COPY backend/dosier_api/dosier_api.csproj ./backend/dosier_api/
COPY backend/dosier_application/dosier_application.csproj ./backend/dosier_application/
COPY backend/dosier_domain/dosier_domain.csproj ./backend/dosier_domain/
COPY backend/dosier_infrastructure/dosier_infrastructure.csproj ./backend/dosier_infrastructure/
COPY backend/dosier_tests/dosier_tests.csproj ./backend/dosier_tests/

# Restaurar dependencias
RUN dotnet restore ./backend/dosier.sln

# Copiar todo el código fuente del backend
COPY backend/ ./backend/

# Compilar y publicar dosier_api en modo Release
WORKDIR /src/backend/dosier_api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Imagen de ejecucion (Runtime optimizado)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Instalar curl (requerido por el healthcheck de Docker Compose)
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Crear directorios necesarios para uploads y backups
RUN mkdir -p /app/uploads /app/backups

# Copiar artefactos compilados desde la etapa de build
COPY --from=build /app/publish .

# Variables de entorno por defecto
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

# Punto de entrada
ENTRYPOINT ["dotnet", "dosier_api.dll"]
