// Punto de entrada principal de la aplicación
import { CONFIG } from './config.js';
import { API } from './modules/api.js';
import { Converter } from './modules/converter.js';
import { UI } from './modules/ui.js';
import { Storage } from './modules/storage.js';
import { Utils } from './modules/utils.js';
import { Clock } from './modules/clock.js';
import { Weather } from './modules/weather.js';
import { Greeting } from './modules/greeting.js';
import { Theme } from './modules/theme.js';

class App {
    constructor() {
        this.factors = {
            factor1: 0,
            factor2: 0,
            factor3: 0
        };
        this.clock = new Clock();
        this.weather = new Weather();
        this.greeting = new Greeting();
        this.theme = new Theme();
    }

    async init() {
        try {
            this.theme.apply();
            this.theme.setupListeners();

            await this.loadAllData();
            this.loadCurrencies();
            this.setupEventListeners();
            this.setupSidebarMenu();
            this.startServices();
            this.loadConversionHistory();
            
            this.greeting.show();
            this.greeting.setupListeners();
            
            console.log('✅ Aplicación inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar:', error);
            UI.showToast('Error al cargar algunos datos', 'error');
        }
    }

    async loadAllData() {
        await Promise.all([
            this.loadExchangeRates(),
            this.loadBCVData(),
            this.loadParaleloData(),
            this.loadEuroData(),
            this.loadTRMData(),
            this.loadConversionFactors()
        ]);
    }

    async loadExchangeRates() {
        try {
            await API.getExchangeRates('USD');
        } catch (error) {
            console.error('Error loading exchange rates:', error);
        }
    }

    async loadBCVData() {
        try {
            const data = await API.getDolarOficial();
            UI.updateRateDisplay('resultadoBcv', data, '1 USD =');
        } catch (error) {
            UI.showError('resultadoBcv', 'Error al cargar datos');
        }
    }

    async loadParaleloData() {
        try {
            const data = await API.getDolarParalelo();
            UI.updateRateDisplay('resultadoParalelo', data, '1 USDT =');
        } catch (error) {
            UI.showError('resultadoParalelo', 'Error al cargar datos');
        }
    }

    async loadEuroData() {
        try {
            const data = await API.getEuroOficial();
            UI.updateRateDisplay('resultadoEuroOficial', data, '1 EUR =');
        } catch (error) {
            UI.showError('resultadoEuroOficial', 'Error al cargar datos');
        }
    }

    async loadTRMData() {
        try {
            const data = await API.getTRMColombia();
            UI.updateTRMDisplay('valorDolarTRM', data.trm);
        } catch (error) {
            UI.showError('valorDolarTRM', 'Error al cargar TRM');
        }
    }

    async loadConversionFactors() {
        try {
            this.factors = await API.getConversionFactors();
            
            UI.updateFactorDisplay('factor-value', this.factors.factor1);
            UI.updateFactorDisplay('factor-value-2', this.factors.factor2);
            UI.updateFactorDisplay('factor-value-3', this.factors.factor3);
        } catch (error) {
            console.error('Error loading factors:', error);
        }
    }

    loadCurrencies() {
        const fromSelect = document.getElementById('from');
        const toSelect = document.getElementById('to');

        if (!fromSelect || !toSelect) return;

        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        CONFIG.CURRENCIES.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency.code;
            option1.textContent = `${currency.name} (${currency.code})`;
            fromSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency.code;
            option2.textContent = `${currency.name} (${currency.code})`;
            toSelect.appendChild(option2);
        });

        fromSelect.value = CONFIG.DEFAULT_CURRENCY.FROM;
        toSelect.value = CONFIG.DEFAULT_CURRENCY.TO;

        console.log('✅ Currencies loaded in selectors');
    }

    setupEventListeners() {
        const currencyForm = document.getElementById('currency-form');
        if (currencyForm) {
            currencyForm.addEventListener('submit', (e) => this.handleConversion(e));
        }

        this.setupRefreshButton('refresh', () => this.loadExchangeRates());
        this.setupRefreshButton('actualizar', () => this.loadBCVData());
        this.setupRefreshButton('actualizarEuro', () => this.loadEuroData());
        this.setupRefreshButton('actualizarParalelo', () => this.loadParaleloData());
        this.setupRefreshButton('actualizarTRM', () => this.loadTRMData());

        this.setupToggle('show-converter', 'close-converter', 'converter-container');
        this.setupToggle('show-converter-paralelo', 'close-converter-paralelo', 'convertir-a-paralelo');

        const inputBolivares = document.getElementById('input-bolivares');
        if (inputBolivares) {
            inputBolivares.addEventListener('input', Utils.debounce(() => {
                this.convertBsToCopRealtime();
            }, 300));
        }

        const inputPesos = document.getElementById('input-pesos');
        if (inputPesos) {
            inputPesos.addEventListener('input', Utils.debounce(() => {
                this.convertCopToBsRealtime();
            }, 300));
        }
    }

    /**
     * Configura el menú lateral (sidebar)
     */
    setupSidebarMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('app-sidebar');
        const sidebarClose = document.getElementById('sidebar-close');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        // Abrir menú
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        // Cerrar menú
        const closeSidebar = () => {
            sidebar.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

        // Actualizar label del tema en el menú
        this.updateMenuThemeLabel();

        // Botón de tema en menú
        const menuThemeBtn = document.getElementById('menu-theme');
        if (menuThemeBtn) {
            menuThemeBtn.addEventListener('click', () => {
                this.theme.toggle();
                this.updateMenuThemeLabel();
                UI.showToast('Tema actualizado', 'success');
            });
        }

        // Actualizar todas las tasas
        const refreshAllBtn = document.getElementById('menu-refresh-all');
        if (refreshAllBtn) {
            refreshAllBtn.addEventListener('click', async () => {
                UI.showToast('Actualizando todas las tasas...', 'info');
                await this.loadAllData();
                UI.showToast('Todas las tasas actualizadas', 'success');
                closeSidebar();
            });
        }

        // Compartir app
        const shareBtn = document.getElementById('menu-share');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const shareData = {
                    title: 'Conversor de Monedas Pro',
                    text: 'Convierte monedas con tasas en tiempo real',
                    url: window.location.href
                };

                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else {
                        await navigator.clipboard.writeText(window.location.href);
                        UI.showToast('Enlace copiado al portapapeles', 'success');
                    }
                } catch (error) {
                    console.error('Error sharing:', error);
                }
                closeSidebar();
            });
        }

        // Limpiar caché
        const clearCacheBtn = document.getElementById('menu-clear-cache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                localStorage.clear();
                UI.showToast('Caché limpiado. Recarga la página.', 'success');
                closeSidebar();
            });
        }

        // Mostrar historial
        const showHistoryBtn = document.getElementById('menu-show-history');
        if (showHistoryBtn) {
            showHistoryBtn.addEventListener('click', () => {
                this.showHistoryModal();
                closeSidebar();
            });
        }

        // Mostrar acerca de
        const aboutBtn = document.getElementById('menu-about');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => {
                this.openModal('modal-about');
                closeSidebar();
            });
        }

        // Limpiar historial
        const clearHistoryBtn = document.getElementById('btn-clear-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                Storage.clearHistory();
                this.loadConversionHistory();
                this.showHistoryModal();
                UI.showToast('Historial limpiado', 'success');
            });
        }

        // Cerrar modales
        document.querySelectorAll('.modal-custom-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                this.closeModal(modalId);
            });
        });

        // Cerrar modal al hacer clic en overlay
        document.querySelectorAll('.modal-custom-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-custom');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    updateMenuThemeLabel() {
        const label = document.getElementById('menu-theme-label');
        const icon = document.querySelector('#menu-theme i');
        if (label && icon) {
            if (this.theme.currentTheme === 'dark') {
                label.textContent = 'Cambiar a Modo Claro';
                icon.className = 'fas fa-sun';
            } else {
                label.textContent = 'Cambiar a Modo Oscuro';
                icon.className = 'fas fa-moon';
            }
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showHistoryModal() {
        const history = Storage.getConversionHistory();
        const list = document.getElementById('modal-history-list');
        
        if (!list) return;

        list.innerHTML = '';

        if (history.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No hay conversiones en el historial</p>';
        } else {
            history.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                
                const date = new Date(item.timestamp).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                div.innerHTML = `
                    <div>
                        <strong>${Utils.formatNumber(item.amount)} ${item.from}</strong>
                        <br>
                        <small style="color: var(--text-secondary);">= ${Utils.formatNumber(item.result)} ${item.to}</small>
                    </div>
                    <div class="history-date">${date}</div>
                `;
                list.appendChild(div);
            });
        }

        this.openModal('modal-history');
    }

    setupRefreshButton(buttonId, callback) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', async () => {
                UI.showToast('Actualizando...', 'info');
                await callback();
                UI.showToast('Actualizado correctamente', 'success');
            });
        }
    }

    setupToggle(showId, hideId, containerId) {
        const showBtn = document.getElementById(showId);
        const hideBtn = document.getElementById(hideId);

        if (showBtn) {
            showBtn.addEventListener('click', () => {
                UI.toggleVisibility(containerId, true);
            });
        }

        if (hideBtn) {
            hideBtn.addEventListener('click', () => {
                UI.toggleVisibility(containerId, false);
            });
        }
    }

    async handleConversion(event) {
        event.preventDefault();

        const amountInput = document.getElementById('amount');
        const fromSelect = document.getElementById('from');
        const toSelect = document.getElementById('to');
        const resultParagraph = document.getElementById('result');

        const amount = amountInput.value;
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;

        if (!amount || !fromCurrency || !toCurrency) {
            resultParagraph.textContent = 'Por favor, completa todos los campos.';
            return;
        }

        try {
            const result = await Converter.convert(amount, fromCurrency, toCurrency);
            UI.updateConversionResult('result', amount, fromCurrency, result, toCurrency);
            
            Converter.saveToHistory(amount, fromCurrency, result, toCurrency);
            this.loadConversionHistory();
            
            UI.showToast('Conversión exitosa', 'success');
        } catch (error) {
            resultParagraph.textContent = 'Error al obtener la tasa de conversión. Intenta de nuevo más tarde.';
            UI.showToast('Error en la conversión', 'error');
        }
    }

    convertBsToCopRealtime() {
        const input = document.getElementById('input-bolivares');
        const result = document.getElementById('resultado-cop');

        if (!input || !result) return;

        const bolivares = parseFloat(input.value);
        
        if (this.factors.factor1 > 0 && !isNaN(bolivares) && bolivares >= 0) {
            const cop = Converter.convertBsToCop(bolivares, this.factors.factor1);
            result.innerText = Utils.formatCurrency(cop, 'COP');
        } else {
            result.innerText = '$ 0,00';
        }
    }

    convertCopToBsRealtime() {
        const input = document.getElementById('input-pesos');
        const result = document.getElementById('resultado-bs');

        if (!input || !result) return;

        const pesos = parseFloat(input.value);
        
        if (this.factors.factor1 > 0 && !isNaN(pesos) && pesos >= 0) {
            const bs = Converter.convertCopToBs(pesos, this.factors.factor1);
            result.innerText = Utils.formatCurrency(bs, 'VES', 'es-VE');
        } else {
            result.innerText = 'Bs. 0,00';
        }
    }

    loadConversionHistory() {
        const history = Storage.getConversionHistory();
        const list = document.getElementById('history-list');
        
        if (!list) return;

        list.innerHTML = '';
        
        if (history.length === 0) {
            list.innerHTML = '<li style="text-align: center; color: var(--text-tertiary);">Sin conversiones recientes</li>';
            return;
        }

        history.slice(0, 5).forEach(item => {
            const text = `${Utils.formatNumber(item.amount)} ${item.from} = ${Utils.formatNumber(item.result)} ${item.to}`;
            UI.addHistoryItem('history-list', text);
        });
    }

    startServices() {
        this.clock.start();
        this.weather.init();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});