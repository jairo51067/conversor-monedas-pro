# 📖 Contexto del Proyecto: Conversor de Monedas Pro

## 🎯 Propósito
"Conversor de Monedas Pro" es una Aplicación Web Progresiva (PWA) de alto rendimiento diseñada para proporcionar conversiones de divisas en tiempo real, con un enfoque especial en las tasas de Venezuela (BCV, Paralelo) y Colombia (TRM), además de incluir herramientas avanzadas como calculadora de oro, estadísticas de mercado y noticias financieras.

## 🏗️ Arquitectura y Stack Tecnológico
- **Frontend:** HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JavaScript (ES6+ Modules).
- **Librerías Externas:** 
  - Bootstrap 5.3.3 (solo utilidades básicas de grid/reset).
  - Font Awesome 6.5.1 (Iconografía).
  - Chart.js (Visualización de datos de tendencias, carga diferida).
- **APIs Externas:** DolarAPI, Open-Meteo (Clima), Gold-API, ExchangeRate-API.
- **Backend/Serverless:** Cloudflare Worker personalizado (`jairo-news-api`) para agregación, limpieza y conversión de feeds RSS (Binance, CriptoNoticias, El Nacional, Diario Los Andes, La Nación) a JSON, evitando problemas de CORS y mejorando el rendimiento.
- **Arquitectura:** Modular (Separación de responsabilidades en `js/modules/`).

##  Diagrama de Arquitectura (Flujo de Datos)
mermaid
graph TD
    User((Usuario)) -->|Interactúa| Frontend[Frontend PWA / HTML5+JS]
    Frontend -->|Fetch Rates| APIs[APIs Externas: DolarAPI, Gold-API, etc.]
    Frontend -->|Fetch News| CF[Cloudflare Worker: jairo-news-api]
    CF -->|Parse RSS| RSS[Feeds RSS: Binance, El Nacional, etc.]
    CF -->|JSON Limpio| Frontend
    Frontend -->|Cache/Offline| SW[Service Worker / LocalStorage]
    Frontend -->|Ads Injection| Config[config.js: AD_CONFIG] 

## 🏗️ Principios de Arquitectura
1. **Modularidad (ES6 Modules):** El código JavaScript está estrictamente separado por responsabilidades (UI, API, Lógica de Negocio, Utilidades) para facilitar el mantenimiento y las pruebas.
2. **Offline-First:** Gracias al Service Worker (`sw.js`), la app es funcional sin conexión, mostrando datos en caché y una página de respaldo (`offline.html`).
3. **Accesibilidad (a11y) y Rendimiento:** Diseñada para obtener puntuaciones de 100/100 en Lighthouse (Accessibility, Best Practices, SEO) y ≥ 90 en Performance.
4. **Mobile-First:** CSS diseñado prioritariamente para dispositivos móviles, escalando elegantemente a tablet y escritorio.
5. **Monetización Segura:** La publicidad (afiliados y clientes) se inyecta de forma diferida (`requestIdleCallback`) con dimensiones fijas para garantizar CLS 0.000 y no afectar el Total Blocking Time (TBT).

## 📏 Estándares de Calidad y Línea Base (Lighthouse Baseline)
Todo nuevo código debe mantener o superar las siguientes métricas de auditoría:
- **Performance:** ≥ 90
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 100

*Ver `STATUS.md` para el reporte de auditoría más reciente y oportunidades de mejora específicas.*

## 📜 REGLAS DE ORO
- ✅ **Mobile-First:** Todo cambio debe verse perfecto en móvil (cards apiladas, sin scroll horizontal)
- ✅ **No romper lo que funciona:** Si vas a modificar lógica existente, pídemel el código actual primero
- ✅ **Cero adivinanzas:** Si necesitas ver un archivo, pídemelo antes de proponer cambios
- ✅ **Modularidad:** Mantén el código limpio, comentado y siguiendo la estructura actual
- ✅ **Commits descriptivos:** Cada cambio importante debe tener su commit
- ✅ **CSS Consolidado:** Eliminar duplicaciones y estilos inline, usar clases reutilizables
- ✅ **Trazabilidad:** No borrar información histórica en CONTEXT/STATUS, solo agregar y actualizar

## 📂 Estructura de Directorios

```text
├── assets/images/          # Activos PWA (Iconos, OG Image, Screenshots para instalabilidad)
├── calculadora.html        # Página dedicada a la calculadora científica/financiera
├── index.html              # Punto de entrada principal (SPA-like, incluye contenedores de ads)
├── js/                     # Lógica de la aplicación (Arquitectura Modular)
│   ├── app.js              # Orquestador principal que inicializa los módulos
│   ├── config.js           # Constantes, claves de API, configuraciones globales y AD_CONFIG (Gestión de publicidad)
│   └── modules/            # Módulos de responsabilidad única (Single Responsibility)
│       ├── api.js          # Gestión de fetch y llamadas a APIs externas
│       ├── clock.js        # Lógica del reloj en tiempo real
│       ├── converter.js    # Lógica matemática de conversión de divisas
│       ├── gold.js         # Lógica y UI de la calculadora de oro
│       ├── greeting.js     # Lógica del mensaje de bienvenida contextual
│       ├── news.js         # Integración, renderizado, filtros de noticias e inyección diferida de publicidad (Dual: Afiliado/Cliente)
│       ├── stats.js        # Gráficos y análisis de tendencias (Chart.js)
│       ├── storage.js      # Abstracción de localStorage (Caché e Historial)
│       ├── theme.js        # Gestión de modo Oscuro/Claro
│       ├── ui.js           # Manipulación segura del DOM y notificaciones Toast
│       ├── utils.js        # Funciones auxiliares (formateo de números, debounce)
│       └── weather.js      # Integración con API del clima (Open-Meteo)
├── manifest.json           # Configuración de la PWA (Nombre, iconos, tema)
├── offline.html            # Página de respaldo cuando no hay conexión a internet
├── README.md               # Documentación para el usuario final y desarrolladores
├── styles-news.css         # Estilos específicos para el módulo de noticias y banners publicitarios (CLS-proof)
├── styles.css              # Hoja de estilos principal (Variables CSS, Grid, Flexbox)
└── sw.js                   # Service Worker (Estrategia: Network First con fallback a Cache)
```

## 📅 HISTORIAL DE SESIONES

###  Sesión: 2026-08-02 (Base)
- Consolidación de la arquitectura modular, PWA, calculadora de oro y métricas base de Lighthouse (Performance 92, resto 100).
- Integración del módulo de noticias con feeds RSS regionales y cripto (Binance, El Nacional, Los Andes, La Nación, etc.) mediante un Cloudflare Worker personalizado (evita CORS, limpia HTML, extrae imágenes).
- Implementación de un **sistema de publicidad dual** (Banner de Afiliado de Binance + Espacio para Clientes) con carga diferida (`requestIdleCallback`) y configuración centralizada en `config.js` (`AD_CONFIG`).
- Aseguramiento de CLS 0.000 mediante contenedores de publicidad con dimensiones fijas (`aspect-ratio` y `min-height`).

### 🆕 Sesión: 2026-08-03 (Correcciones Críticas y Mejora de UX)

#### 🎯 Objetivos Cumplidos
1. **Corrección del Conversor Oficial (100% funcional):** Se identificó y resolvió la falta del método `getConversionRate` en `js/modules/api.js`, que era invocado por `converter.js` pero no existía. Esto restauró la conversión general de divisas.
2. **Resolución de Errores 404 de Módulos:** Se corrigieron las rutas de importación relativas en `js/app.js` (cambio de `'config.js'` a `'./config.js'` y de `'./utils.js'` a `'./modules/utils.js'`) y en `js/modules/api.js` (agregado `import { Storage } from './storage.js'` faltante).
3. **Sistema de Variaciones Reales y Serias:** Se extendió `js/modules/storage.js` con nuevos métodos (`savePreviousRate`, `getRateVariation`, `setRatesWithHistory`) para calcular variaciones absolutas y porcentuales basadas estrictamente en datos históricos del caché. Se garantiza que solo se muestren variaciones reales (no se muestran ceros en la primera carga).
4. **Rediseño Profesional del Modal de Bienvenida (`greeting.js` + `styles.css`):** 
   - Layout en **columna** (`flex-direction: column`) para todas las vistas (móvil, tablet, desktop), mejorando la legibilidad.
   - Lógica condicional para **ocultar variaciones en cero** (primera apertura), evitando ruido visual.
   - Colores accesibles: verde brillante (`#10b981`) para subidas, rojo (`#ef4444`) para bajadas.
5. **Robustez del Service Worker:** Se actualizó `sw.js` a la versión `v3`:
   - Agregados `news.js` y `styles-news.css` a los activos estáticos.
   - Implementada validación `!networkResponse.bodyUsed` antes de clonar respuestas, eliminando el error `InvalidStateError: Failed to execute 'clone' on 'Response'`.
   - Agregado soporte para el Cloudflare Worker de noticias (`jairo-news-api`).

#### 📂 Archivos Modificados en Esta Sesión
- `js/modules/api.js` → Agregado método `getConversionRate`, importación de `Storage`, fallbacks seguros en `getConversionFactors`.
- `js/modules/storage.js` → Nuevos métodos: `savePreviousRate`, `getRateVariation`, `setRatesWithHistory`.
- `js/modules/greeting.js` → Corrección de IDs del DOM (`welcome-bcv` en lugar de `welcome-bcv-value`), lógica de renderizado condicional de variaciones.
- `js/app.js` → Corrección de rutas de importación relativas.
- `sw.js` → Actualización a v3, prevención de errores de clonación, inclusión de módulos de noticias.
- `styles.css` → Optimización y unificación de estilos del Welcome Dashboard en layout de columna, eliminación de duplicados.

## 📋 QUE QUEDÓ O ESTÁ PENDIENTE
- Reemplazar el placeholder `TU_CODIGO_DE_REFERIDO` en `js/config.js` con el enlace de afiliado real de Binance.
- Ejecutar una auditoría Lighthouse final en producción para validar que las nuevas secciones de publicidad y el rediseño del modal mantienen el Performance ≥ 90 y Accessibility 100.
- (Futuro) Adaptar el banner de cliente a formato de imagen (`isImage: true`) cuando se concrete el primer patrocinador.

## PRÓXIMO PASO EXACTO 🎯 OBJETIVO DE LA PRÓXIMA SESIÓN: 
1. Validar el funcionamiento visual y de rendimiento de los dos banners en producción.
2. Actualizar el enlace de afiliado real.
3. (Futuro) Adaptar el banner de cliente a formato de imagen (`isImage: true`) cuando se concrete el primer patrocinador.

## 📝 NOTAS IMPORTANTES
- El código del Cloudflare Worker está respaldado y funcionando. Cualquier cambio en las fuentes de noticias se hace allí.
- La gestión de la publicidad es 100% dinámica desde `js/config.js`. No es necesario tocar `news.js` para cambiar entre un cliente pagando y el enlace de afiliado.
- Se eliminó la duplicidad de secciones de publicidad en el HTML, dejando solo los contenedores `ad-affiliate-container` y `ad-client-container`.
- **🆕 NUEVO:** Las variaciones de tasas solo se muestran cuando hay datos históricos reales en caché (segunda apertura en adelante). Esto garantiza seriedad en los datos financieros mostrados.
- **🆕 NUEVO:** El Service Worker ahora usa la estrategia `Network First` con validación de `bodyUsed` para evitar errores de clonación en respuestas de APIs externas.

## 🌐 DESPLIEGUE
Plataforma: GitHub Pages  
URL: https://jairo51067.github.io/conversor-monedas-pro/  
Dominio: Personalizado (si aplica en el futuro).

## INSTRUCCIONES
¿Listo para empezar? Confírmame que entendiste el contexto y dime qué archivo necesitas ver primero." Es primordial que entiendas en contexto y si necesitas ver el STATUS piedemelo y al final del dia este CONTEXT y STATUS lo actualizamos me lo pasas para sustituirlo y tenerlo al dia y mantener la trazabilidad completa del proyecto. De acuerdo. ¿COMO QUIERES INCIAR HOY?...