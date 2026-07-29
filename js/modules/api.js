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
                cache: 'no-cache', // Evita usar caché del navegador para datos frescos
                mode: 'cors',
                ...options
            };

            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }, 3); // 3 intentos
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

            const trm = trmData.trm;
            const paralelo = paraleloData.promedio;
            const oficial = oficialData.promedio;
            const euro = euroData.promedio;

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