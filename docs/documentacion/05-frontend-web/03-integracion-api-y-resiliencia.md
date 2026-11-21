# Integración con API REST, Convenciones de Casing y Resiliencia

## 1. Visión General del Cliente HTTP Centralizado

La capa de comunicación entre el frontend React (`dosier_web`) y la API backend (`dosier_api`) opera a través de un cliente HTTP centralizado basado en **Axios** configurado en `src/api/axios_config.ts`.

Este módulo administra de forma automatizada:
1. La resolución dinámica de la dirección base del servidor (`baseURL`) según el entorno de despliegue.
2. El transporte seguro de credenciales y cookies de sesión mediante `withCredentials: true`.
3. La normalización de respuestas JSON duplicando claves en tiempo de ejecución para garantizar compatibilidad universal (`addCamelCaseKeys`), preservando intactos los documentos y esquemas de plantillas.
4. El control de excepciones de red, códigos de autorización HTTP (401 y 403) y depuración de sesiones vencidas.

> [!IMPORTANT]
> **Consumo Exclusivo mediante la Capa de Servicios (`src/services/`):**
> Queda terminantemente prohibido el uso de `fetch()` nativo o de llamadas directas a métodos Axios (`api.get`, `api.post`, `api.put`, `api.delete`) desde componentes JSX o hooks de vista. Toda comunicación con los controladores de ASP.NET Core debe canalizarse a través de una fachada tipada en `src/services/` (`peaService`, `docenteAsignaturasService`, `notificacionesService`, `auditService`, etc.). Esto garantiza desacoplamiento arquitectónico, contratos de datos predecibles, serialización uniforme y testeabilidad con Vitest.

---

## 2. Resolución Dinámica de URLs y Configuración de Red

Para permitir la interoperabilidad tanto en entornos de desarrollo local como en servidores institucionales bajo Internet Information Services (IIS) o contenedores Docker, `src/api/axios_config.ts` implementa resolución automática de rutas:

```typescript
export function getApiBaseUrl(): string {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // En IIS bajo ruta virtual institucional (/dosier): conecta con '/apiDosier/api'
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dosier')) {
        return '/apiDosier/api';
    }
    // En desarrollo local (localhost): enrutado por proxy de Vite a '/api'
    return '/api';
}

export function getApiRootUrl(): string {
    const base = getApiBaseUrl();
    if (base.endsWith('/api')) {
        return base.slice(0, -4);
    }
    return base || (typeof window !== 'undefined' ? window.location.origin : '');
}
```

### Configuración de la Instancia de Axios

```typescript
const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
```

* **`withCredentials: true`:** Garantiza la transmisión bidireccional de cookies HttpOnly seguras de sesión en cada interacción con la API.
* **Control de expiración HTTP 401:** Al interceptar un código 401 Unauthorized, el cliente purga los indicadores locales de sesión (`localStorage.removeItem('dosier_logged_in')`) y propaga el rechazo para que `AuthContext` redirija oportunamente al inicio de sesión institucional.

---

## 3. Convenciones de Serialización y Duplicación Reactiva de Claves

El backend de DOSIER implementa globalmente la política de serialización JSON `JsonNamingPolicy.SnakeCaseLower` de ASP.NET Core.

### 3.1. Peticiones Salientes (Frontend a Backend)
Toda carga útil (`payload`) enviada mediante métodos `POST`, `PUT` o `PATCH` debe formatearse estrictamente en **`snake_case`** para coincidir con las propiedades de los DTOs de C#, exceptuando aquellos campos con anotaciones explícitas de serialización o metadatos de plantillas dinámicas CACES.

### 3.2. Respuestas Entrantes y Algoritmo `addCamelCaseKeys`
A fin de resolver discrepancias entre el código TypeScript tradicional (`camelCase`) y la respuesta del servidor (`snake_case`), el interceptor de respuesta de Axios ejecuta una duplicación recursiva transparente:

```typescript
api.interceptors.response.use(
    (response) => {
        const url = response.config.url;
        const isDocumentRoute = url && (url.includes('/documents/') || url.includes('/documents'));
        
        // Excepción de diseño: se omiten las rutas de documentos para no corromper los esquemas JSON
        if (response.data && !isDocumentRoute) {
            response.data = addCamelCaseKeys(response.data);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('dosier_logged_in');
        }
        return Promise.reject(error);
    }
);
```

#### Regla de Excepción para Motor Documental (`/documents/`)
Las rutas que involucran `/documents/` transportan esquemas declarativos de plantillas (`DocumentTemplateRegistry`) y capturas de datos (`data_snapshot_json`). Alterar sus claves provocaría discrepancias en los identificadores de campos del PEA. Por tanto, el interceptor excluye estas rutas de la conversión a camelCase.

---

## 4. Flujo de Autenticación y Contexto de Seguridad (`AuthContext.tsx`)

El archivo `src/api/AuthContext.tsx` centraliza la gestión de sesión, la evaluación de roles institucionales y el control de acceso en el frontend.

### 4.1. Estructura de la Entidad de Usuario (`User`)

```typescript
export interface User {
    id_referencia: string;
    nombre_completo: string;
    role: string;
    tipo_usuario: string;
    permissions: string[];
    administrador: boolean;
    roles: string[];
    usuario?: string;
    id_usuario?: number;
    id_sigafi?: string;
    idSigafi?: string;
    id?: number | string;
    role_codes?: string[];
    acepto_lopdp?: boolean;
}
```

### 4.2. Jerarquía Ponderada de Roles Institucionales

DOSIER articula 5 roles institucionales con un esquema de ponderación jerárquica estricta:

| Rol Canónico | Nombre Mostrado en Interfaz | Peso Jerárquico |
| :--- | :--- | :---: |
| `DOSIER_ADMIN` | Administrador del Sistema | **5** |
| `DOSIER_VICERRECTOR` | Vicerrectorado Académico | **4** |
| `DOSIER_COORD_ACAD` | Coordinación Académica | **3** |
| `DOSIER_COORD_CARRERA` | Coordinación de Carrera | **2** |
| `DOSIER_DOCENTE` | Docente | **1** |

### 4.3. Algoritmo de Resolución Canónica (`resolveCanonicalRole`)

Para garantizar coherencia y prevenir escaladas de privilegios:
1. **Usuarios No-Administradores:** La función `resolveCanonicalRole` evalúa la lista de roles devuelta por el servidor y asigna de manera forzosa el rol con el mayor peso jerárquico (`ROLE_HIERARCHY_WEIGHT`), purgando cualquier preferencia residual en el almacenamiento local.
2. **Administradores (`DOSIER_ADMIN`):** Es el único perfil con facultad de conmutar interactivamente su rol activo en sesión (`availableRoles` y `setActiveRole`) para auditar, supervisar y validar flujos curriculares desde la perspectiva de cualquier rol sin alterar los registros de base de datos.

### 4.4. Flags Auxiliares Expuestos por `useAuth()`
El hook `useAuth()` provee banderas booleanas precalculadas para simplificar los renderizados condicionales en el JSX:
* `isAdmin`: Verifica si el usuario posee privilegios de administración global.
* `isDocente`: Usuario con carga lectiva para formulación de PEAs.
* `isCoordCarrera`: Autoridad de carrera para emisión de aval disciplinar.
* `isCoordAcad`: Autoridad académica para revisión y aval metodológico.
* `isVicerrector`: Máxima autoridad institucional para legalización final del PEA.
* `hasPermission(module, operation)`: Verificación granular contra la matriz de permisos.

---

## 5. Proveedor de Confirmaciones Declarativas (`ConfirmContext.tsx`)

`src/api/ConfirmContext.tsx` elimina la necesidad de declarar estados booleanos locales (`isOpen`, `setIsOpen`) en cada vista mediante una API declarativa basada en promesas:

```typescript
const confirm = useConfirm();

const handleDelete = async () => {
    const isConfirmed = await confirm({
        title: 'Eliminar Registro',
        message: '¿Está seguro de trasladar este elemento a la papelera institucional?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        variant: 'destructive',
        position: 'center'
    });

    if (isConfirmed) {
        await peaService.deletePea(uuid);
    }
};
```

### Características Operativas
* **Variantes Semánticas:** `primary` (acento azul institucional), `destructive` (rojo de alerta) y `warning` (ámbar normativo).
* **Accesibilidad por Teclado:** Captura global de la tecla `Escape` para cancelar la acción de forma segura.
* **Diseño Sólido:** Contenedor modal con fondo 100% sólido y opaco (`bg-white` en modo claro, `bg-zinc-950` en modo oscuro), sin transparencias ni difuminados translúcidos.

---

## 6. Proveedor de Notificaciones en Tiempo Real (`NotificationsContext.tsx`)

`src/api/NotificationsContext.tsx` gestiona la comunicación bidireccional y las alertas emergentes de la aplicación:

### 6.1. Transporte SignalR hacia `/notificacionesHub`
* Establece una conexión persistente mediante `@microsoft/signalr` utilizando `getApiRootUrl() + '/notificacionesHub'`.
* Cuenta con reconexión automática (`withAutomaticReconnect`) y sincronización del conteo de notificaciones no leídas (`unreadCount`).

### 6.2. Sistema de Alertas Toast
* Despacha notificaciones flotantes en la esquina superior derecha (`.toast-container-vercel`) mediante el método `addToast(title, body, type, url, onUndo, actionLabel)`.
* **Soporte de Reversión (`onUndo`):** Permite adjuntar callbacks asíncronos para deshacer acciones destructivas directamente desde la alerta.
* **Aislamiento con `ToastErrorBoundary`:** Componente de límite de error que previene que cualquier fallo en la representación visual de una alerta interfiera con la estabilidad del lienzo documental principal.
