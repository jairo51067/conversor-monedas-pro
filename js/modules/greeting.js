// Manejo del Welcome Dashboard
import { API } from './api.js';
import { Storage } from './storage.js';
import { Utils } from './utils.js';

export class Greeting {
    constructor() {
        this.modalId = 'modalSaludo';
        this.storageKey = 'greetingShown';
        this.tips = [
            "💡 Tip: Revisa las estadísticas para ver tendencias de 7D, 30D y 1 año",
            "📊 Tip: Usa el conversor Bs↔COP para transacciones rápidas en tiempo real",
            "🌙 Tip: Activa el modo oscuro para mejor experiencia nocturna",
            "🔄 Tip: Actualiza las tasas manualmente si necesitas datos frescos",
            "📱 Tip: Agrega la app a tu pantalla de inicio para acceso rápido",
            "💱 Tip: La brecha cambiaria te indica la diferencia entre BCV y Paralelo",
            " Tip: Los factores de conversión te ayudan a calcular TRM vs tasas locales"
        ];
    }

    /**
     * Muestra el saludo si no se ha mostrado antes en esta sesión
     */
    async show() {
        const alreadyShown = sessionStorage.getItem(this.storageKey);
        
        if (alreadyShown) {
            console.log('ℹ️ Greeting already shown in this session');
            return;
        }

        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.warn('⚠️ Greeting modal not found in DOM');
            return;
        }

        // Cargar datos del dashboard
        await this.loadDashboardData();

        modal.classList.add('active');
        sessionStorage.setItem(this.storageKey, 'true');
        console.log('✅ Welcome dashboard shown');
    }

    /**
     * Cierra el modal
     */
    close() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('active');
            console.log('✅ Welcome dashboard closed');
        }
    }

    /**
     * Configura event listeners
     */
    setupListeners() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const closeBtn = modal.querySelector('.welcome-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Cerrar al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });
    }

    /**
     * Carga todos los datos del dashboard
     */
    async loadDashboardData() {
        try {
            // Saludo personalizado
            this.updateGreeting();

            // Cargar tasas en paralelo
            const [bcvData, paraleloData, trmData] = await Promise.all([
                API.getDolarOficial().catch(() => null),
                API.getDolarParalelo().catch(() => null),
                API.getTRMColombia().catch(() => null)
            ]);

            // Actualizar valores en el modal
            if (bcvData) {
                document.getElementById('welcome-bcv').textContent = Utils.formatNumber(bcvData.promedio, 'es-VE', { minimumFractionDigits: 2 });
            }
            if (paraleloData) {
                document.getElementById('welcome-paralelo').textContent = Utils.formatNumber(paraleloData.promedio, 'es-VE', { minimumFractionDigits: 2 });
            }
            if (trmData) {
                document.getElementById('welcome-trm').textContent = Utils.formatNumber(trmData.trm, 'es-CO', { minimumFractionDigits: 0 });
            }

            // Calcular y mostrar insight
            if (bcvData && paraleloData) {
                this.updateInsight(bcvData.promedio, paraleloData.promedio);
            }

            // Tip rotativo
            this.updateTip();

            // Estado de actualización
            this.updateLastUpdate();

        } catch (error) {
            console.error('❌ Error loading welcome dashboard:', error);
            document.getElementById('welcome-insight-text').textContent = 'No se pudieron cargar los datos del mercado';
        }
    }

    /**
     * Actualiza el saludo según la hora del día
     */
    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = '👋 ¡Hola!';
        
        if (hour >= 5 && hour < 12) {
            greeting = '️ ¡Buenos días!';
        } else if (hour >= 12 && hour < 19) {
            greeting = '️ ¡Buenas tardes!';
        } else {
            greeting = '🌙 ¡Buenas noches!';
        }

        const greetingEl = document.getElementById('welcome-greeting');
        if (greetingEl) {
            greetingEl.textContent = greeting;
        }
    }

    /**
     * Calcula y muestra el insight del día
     */
    updateInsight(bcvValue, paraleloValue) {
        const brecha = ((paraleloValue - bcvValue) / bcvValue) * 100;
        const isPositive = brecha >= 0;
        
        let insightText = '';
        
        if (Math.abs(brecha) < 5) {
            insightText = `La brecha cambiaria es mínima (${brecha.toFixed(1)}%). Tasas muy cercanas.`;
        } else if (isPositive) {
            insightText = `El paralelo está ${brecha.toFixed(1)}% por encima del BCV. Brecha significativa.`;
        } else {
            insightText = `El paralelo está ${Math.abs(brecha).toFixed(1)}% por debajo del BCV. Situación inusual.`;
        }

        const insightEl = document.getElementById('welcome-insight-text');
        if (insightEl) {
            insightEl.textContent = insightText;
        }
    }

    /**
     * Selecciona y muestra un tip rotativo
     */
    updateTip() {
        // Usar el día del año como índice para rotar tips diariamente
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        const tipIndex = dayOfYear % this.tips.length;
        const tipText = this.tips[tipIndex];

        const tipEl = document.getElementById('welcome-tip-text');
        if (tipEl) {
            tipEl.textContent = tipText;
        }
    }

    /**
     * Muestra cuándo se actualizaron las tasas por última vez
     */
    updateLastUpdate() {
        const ratesData = Storage.getRates('exchange_rates_cache_USD');
        const lastUpdateEl = document.getElementById('welcome-last-update');
        
        if (!lastUpdateEl) return;

        if (ratesData && ratesData.timestamp) {
            const minutesAgo = Math.floor((Date.now() - ratesData.timestamp) / 60000);
            
            if (minutesAgo < 1) {
                lastUpdateEl.textContent = 'Actualizado: hace menos de 1 minuto';
            } else if (minutesAgo < 60) {
                lastUpdateEl.textContent = `Actualizado: hace ${minutesAgo} minuto${minutesAgo > 1 ? 's' : ''}`;
            } else {
                const hoursAgo = Math.floor(minutesAgo / 60);
                lastUpdateEl.textContent = `Actualizado: hace ${hoursAgo} hora${hoursAgo > 1 ? 's' : ''}`;
            }
        } else {
            lastUpdateEl.textContent = 'Actualizado: ahora';
        }
    }
}

