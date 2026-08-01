import { AD_CONFIG } from '../config.js';

export class News {
  constructor() {
    this.api = "https://jairo-news-api.jairocardenas05.workers.dev";
    this.cacheKey = "currency-news-cache";
    this.initialized = false;
    this.currentFilter = "all";
    this.cachedNews = [];
  }

  async fetchNews() {
    const cached = localStorage.getItem(this.cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 900000) { // 15 min
        this.cachedNews = data.news;
        return data.news;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(this.api, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(response.status);

      const data = await response.json();
      this.cachedNews = data.news || [];

      localStorage.setItem(this.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        news: this.cachedNews,
      }));
      return this.cachedNews;
    } catch (error) {
      console.error("[News]", error);
      return this.cachedNews; // Fallback a caché
    }
  }

  createCard(item) {
    const card = document.createElement("article");
    card.className = "news-card";
    card.dataset.category = item.category; // Para filtrado

    const image = item.image ? `<img class="news-image" src="${item.image}" loading="lazy" alt="${item.title}" width="400" height="200">` : "";

    card.innerHTML = `
      <a href="${item.link}" target="_blank" rel="noopener noreferrer">
        ${image}
        <div class="news-content">
          <span class="news-category ${item.category === 'Cripto' ? 'cat-cripto' : 'cat-regional'}">
            ${item.category}
          </span>
          <h3 class="news-title">${item.title}</h3>
          <p class="news-description">${item.description}</p>
          <div class="news-meta">
            <span><i class="fas fa-newspaper"></i> ${item.source}</span>
            <span><i class="far fa-clock"></i> ${new Date(item.date).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
      </a>
    `;
    return card;
  }

  renderNews(newsToRender) {
    const container = document.getElementById("news-container");
    if (!container) return;

    container.innerHTML = "";
    if (!newsToRender.length) {
      container.innerHTML = `<div class="news-empty"><i class="fas fa-inbox"></i><p>No hay noticias en esta categoría</p></div>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    newsToRender.forEach((item) => fragment.appendChild(this.createCard(item)));
    container.appendChild(fragment);
  }

  applyFilter(category) {
    this.currentFilter = category;
    const filtered = category === "all" 
      ? this.cachedNews 
      : this.cachedNews.filter(item => item.category === category);
    this.renderNews(filtered);
    
    // Actualizar estado de botones (Accesibilidad)
    document.querySelectorAll(".filter-btn").forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive);
    });
  }

  async init() {
    const container = document.getElementById("news-container");
    if (!container) return;

    // Mostrar loading inicial
    container.innerHTML = `<div class="news-loading"><span></span><span></span><span></span></div>`;
    
    await this.fetchNews();
    this.applyFilter("all");

    // Event Listeners para Filtros
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => this.applyFilter(e.target.dataset.category));
    });

    // Botón de refrescar
    const refreshBtn = document.getElementById("refresh-news");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        localStorage.removeItem(this.cacheKey);
        container.innerHTML = `<div class="news-loading"><span></span><span></span><span></span></div>`;
        await this.fetchNews();
        this.applyFilter(this.currentFilter);
      });
    }

    // 🚀 OPTIMIZACIÓN: Cargar publicidad solo después de que la página sea interactiva
    this.loadAdDeferred();
  }

  // ==========================================
  // LÓGICA DE PUBLICIDAD (DOBLE BANNER)
  // ==========================================

  loadAdDeferred() {
    // Carga diferida para no afectar el performance (LCP/TBT)
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        this.injectAffiliateAd();
        this.injectClientAd();
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        this.injectAffiliateAd();
        this.injectClientAd();
      }, 2000);
    }
  }

  injectAffiliateAd() {
    const container = document.getElementById("ad-affiliate-container");
    if (!container) return;

    const ad = AD_CONFIG.affiliate;

    container.innerHTML = `
      <a href="${ad.url}" 
         target="_blank" 
         rel="noopener noreferrer sponsored" 
         class="binance-banner-link"
         aria-label="Regístrate en ${ad.name} (enlace de afiliado)">
        
        <div class="binance-banner" style="border-left-color: ${ad.color};">
          <div class="binance-icon" style="color: ${ad.color}; background: ${ad.color}1A;">
            <i class="fas fa-coins" style="font-size: 1.4rem;"></i>
          </div>
          
          <div class="binance-content">
            <h3 class="binance-title">${ad.title}</h3>
            <p class="binance-text">${ad.text}</p>
          </div>
          
          <div class="binance-cta" style="background: ${ad.color}; color: #1E2329;">
            <span>${ad.cta}</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </a>
    `;
  }

  injectClientAd() {
    const container = document.getElementById("ad-client-container");
    if (!container) return;

    const ad = AD_CONFIG.client;

    // Si el cliente proporciona una imagen, usamos este diseño alternativo
    if (ad.isImage && ad.imageUrl) {
      container.innerHTML = `
        <a href="${ad.url}" target="_blank" rel="noopener noreferrer sponsored" 
           class="client-banner-link" aria-label="Publicidad de ${ad.name}">
          <div class="client-banner" style="border-left-color: ${ad.color}; padding: 0; overflow: hidden;">
            <img src="${ad.imageUrl}" alt="Publicidad de ${ad.name}" 
                 style="width: 100%; height: auto; display: block; border-radius: 8px;"
                 width="320" height="100">
          </div>
        </a>
      `;
      return;
    }

    // Diseño por defecto: Texto + Ícono
    container.innerHTML = `
      <a href="${ad.url}" 
         target="_blank" 
         rel="noopener noreferrer sponsored" 
         class="client-banner-link"
         aria-label="Información sobre publicidad en Conversor Pro">
        
        <div class="client-banner" style="border-left-color: ${ad.color};">
          <div class="client-icon" style="color: ${ad.color}; background: ${ad.color}1A;">
            <i class="fas fa-store" style="font-size: 1.4rem;"></i>
          </div>
          
          <div class="client-content">
            <h3 class="client-title">${ad.title}</h3>
            <p class="client-text">${ad.text}</p>
          </div>
          
          <div class="client-cta" style="background: ${ad.color}; color: #FFFFFF;">
            <span>${ad.cta}</span>
            <i class="fas fa-envelope"></i>
          </div>
        </div>
      </a>
    `;
  }
}