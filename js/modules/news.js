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
    const adContainer = document.getElementById("ad-placeholder");
    if (!adContainer) return;
    
    // AQUÍ PEGAS EL CÓDIGO DE TU PROVEEDOR DE PUBLICIDAD (Google AdSense, etc.)
    // Ejemplo de inyección segura:
    adContainer.innerHTML = `
      <span class="ad-label">Publicidad</span>
      <div class="ad-content">
        <!-- Reemplaza esto con tu script de publicidad real -->
        <p>🚀 Potencia tu negocio con Conversor Pro</p>
        <a href="#" class="ad-cta">Más información</a>
      </div>
    `;
  }
}