// Punto de entrada principal de la aplicación
import { CONFIG } from "./config.js";
import { API } from "./modules/api.js";
import { Converter } from "./modules/converter.js";
import { UI } from "./modules/ui.js";
import { Storage } from "./modules/storage.js";
import { Utils } from "./modules/utils.js";
import { Clock } from "./modules/clock.js";
import { Weather } from "./modules/weather.js";
import { Greeting } from "./modules/greeting.js";

class App {
  constructor() {
    this.factors = {
      factor1: 0,
      factor2: 0,
      factor3: 0,
    };
    this.clock = new Clock();
    this.weather = new Weather();
    this.greeting = new Greeting();
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    try {
      await this.loadAllData();
       this.loadCurrencies();
      this.setupEventListeners();
      this.startServices();
      this.loadConversionHistory();

      // Mostrar saludo
      this.greeting.show();
      this.greeting.setupListeners();

      console.log("✅ Aplicación inicializada correctamente");
    } catch (error) {
      console.error("❌ Error al inicializar:", error);
      UI.showToast("Error al cargar algunos datos", "error");
    }
  }

  /**
   * Carga todos los datos iniciales
   */
  async loadAllData() {
    // Cargar datos en paralelo
    await Promise.all([
      this.loadExchangeRates(),
      this.loadBCVData(),
      this.loadParaleloData(),
      this.loadEuroData(),
      this.loadTRMData(),
      this.loadConversionFactors(),
    ]);
  }

  /**
   * Carga las monedas en los selectores del conversor general
   */
  loadCurrencies() {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");

    if (!fromSelect || !toSelect) return;

    // Limpiar opciones anteriores
    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";

    // Crear opciones desde CONFIG
    CONFIG.CURRENCIES.forEach((currency) => {
      const option1 = document.createElement("option");
      option1.value = currency.code;
      option1.textContent = `${currency.name} (${currency.code})`;
      fromSelect.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = currency.code;
      option2.textContent = `${currency.name} (${currency.code})`;
      toSelect.appendChild(option2);
    });

    // Establecer valores predeterminados
    fromSelect.value = CONFIG.DEFAULT_CURRENCY.FROM;
    toSelect.value = CONFIG.DEFAULT_CURRENCY.TO;

    console.log("✅ Currencies loaded in selectors");
  }

  /**
   * Carga tasas de cambio generales
   */
  async loadExchangeRates() {
    try {
      await API.getExchangeRates("USD");
    } catch (error) {
      console.error("Error loading exchange rates:", error);
    }
  }

  /**
   * Carga datos del dólar BCV
   */
  async loadBCVData() {
    try {
      const data = await API.getDolarOficial();
      UI.updateRateDisplay("resultadoBcv", data, "1 USD =");
    } catch (error) {
      UI.showError("resultadoBcv", "Error al cargar datos");
    }
  }

  /**
   * Carga datos del dólar paralelo
   */
  async loadParaleloData() {
    try {
      const data = await API.getDolarParalelo();
      UI.updateRateDisplay("resultadoParalelo", data, "1 USDT =");
    } catch (error) {
      UI.showError("resultadoParalelo", "Error al cargar datos");
    }
  }

  /**
   * Carga datos del euro oficial
   */
  async loadEuroData() {
    try {
      const data = await API.getEuroOficial();
      UI.updateRateDisplay("resultadoEuroOficial", data, "1 EUR =");
    } catch (error) {
      UI.showError("resultadoEuroOficial", "Error al cargar datos");
    }
  }

  /**
   * Carga TRM Colombia
   */
  async loadTRMData() {
    try {
      const data = await API.getTRMColombia();
      UI.updateTRMDisplay("valorDolarTRM", data.trm);
    } catch (error) {
      UI.showError("valorDolarTRM", "Error al cargar TRM");
    }
  }

  /**
   * Carga factores de conversión
   */
  async loadConversionFactors() {
    try {
      this.factors = await API.getConversionFactors();

      UI.updateFactorDisplay("factor-value", this.factors.factor1);
      UI.updateFactorDisplay("factor-value-2", this.factors.factor2);
      UI.updateFactorDisplay("factor-value-3", this.factors.factor3);
    } catch (error) {
      console.error("Error loading factors:", error);
    }
  }

  /**
   * Configura todos los event listeners
   */
  setupEventListeners() {
    // Conversor general
    const currencyForm = document.getElementById("currency-form");
    if (currencyForm) {
      currencyForm.addEventListener("submit", (e) => this.handleConversion(e));
    }

    // Botones de actualización
    this.setupRefreshButton("refresh", () => this.loadExchangeRates());
    this.setupRefreshButton("actualizar", () => this.loadBCVData());
    this.setupRefreshButton("actualizarEuro", () => this.loadEuroData());
    this.setupRefreshButton("actualizarParalelo", () =>
      this.loadParaleloData(),
    );
    this.setupRefreshButton("actualizarTRM", () => this.loadTRMData());

    // Toggle conversores
    this.setupToggle(
      "show-converter",
      "close-converter",
      "converter-container",
    );
    this.setupToggle(
      "show-converter-paralelo",
      "close-converter-paralelo",
      "convertir-a-paralelo",
    );

    // Conversión en tiempo real Bs -> COP
    const inputBolivares = document.getElementById("input-bolivares");
    if (inputBolivares) {
      inputBolivares.addEventListener(
        "input",
        Utils.debounce(() => {
          this.convertBsToCopRealtime();
        }, 300),
      );
    }

    // Conversión en tiempo real COP -> Bs
    const inputPesos = document.getElementById("input-pesos");
    if (inputPesos) {
      inputPesos.addEventListener(
        "input",
        Utils.debounce(() => {
          this.convertCopToBsRealtime();
        }, 300),
      );
    }
  }

  /**
   * Configura botón de actualización
   */
  setupRefreshButton(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", async () => {
        UI.showToast("Actualizando...", "info");
        await callback();
        UI.showToast("Actualizado correctamente", "success");
      });
    }
  }

  /**
   * Configura toggle de visibilidad
   */
  setupToggle(showId, hideId, containerId) {
    const showBtn = document.getElementById(showId);
    const hideBtn = document.getElementById(hideId);

    if (showBtn) {
      showBtn.addEventListener("click", () => {
        UI.toggleVisibility(containerId, true);
      });
    }

    if (hideBtn) {
      hideBtn.addEventListener("click", () => {
        UI.toggleVisibility(containerId, false);
      });
    }
  }

  /**
   * Maneja conversión general
   */
  async handleConversion(event) {
    event.preventDefault();

    const amountInput = document.getElementById("amount");
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");
    const resultParagraph = document.getElementById("result");

    const amount = amountInput.value;
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (!amount || !fromCurrency || !toCurrency) {
      resultParagraph.textContent = "Por favor, completa todos los campos.";
      return;
    }

    try {
      const result = await Converter.convert(amount, fromCurrency, toCurrency);
      UI.updateConversionResult(
        "result",
        amount,
        fromCurrency,
        result,
        toCurrency,
      );

      // Guardar en historial
      Converter.saveToHistory(amount, fromCurrency, result, toCurrency);
      this.loadConversionHistory();

      UI.showToast("Conversión exitosa", "success");
    } catch (error) {
      resultParagraph.textContent =
        "Error al obtener la tasa de conversión. Intenta de nuevo más tarde.";
      UI.showToast("Error en la conversión", "error");
    }
  }

  /**
   * Conversión Bs a COP en tiempo real
   */
  convertBsToCopRealtime() {
    const input = document.getElementById("input-bolivares");
    const result = document.getElementById("resultado-cop");

    if (!input || !result) return;

    const bolivares = parseFloat(input.value);

    if (this.factors.factor1 > 0 && !isNaN(bolivares) && bolivares >= 0) {
      const cop = Converter.convertBsToCop(bolivares, this.factors.factor1);
      result.innerText = Utils.formatCurrency(cop, "COP");
    } else {
      result.innerText = "$ 0,00";
    }
  }

  /**
   * Conversión COP a Bs en tiempo real
   */
  convertCopToBsRealtime() {
    const input = document.getElementById("input-pesos");
    const result = document.getElementById("resultado-bs");

    if (!input || !result) return;

    const pesos = parseFloat(input.value);

    if (this.factors.factor1 > 0 && !isNaN(pesos) && pesos >= 0) {
      const bs = Converter.convertCopToBs(pesos, this.factors.factor1);
      result.innerText = Utils.formatCurrency(bs, "VES", "es-VE");
    } else {
      result.innerText = "Bs. 0,00";
    }
  }

  /**
   * Carga historial de conversiones
   */
  loadConversionHistory() {
    const history = Storage.getConversionHistory();
    const list = document.getElementById("history-list");

    if (!list) return;

    list.innerHTML = "";

    history.forEach((item) => {
      const text = `${Utils.formatNumber(item.amount)} ${item.from} = ${Utils.formatNumber(item.result)} ${item.to}`;
      UI.addHistoryItem("history-list", text);
    });
  }

  /**
   * Inicia servicios (reloj, clima)
   */
  startServices() {
    this.clock.start();
    this.weather.init();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});
