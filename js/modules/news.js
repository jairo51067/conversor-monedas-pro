// js/modules/news.js

export class News {
    constructor() {
        this.containerId = 'news-container';
        // Fuentes de noticias confiables con RSS público
        this.sources = [
            { name: 'Banca y Negocios', url: 'https://www.bancaynegocios.com/feed/' },
            { name: 'CriptoNoticias', url: 'https://www.criptonoticias.com/feed/' }
        ];
    }

    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = '<div class="news-loading"><div class="spinner"></div> Cargando noticias...</div>';

        try {
            const articles = await this.fetchNews();
            this.renderNews(articles, container);
        } catch (error) {
            console.error('Error al cargar noticias:', error);
            container.innerHTML = '<div class="news-error">No se pudieron cargar las noticias. Intenta más tarde.</div>';
        }
    }

    async fetchNews() {
        const allArticles = [];
        
        for (const source of this.sources) {
            try {
                // Usamos allorigins para evitar problemas de CORS al obtener el RSS XML
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
                const response = await fetch(proxyUrl);
                const data = await response.json();
                
                if (data.contents) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                    const items = xmlDoc.querySelectorAll("item");
                    
                    items.forEach((item, index) => {
                        if (index < 3) { // Tomamos solo las 3 más recientes de cada fuente
                            const title = item.querySelector("title")?.textContent || "Sin título";
                            const link = item.querySelector("link")?.textContent || "#";
                            const description = item.querySelector("description")?.textContent || "";
                            const pubDate = item.querySelector("pubDate")?.textContent || "";
                            
                            // Limpiar descripción de etiquetas HTML
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = description;
                            const cleanDescription = tempDiv.textContent || tempDiv.innerText || "";

                            allArticles.push({
                                title: title,
                                link: link,
                                description: cleanDescription.substring(0, 110) + "...",
                                date: new Date(pubDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                                source: source.name
                            });
                        }
                    });
                }
            } catch (error) {
                console.warn(`Error al obtener noticias de ${source.name}:`, error);
            }
        }

        return allArticles;
    }

    renderNews(articles, container) {
        if (articles.length === 0) {
            container.innerHTML = '<div class="news-error">No hay noticias disponibles en este momento.</div>';
            return;
        }

        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'news-grid';

        articles.forEach(article => {
            const card = document.createElement('a');
            card.className = 'news-card';
            card.href = article.link;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            
            card.innerHTML = `
                <div class="news-source">${article.source}</div>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description}</p>
                <div class="news-date"><i class="far fa-clock"></i> ${article.date}</div>
            `;
            
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }
}