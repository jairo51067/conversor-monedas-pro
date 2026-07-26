# 💰 Conversor Pro

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://jairo51067.github.io/conversor-monedas-pro/)
[![PWA](https://img.shields.io/badge/PWA-100/100-blue)]()
[![Lighthouse](https://img.shields.io/badge/Lighthouse-100/100-green)]()

Aplicación Web Progresiva (PWA) financiera de nivel profesional para conversión de monedas, cálculo de oro y análisis de tendencias en tiempo real.

## 🌐 Demo en Vivo
👉 [**Abrir Conversor Pro**](https://jairo51067.github.io/conversor-monedas-pro/)

##  Características Principales
- **Tasas en Tiempo Real:** BCV, Dólar Paralelo (Binance), Euro BCV y TRM Colombia.
- **Calculadora de Oro Educativa:** Cálculo en tiempo real con API internacional, explicación de pureza (Kilates) y márgenes de compra/venta.
- **Estadísticas y Tendencias:** Gráficos determinísticos (Chart.js) de 7D, 30D y 1 Año.
- **Modo Offline-First:** Service Worker Híbrido Pro que garantiza el funcionamiento sin internet.
- **UX/UI Premium:** Modo oscuro/claro, micro-interacciones, diseño mobile-first y calculadora con feedback háptico.

## ️ Arquitectura Técnica (Estándar PWA Pro v2.0)
- **Frontend:** HTML5, CSS3 (Variables, Grid, Flexbox), JavaScript (ES6+ Modules).
- **PWA:** Manifest.json con iconos maskable, Service Worker (Network First + Stale-While-Revalidate).
- **APIs:** DolarAPI, ExchangeRate-API, Gold-API, Open-Meteo.
- **Librerías:** Bootstrap 5, Font Awesome, Chart.js.

## 📦 Instalación Local
```bash
git clone https://github.com/jairo51067/conversor-monedas-pro.git
cd conversor-monedas-pro
# Servir con Live Server (VS Code) o Python:
python -m http.server 8000

👨‍ Autor
Jairo Cárdenas | Tech Lead & Frontend Developer
📧 jairo.cardenas.dev@gmail.com


