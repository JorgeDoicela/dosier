# Guía de Aprovisionamiento, Migración de Servidores y Rotación de Seguridad — DOSIER

Este documento establece el protocolo oficial y reproducible para aprovisionar la plataforma **DOSIER** en cualquier servidor Linux (AWS EC2, VPS o servidor local on-premise), restaurar respaldos de la base de datos institucional SIGAFI, garantizar la compatibilidad estructural de esquemas y rotar credenciales criptográficas de forma segura.

---

## 1. Arquitectura de Despliegue y Aislamiento de Credenciales

Siguiendo el estándar de seguridad de producción y la Ley Orgánica de Protección de Datos Personales (LOPDP):

1. **Cero Secretos en el Repositorio:** Ni `docker-compose.yml`, ni los flujos de GitHub Actions (`deploy.yml`), ni el código fuente contienen contraseñas o claves maestras en texto plano.
2. **Fuente Única de Verdad (`.env`):** Todas las variables sensibles se gestionan en el archivo local `/var/www/dosier/.env` con permisos estrictos de sistema de archivos (`chmod 600`).
3. **Frontera Inviolable SIGAFI:** El sistema DOSIER opera en modo de **solo lectura** sobre la nómina, mallas y períodos de SIGAFI, y en modo de **escritura** exclusivamente sobre sus 54 tablas propias (`doc_*`) y asignaciones RBAC (`idSistema = 6`).

---

## 2. Requisitos Previos del Servidor Host

* **Sistema Operativo:** Ubuntu 22.04 LTS o 24.04 LTS (x86_64).
* **Motor de Contenedores:** Docker Engine 24.0+ y Docker Compose v2.20+.
* **Herramientas de Diagnóstico:** `openssl`, `curl`, `git`, `tar`.
* **Puertos de Red Abiertos:**
  * `80/TCP` (HTTP - Redirección o Let's Encrypt).
  * `443/TCP` (HTTPS - Nginx Proxy con SSL Cloudflare Origin CA).
  * `5000/TCP` (Opcional en LAN - Web API .NET 8).
  * `3306/TCP` (Solo accesible localmente en red Docker bridge).

---

## 3. Protocolo de Aprovisionamiento en un Nuevo Servidor

### Paso 1: Preparación del Directorio y Clonación del Repositorio

```bash
# Crear directorio oficial de despliegue
sudo mkdir -p /var/www/dosier
sudo chown -R $USER:$USER /var/www/dosier
cd /var/www/dosier

# Clonar el repositorio
git clone https://github.com/JorgeDoicela/dosier.git .

# Crear subdirectorios de persistencia
mkdir -p uploads backups certs scripts/base_datos
```

---

### Paso 2: Generación Segura de Credenciales y Archivo `.env`

Genera contraseñas criptográficamente fuertes y configura el archivo `.env`:

```bash
cd /var/www/dosier

# Generar tokens criptográficos
NUEVA_PASS=$(openssl rand -hex 16)
NUEVO_JWT=$(openssl rand -hex 32)

# Crear archivo de variables de entorno
cat <<EOF > /var/www/dosier/.env
DB_ROOT_PASSWORD=$NUEVA_PASS
DB_USER=dosier_user
DB_PASSWORD=$NUEVA_PASS
JWT_SECRET=$NUEVO_JWT
FRONTEND_URL=https://dosier.jorgedoicela.com
ASPNETCORE_ENVIRONMENT=Production
EOF

# Asignar permisos restringidos
chmod 600 /var/www/dosier/.env
```

---

### Paso 3: Inicialización del Contenedor de Base de Datos

```bash
# Levantar el servicio de base de datos MySQL
docker compose up -d dosier-db

# Esperar a que el motor esté en estado saludable (Healthy)
docker compose ps dosier-db
```

---

### Paso 4: Restauración de Datos Maestros SIGAFI (Solo si aplica)

Si dispones de un respaldo institucional previo (`backup_sigafi.sql`), impórtalo antes de aplicar los módulos de DOSIER:

```bash
# Cargar la contraseña desde el archivo .env
export $(grep -v '^#' .env | xargs)

# Importar el dump de SIGAFI a la base de datos sigafi_es
docker compose exec -T dosier-db mysql -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 sigafi_es < /ruta/al/backup_sigafi.sql
```

> [!IMPORTANT]
> Si no dispones de un respaldo institucional externo, ejecuta el semillero no destructivo de prueba:
> ```bash
> docker compose exec -T dosier-db mysql -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 sigafi_es < scripts/base_datos/00_sigafi_esquema_y_datos_demo.sql
> ```

---

### Paso 5: Sincronización de los 4 Esquemas Oficiales de DOSIER

Aplica los 4 scripts en orden cronológico estricto. Todos los scripts están diseñados para operar de forma idempotente y respetan la frontera de solo lectura de SIGAFI:

```bash
cd /var/www/dosier
export $(grep -v '^#' .env | xargs)

# 1. Módulo Base (Plantillas, Firmas, Notificaciones, CoWork y Auditoría)
docker compose exec -T dosier-db mysql -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 sigafi_es < scripts/base_datos/01_sistema_base.sql

# 2. Gobernanza Curricular y Antecedentes Institucionales
docker compose exec -T dosier-db mysql -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 sigafi_es < scripts/base_datos/02_gobernanza_y_antecedentes_curriculares.sql

# 3. Currículum Oficial PEA (11 Secciones CACES/RRA)
docker compose exec -T dosier-db mysql -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 sigafi_es < scripts/base_datos/03_curriculum_pea_oficial.sql

# 4. Seguridad RBAC y Roles Curriculares ISTPET (idSistema = 6)
docker compose exec -T dosier-db mysql -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 sigafi_es < scripts/base_datos/04_seguridad_rbac_roles_curriculares.sql
```

---

### Paso 6: Levantamiento Integral de la Plataforma

```bash
# Descargar las imágenes publicadas en GitHub Container Registry (GHCR)
docker compose pull

# Recrear y encender todos los servicios
docker compose up -d --force-recreate

# Verificar el estado de los contenedores
docker compose ps
```

---

## 4. Resolución de Incidencias Operativas Comunes

### 1. Error de Collation Incompatible (`ERROR 1267: Illegal mix of collations`)
* **Causa:** Ocurre al realizar comparaciones (`=`) o uniones (`JOIN`) entre tablas históricas creadas con `utf8mb4_0900_ai_ci` o `latin1` y tablas de DOSIER creadas con `utf8mb4_unicode_ci`.
* **Solución Arquitectural:** Todos los scripts de DOSIER utilizan conversión explícita `CONVERT(columna USING utf8mb4)` para garantizar interoperabilidad agnóstica a la versión de MySQL del servidor.

### 2. Error de Clave Foránea en Períodos (`ERROR 1215: Cannot add foreign key constraint`)
* **Causa:** La tabla legada `periodos.idPeriodo` es `CHAR(7) CHARACTER SET latin1`.
* **Solución:** Las columnas foráneas en tablas de DOSIER (`doc_expedientes_curriculares.idPeriodo`, `doc_pea_oficial.idPeriodo`, `mallas_periodos.idPeriodo`) definen explícitamente `CHAR(7) CHARACTER SET latin1`.

### 3. Faltante de Tablas `doc_*` tras Restaurar un Backup Manual
* **Causa:** El respaldo de SIGAFI no contenía las tablas del módulo DOSIER.
* **Solución:** Re-ejecutar únicamente los scripts `01`, `02`, `03` y `04` siguiendo el **Paso 5** de este documento y reiniciar el contenedor `dosier-backend`.

---

## 5. Procedimiento de Rotación Periódica de Contraseñas

Para cambiar la contraseña de MySQL en un servidor en producción sin pérdida de datos:

```bash
cd /var/www/dosier

# 1. Generar la nueva contraseña
NUEVA_CLAVE=$(openssl rand -hex 16)
CLAVE_ACTUAL=$(grep '^DB_ROOT_PASSWORD=' .env | cut -d '=' -f2)

# 2. Actualizar las credenciales dentro del motor MySQL
docker compose exec -T dosier-db mysql -u root -p"$CLAVE_ACTUAL" -e "
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$NUEVA_CLAVE';
  ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '$NUEVA_CLAVE';
  FLUSH PRIVILEGES;
"

# 3. Actualizar el archivo .env
sed -i "s/^DB_ROOT_PASSWORD=.*/DB_ROOT_PASSWORD=$NUEVA_CLAVE/" .env
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$NUEVA_CLAVE/" .env

# 4. Recrear contenedores para inyectar la nueva credencial en la API
docker compose up -d --force-recreate dosier-backend dosier-db
```

---

## 6. Verificación de Salud del Sistema (Health Check)

Una vez completado el despliegue, valida los siguientes puntos:

```bash
# 1. Health check de la API REST
curl -i http://localhost:5000/api/ping
# Respuesta esperada: HTTP/1.1 200 OK {"status":"healthy","timestamp":"..."}

# 2. Revisión de logs limpios en el backend
docker logs --tail 30 dosier-backend

# 3. Comprobación de servicios en ejecución
docker compose ps
```
