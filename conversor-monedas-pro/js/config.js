// Configuración centralizada de la aplicación
export const CONFIG = {
    APIs: {
        EXCHANGE_RATE: 'https://api.exchangerate-api.com/v4/latest/',
        DOLAR_API: {
            OFICIAL: 'https://ve.dolarapi.com/v1/dolares/oficial',
            PARALELO: 'https://ve.dolarapi.com/v1/dolares/paralelo',
            EURO: 'https://ve.dolarapi.com/v1/euros/oficial'
        },
        WEATHER: 'https://api.open-meteo.com/v1/forecast'
    },
    CACHE: {
        DURATION: 3600000, // 1 hora en milisegundos
        KEYS: {
            RATES: 'exchange_rates_cache',
            BCV: 'bcv_rates_cache',
            PARALELO: 'paralelo_rate_cache',
            TRM: 'trm_rate_cache'
        }
    },
    CURRENCIES: [
        { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
        { code: 'VES', name: 'Bolívar Venezolano', symbol: 'Bs' }
    ],
    DEFAULT_CURRENCY: {
        FROM: 'USD',
        TO: 'COP'
    }
};