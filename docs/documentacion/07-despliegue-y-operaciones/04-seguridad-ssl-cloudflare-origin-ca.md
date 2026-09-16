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

* **Mecanismo:** Contenedor `dosier-tunnel` (`cloudflare/cloudflared:latest`) integrado como perfil en Docker Compose.
* **Topología:** Establece un túnel seguro saliente por QUIC/HTTP2 hacia los bordes de Cloudflare sin abrir puertos en el router ni requerir IP pública.
* **Cifrado:** Cloudflare Edge provee terminación SSL/TLS 1.3 automática mediante URLs públicas firmadas (`https://*.trycloudflare.com`).
* **Enrutamiento:** Dirige el tráfico HTTPS directamente al contenedor Nginx (`dosier-web:80`), el cual balancea hacia `dosier-backend:5000` y `dosier-db:3306`.
* **Arranque:**
  ```powershell
  .\scripts\despliegue\docker\start-local.ps1 -Tunnel
  ```

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
