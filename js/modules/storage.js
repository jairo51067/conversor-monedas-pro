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
      console.error("Error reading from storage:", error);
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
      console.error("Error writing to storage:", error);
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
      console.error("Error removing from storage:", error);
      return false;
    }
  }

  /**
   * Guarda tasas con timestamp para caché
   */
  static setRates(key, rates) {
    const data = {
      rates,
      timestamp: Date.now(),
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
    return this.get("conversionHistory", []);
  }

  static addToHistory(conversion) {
    const history = this.getConversionHistory();
    history.unshift({
      ...conversion,
      timestamp: Date.now(),
    });

    // Mantener solo las últimas 50 conversiones
    if (history.length > 50) history.pop();

    return this.set("conversionHistory", history);
  }

  static clearHistory() {
    return this.remove("conversionHistory");
  }
  // js/modules/storage.js - AGREGAR ESTOS MÉTODOS AL FINAL DE LA CLASE Storage

  /**
   * ✅ NUEVO: Guarda el valor anterior de una tasa antes de actualizar
   * Esto permite calcular variaciones reales
   */
  static savePreviousRate(key, newValue) {
    const currentData = this.get(key);
    if (currentData && currentData.rates) {
      // Guardar el valor actual como "anterior" antes de sobrescribir
      const previousKey = `${key}_previous`;
      this.set(previousKey, {
        rates: currentData.rates,
        timestamp: currentData.timestamp,
      });
    }
  }

  /**
   * ✅ NUEVO: Obtiene la variación entre el valor actual y el anterior
   * Retorna: { absolute: number, percentage: number, direction: 'up'|'down'|'stable' }
   */
  static getRateVariation(currentValue, cacheKey) {
    const previousKey = `${cacheKey}_previous`;
    const previousData = this.get(previousKey);

    if (!previousData || !previousData.rates) {
      return null; // No hay dato anterior para comparar
    }

    let previousValue = null;

    // Extraer el valor anterior según el tipo de tasa
    if (cacheKey.includes("bcv")) {
      previousValue = previousData.rates.promedio || previousData.rates.venta;
    } else if (cacheKey.includes("paralelo")) {
      previousValue = previousData.rates.promedio || previousData.rates.venta;
    } else if (cacheKey.includes("euro")) {
      previousValue = previousData.rates.promedio || previousData.rates.venta;
    } else if (cacheKey.includes("exchange_rates_cache")) {
      // Para TRM y otras tasas de ExchangeRate-API
      previousValue = previousData.rates;
    }

    if (!previousValue || previousValue === 0) {
      return null;
    }

    // Calcular variación
    const absolute = currentValue - previousValue;
    const percentage = (absolute / previousValue) * 100;
    const direction = absolute > 0 ? "up" : absolute < 0 ? "down" : "stable";

    return {
      absolute: Math.abs(absolute),
      percentage: Math.abs(percentage),
      direction: direction,
    };
  }

  /**
   * ✅ NUEVO: Guarda tasas con timestamp Y guarda el valor anterior
   */
  static setRatesWithHistory(key, rates) {
    // Primero guardar el valor actual como "anterior"
    this.savePreviousRate(key, rates);

    // Luego guardar el nuevo valor
    return this.setRates(key, rates);
  }
}
