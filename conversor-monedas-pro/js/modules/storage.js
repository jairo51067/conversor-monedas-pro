// Manejo de persistencia con localStorage
export class Storage {
    /**
     * Obtiene datos del localStorage
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    }

    /**
     * Guarda datos en localStorage
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    }

    /**
     * Elimina datos del localStorage
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    }

    /**
     * Guarda tasas con timestamp para caché
     */
    static setRates(key, rates) {
        const data = {
            rates,
            timestamp: Date.now()
        };
        return this.set(key, data);
    }

    /**
     * Obtiene tasas verificando caché
     */
    static getRates(key, maxAge = 3600000) {
        const data = this.get(key);
        if (!data || !data.timestamp) return null;
        
        const age = Date.now() - data.timestamp;
        if (age > maxAge) {
            this.remove(key);
            return null;
        }
        
        return data.rates;
    }

    /**
     * Historial de conversiones
     */
    static getConversionHistory() {
        return this.get('conversionHistory', []);
    }

    static addToHistory(conversion) {
        const history = this.getConversionHistory();
        history.unshift({
            ...conversion,
            timestamp: Date.now()
        });
        
        // Mantener solo las últimas 50 conversiones
        if (history.length > 50) history.pop();
        
        return this.set('conversionHistory', history);
    }

    static clearHistory() {
        return this.remove('conversionHistory');
    }
}