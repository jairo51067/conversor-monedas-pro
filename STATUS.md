# 🌐 Despliegue
Plataforma: GitHub Pages
URL: https://jairo51067.github.io/conversor-monedas-pro/
Dominio: Personalizado (si aplica en el futuro).

# 🛠️ Stack Tecnológico
Frontend: HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JavaScript (ES6+).
Librerías Externas: Chart.js (Gráficos, carga diferida), Font Awesome (Iconografía).
APIs: DolarAPI, Open-Meteo (Clima), Gold-API, ExchangeRate-API.
Backend/Serverless: Cloudflare Worker personalizado (https://jairo-news-api.jairocardenas05.workers.dev/) para agregación, limpieza y conversión de feeds RSS (Binance, CriptoNoticias, El Nacional, Diario Los Andes, La Nación) a JSON, evitando problemas de CORS.

# 📈 Estado del Proyecto (STATUS)

**Última Actualización:** 2026-08-02  
**Versión Actual:** 3.1.0  
**Estado del Despliegue:** ✅ Activo en GitHub Pages  
**URL de Producción:** https://jairo51067.github.io/conversor-monedas-pro/

## 📜 Mini-Changelog Semántico
| Versión | Fecha | Cambios Clave |
|---------|-------|---------------|
| **3.1.0** | 2026-08-02 | Integración de noticias RSS vía Cloudflare Worker, filtros accesibles y sistema de publicidad dual con carga diferida. |
| **3.0.0** | 2026-07-XX | Consolidación de arquitectura modular, PWA offline-first y calculadora de oro. |
| **2.0.0** | 2026-07-26 | Versión base con tasas BCV, Paralelo, TRM y métricas Lighthouse base. |

## 🏆 Métricas de Lighthouse (Auditoría Reciente)

| Categoría | Puntuación | Estado |
|-----------|------------|--------|
| **Performance** | **92/100** | 🟢 Excelente (Objetivo: Mantener con la nueva inyección diferida de ads) |
| **Accessibility** | **100/100** | 🟢 Perfecto |
| **Best Practices** | **100/100** | 🟢 Perfecto |
| **SEO** | **100/100** | 🟢 Perfecto |
| **Agentic Browsing** | **100/100** | 🟢 Perfecto |

### 📊 Métricas de Rendimiento Clave (Core Web Vitals)
- **First Contentful Paint (FCP):** 2.1 s
- **Largest Contentful Paint (LCP):** 3.0 s
- **Total Blocking Time (TBT):** 60 ms (Protegido por `requestIdleCallback` en módulos de ads)
- **Cumulative Layout Shift (CLS):** 0.000 (Garantizado por dimensiones fijas en contenedores de publicidad)

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
- [x] **NUEVO:** Integración del módulo de noticias con feeds RSS regionales y cripto vía Cloudflare Worker (sin CORS, con limpieza de HTML y extracción inteligente de imágenes).
- [x] **NUEVO:** Implementación de filtros de noticias accesibles (Todas, Cripto, Regional) con gestión de estado (`aria-selected`).
- [x] **NUEVO:** Sistema de publicidad dual (Banner de Afiliado + Espacio para Clientes) con inyección diferida (`requestIdleCallback`) y configuración centralizada en `config.js` (`AD_CONFIG`).
- [x] **NUEVO:** Garantía de CLS 0.000 en nuevos contenedores dinámicos mediante el uso de `aspect-ratio` y `min-height` en CSS.

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
6. **NUEVO:** Validar en producción que la inyección diferida de los dos banners publicitarios mantiene el TBT < 60ms y no introduce regresiones en el CLS.

---

## 📝 Notas para el Equipo
- La app ya cumple con los estándares de accesibilidad (WCAG AA/AAA) y SEO básico.
- El Service Worker está funcionando correctamente en modo offline.
- Cualquier nueva característica debe mantener la puntuación de Accesibilidad y Best Practices en 100.
- **NUEVO:** La gestión de la publicidad es 100% dinámica desde `js/config.js` (`AD_CONFIG`). No es necesario tocar la lógica de `news.js` para cambiar entre un cliente pagando y el enlace de afiliado.
- **NUEVO:** El código del Cloudflare Worker está respaldado. Cualquier adición de nuevas fuentes de noticias se realiza exclusivamente en el Worker.

## ✅ Checklist de Validación Pre-Deploy
*Marcar antes de hacer `git push` a la rama principal:*
- [ ] **Lighthouse:** Ejecutar auditoría y verificar Performance ≥ 90, Accessibility/Best Practices/SEO = 100.
- [ ] **CLS Check:** Verificar en modo incógnito que no hay saltos visuales al cargar los banners de publicidad.
- [ ] **Limpieza de Código:** Asegurar que no queden `console.log()` de depuración en los módulos JS.
- [ ] **Enlaces Patrocinados:** Confirmar que todos los banners de ads tienen el atributo `rel="noopener noreferrer sponsored"`.
- [ ] **Mobile-First:** Probar la interacción de los filtros de noticias y los banners en un dispositivo móv