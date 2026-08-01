# 📖 Contexto del Proyecto: Conversor de Monedas Pro

## 🎯 Propósito
"Conversor de Monedas Pro" es una Aplicación Web Progresiva (PWA) de alto rendimiento diseñada para proporcionar conversiones de divisas en tiempo real, con un enfoque especial en las tasas de Venezuela (BCV, Paralelo) y Colombia (TRM), además de incluir herramientas avanzadas como calculadora de oro, estadísticas de mercado y noticias financieras.

## 🏗️ Arquitectura y Stack Tecnológico
- **Frontend:** HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JavaScript (ES6+ Modules).
- **Librerías Externas:** 
  - Bootstrap 5.3.3 (solo utilidades básicas de grid/reset).
  - Font Awesome 6.5.1 (Iconografía).
  - Chart.js (Visualización de datos de tendencias).
- **APIs Externas:** DolarAPI, Open-Meteo (Clima), Gold-API, ExchangeRate-API.
- **Arquitectura:** Modular (Separación de responsabilidades en `js/modules/`).

## 🏗️ Principios de Arquitectura
1. **Modularidad (ES6 Modules):** El código JavaScript está estrictamente separado por responsabilidades (UI, API, Lógica de Negocio, Utilidades) para facilitar el mantenimiento y las pruebas.
2. **Offline-First:** Gracias al Service Worker (`sw.js`), la app es funcional sin conexión, mostrando datos en caché y una página de respaldo (`offline.html`).
5. **Accesibilidad (a11y) y Rendimiento:** Diseñada para obtener puntuaciones de 100/100 en Lighthouse (Performance, Accessibility, Best Practices, SEO).
6. **Mobile-First:** CSS diseñado prioritariamente para dispositivos móviles, escalando elegantemente a tablet y escritorio.

## 📏 Estándares de Calidad y Línea Base (Lighthouse Baseline)
Todo nuevo código debe mantener o superar las siguientes métricas de auditoría:
- **Performance:** ≥ 90
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 100

*Ver `STATUS.md` para el reporte de auditoría más reciente y oportunidades de mejora específicas.*

## REGLAS DE ORO
- ✅ **Mobile-First:** Todo cambio debe verse perfecto en móvil (cards apiladas, sin scroll horizontal)
- ✅ **No romper lo que funciona:** Si vas a modificar lógica existente, pídemel el código actual primero
- ✅ **Cero adivinanzas:** Si necesitas ver un archivo, pídemelo antes de proponer cambios
- ✅ **Modularidad:** Mantén el código limpio, comentado y siguiendo la estructura actual
- ✅ **Commits descriptivos:** Cada cambio importante debe tener su commit
- ✅ **CSS Consolidado:** Eliminar duplicaciones y estilos inline, usar clases reutilizables


## 📂 Estructura de Directorios

├── assets/images/          # Activos PWA (Iconos, OG Image, Screenshots para instalabilidad)
├── calculadora.html        # Página dedicada a la calculadora científica/financiera
├── index.html              # Punto de entrada principal (SPA-like)
├── js/                     # Lógica de la aplicación (Arquitectura Modular)
│   ├── app.js              # Orquestador principal que inicializa los módulos
│   ├── config.js           # Constantes, claves de API y configuraciones globales
│   └── modules/            # Módulos de responsabilidad única (Single Responsibility)
│       ├── api.js          # Gestión de fetch y llamadas a APIs externas
│       ├── clock.js        # Lógica del reloj en tiempo real
│       ├── converter.js    # Lógica matemática de conversión de divisas
│       ├── gold.js         # Lógica y UI de la calculadora de oro
│       ├── greeting.js     # Lógica del mensaje de bienvenida contextual
│       ├── news.js         # Integración y renderizado de noticias financieras
│       ├── stats.js        # Gráficos y análisis de tendencias (Chart.js)
│       ├── storage.js      # Abstracción de localStorage (Caché e Historial)
│       ├── theme.js        # Gestión de modo Oscuro/Claro
│       ├── ui.js           # Manipulación segura del DOM y notificaciones Toast
│       ├── utils.js        # Funciones auxiliares (formateo de números, debounce)
│       └── weather.js      # Integración con API del clima (Open-Meteo)
├── manifest.json           # Configuración de la PWA (Nombre, iconos, tema)
├── offline.html            # Página de respaldo cuando no hay conexión a internet
├── README.md               # Documentación para el usuario final y desarrolladores
├── styles-news.css         # Estilos específicos para el módulo de noticias
├── styles.css              # Hoja de estilos principal (Variables CSS, Grid, Flexbox)
└── sw.js                   # Service Worker (Estrategia: Network First con fallback a Cache)

## SESIÓN ANTERIOR 

## SESIÓN ACTUAL 

## QUE QUEDO O ESTA PENDIENTE 

## PRÓXIMO PASO EXACTO 🎯 OBJETIVO DE LA PRÓXIMA SESIÓN: 

## NOTAS IMPORTANTES

## 🌐 DESPLIEGUE
Plataforma: GitHub Pages
URL: https://jairo51067.github.io/conversor-monedas-pro/
Dominio: Personalizado (si aplica en el futuro).

¿Listo para empezar? Confírmame que entendiste el contexto y dime qué archivo necesitas ver primero." Es primordial que entiendas en contexto y si necesitas ver el STATUS piedemelo y al final del dia este CONTEXT y STATUS lo actualizamos me lo pasas para sustituirlo y tenerlo al dia y mantener la trazabilidad completa del proyecto. De acuerdo. ¿COMO QUIERES INCIAR HOY?...