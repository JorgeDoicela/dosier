# Arquitectura de Infraestructura: Dimensionamiento de Servidor y Topologia en AWS EC2

Este documento describe la especificación de infraestructura de servidor, dimensionamiento de recursos de cómputo, huella de memoria (*memory footprint*) y topología de red en la nube de Amazon Web Services (AWS) para el soporte en producción de la plataforma **DOSIER**.

---

## 1. Justificacion de Seleccion de Tipo de Instancia (AWS EC2)

La plataforma DOSIER combina tres componentes con requerimientos de cómputo y memoria diferenciados:

1. **Runtime ASP.NET Core (.NET 8):** Gestión de hilos de alto rendimiento para APIs REST, consultas asíncronas de Entity Framework Core y canales persistentes de SignalR WebSockets.
2. **Motor de Compilacion de Documentos e Integridad Forense (iText 9 + QRCoder + SHA-256):** La generación de documentos oficiales PEA vectoriales de alta resolución con firmas digitales y sellos de tiempo genera picos momentáneos de asignación de memoria heap.
3. **Servidor Web y Proxy Inverso (Nginx):** Terminación de cifrado SSL/TLS 1.3 y enrutamiento SPA de baja latencia.

### 1.1 Comparativa Tecnica de Familias de Instancias

| Tipo de Instancia | vCPU | Memoria RAM | Evaluacion Técnica para DOSIER |
| :--- | :--- | :--- | :--- |
| `t3.micro` | 2 | 1 GiB | **Inviable para Producción:** El sistema operativo Linux (~300 MB) + Docker daemon (~150 MB) + .NET 8 runtime (~350 MB) agotan la memoria. Durante el despliegue (`docker pull`) o picos de generación de PDFs, el kernel activa el **OOM Killer** provocando caídas de servicio. |
| `t3.small` | 2 | 2 GiB | **Mínimo Operativo:** Funcional con base de datos externa y swapfile de 2 GB, pero con margen estrecho ante concurrencia multi-docente. |
| **`c7i-flex.large` (Seleccionada)** | **2** | **4 GiB** | **Óptima y Recomendada:** Procesadores Intel Xeon Scalable de 4ta generación (Sapphire Rapids), 4 GiB de RAM. Provee holgura para compilación documental concurrente, WebSockets masivos y despliegues inmutables sin degradación de latencia. |

---

## 2. Analisis de Capacidad y Huella de Memoria (Memory Footprint)

Distribución proyectada del consumo de memoria en estado estacionario y bajo carga operativa en la instancia de 4 GiB:

```
[ Memoria Total: 4096 MB ]
|---------------------------------------------------------------------------------|
| SO Linux Debian/Ubuntu (~300 MB)                                                |
| Docker Engine & Containerd (~150 MB)                                            |
| dosier-web (Nginx SPA + SSL) (~50 MB)                                           |
| dosier-backend (.NET 8 Web API + EF Core + SignalR) (~450 MB)                   |
| Reserva para Picos de iText 9 / Firmas SHA-256 (~500 MB)                        |
| Margen Libre / Page Cache de Linux (~2646 MB)                                   |
|---------------------------------------------------------------------------------|
```

El margen de más de 2.5 GB garantiza que el sistema operativo mantenga en memoria caché de disco los archivos estáticos y datos de lectura frecuente sin recurrir a paginación en disco.

---

## 3. Topologia de Red y Grupos de Seguridad (Security Groups)

El servidor implementa el principio de mínima exposición de puertos (*least privilege network exposure*):

```
                                [ INTERNET / CLOUDFLARE ]
                                            |
                         +------------------+------------------+
                         |                                     |
                [ Puerto 22 / SSH ]                   [ Puerto 80 / 443 ]
             (Administración / CI-CD)                 (Tráfico Web Seguro)
                         |                                     |
                         v                                     v
                  [ Debian Host ]                      [ Nginx Container ]
                                                               |
                                                  +------------+------------+
                                                  |                         |
                                            (HTTP Puerto 80)        (HTTPS Puerto 443)
                                                  |                         |
                                             [ Redirección ]          [ Terminación SSL ]
                                                                            |
                                                                            v
                                                                   [ dosier-backend:5000 ]
```

### 3.1 Matriz de Reglas de Entrada (Inbound Rules)

| Tipo de Tráfico | Protocolo | Puerto | Origen (CIDR) | Propósito Técnico |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | `0.0.0.0/0` | Acceso seguro para administración remota y despliegue automatizado por GitHub Actions mediante clave RSA PEM. |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Recepción de tráfico web estándar, redirigido automáticamente a HTTPS (código 301). |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` | Canal cifrado principal TLS 1.3 conectado con Cloudflare Origin CA en modo Full Strict. |
| **API Directa** *(Opcional)* | TCP | `5000` | `0.0.0.0/0` | Smoke tests de conectividad y diagnóstico de endpoints de salud (`/api/ping`). |

---

## 4. Estrategia de Almacenamiento y Volúmenes EBS

El almacenamiento principal está soportado por un volumen **AWS Elastic Block Store (EBS) de tipo `gp3`** configurado en **30 GiB** (incluido dentro de la capa gratuita permanente de AWS):

* **Rendimiento:** 3,000 IOPS de línea base y 125 MB/s de rendimiento sin costo adicional.
* **Estructura de Directorios en `/var/www/dosier`:**
  * `/certs`: Contiene los certificados criptográficos del servidor de origen (`cert.pem`, `key.pem`).
  * `/uploads`: Evidencias curriculares, anexos de proyectos y PDFs sellados digitalmente con firma PKCS#12.
  * `/backups`: Volcados de respaldo automáticos y scripts DDL para recuperación ante desastres.
