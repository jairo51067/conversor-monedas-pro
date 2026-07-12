// Lógica de conversión de monedas
import { API } from './api.js';
import { Storage } from './storage.js';
import { Utils } from './utils.js';

export class Converter {
    /**
     * Convierte entre monedas usando ExchangeRate-API
     */
    static async convert(amount, fromCurrency, toCurrency) {
        if (!Utils.isValidNumber(amount)) {
            throw new Error('Cantidad inválida');
        }

        if (amount === 0) return 0;

        const rate = await API.getConversionRate(fromCurrency, toCurrency);
        if (!rate) {
            throw new Error('Tasa de cambio no disponible');
        }

        return amount * rate;
    }

    /**
     * Convierte Bolívares a Pesos COP usando factor paralelo
     */
    static convertBsToCop(bolivares, factor) {
        if (!Utils.isValidNumber(bolivares) || factor <= 0) {
            return 0;
        }
        return bolivares * factor;
    }

    /**
     * Convierte Pesos COP a Bolívares usando factor paralelo
     */
    static convertCopToBs(pesos, factor) {
        if (!Utils.isValidNumber(pesos) || factor <= 0) {
            return 0;
        }
        return pesos / factor;
    }

    /**
     * Guarda conversión en historial
     */
    static saveToHistory(amount, fromCurrency, result, toCurrency) {
        Storage.addToHistory({
            amount: parseFloat(amount),
            from: fromCurrency,
            to: toCurrency,
            result: parseFloat(result)
        });
    }
}