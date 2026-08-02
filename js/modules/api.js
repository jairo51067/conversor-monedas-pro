// js/modules/api.js
import { CONFIG } from '../config.js';
import { Utils } from './utils.js';

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
     * Este es el método que llama converter.js y que faltaba en tu archivo original.
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
            return await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.OFICIAL);
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
            return await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.PARALELO);
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
            return await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.EURO);
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
            return { trm: rates.COP };
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

            // Fallback seguro por si la API cambia el nombre de la propiedad
            const trm = trmData.trm || 0;
            const paralelo = paraleloData.promedio || paraleloData.venta || 0;
            const oficial = oficialData.promedio || oficialData.venta || 0;
            const euro = euroData.promedio || euroData.venta || 0;

            if (paralelo === 0 || oficial === 0 || euro === 0) {
                throw new Error('Tasas de Venezuela incompletas o en cero');
            }

            return {
                factor1: trm / paralelo, // TRM/PARALELO
                factor2: trm / oficial,  // TRM/OFICIAL
                factor3: trm / euro      // TRM/EURO
            };
        } catch (error) {
            console.error('❌ Error calculating factors:', error);
            throw error;
        }
    }
}