/**
 * Módulo de Noticias Financieras
 * Combina NewsAPI.org + RSS Feeds
 */

const NewsModule = (() => {
    // Configuración
    const CONFIG = {
        NEWSAPI_KEY: 'fb98581019a54258bd249f25b15a0e62', // Reemplazar con tu key de NewsAPI.org
        CACHE_DURATION: 30 * 60 * 1000, // 30 minutos
        MAX_NEWS: 20,
        SOURCES: {
            rss: [
                {
                    name: 'El Nacional - Economía',
                    url: 'https://www.elnacional.com/economia/feed/',
                    category: 'economia',
                    country: 'VE'
                },
                {
                    name: 'Banca y Negocios',
                    url: 'https://www.bancaynegocios.com/feed/',
                    category: 'finanzas',
                    country: 'VE'
                },
                {
                    name: 'CriptoNoticias',
                    url: 'https://www.criptonoticias.com/feed/',
                    category: 'crypto',
                    country: 'VE'
                },
                {
                    name: 'Bloomberg Línea',
                    url: 'https://www.bloomberglinea.com/feed/',
                    category: 'finanzas',
                    country: 'LATAM'
                }
            ],
            newsapi: {
                baseUrl: 'https://newsapi.org/v2',
                sources: [
                    'bloomberg',
                    'financial-times',
                    'reuters',
                    'cnbc'
                ],
                keywords: [
                    'dólar Venezuela',
                    'euro Venezuela',
                    'bolívar',
                    'tasas de cambio',
                    'criptomonedas',
                    'bitcoin',
                    'economía Venezuela'
                ]
            }
        }
    };

    // Estado
    let newsCache = {
        data: [],
        timestamp: 0
    };

    // Utilidades
    const utils = {
        /**
         * Verifica si el caché es válido
         */
        isCacheValid() {
            return Date.now() - newsCache.timestamp < CONFIG.CACHE_DURATION;
        },

        /**
         * Limpia HTML de los feeds RSS
         */
        stripHtml(html) {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        },

        /**
         * Formatea fecha
         */
        formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            
            // Menos de 1 hora
            if (diff < 60 * 60 * 1000) {
                const minutes = Math.floor(diff / (60 * 1000));
                return `Hace ${minutes} min`;
            }
            
            // Menos de 24 horas
            if (diff < 24 * 60 * 60 * 1000) {
                const hours = Math.floor(diff / (60 * 60 * 1000));
                return `Hace ${hours} h`;
            }
            
            // Más de 24 horas
            return date.toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        },

        /**
         * Extrae imagen del contenido
         */
        extractImage(content, url) {
            // Intentar encontrar imagen en el contenido
            const imgRegex = /<img[^>]+src="([^">]+)"/;
            const match = content.match(imgRegex);
            
            if (match && match[1]) {
                return match[1];
            }
            
            // Imagen por defecto basada en categoría
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhNzMxYyIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm90aWNpYXM8L3RleHQ+PC9zdmc+';
        },

        /**
         * Categoriza la noticia
         */
        categorize(title, content) {
            const text = (title + ' ' + content).toLowerCase();
            
            if (text.includes('bitcoin') || text.includes('crypto') || text.includes('blockchain')) {
                return 'crypto';
            }
            if (text.includes('dólar') || text.includes('euro') || text.includes('tasa') || text.includes('cambio')) {
                return 'divisas';
            }
            if (text.includes('banco') || text.includes('financiero') || text.includes('inversión')) {
                return 'finanzas';
            }
            
            return 'economia';
        }
    };

    // API NewsAPI.org
    const newsAPI = {
        async fetchNews() {
            try {
                const queries = CONFIG.SOURCES.newsapi.keywords.join(' OR ');
                const url = `${CONFIG.SOURCES.newsapi.baseUrl}/everything?` +
                    `q=${encodeURIComponent(queries)}&` +
                    `language=es&` +
                    `sortBy=publishedAt&` +
                    `pageSize=10&` +
                    `apiKey=${CONFIG.NEWSAPI_KEY}`;

                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`NewsAPI error: ${response.status}`);
                }

                const data = await response.json();
                
                return data.articles.map(article => ({
                    title: article.title,
                    summary: article.description || utils.stripHtml(article.content).substring(0, 200),
                    url: article.url,
                    source: article.source.name,
                    publishedAt: article.publishedAt,
                    image: article.urlToImage,
                    category: utils.categorize(article.title, article.description || ''),
                    type: 'newsapi'
                }));
            } catch (error) {
                console.error('Error fetching NewsAPI:', error);
                return [];
            }
        }
    };

    // RSS Parser
    const rssParser = {
        async fetchFeed(feedConfig) {
            try {
                // Usar un proxy CORS para RSS (rss2json o similar)
                const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedConfig.url)}`;
                
                const response = await fetch(proxyUrl);
                
                if (!response.ok) {
                    throw new Error(`RSS error: ${response.status}`);
                }

                const data = await response.json();
                
                return data.items.slice(0, 5).map(item => ({
                    title: item.title,
                    summary: utils.stripHtml(item.description).substring(0, 200),
                    url: item.link,
                    source: feedConfig.name,
                    publishedAt: item.pubDate,
                    image: utils.extractImage(item.content || item.description, item.link),
                    category: feedConfig.category,
                    country: feedConfig.country,
                    type: 'rss'
                }));
            } catch (error) {
                console.error(`Error fetching RSS ${feedConfig.name}:`, error);
                return [];
            }
        },

        async fetchAllFeeds() {
            const promises = CONFIG.SOURCES.rss.map(feed => this.fetchFeed(feed));
            const results = await Promise.all(promises);
            return results.flat();
        }
    };

    // Funciones principales
    async function fetchAllNews() {
        const [newsApiNews, rssNews] = await Promise.all([
            newsAPI.fetchNews(),
            rssParser.fetchAllFeeds()
        ]);

        // Combinar y ordenar por fecha
        const allNews = [...newsApiNews, ...rssNews]
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, CONFIG.MAX_NEWS);

        // Actualizar caché
        newsCache = {
            data: allNews,
            timestamp: Date.now()
        };

        return allNews;
    }

    async function getNews(forceRefresh = false) {
        if (!forceRefresh && utils.isCacheValid() && newsCache.data.length > 0) {
            return newsCache.data;
        }

        return await fetchAllNews();
    }

    // UI Functions
    function renderNews(news, container) {
        if (!container) {
            container = document.getElementById('news-container');
        }

        if (!container) {
            console.warn('News container not found');
            return;
        }

        container.innerHTML = '';

        if (news.length === 0) {
            container.innerHTML = `
                <div class="news-empty">
                    <i class="fas fa-newspaper"></i>
                    <p>No hay noticias disponibles</p>
                </div>
            `;
            return;
        }

        news.forEach((item, index) => {
            const newsCard = createNewsCard(item, index);
            container.appendChild(newsCard);
        });
    }

    function createNewsCard(news, index) {
        const card = document.createElement('article');
        card.className = `news-card news-card--${news.category}`;
        card.style.animationDelay = `${index * 0.1}s`;

        const categoryIcons = {
            'divisas': 'fa-dollar-sign',
            'crypto': 'fa-bitcoin',
            'finanzas': 'fa-chart-line',
            'economia': 'fa-briefcase'
        };

        const icon = categoryIcons[news.category] || 'fa-newspaper';

        card.innerHTML = `
            <div class="news-card__image">
                <img src="${news.image}" alt="${news.title}" loading="lazy" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhNzMxYyIvPjwvc3ZnPg=='">
                <span class="news-card__category">
                    <i class="fas ${icon}"></i>
                    ${news.category}
                </span>
            </div>
            <div class="news-card__content">
                <h3 class="news-card__title">${news.title}</h3>
                <p class="news-card__summary">${news.summary}</p>
                <div class="news-card__meta">
                    <span class="news-card__source">
                        <i class="fas fa-building"></i>
                        ${news.source}
                    </span>
                    <span class="news-card__date">
                        <i class="fas fa-clock"></i>
                        ${utils.formatDate(news.publishedAt)}
                    </span>
                </div>
                <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="news-card__link">
                    Leer más <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        return card;
    }

    // Inicialización
    async function init() {
        try {
            const news = await getNews();
            const container = document.getElementById('news-container');
            
            if (container) {
                renderNews(news, container);
            }

            // Actualizar cada 30 minutos
            setInterval(async () => {
                const freshNews = await getNews(true);
                if (container) {
                    renderNews(freshNews, container);
                }
            }, CONFIG.CACHE_DURATION);

        } catch (error) {
            console.error('Error initializing news module:', error);
        }
    }

    // Public API
    return {
        init,
        getNews,
        renderNews,
        CONFIG
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.NewsModule = NewsModule;
}

export default NewsModule;