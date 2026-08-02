// js/modules/greeting.js
import { API } from "./api.js";
import { Storage } from "./storage.js";
import { Utils } from "./utils.js";
import { CONFIG } from "../config.js"; // ✅ Importado correctamente al inicio

export class Greeting {
  constructor() {
    this.modalId = "modalSaludo";
    this.storageKey = "greetingShown";
    this.tips = [
      "💡 Tip: Revisa las estadísticas para ver tendencias de 7D, 30D y 1 año",
      "📊 Tip: Usa el conversor Bs↔COP para transacciones rápidas en tiempo real",
      "🌙 Tip: Activa el modo oscuro para mejor experiencia nocturna",
      "🔄 Tip: Actualiza las tasas manualmente si necesitas datos frescos",
      "📱 Tip: Agrega la app a tu pantalla de inicio para acceso rápido",
      "💱 Tip: La brecha cambiaria te indica la diferencia entre BCV y Paralelo",
      "📈 Tip: Los factores de conversión te ayudan a calcular TRM vs tasas locales",
    ];
  }

  async show() {
    const alreadyShown = sessionStorage.getItem(this.storageKey);
    if (alreadyShown) return;

    const modal = document.getElementById(this.modalId);
    if (!modal) return;

    await this.loadDashboardData();
    modal.classList.add("active");
    sessionStorage.setItem(this.storageKey, "true");
  }

  close() {
    const modal = document.getElementById(this.modalId);
    if (modal) modal.classList.remove("active");
  }

  setupListeners() {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;

    const closeBtn = modal.querySelector(".welcome-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", () => this.close());

    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.close();
    });
  }

  async loadDashboardData() {
    try {
      this.updateGreeting();

      const [bcvData, paraleloData, euroData, trmData] = await Promise.all([
        API.getDolarOficial().catch(() => null),
        API.getDolarParalelo().catch(() => null),
        API.getEuroOficial().catch(() => null),
        API.getTRMColombia().catch(() => null),
      ]);

      if (bcvData)
        this.updateRateWithVariation(
          "welcome-bcv",
          bcvData.promedio,
          CONFIG.CACHE.KEYS.BCV,
          "Bs.",
        );
      if (paraleloData)
        this.updateRateWithVariation(
          "welcome-paralelo",
          paraleloData.promedio,
          CONFIG.CACHE.KEYS.PARALELO,
          "Bs.",
        );
      if (euroData)
        this.updateRateWithVariation(
          "welcome-euro",
          euroData.promedio,
          "euro_oficial_cache",
          "Bs.",
        );
      if (trmData)
        this.updateRateWithVariation(
          "welcome-trm",
          trmData.trm,
          CONFIG.CACHE.KEYS.TRM,
          "$",
        );

      if (bcvData && paraleloData)
        this.updateInsight(bcvData.promedio, paraleloData.promedio);
      this.updateTip();
      this.updateLastUpdate();
    } catch (error) {
      console.error("❌ Error loading welcome dashboard:", error);
    }
  }

  /**
   * Actualiza un valor de tasa con su variación calculada
   */
  updateRateWithVariation(elementId, currentValue, cacheKey, prefix = "") {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`⚠️ Elemento ${elementId} no encontrado`);
      return;
    }

    // Obtener variación del almacenamiento
    const variation = Storage.getRateVariation(currentValue, cacheKey);

    // Formatear valor principal
    let formattedValue = prefix + " ";
    if (prefix === "Bs.") {
      formattedValue += Utils.formatNumber(currentValue, "es-VE", {
        minimumFractionDigits: 2,
      });
    } else {
      formattedValue += Utils.formatNumber(currentValue, "es-CO", {
        minimumFractionDigits: 0,
      });
    }

    element.textContent = formattedValue;

    // Si hay variación válida, mostrarla
    if (variation) {
      this.renderVariation(element, variation, prefix);
    } else {
      // Limpiar variación anterior si existe
      const existingVariation =
        element.parentElement.querySelector(".rate-variation");
      if (existingVariation) {
        existingVariation.remove();
      }
    }
  }

  /**
   * Renderiza la variación (flecha + porcentaje)
   */
  renderVariation(element, variation, prefix) {
    const parent = element.parentElement;
    if (!parent) return;

    // Eliminar variación anterior si existe
    const existingVariation = parent.querySelector(".rate-variation");
    if (existingVariation) {
      existingVariation.remove();
    }

    // Crear elemento de variación
    const variationEl = document.createElement("div");
    variationEl.className = "rate-variation";

    const isUp = variation.direction === "up";
    const arrowIcon = isUp ? "▲" : variation.direction === "down" ? "▼" : "─";
    const colorClass = isUp
      ? "variation-up"
      : variation.direction === "down"
        ? "variation-down"
        : "variation-stable";

    const absValue = Utils.formatNumber(
      variation.absolute,
      prefix === "Bs." ? "es-VE" : "es-CO",
      { minimumFractionDigits: 2 },
    );
    const pctValue = variation.percentage.toFixed(2);

    variationEl.innerHTML = `
        <span class="${colorClass}">
            ${arrowIcon} ${absValue} (${pctValue}%)
        </span>
    `;

    parent.appendChild(variationEl);
  }

  /**
   * Renderiza la variación (flecha + porcentaje)
   * Solo muestra si hay variación REAL (no 0.00)
   */
  renderVariation(element, variation, prefix) {
    const parent = element.parentElement;
    if (!parent) return;

    // Eliminar variación anterior si existe
    const existingVariation = parent.querySelector(".rate-variation");
    if (existingVariation) {
      existingVariation.remove();
    }

    // ✅ NO MOSTRAR si la variación es 0 o muy pequeña (< 0.01)
    if (variation.percentage < 0.01 && variation.absolute < 0.01) {
      return; // No renderizar nada
    }

    // Crear elemento de variación
    const variationEl = document.createElement("div");
    variationEl.className = "rate-variation";

    const isUp = variation.direction === "up";
    const arrowIcon = isUp ? "▲" : variation.direction === "down" ? "▼" : "─";
    const colorClass = isUp
      ? "variation-up"
      : variation.direction === "down"
        ? "variation-down"
        : "variation-stable";

    const absValue = Utils.formatNumber(
      variation.absolute,
      prefix === "Bs." ? "es-VE" : "es-CO",
      { minimumFractionDigits: 2 },
    );
    const pctValue = variation.percentage.toFixed(2);

    variationEl.innerHTML = `
        <span class="${colorClass}">
            ${arrowIcon} ${absValue} (${pctValue}%)
        </span>
    `;

    parent.appendChild(variationEl);
  }

  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "👋 ¡Hola!";
    if (hour >= 5 && hour < 12) greeting = "☀️ ¡Buenos días!";
    else if (hour >= 12 && hour < 19) greeting = "🌤️ ¡Buenas tardes!";
    else greeting = "🌙 ¡Buenas noches!";

    const el = document.getElementById("welcome-greeting");
    if (el) el.textContent = greeting;
  }

  updateInsight(bcvValue, paraleloValue) {
    const brecha = ((paraleloValue - bcvValue) / bcvValue) * 100;
    let text = "",
      cls = "";

    if (Math.abs(brecha) < 5) {
      text = `La brecha cambiaria es mínima (${brecha.toFixed(1)}%). Tasas muy cercanas.`;
      cls = "insight-neutral";
    } else if (brecha >= 0) {
      text = `El paralelo está ${brecha.toFixed(1)}% por encima del BCV. Brecha significativa.`;
      cls = "insight-warning";
    } else {
      text = `El paralelo está ${Math.abs(brecha).toFixed(1)}% por debajo del BCV. Situación inusual.`;
      cls = "insight-alert";
    }

    const el = document.getElementById("welcome-insight-text");
    if (el) {
      el.textContent = text;
      el.className = `welcome-insight-text ${cls}`;
    }
  }

  updateTip() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const tipText = this.tips[dayOfYear % this.tips.length];
    const el = document.getElementById("welcome-tip-text");
    if (el) el.textContent = tipText;
  }

  updateLastUpdate() {
    const ratesData = Storage.getRates("exchange_rates_cache_USD");
    const el = document.getElementById("welcome-last-update");
    if (!el) return;

    if (ratesData && ratesData.timestamp) {
      const mins = Math.floor((Date.now() - ratesData.timestamp) / 60000);
      if (mins < 1) el.textContent = "Actualizado: hace menos de 1 minuto";
      else if (mins < 60)
        el.textContent = `Actualizado: hace ${mins} minuto${mins > 1 ? "s" : ""}`;
      else
        el.textContent = `Actualizado: hace ${Math.floor(mins / 60)} hora${Math.floor(mins / 60) > 1 ? "s" : ""}`;
    } else {
      el.textContent = "Actualizado: ahora";
    }
  }
}
