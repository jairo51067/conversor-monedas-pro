🌐 Despliegue
Plataforma: GitHub Pages
URL: https://jairo51067.github.io/conversor-monedas-pro/
Dominio: Personalizado (si aplica en el futuro).

🛠️ Stack Tecnológico
Frontend: HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JavaScript (ES6+).
Librerías Externas: Chart.js (Gráficos), Font Awesome (Iconografía).
APIs: DolarAPI, Open-Meteo (Clima), Gold-API, APIs de noticias financieras.

### 📄 2. Archivo `STATUS.md`

_Este es un documento vivo. Se actualiza en cada sprint o cambio mayor para saber exactamente en qué punto está el desarrollo._

# 📈 Estado del Proyecto (Status)

**Última Actualización:** 2026-07-10  
**Versión Actual:** v3.0.0 (Refactorización Profesional y PWA)  
**Estado del Despliegue:** ✅ Activo en GitHub Pages

---

## ✅ Características Completadas (Done)

- [x] **Arquitectura Modular:** Migración completa a ES6 Modules (`app.js` + carpeta `modules/`).
- [x] **PWA Completa:** `manifest.json` configurado con iconos maskable, `sw.js` con estrategia _Network First_ y página `offline.html`.
- [x] **Rendimiento y SEO:** Optimización para obtener 100/100 en Lighthouse (Auditoría de rendimiento, accesibilidad, SEO y mejores prácticas).
- [x] **Módulo de Tasas:** Visualización en tiempo real de BCV, Paralelo, Euro y TRM con diseño de tarjetas profesional.
- [x] **Calculadora de Oro:** Implementación completa con cálculo de pureza (Kilates), peso y márgenes de compra/venta.
- [x] **Módulo de Estadísticas:** Gráficos interactivos con Chart.js para visualizar tendencias (7D, 30D, 1A).
- [x] **Módulo de Noticias:** Integración de feed de noticias financieras con diseño responsivo y caché.
- [x] **Accesibilidad (a11y):** Corrección de contrastes, atributos ARIA, y navegación por teclado.
- [x] **Gestión de Estado:** Sistema robusto de `localStorage` para caché de tasas e historial de conversiones.

---

## 🚧 En Progreso / Enfoque Actual (In Progress)

- [x] **Documentación y Trazabilidad:** Creación de `CONTEXT.md` y `STATUS.md` para estandarizar el flujo de trabajo.
- [ ] **Refinamiento de Datos Históricos:** Actualmente, el módulo de estadísticas (`stats.js`) utiliza una simulación realista para el historial. _Próximo paso:_ Conectar con una API gratuita de series de tiempo (ej. ExchangeRate-API histórico o similar) para reemplazar la simulación por datos reales.

---

## 🐛 Problemas Conocidos / Deuda Técnica (Known Issues)

1. **Límites de API:** Las APIs gratuitas (como Gold-API o las de noticias) tienen límites de rate-limit. El sistema de caché en `storage.js` mitiga esto, pero en uso masivo podría requerir un backend proxy propio.
2. **Mapa de Sitio (Sitemap):** Falta generar un `sitemap.xml` para mejorar aún más el SEO en motores de búsqueda.

---

## 🗺️ Hoja de Ruta (Roadmap) - Próximos Pasos

1. **Corto Plazo:**
   - Integrar una API de datos históricos real para el módulo de Estadísticas.
   - Agregar un `sitemap.xml` y mejorar los metadatos de `robots.txt`.
2. **Mediano Plazo:**
   - Implementar un "Install Prompt" personalizado para animar al usuario a instalar la PWA en su pantalla de inicio.
   - Agregar soporte para múltiples idiomas (i18n) usando un archivo JSON de traducciones.
3. **Largo Plazo:**
   - Migrar el almacenamiento de `localStorage` a `IndexedDB` (vía librería como `idb`) para manejar grandes volúmenes de historial de conversiones sin bloquear el hilo principal.

---

## 📝 Notas para Desarrolladores

- Al agregar un nuevo módulo, crear el archivo en `js/modules/`, registrarlo en `app.js` y actualizar este archivo `STATUS.md`.
- Seguir la convención de nomenclatura: `camelCase` para variables/funciones, `PascalCase` para Clases.
- Antes de hacer push a `main`, ejecutar una auditoría rápida de Lighthouse en localhost.
