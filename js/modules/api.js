// Manejo centralizado de APIs - CORREGIDO PARA CORS
import { CONFIG } from '../config.js';
import { Storage } from './storage.js';
import { Utils } from './utils.js';

export class API {
    /**
     * Fetch genérico con retry - SIN HEADERS para evitar CORS preflight
     */
    static async fetchWithRetry(url, options = {}) {
        return Utils.retryAsync(async () => {
            // IMPORTANTE: No enviar headers para peticiones GET simples
            // Esto evita el preflight CORS
            const fetchOptions = {
                method: 'GET',
                mode: 'cors',
                cache: 'default'
            };

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        }, 3);
    }

    /**
     * Obtiene tasas de cambio generales (ExchangeRate-API)
     */
    static async getExchangeRates(baseCurrency = 'USD') {
        const cacheKey = `${CONFIG.CACHE.KEYS.RATES}_${baseCurrency}`;
        const cached = Storage.getRates(cacheKey, CONFIG.CACHE.DURATION);
        
        if (cached) {
            console.log('✅ Exchange rates loaded from cache');
            return cached;
        }

        try {
            const data = await this.fetchWithRetry(
                `${CONFIG.APIs.EXCHANGE_RATE}${baseCurrency}`
            );
            
            Storage.setRates(cacheKey, data.rates);
            console.log('✅ Exchange rates fetched from API');
            return data.rates;
        } catch (error) {
            console.error('❌ Error fetching exchange rates:', error);
            throw new Error('No se pudieron obtener las tasas de cambio');
        }
    }

    /**
     * Obtiene tasa de conversión específica
     */
    static async getConversionRate(from, to) {
        try {
            const rates = await this.getExchangeRates(from);
            return rates[to] || null;
        } catch (error) {
            console.error('❌ Error getting conversion rate:', error);
            return null;
        }
    }

    /**
     * Obtiene dólar BCV oficial
     */
    static async getDolarOficial() {
        const cached = Storage.getRates(CONFIG.CACHE.KEYS.BCV, CONFIG.CACHE.DURATION);
        if (cached) {
            console.log('✅ Dólar oficial loaded from cache');
            return cached;
        }

        try {
            const data = await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.OFICIAL);
            Storage.setRates(CONFIG.CACHE.KEYS.BCV, data);
            console.log('✅ Dólar oficial fetched from API');
            return data;
        } catch (error) {
            console.error('❌ Error fetching dólar oficial:', error);
            throw error;
        }
    }

    /**
     * Obtiene dólar paralelo
     */
    static async getDolarParalelo() {
        const cached = Storage.getRates(CONFIG.CACHE.KEYS.PARALELO, CONFIG.CACHE.DURATION);
        if (cached) {
            console.log('✅ Dólar paralelo loaded from cache');
            return cached;
        }

        try {
            const data = await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.PARALELO);
            Storage.setRates(CONFIG.CACHE.KEYS.PARALELO, data);
            console.log('✅ Dólar paralelo fetched from API');
            return data;
        } catch (error) {
            console.error('❌ Error fetching dólar paralelo:', error);
            throw error;
        }
    }

    /**
     * Obtiene euro oficial
     */
    static async getEuroOficial() {
        const cached = Storage.getRates(CONFIG.CACHE.KEYS.EURO, CONFIG.CACHE.DURATION);
        if (cached) {
            console.log('✅ Euro oficial loaded from cache');
            return cached;
        }

        try {
            const data = await this.fetchWithRetry(CONFIG.APIs.DOLAR_API.EURO);
            Storage.setRates(CONFIG.CACHE.KEYS.EURO, data);
            console.log('✅ Euro oficial fetched from API');
            return data;
        } catch (error) {
            console.error('❌ Error fetching euro oficial:', error);
            throw error;
        }
    }

    /**
     * Obtiene TRM Colombia
     */
    static async getTRMColombia() {
        const cached = Storage.getRates(CONFIG.CACHE.KEYS.TRM, CONFIG.CACHE.DURATION);
        if (cached) {
            console.log('✅ TRM loaded from cache');
            return cached;
        }

        try {
            const rates = await this.getExchangeRates('USD');
            const trm = rates.COP;
            Storage.setRates(CONFIG.CACHE.KEYS.TRM, { trm });
            console.log('✅ TRM fetched from API');
            return { trm };
        } catch (error) {
            console.error('❌ Error fetching TRM:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los datos de tasas en paralelo
     */
    static async getAllRates() {
        try {
            const [oficial, paralelo, euro, trm] = await Promise.all([
                this.getDolarOficial(),
                this.getDolarParalelo(),
                this.getEuroOficial(),
                this.getTRMColombia()
            ]);

            return { oficial, paralelo, euro, trm };
        } catch (error) {
            console.error('❌ Error fetching all rates:', error);
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

            const factors = {
                factor1: trm / paralelo, // TRM/PARALELO
                factor2: trm / oficial,  // TRM/OFICIAL
                factor3: trm / euro      // TRM/EURO
            };

            console.log('✅ Conversion factors calculated:', factors);
            return factors;
        } catch (error) {
            console.error('❌ Error calculating factors:', error);
            throw error;
        }
    }
}