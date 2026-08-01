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

  loadAdDeferred() {
    // Se ejecuta después de la carga inicial para no afectar LCP/TBT
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => this.injectAd());
    } else {
      setTimeout(() => this.injectAd(), 2000);
    }
  }

    injectAd() {
    const adContainer = document.getElementById("ad-container");
    if (!adContainer) return;

    // ⚠️ REEMPLAZA ESTE LINK con tu URL de referido real de Binance
    const affiliateLink = "https://accounts.binance.com/register?ref=TU_CODIGO_DE_REFERIDO";

    adContainer.innerHTML = `
      <a href="${affiliateLink}" 
         target="_blank" 
         rel="noopener noreferrer sponsored" 
         class="binance-banner-link"
         aria-label="Regístrate en Binance y obtén un bono de bienvenida (enlace de afiliado)">
        
        <div class="binance-banner">
          <div class="binance-icon">
            <!-- Logo de Binance en SVG inline (Cero peticiones de red, máximo rendimiento) -->
            <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0L9.6 6.4L16 12.8L22.4 6.4L16 0ZM4.8 11.2L0 16L4.8 20.8L9.6 16L4.8 11.2ZM16 19.2L9.6 25.6L16 32L22.4 25.6L16 19.2ZM27.2 11.2L22.4 16L27.2 20.8L32 16L27.2 11.2ZM16 14.4L11.2 19.2L16 24L20.8 19.2L16 14.4Z"/>
            </svg>
          </div>
          
          <div class="binance-content">
            <h3 class="binance-title">Opera Cripto con Seguridad</h3>
            <p class="binance-text">Regístrate en Binance y obtén un bono de bienvenida exclusivo para nuevos usuarios.</p>
          </div>
          
          <div class="binance-cta">
            <span>Crear Cuenta</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </a>
    `;
  }
}