# Seguridad Perimetral: Cifrado SSL/TLS con Cloudflare Origin CA y Nginx

Este documento detalla la arquitectura de seguridad perimetral implementada para el sistema DOSIER, utilizando el modo **Full (Strict) / Completo (Estricto)** de Cloudflare y certificados criptográficos emitidos por la Autoridad Certificadora de Origen (Origin CA) de Cloudflare.

---

## 1. Arquitectura de Cifrado Extremo a Extremo

En arquitecturas tradicionales con SSL básico o proxies flexibles, el tráfico entre Cloudflare y el servidor de origen viaja en texto plano (HTTP puerto 80), lo que expone los datos a ataques Man-in-the-Middle en el canal de transporte.

En DOSIER, se implementa una topología de **cifrado estricto de dos niveles**:

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

## 2. Ventajas del Certificado Cloudflare Origin CA

1. **Validez Prolongada (Hasta 15 Años):** Elimina la dependencia de daemons de renovación automática en el servidor como Certbot/Let's Encrypt, previniendo caídas imprevistas por expiración de certificados.
2. **Autenticación Mutua con Cloudflare:** El servidor Nginx solo acepta conexiones validadas por la red de Cloudflare, reduciendo la superficie de ataque sobre el host EC2.
3. **Cero Penalización de Rendimiento:** La terminación SSL se realiza a nivel del contenedor Nginx de alto rendimiento con optimización de ciphers modernos.

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
