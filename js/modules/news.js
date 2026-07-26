/**
 * Módulo de Noticias Financieras (Versión Robusta para GitHub Pages)
 * Utiliza RSS Feeds con fallback de proxy CORS para evitar bloqueos.
 */

const CONFIG = {
    CACHE_DURATION: 30 * 60 * 1000, // 30 minutos
    MAX_NEWS: 15,
    SOURCES: [
        { name: 'El Nacional', url: 'https://www.elnacional.com/economia/feed/' },
        { name: 'Banca y Negocios', url: 'https://www.bancaynegocios.com/feed/' },
        { name: 'CriptoNoticias', url: 'https://www.criptonoticias.com/feed/' },
        { name: 'El Pitazo', url: 'https://elpitazo.net/category/economia/feed/' },
        { name: 'Bloomberg Línea', url: 'https://www.bloomberglinea.com/feed/' }
    ]
};

let newsCache = { data: [], timestamp: 0 };

const utils = {
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return tmp.textContent || tmp.innerText || '';
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const diff = Date.now() - date.getTime();
        
        if (diff < 60 * 60 * 1000) return `Hace ${Math.floor(diff / (60 * 1000))} min`;
        if (diff < 24 * 60 * 60 * 1000) return `Hace ${Math.floor(diff / (60 * 60 * 1000))} h`;
        
        return date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    categorize(title, content) {
        const text = (title + ' ' + content).toLowerCase();
        if (text.includes('bitcoin') || text.includes('crypto') || text.includes('cripto')) return 'crypto';
        if (text.includes('dólar') || text.includes('euro') || text.includes('tasa') || text.includes('bcv')) return 'divisas';
        if (text.includes('banco') || text.includes('financiero') || text.includes('inversión')) return 'finanzas';
        return 'economia';
    },

    // Imagen por defecto profesional en base64
    getDefaultImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEzMjA0MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ob3RpY2lhcyBGaW5hbmNpZXJhczwvdGV4dD48L3N2Zz4=';
    }
};

const rssParser = {
    async fetchFeed(feedConfig) {
        try {
            // Intentamos con rss2json primero
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedConfig.url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error('rss2json failed');
            
            const data = await response.json();
            if (data.status !== 'ok') throw new Error('Invalid RSS data');

            return data.items.slice(0, 3).map(item => ({
                title: item.title,
                summary: utils.stripHtml(item.description).substring(0, 150) + '...',
                url: item.link,
                source: feedConfig.name,
                publishedAt: item.pubDate,
                image: item.thumbnail || utils.getDefaultImage(),
                category: utils.categorize(item.title, item.description)
            }));
        } catch (error) {
            console.warn(`⚠️ Fallo al cargar RSS de ${feedConfig.name}:`, error.message);
            
            // Fallback: Intentar con AllOrigins si rss2json falla o tiene límite
            try {
                const fallbackUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedConfig.url)}`;
                const response = await fetch(fallbackUrl);
                const data = await response.json();
                
                if (!data.contents) throw new Error('No content');

                // Parseo manual básico del XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                const items = xmlDoc.querySelectorAll("item");
                
                return Array.from(items).slice(0, 3).map(item => {
                    const title = item.querySelector("title")?.textContent || "Sin título";
                    const desc = item.querySelector("description")?.textContent || "";
                    const link = item.querySelector("link")?.textContent || "#";
                    const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
                    
                    // Intentar extraer imagen del contenido o usar default
                    const imgMatch = desc.match(/<img[^>]+src="([^">]+)"/);
                    const image = imgMatch ? imgMatch[1] : utils.getDefaultImage();

                    return {
                        title,
                        summary: utils.stripHtml(desc).substring(0, 150) + '...',
                        url: link,
                        source: feedConfig.name,
                        publishedAt: pubDate,
                        image,
                        category: utils.categorize(title, desc)
                    };
                });
            } catch (fallbackError) {
                console.error(`❌ Fallo total en ${feedConfig.name}:`, fallbackError.message);
                return [];
            }
        }
    },

    async fetchAllFeeds() {
        // Ejecutar todas las peticiones en paralelo
        const promises = CONFIG.SOURCES.map(feed => this.fetchFeed(feed));
        const results = await Promise.all(promises);
        
        // Aplanar, eliminar duplicados por URL, ordenar por fecha y limitar
        return results
            .flat()
            .filter((item, index, self) => index === self.findIndex((t) => t.url === item.url))
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, CONFIG.MAX_NEWS);
    }
};

async function fetchAllNews() {
    const allNews = await rssParser.fetchAllFeeds();
    
    newsCache = {
        data: allNews,
        timestamp: Date.now()
    };

    return allNews;
}

async function getNews(forceRefresh = false) {
    const isCacheValid = (Date.now() - newsCache.timestamp) < CONFIG.CACHE_DURATION;
    
    if (!forceRefresh && isCacheValid && newsCache.data.length > 0) {
        return newsCache.data;
    }

    return await fetchAllNews();
}

function renderNews(news, containerId = 'news-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (news.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-newspaper" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No se pudieron cargar las noticias en este momento.</p>
            </div>
        `;
        return;
    }

    const categoryIcons = {
        'divisas': 'fa-dollar-sign',
        'crypto': 'fa-bitcoin',
        'finanzas': 'fa-chart-line',
        'economia': 'fa-briefcase'
    };

    news.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = `news-card news-card--${item.category}`;
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        card.style.opacity = '0'; // Para la animación

        const icon = categoryIcons[item.category] || 'fa-newspaper';

        card.innerHTML = `
            <div class="news-card__image">
                <img src="${item.image}" alt="${item.title}" loading="lazy" 
                     onerror="this.src='${utils.getDefaultImage()}'">
                <span class="news-card__category">
                    <i class="fas ${icon}"></i> ${item.category}
                </span>
            </div>
            <div class="news-card__content">
                <h3 class="news-card__title">${item.title}</h3>
                <p class="news-card__summary">${item.summary}</p>
                <div class="news-card__meta">
                    <span class="news-card__source">
                        <i class="fas fa-building"></i> ${item.source}
                    </span>
                    <span class="news-card__date">
                        <i class="fas fa-clock"></i> ${utils.formatDate(item.publishedAt)}
                    </span
                </div>
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-card__link">
                    Leer más <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        container.appendChild(card);
    });
}

async function init() {
    try {
        const news = await getNews();
        renderNews(news);

        // Actualizar en segundo plano cada 30 minutos
        setInterval(async () => {
            const freshNews = await getNews(true);
            renderNews(freshNews);
        }, CONFIG.CACHE_DURATION);

    } catch (error) {
        console.error('❌ Error inicializando módulo de noticias:', error);
    }
}

// Exportar para uso como módulo ES6
export default { init, getNews, renderNews };