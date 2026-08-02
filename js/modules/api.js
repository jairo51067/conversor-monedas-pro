// js/modules/api.js
import { CONFIG } from '../config.js';
import { Utils } from './utils.js';
import { Storage } from './storage.js'; // ✅ ¡ESTA LÍNEA FALTABA!

export class API {
    /**
     * Fetch genérico con reintentos y cache bypass
     */
    static async fetchWithRetry(url, options = {}) {
        return Utils.retryAsync(async () => {
            const fetchOptions = {
                method: 'GET',
                cache: 'no-cache',
                mode: 'cors',
                ...options
            };

            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }, 3);
    }

    /**
     * ✅ MÉTODO AGREGADO: Obtiene la tasa de conversión específica entre dos monedas
     */
    static async getConversionRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return 1;
        try {
            const data = await this.fetchWithRetry(`${CONFIG.APIs.EXCHANGE_RATE}${fromCurrency}`);
            return data.rates[toCurrency] || null;
        } catch (error) {
            console.error(`❌ Error fetching rate from ${fromCurrency} to ${toCurrency}:`, error);
            throw new Error('Tasa de cambio no disponible');
        }
    }

    /**
     * Obtiene tasas de cambio generales (ExchangeRate-API)
     */
    static async getExchangeRates(baseCurrency = 'USD') {
        try {
            const data = await this.fetchWithRetry(`${CONFIG.APIs.EXCHANGE_RATE}${baseCurrency}`);
            return data.rates;
        } catch (error) {
            console.error('❌ Error fetching exchange rates:', error);
            throw new Error('No se pudieron obtener las tasas de cambio');
        }
    }

    /**
     * Obtiene tasa del dólar oficial (BCV)
     */
    static async getDolarOficial() {
        try {
            const data = await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.OFICIAL);
            Storage.setRatesWithHistory(CONFIG.CACHE.KEYS.BCV, data); // ✅ Ahora sí funcionará
            return data;
        } catch (error) {
            console.error('❌ Error fetching dólar oficial:', error);
            throw error;
        }
    }

    /**
     * Obtiene tasa del dólar paralelo
     */
    static async getDolarParalelo() {
        try {
            const data = await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.PARALELO);
            Storage.setRatesWithHistory(CONFIG.CACHE.KEYS.PARALELO, data); // ✅ Ahora sí funcionará
            return data;
        } catch (error) {
            console.error('❌ Error fetching dólar paralelo:', error);
            throw error;
        }
    }

    /**
     * Obtiene tasa del euro oficial
     */
    static async getEuroOficial() {
        try {
            const data = await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.EURO);
            Storage.setRatesWithHistory('euro_oficial_cache', data); // ✅ Ahora sí funcionará
            return data;
        } catch (error) {
            console.error('❌ Error fetching euro oficial:', error);
            throw error;
        }
    }

    /**
     * Obtiene TRM de Colombia
     */
    static async getTRMColombia() {
        try {
            const rates = await this.getExchangeRates('USD');
            const trmData = { trm: rates.COP };
            Storage.setRatesWithHistory(CONFIG.CACHE.KEYS.TRM, trmData); // ✅ Ahora sí funcionará
            return trmData;
        } catch (error) {
            console.error('❌ Error fetching TRM:', error);
            throw error;
        }
    }

    /**
     * Calcula factores de conversión
     */
    static async getConversionFactors() {
        try {
            const [trmData, paraleloData, oficialData, euroData] = await Promise.all([
                this.getTRMColombia(),
                this.getDolarParalelo(),
                this.getDolarOficial(),
                this.getEuroOficial()
            ]);

            const trm = trmData.trm || 0;
            const paralelo = paraleloData.promedio || paraleloData.venta || 0;
            const oficial = oficialData.promedio || oficialData.venta || 0;
            const euro = euroData.promedio || euroData.venta || 0;

            if (paralelo === 0 || oficial === 0 || euro === 0) {
                throw new Error('Tasas de Venezuela incompletas o en cero');
            }

            return {
                factor1: trm / paralelo,
                factor2: trm / oficial,
                factor3: trm / euro
            };
        } catch (error) {
            console.error('❌ Error calculating factors:', error);
            throw error;
        }
    }
}