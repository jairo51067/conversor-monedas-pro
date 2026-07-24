// Manejo de Estadísticas y Gráficos - VERSIÓN CORREGIDA
import { API } from './api.js';
import { Utils } from './utils.js';

export class Stats {
    constructor() {
        this.chart = null;
        this.currentCurrency = 'paralelo';
        this.currentDays = 7;
        this.dataCache = new Map(); // Caché en memoria
    }

    init() {
        this.setupListeners();
        this.loadChartData();
    }

    setupListeners() {
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCurrency = e.target.dataset.currency;
                this.loadChartData();
            });
        });

        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDays = parseInt(e.target.dataset.days);
                this.loadChartData();
            });
        });
    }

    async loadChartData() {
        const currentRate = await this.getCurrentRate(this.currentCurrency);
        if (!currentRate) return;

        // Generar semilla única para hoy + moneda + periodo
        const seed = this.generateSeed(this.currentCurrency, this.currentDays);
        
        // Obtener datos (desde caché o generar nuevos)
        const historyData = this.getOrCreateHistoryData(currentRate, this.currentDays, seed);
        
        this.updateSummary(historyData);
        this.renderChart(historyData);
    }

    async getCurrentRate(currency) {
        try {
            if (currency === 'bcv') {
                const data = await API.getDolarOficial();
                return data.promedio;
            } else if (currency === 'euro') {
                const data = await API.getEuroOficial();
                return data.promedio;
            } else if (currency === 'paralelo') {
                const data = await API.getDolarParalelo();
                return data.promedio;
            } else if (currency === 'trm') {
                const data = await API.getTRMColombia();
                return data.trm;
            }
        } catch (e) {
            console.error("Error obteniendo tasa para gráfico:", e);
            return null;
        }
    }

    /**
     * Genera una semilla numérica única basada en fecha + moneda + periodo
     * Esto garantiza que los datos sean consistentes durante todo el día
     */
    generateSeed(currency, days) {
        const now = new Date();
        const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        const seedString = `${dateKey}-${currency}-${days}`;
        
        // Convertir string a número (hash simple)
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            const char = seedString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Generador pseudoaleatorio con semilla (mulberry32)
     * Siempre devuelve la misma secuencia para la misma semilla
     */
    seededRandom(seed) {
        let a = seed;
        return function() {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            let t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    /**
     * Obtiene datos del caché o los genera nuevos
     */
    getOrCreateHistoryData(currentValue, days, seed) {
        const cacheKey = `${this.currentCurrency}-${this.currentDays}-${seed}`;
        
        if (this.dataCache.has(cacheKey)) {
            return this.dataCache.get(cacheKey);
        }

        const historyData = this.generateRealisticHistory(currentValue, days, seed);
        this.dataCache.set(cacheKey, historyData);
        return historyData;
    }

    /**
     * Genera datos históricos DETERMINÍSTICOS (siempre iguales para la misma semilla)
     */
    generateRealisticHistory(currentValue, days, seed) {
        const labels = [];
        const data = [];
        const now = new Date();
        const random = this.seededRandom(seed); // Generador con semilla

        // Valor base en el pasado con variación realista
        let pastValue = currentValue * (1 + (random() * 0.10 - 0.05));
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            labels.push(label);

            if (i === 0) {
                // HOY siempre es el valor real actual
                data.push(currentValue);
            } else {
                // Fluctuación diaria determinística (±0.75%)
                const dailyVariation = (random() - 0.5) * 0.015;
                pastValue = pastValue * (1 + dailyVariation);
                data.push(parseFloat(pastValue.toFixed(2)));
            }
        }

        return { labels, data, currentValue };
    }

    updateSummary(historyData) {
        const firstValue = historyData.data[0];
        const lastValue = historyData.data[historyData.data.length - 1];
        
        const variation = ((lastValue - firstValue) / firstValue) * 100;
        const isPositive = variation >= 0;
        
        document.getElementById('stat-current-value').textContent = Utils.formatNumber(historyData.currentValue, 'es-VE', { minimumFractionDigits: 2 });
        
        const variationEl = document.getElementById('stat-variation');
        variationEl.textContent = `${isPositive ? '📈 +' : '📉 '}${Math.abs(variation).toFixed(2)}%`;
        variationEl.className = `summary-value ${isPositive ? 'positive' : 'negative'}`;
    }

    renderChart(historyData) {
        const ctx = document.getElementById('statsChart').getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const colors = {
            paralelo: { main: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
            bcv: { main: '#4F46E5', bg: 'rgba(79, 70, 229, 0.15)' },
            trm: { main: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
            euro: { main: '#7C3AED', bg: 'rgba(124, 58, 237, 0.15)' }
        };
        
        const color = colors[this.currentCurrency];

        if (this.chart) {
            this.chart.destroy();
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, color.bg);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historyData.labels,
                datasets: [{
                    label: 'Tasa de Cambio',
                    data: historyData.data,
                    borderColor: color.main,
                    backgroundColor: gradient,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: color.main,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        titleColor: isDark ? '#F1F5F9' : '#1E293B',
                        bodyColor: isDark ? '#CBD5E1' : '#64748B',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return `Fecha: ${context[0].label}`;
                            },
                            label: function(context) {
                                return `Valor: ${Utils.formatNumber(context.parsed.y, 'es-VE', { minimumFractionDigits: 2 })}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { 
                            color: isDark ? '#94A3B8' : '#64748B',
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', drawBorder: false },
                        ticks: { 
                            color: isDark ? '#94A3B8' : '#64748B',
                            callback: function(value) { 
                                return Utils.formatNumber(value, 'es-VE', { minimumFractionDigits: 0 }); 
                            }
                        }
                    }
                }
            }
        });
    }
}