# Acceso Remoto Seguro con Cloudflare Tunnel (DOSIER Staging)

Este documento detalla la arquitectura de despliegue y acceso remoto para el entorno de Staging de DOSIER mediante Cloudflare Tunnel, garantizando conectividad HTTPS publica, soporte completo para WebSockets (SignalR) y consumo de API sin necesidad de abrir puertos en el router ni almacenar certificados criptograficos en el host.

---

## 1. Arquitectura de Red y Enrutamiento

El flujo de solicitudes hacia el entorno de Staging de DOSIER sigue el siguiente recorrido:

```
[ Navegador del Usuario / Evaluador Externo ]
                     |
                     |  HTTPS (TLS 1.3 - Dominio: https://staging-dosier.doicela.dev)
                     v
[ Red Perimetral de Cloudflare (WAF, Anti-DDoS, Edge SSL) ]
                     |
                     |  Tunel Cifrado Seguro (Conexion saliente QUIC / HTTP2)
                     v
[ Daemon cloudflared en Host ]
                     |
                     |  HTTP (127.0.0.1:8080 - Puerto host)
                     v
[ Contenedor Docker: dosier-web (Nginx en puerto 80) ]
         |
         +--> /          (React 18 SPA compilada para produccion)
         +--> /api/*     (Proxy inverso hacia http://dosier-backend:5000/api/*)
         +--> /hubs/*    (Proxy WebSockets / SignalR hacia http://dosier-backend:5000/hubs/*)
                                  |
                                  v
                   [ Contenedor Docker: dosier-backend (.NET 8) ]
                                  |
                                  v
                   [ host.docker.internal:3306 (MySQL sigafi_es en Windows) ]
```

---

## 2. Especificacion Tecnica del Servicio

* **Dominio Asignado:** `staging-dosier.doicela.dev`
* **URL de Acceso Web:** `https://staging-dosier.doicela.dev`
* **Endpoint de Diagnostico:** `https://staging-dosier.doicela.dev/api/ping`
* **Servicio de Destino Local:** `http://localhost:8080` (o `http://127.0.0.1:8080`)
* **Mapeo de Puertos Host / Contenedor:**
  * `dosier-web`: `8080:80` (Nginx sirviendo SPA y proxy inverso)
  * `dosier-backend`: `5001:5000` (ASP.NET Core Web API Kestrel)
  * `dosier-db`: `3307:3306` (MySQL opcional en contenedor; habitualmente se utiliza `host.docker.internal:3306`)
* **Politica de Nginx en Contenedor:** Nginx escucha exclusivamente en el puerto `80` (HTTP plano). El cifrado TLS y los certificados publicos son gestionados integramente por el borde de Cloudflare, eliminando la necesidad de certificados locales o carpetas de certificados en el repositorio.
* **Politica de CORS en Backend:** `Program.cs` autoriza dinamicamente el origen `https://staging-dosier.doicela.dev` y cualquier subdominio perteneciente a `*.doicela.dev`, habilitando credenciales de sesion (`withCredentials: true`) y canales de WebSockets.

---

## 3. Seguridad Perimetral y Ventajas Operativas

1. **Edge SSL Termination:** La terminacion SSL se realiza en los data centers de Cloudflare con un certificado gestionado de forma automatica.
2. **Cero Superficie de Ataque Directa:** No existen puertos abiertos hacia Internet en el router ni en la tarjeta de red del host.
3. **Persistencia de Datos Unificada:** El backend se comunica con la base de datos `sigafi_es` en el host Windows a traves de `host.docker.internal:3306`, compartiendo datos con los demas entornos sin duplicacion de instancias.

---

## 4. Procedimiento de Arranque y Operacion

### Paso 1: Levantar el Stack de DOSIER en Docker
En una terminal situada en la raiz del proyecto `dosier`:

```bash
docker compose up -d
```

Si se han realizado modificaciones en el frontend o Nginx, reconstruir la imagen:
```bash
docker compose up -d --build dosier-web
```

Verificar que los servicios esten activos y saludables:
```bash
docker compose ps
```

### Paso 2: Iniciar el Tunel de Cloudflare
Desde cualquier consola de PowerShell del sistema, iniciar el agente del tunel:

```powershell
cloudflared tunnel --config "C:\ProgramData\cloudflared\config.yml" run
```

O utilizando la suite interactiva de gestion:
```powershell
& "c:\Users\DESARROLLADOR\Desktop\Proyectos\diitra\scripts\despliegue\setup_cloudflare_tunnel.ps1"
```
(Seleccionando la opcion `[1]`).

### Paso 3: Verificacion de Acceso
Abrir en el navegador:
* Aplicacion Web: `https://staging-dosier.doicela.dev`
* API Ping: `https://staging-dosier.doicela.dev/api/ping` (Debe responder con `{"status":"healthy"}`).

### Paso 4: Detencion del Servicio
Para suspender el acceso publico, presionar `Ctrl + C` en la terminal del tunel.
Para detener los contenedores locales cuando no se requieran:
```bash
docker compose down
```