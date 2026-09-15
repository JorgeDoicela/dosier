---
name: documentacion-dosier
description: Activa esta skill para garantizar que cada cambio funcional, arquitectónico, de base de datos, endpoints, componentes o infraestructura sea documentado de inmediato con rigor académico y técnico para la tesis de grado del ISTPET en docs/documentacion/ y README.md.
---
# Gobernanza y Documentación Técnica Continua — DOSIER (Tesis ISTPET)

> **Propósito:** Esta skill rige la creación, actualización y mantenimiento de la documentación técnica y memoria académica de la plataforma **DOSIER**. Garantiza que el código fuente y los documentos en `docs/documentacion/` y `README.md` permanezcan permanentemente sincronizados con rigor ingenieril para la tesis de titulación.

---

## 1. Principio de Documentación Inmediata y Cero Deuda

* **Actualización en el Mismo Turno:** Cada vez que se cree un nuevo controlador, servicio, entidad, endpoint, componente de React, script SQL, workflow de CI/CD, contenedor Docker o cambio en la máquina de estados, el agente debe **crear o actualizar inmediatamente los archivos Markdown (.md) pertinentes** antes de finalizar la tarea.
* **Autonomía Documental:** El agente tiene autorización explícita para crear nuevos archivos `.md`, editar secciones existentes o eliminar documentación obsoleta cuando la arquitectura evolucione.
* **Prohibición Absoluta de Emojis:** Queda terminantemente prohibido el uso de emojis en títulos, tablas, listas o cuerpo de la documentación técnica.
* **Veracidad y Cero Especulaciones:** Los documentos deben describir única y exclusivamente lo implementado y operativo en el código real.

---

## 2. Mapa Estructural de Secciones (`docs/documentacion/`)

Todo documento técnico nuevo o modificado debe ubicarse estrictamente en la sección temática correspondiente:

```
docs/documentacion/
|-- 01-arquitectura/              # Clean Architecture, DTOs, diagramas de capas y patrones de software.
|-- 02-backend-servicios/         # Controladores REST, autenticación JWT/SSO, RBAC (5 roles) y workflow PEA.
|-- 03-motores-especializados/    # DocumentEngine (PDF iText 9), CoWork (Yjs SignalR), Firmas PKCS#12, Notificaciones.
|-- 04-base-de-datos/             # Frontera SIGAFI (solo lectura), scripts 01 a 04 y normativas externas CES/CACES.
|-- 05-frontend-web/              # Arquitectura React Vite, Geist UI, DOSIERBuilderShell, editor de 11 secciones.
|-- 06-aplicacion-movil/          # Arquitectura React Native Expo, navegación por tabs y vistas docentes.
`-- 07-despliegue-y-operaciones/  # Instalación local, CACES 2026, CI/CD GitHub Actions, Cloudflare SSL y topología AWS EC2.
```

---

## 3. Estándares Académicos para Memoria de Tesis

Cada documento debe redactarse con un lenguaje formal de ingeniería de software e incluir:

1. **Justificación Técnica / Académica:** Explicar el *por qué* de la decisión de diseño (ej. por qué usar Yjs sobre WebSockets en lugar de bloqueos pesimistas en base de datos; por qué Cloudflare Origin CA sobre Let's Encrypt).
2. **Diagramas de Flujo y Arquitectura:** Emplear diagramas de texto plano (ASCII o Mermaid) que ilustren la interacción entre componentes, bases de datos y usuarios.
3. **Tablas de Especificación:**
   * Para APIs: Ruta HTTP, método, roles autorizados, payload de entrada y códigos de respuesta.
   * Para Base de Datos: Nombre de tabla, columnas clave, tipos de datos, llaves foráneas e índices.
   * Para CI/CD e Infraestructura: Variables de entorno, puertos, runners, recursos de hardware y políticas de seguridad.
4. **Cumplimiento Normativo y Auditoría CACES:** Señalar la articulación con el Reglamento de Régimen Académico (RRA), el Modelo Educativo del ISTPET y los criterios de evaluación del CACES 2026.

---

## 4. Protocolo de Sincronización de Índices

Siempre que se agregue, renombre o elimine un archivo `.md`:

1. **Actualizar el Índice General:** Registrar el enlace relativo y una breve descripción en [docs/documentacion/README.md](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/docs/documentacion/README.md).
2. **Actualizar el README Principal:** Si el cambio impacta la arquitectura global, los requisitos de instalación o el despliegue en producción, reflejarlo en [README.md](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/README.md).

---

## 5. Checklist de Verificación Documental

Antes de dar por concluida cualquier intervención técnica:
* [ ] ¿Se crearon o modificaron los `.md` en la subcarpeta correcta de `docs/documentacion/`?
* [ ] ¿Se eliminaron referencias a código o dependencias en desuso?
* [ ] ¿Se actualizaron las rutas y tablas de parámetros si la API cambió?
* [ ] ¿El documento carece al 100% de emojis y mantiene tono profesional en español?
* [ ] ¿Están actualizados los índices en `docs/documentacion/README.md` y `README.md`?
