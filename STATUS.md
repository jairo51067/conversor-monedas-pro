# 🌐 Despliegue
Plataforma: GitHub Pages
URL: https://jairo51067.github.io/conversor-monedas-pro/
Dominio: Personalizado (si aplica en el futuro).

# 🛠️ Stack Tecnológico
Frontend: HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JavaScript (ES6+).
Librerías Externas: Chart.js (Gráficos), Font Awesome (Iconografía).
APIs: DolarAPI, Open-Meteo (Clima), Gold-API, APIs de noticias financieras.
Usa tu propio Cloudflare Worker (https://jairo-news-api.jairocardenas05.workers.dev/), para obtener las nioticias.

# 📈 Estado del Proyecto (STATUS)

**Última Actualización:** 2026-07-26  
**Versión Actual:** 2.0.0  
**Estado del Despliegue:** ✅ Activo en GitHub Pages  
**URL de Producción:** https://jairo51067.github.io/conversor-monedas-pro/

---

## 🏆 Métricas de Lighthouse (Auditoría Reciente)

| Categoría | Puntuación | Estado |
|-----------|------------|--------|
| **Performance** | **92/100** | 🟢 Excelente |
| **Accessibility** | **100/100** | 🟢 Perfecto |
| **Best Practices** | **100/100** | 🟢 Perfecto |
| **SEO** | **100/100** | 🟢 Perfecto |
| **Agentic Browsing** | **100/100** | 🟢 Perfecto |

### 📊 Métricas de Rendimiento Clave (Core Web Vitals)
- **First Contentful Paint (FCP):** 2.1 s
- **Largest Contentful Paint (LCP):** 3.0 s
- **Total Blocking Time (TBT):** 60 ms
- **Cumulative Layout Shift (CLS):** 0.000

---

## ✅ Tareas Completadas (Done)
- [x] Arquitectura modular ES6 (API, UI, Storage, Utils, etc.).
- [x] Implementación completa de PWA (Manifest, Service Worker con estrategia Network First + Stale While Revalidate).
- [x] Interfaz 100% responsiva y optimizada para móviles (Mobile-First).
- [x] Modo Oscuro/Claro con persistencia en `localStorage`.
- [x] Calculadora de Oro con lógica de pureza y conversión en tiempo real.
- [x] Gráficos de tendencias con Chart.js (con datos determinísticos para evitar parpadeos).
- [x] Correcciones de Accesibilidad (ARIA labels, contraste de colores, orden de encabezados).
- [x] Optimización de SEO (Meta tags, Open Graph, Twitter Cards, Canonical URL).

---

## 🚧 Próximos Pasos (Oportunidades de Mejora detectadas por Lighthouse)

Las siguientes optimizaciones son de **baja prioridad** pero pueden llevar el rendimiento de 92 a 98-100:

1. **Minificación de CSS/JS:** Reducir ~31 KiB combinados de CSS y JS sin minificar.
2. **Eliminar CSS/JS no utilizado:** 
   - CSS no usado: ~38 KiB (principalmente de Bootstrap y estilos de animación no activos).
   - JS no usado: ~63 KiB (principalmente `chart.js`, que podría cargarse de forma diferida o bajo demanda).
3. **Optimización de Fuentes:** Asegurar que `font-display: swap` esté aplicado correctamente a Font Awesome para ahorrar ~930 ms en renderizado.
4. **Compresión de Texto:** Habilitar compresión Brotli/Gzip en el servidor de GitHub Pages (generalmente automático, pero verificar configuración).
5. **Eliminar recursos que bloquean el renderizado:** Diferir la carga de CSS/JS no crítico para ahorrar ~690 ms en el inicio.

---

## 📝 Notas para el Equipo
- La app ya cumple con los estándares de accesibilidad (WCAG AA/AAA) y SEO básico.
- El Service Worker está funcionando correctamente en modo offline.
- Cualquier nueva característica debe mantener la puntuación de Accesibilidad y Best Practices en 100.