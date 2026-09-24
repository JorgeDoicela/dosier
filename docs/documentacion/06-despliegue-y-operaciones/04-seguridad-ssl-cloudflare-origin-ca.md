# Seguridad Perimetral: Cifrado SSL/TLS con Cloudflare Origin CA y Nginx

Este documento detalla la arquitectura de seguridad perimetral implementada para el sistema DOSIER, utilizando el modo **Full (Strict) / Completo (Estricto)** de Cloudflare y certificados criptográficos emitidos por la Autoridad Certificadora de Origen (Origin CA) de Cloudflare.

---

## 1. Arquitectura de Cifrado y Entornos Operativos (Producción vs Staging)

En DOSIER se definen dos niveles de conectividad segura según el entorno de ejecución:

### 1.1 Entorno de Producción (AWS EC2 + Cloudflare Full Strict)
Utiliza certificados Origin CA de Cloudflare instalados en Nginx en el puerto 443 del servidor AWS EC2:

```
[ Navegador del Usuario ]
         |
         |  HTTPS (TLS 1.3 - Certificado Público Cloudflare Edge)
         v
[ Red Perimetral Cloudflare (WAF / Anti-DDoS) ]
         |
         |  HTTPS (TLS 1.2/1.3 - Puerto 443 con Cloudflare Origin CA)
         v
[ Servidor AWS EC2 ]
         |
         +--> [ Nginx (Reverse Proxy + Terminación SSL) ]
                    |
                    +--> [ dosier_web:80 (React SPA) ]
                    |
                    +--> [ dosier-backend:5000 (ASP.NET Core API / SignalR) ]
```

---

### 1.2 Entorno de Staging / Pre-Producción Local (Docker + Cloudflare Quick Tunnel)
Para pruebas de integración, co-redacción concurrente multi-dispositivo y simulaciones de defensa de grado sin costos de infraestructura en AWS:

* **Mecanismo:** Servicio `dosier-tunnel` sustentado en la imagen oficial `cloudflare/cloudflared:latest` integrado como perfil condicional (`--profile tunnel`) en Docker Compose, o ejecutado directamente mediante el binario de línea de comandos de `cloudflared`.
* **Naturaleza Efímera (Ciclo de Vida):** Los dominios generados bajo el sufijo `*.trycloudflare.com` son túneles rápidos temporales sin registro previo (*Quick Tunnels*). Al detenerse el proceso de `cloudflared`, cerrarse la terminal o reiniciarse el contenedor, el subdominio aleatorio expira definitivamente y Cloudflare asigna un nuevo identificador al relanzar el túnel.
* **Topología:** Establece un túnel seguro saliente por QUIC/HTTP2 hacia la red perimetral (Edge) de Cloudflare sin requerir apertura de puertos en el enrutador local ni asignación de IP pública fija.
* **Cifrado y Certificación:** Los servidores de borde de Cloudflare gestionan la terminación SSL/TLS 1.3 de forma transparente, proveyendo certificados HTTPS válidos y reconocidos por todos los navegadores web.
* **Enrutamiento Unificado:**
  * En entorno de contenedores Docker: El túnel apunta internamente a `http://dosier-web:80`, permitiendo que Nginx resuelva tanto los archivos estáticos del frontend React como las redirecciones de `/api/` hacia `dosier-backend:5000` y de `/hubs/` hacia SignalR.
  * En entorno de desarrollo nativo (Vite + Kestrel): El comando `cloudflared tunnel --url http://localhost:3010` expone el servidor de desarrollo de Vite (puerto 3010), el cual a su vez canaliza `/api` y `/hubs` hacia el backend Kestrel en el puerto `5185` mediante su proxy interno configurado en `vite.config.ts`.
* **Compatibilidad de Políticas de Seguridad (CORS):** La capa de backend (`Program.cs`) incorpora validación nativa explícita para solicitudes procedentes de subdominios `*.trycloudflare.com`, admitiendo cabeceras, credenciales de sesión y tráfico bidireccional de WebSockets.

#### Comandos de Ejecución para Túneles Temporales

**Opción A: Ejecución mediante Docker Compose (Recomendado para Staging)**
```powershell
# Levantar stack completo con túnel activo
.\scripts\despliegue\docker\start-local.ps1 -Tunnel

# O mediante comandos Docker nativos:
docker compose --profile tunnel up -d dosier-tunnel

# Consultar la URL HTTPS temporal asignada en los logs:
docker logs dosier-tunnel 2>&1 | Select-String "trycloudflare.com"
```

**Opción B: Ejecución en Desarrollo Local Nativo en Windows (Sin Docker)**

1. **Aprovisionamiento del binario `cloudflared.exe`:**
   * Descargar el ejecutable oficial de Windows desde el repositorio de Cloudflare (`cloudflared-windows-amd64.exe`) y renombrarlo a `cloudflared.exe`.
   * Para poder invocarlo globalmente desde cualquier terminal (PowerShell / CMD), registrar el directorio donde reside `cloudflared.exe` en la variable de entorno `PATH` del usuario:
     ```powershell
     # Ejemplo agregando la carpeta de Descargas/Cloudfare al PATH de usuario:
     [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$HOME\Downloads\Cloudfare", [EnvironmentVariableTarget]::User)
     ```
   * Alternativa directa: Abrir la terminal PowerShell en la carpeta donde reside el ejecutable e invocarlo como `.\cloudflared.exe`.

2. **Arranque del túnel hacia el puerto de Vite:**
   ```powershell
   # Asegurar que el frontend esté corriendo en dosier_web (puerto 3010)
   npm run dev

   # En otra terminal, abrir el túnel temporal hacia Vite:
   cloudflared tunnel --url http://localhost:3010
   # (O '.\cloudflared.exe tunnel --url http://localhost:3010' si se ejecuta desde su carpeta local)
   ```
La salida por consola generará la URL pública activa (por ejemplo, `https://nuevo-subdominio.trycloudflare.com`). Al abrir dicha URL con el sufijo `/dashboard` o `/login`, la navegación y las llamadas a la API operarán con cifrado HTTPS completo.

#### Criterio de Selección: Terminal vs Contenedor Docker

* **Uso Recomendado de la Terminal (Opción B):** Es la alternativa idónea para pruebas rápidas y demostraciones efímeras. Muestra la URL generada de inmediato en consola, no sobrecarga el archivo `docker-compose.yml` con servicios temporales y permite cerrar la conexión instantáneamente con `Ctrl + C`.
* **Uso del Contenedor Docker (Opción A):** Reservado para entornos de staging desatendidos o cuando se implementa un **Named Tunnel persistente** vinculado a un dominio oficial mediante token (`tunnel run --token ...`), donde el servicio debe operar de forma ininterrumpida en segundo plano sin intervención manual.

---

## 2. Ventajas del Modelo Dual Cloudflare (Origin CA y Quick Tunnel)

1. **Paridad Exacta Producción / Staging:** El frontend y backend corren en contenedores idénticos bajo Nginx y Kestrel en ambos entornos.
2. **Cero Costos en Staging:** Permite apagar la instancia de AWS durante etapas de desarrollo activo sin perder la capacidad de realizar pruebas remotas con evaluadores externos.
3. **Validez Prolongada en Producción (Hasta 15 Años):** Elimina la dependencia de daemons de renovación automática como Certbot/Let's Encrypt en el servidor EC2.
4. **Cero Exposición de Puertos en Staging:** El túnel saliente no requiere apertura de NAT ni reenvío de puertos (Port Forwarding) en redes residenciales o institucionales.

---

## 3. Configuración de Archivos y Certificados

### 3.1 Estructura en el Servidor EC2
Los archivos residen en `/var/www/dosier/certs/`:

* `cert.pem`: Certificado público firmado por Cloudflare Origin CA (`chmod 644`).
* `key.pem`: Clave privada RSA correspondiente (`chmod 600`).

### 3.2 Montaje en Docker Compose
En el archivo `docker-compose.yml`, la carpeta de certificados se monta como volumen de solo lectura (`:ro`) hacia el contenedor web:

```yaml
dosier-web:
  image: ${FRONTEND_IMAGE:-ghcr.io/jorgedoicela/dosier-web:latest}
  container_name: dosier-web
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./certs:/etc/nginx/certs:ro
```

---

## 4. Configuración del Servidor Web Nginx

El archivo `dosier_web/nginx.conf` implementa la siguiente política:

1. **Redirección Forzada a HTTPS:**
   ```nginx
   server {
       listen 80;
       server_name _;
       return 301 https://$host$request_uri;
   }
   ```

2. **Terminación SSL y Cabeceras de Seguridad:**
   ```nginx
   server {
       listen 443 ssl;
       server_name _;

       ssl_certificate /etc/nginx/certs/cert.pem;
       ssl_certificate_key /etc/nginx/certs/key.pem;

       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;

       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;
   }
   ```

3. **Proxy Inverso Transparente para API y WebSockets:**
   * `/api/` enruta las peticiones HTTP REST hacia `http://dosier-backend:5000/api/`.
   * `/hubs/` mantiene abiertas las conexiones persistentes de SignalR con soporte de WebSocket Upgrades (`Connection "upgrade"` y `proxy_read_timeout 86400`).

---

## 5. Procedimiento Operativo de Verificación

Para comprobar que el cifrado estricto está activo y respondiendo:

```bash
# 1. Comprobar que Nginx tiene montados los certificados
docker compose exec dosier-web ls -la /etc/nginx/certs

# 2. Verificar la sintaxis de configuración de Nginx
docker compose exec dosier-web nginx -t

# 3. Probar la respuesta HTTPS directa en el servidor
curl -k https://localhost/api/ping
```
