# 💰 Conversor de Monedas Pro

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://jairo51067.github.io/conversor-monedas-pro/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-orange.svg)]()

Aplicación web profesional para conversión de monedas en tiempo real con tasas oficiales y paralelas de Venezuela y Colombia.

## 🌐 Demo en Vivo

👉 [**Abrir Conversor**](https://jairo51067.github.io/conversor-monedas-pro/)

## ✨ Características

### 💱 Tasas de Cambio en Tiempo Real
- **Dólar BCV Oficial** - Banco Central de Venezuela
- **Euro BCV Oficial** - Banco Central de Venezuela
- **Dólar Paralelo** - Binance P2P
- **TRM Colombia** - Tasa Representativa del Mercado

### 🔄 Conversores Especializados
- Conversor general multi-moneda (USD, EUR, COP, VES)
- Conversor Bolívares ↔ Pesos Colombianos (tiempo real)
- Factores de conversión calculados automáticamente

### 🎨 Experiencia de Usuario
- Interfaz moderna y responsive
- Modal de bienvenida personalizado
- Widget de clima con geolocalización
- Reloj en tiempo real con fecha
- Historial de conversiones persistente

### ⚡ Performance
- Caché inteligente con localStorage (1 hora)
- Sistema de retry automático para APIs
- Carga paralela de datos
- Debounce en inputs para optimización

## 🚀 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+ Modules)
- **APIs**: 
  - [ExchangeRate-API](https://www.exchangerate-api.com/)
  - [DolarAPI Venezuela](https://dolarapi.com/)
  - [Open-Meteo](https://open-meteo.com/)
- **Librerías**: Bootstrap 5, Font Awesome, Animate.css
- **Deploy**: GitHub Pages

## 📦 Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/jairo51067/conversor-monedas-pro.git

# Navegar al directorio
cd conversor-monedas-pro

# Servir con cualquier servidor estático
# Opción 1: Live Server (VS Code)
# Opción 2: Python
python -m http.server 8000
# Opción 3: Node
npx serve

🏗️ Arquitectura

├── js/
│   ├── app.js              # Punto de entrada
│   ├── config.js           # Configuración centralizada
│   └── modules/
│       ├── api.js          # Gestión de APIs
│       ├── converter.js    # Lógica de conversión
│       ├── ui.js           # Manejo de DOM
│       ├── storage.js      # Persistencia
│       ├── utils.js        # Funciones auxiliares
│       ├── clock.js        # Reloj
│       ├── weather.js      # Clima
│       └── greeting.js     # Modal de saludo


📄 Licencia
MIT License - © 2026 Jairo Cárdenas
👨‍💻 Autor
Jairo Cárdenas
📧 jairo.cardenas.dev@gmail.com
⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub.


---

### **FASE 4: Inicializar Git y Subir**

```bash
# 1. Inicializar Git en la nueva carpeta
git init

# 2. Configurar rama principal
git branch -M main

# 3. Agregar todos los archivos
git add .

# 4. Primer commit profesional
git commit -m "🚀 Initial release: Conversor de Monedas Pro v2.0.0

- Arquitectura modular con ES6 modules
- Sistema de caché inteligente con localStorage
- Manejo centralizado de APIs con retry
- Conversión en tiempo real con debounce
- Historial persistente de conversiones
- Widget de clima con geolocalización
- Reloj en tiempo real
- Modal de bienvenida con sessionStorage
- Diseño responsive con Bootstrap 5
- Corrección de problemas CORS"

# 5. Conectar con GitHub (reemplaza con TU URL)
git remote add origin https://github.com/jairo51067/conversor-monedas-pro.git

# 6. Subir a GitHub
git push -u origin main
