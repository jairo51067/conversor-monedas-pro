// Configuración centralizada de la aplicación
export const CONFIG = {
  APIs: {
    EXCHANGE_RATE: "https://api.exchangerate-api.com/v4/latest/",
    DOLAR_API: {
      OFICIAL: "https://ve.dolarapi.com/v1/dolares/oficial",
      PARALELO: "https://ve.dolarapi.com/v1/dolares/paralelo",
      EURO: "https://ve.dolarapi.com/v1/euros/oficial",
    },
    WEATHER: "https://api.open-meteo.com/v1/forecast",
  },
  CACHE: {
    DURATION: 3600000, // 1 hora en milisegundos
    KEYS: {
      RATES: "exchange_rates_cache",
      BCV: "bcv_rates_cache",
      PARALELO: "paralelo_rate_cache",
      TRM: "trm_rate_cache",
    },
  },
  CURRENCIES: [
    { code: "USD", name: "Dólar Estadounidense", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "COP", name: "Peso Colombiano", symbol: "$" },
    { code: "VES", name: "Bolívar Venezolano", symbol: "Bs" },
  ],
  DEFAULT_CURRENCY: {
    FROM: "USD",
    TO: "COP",
  },
};

// =========================================
// CONFIGURACIÓN DE PUBLICIDAD
// =========================================
export const AD_CONFIG = {
  // Configuración de Afiliado (Binance - Ingresos Pasivos)
  affiliate: {
    name: "Binance",
    url: "https://accounts.binance.com/register?ref=TU_CODIGO_DE_REFERIDO", // ⚠️ TU LINK REAL
    title: "Opera Cripto con Seguridad",
    text: "Regístrate y obtén un bono de bienvenida exclusivo.",
    cta: "Crear Cuenta",
    color: "#F0B90B", // Amarillo Binance
    isImage: false,
  },

  // Configuración para Clientes (Ingresos Activos - Venta Directa)
  client: {
    name: "Tu Empresa Aquí",
    url: "mailto:jairo.cardenas.dev@gmail.com?subject=Interesado%20en%20Publicidad%20-%20Conversor%20Pro&body=Hola,%20me%20interesa%20publicitar%20mi%20negocio%20en%20Conversor%20Pro.",
    title: "¿Tienes un negocio? Anúnciate aquí",
    text: "Llega a miles de usuarios interesados en finanzas y cripto. ¡Contáctanos!",
    cta: "Más Información",
    color: "#4F46E5", // Índigo (color de tu app)
    isImage: false,
    imageUrl: "",
  },
};
