# Arquitectura de Aplicación Móvil (React Native + Expo)

## 1. Visión General del Proyecto Móvil (`dosier_mobile`)

El proyecto `dosier_mobile` constituye el cliente móvil del ecosistema DOSIER, desarrollado sobre el stack **React Native** con el marco de trabajo **Expo** y el enrutador basado en archivos **Expo Router** (`app/`).

Su estado de implementación actual se enfoca en el **Sistema de Diseño Vercel Mobile**, proporcionando una biblioteca de componentes táctiles de alta precisión, animaciones fluidas (`react-native-reanimated`) y soporte dual de temas visuales (modo claro y modo oscuro) adaptados a dispositivos móviles.

---

## 2. Estructura de Directorios del Código Fuente (`dosier_mobile/`)

```text
dosier_mobile/
├── app/                  # Enrutador basado en archivos (Expo Router)
│   ├── (tabs)/           # Navegación por pestañas inferiores (Tab Navigator)
│   │   ├── _layout.tsx   # Configuración de barra de pestañas e iconos
│   │   ├── index.tsx     # Pantalla principal (Overview, métricas y Bento Cards)
│   │   └── explore.tsx   # Pantalla de exploración y catálogo de componentes
│   ├── _layout.tsx       # Layout raíz, inyección de fuentes y temas
│   └── modal.tsx         # Ventana modal de interacción
├── components/           # Componentes visuales y catálogo UI Vercel
│   ├── ui/               # Componentes atómicos del sistema de diseño
│   │   ├── bento-card.tsx       # Tarjetas modulares Bento Grid
│   │   ├── vercel-button.tsx    # Botones táctiles de alta interactividad
│   │   ├── vercel-badge.tsx     # Indicadores semánticos de estado
│   │   ├── vercel-modal.tsx     # Modales con fondos opacos
│   │   ├── vercel-tabs.tsx      # Selector de pestañas horizontales
│   │   ├── vercel-toast.tsx     # Sistema de avisos y notificaciones
│   │   ├── progress-bar.tsx     # Indicadores de avance
│   │   ├── background-glow.tsx  # Efectos visuales de iluminación
│   │   └── status-tag.tsx       # Etiquetas de estado
│   ├── themed-text.tsx   # Tipografía reactiva a tema claro/oscuro
│   └── themed-view.tsx   # Contenedores con soporte de tema y resplandor
├── constants/            # Colores, fuentes y espaciados del sistema Geist
├── hooks/                # Hooks personalizados (use-vercel-animations, use-color-scheme)
└── services/             # Servicios de soporte y abstracciones locales
```

---

## 3. Catálogo de Componentes UI Móviles Implementados

El núcleo de la aplicación móvil reside en su catálogo de componentes en `components/ui/`, diseñado bajo las especificaciones de diseño **Vercel Geist**:

1. **`BentoCard`:** Contenedor modular con bordes sobrios, esquinas redondeadas y estados táctiles activos. Permite la visualización compacta de datos estadísticos y bloques de información.
2. **`VercelButton`:** Botón accesible con soporte para múltiples variantes visuales (primario, secundario, contorno), estados deshabilitados y retroalimentación táctil inmediata.
3. **`VercelModal`:** Ventanas modulares para confirmaciones e interacciones emergentes, implementadas con fondos sólidos y encabezados de alta legibilidad.
4. **`VercelTabs`:** Barra de navegación segmentada que administra el intercambio ágil de vistas (`Overview`, `Analytics`, `Settings`) sin recarga de pantalla.
5. **`VercelToast`:** Sistema de alertas efímeras para confirmar acciones del usuario en pantalla.
6. **`use-vercel-animations`:** Integración con `react-native-reanimated` para transiciones de desvanecimiento hacia arriba (`useFadeUp`) y entradas suaves (`useFadeIn`).

---

## 4. Navegación y Pantallas Actuales (`app/`)

* **`HomeScreen` (`app/(tabs)/index.tsx`):**
  * Cabecera con título institucional DOSIER y subtítulo descriptivo.
  * Selector de pestañas (`VercelTabs`) para alternar entre vista general, métricas y ajustes.
  * Cuadrícula de tarjetas `BentoCard` interactivas con números estadísticos (`StatNumber`) y barras de progreso activas (`ProgressBar`).
  * Lanzadores para prueba de modales opacos (`VercelModal`) y toasts flotantes (`VercelToast`).
* **`ExploreScreen` (`app/(tabs)/explore.tsx`):**
  * Catálogo de inspección interactiva para validar las variantes visuales de botones, campos de texto (`VercelInput`), badges semánticos (`VercelBadge`) y divisores.
* **`ModalScreen` (`app/modal.tsx`):**
  * Pantalla de presentación de modales desacoplada del árbol principal de navegación.

---

## 5. Integración con el Ecosistema Institucional

El cliente móvil utiliza TypeScript estricto y tipado compartido para mantener consistencia con los esquemas de diseño web de DOSIER, sirviendo como la base visual sobre la cual interactúa el cuerpo docente y estudiantil del ISTPET en dispositivos iOS y Android.
