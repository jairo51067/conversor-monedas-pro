// js/modules/news.js
export class News {
    constructor() {
        this.feeds = [
            { name: 'Banco y Negocios', url: 'https://www.bancaynegocios.com/feed/' },
            { name: 'El Nacional', url: 'https://www.elnacional.com/feed/' },
            { name: 'CriptoNoticias', url: 'https://www.criptonoticias.com/feed/' }
        ];
    }

    async fetchNews() {
        const allNews = [];
        
        for (const feed of this.feeds) {
            try {
                // Intento 1: rss2json (el más estable y diseñado específicamente para RSS)
                let response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
                let data = await response.json();
                
                if (data.status !== 'ok') {
                    throw new Error('rss2json failed');
                }

                const items = data.items.slice(0, 3).map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: new Date(item.pubDate),
                    source: feed.name
                }));
                
                allNews.push(...items);
            } catch (error) {
                console.warn(`Usando respaldo para ${feed.name}:`, error);
                try {
                    // Intento 2: corsproxy.io (excelente respaldo para CORS)
                    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feed.url)}`;
                    const response = await fetch(proxyUrl);
                    const text = await response.text();
                    
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "text/xml");
                    
                    // Verificar si hay errores de parsing XML
                    const parseError = xmlDoc.querySelector("parsererror");
                    if (parseError) throw new Error('XML parsing error');

                    const items = xmlDoc.querySelectorAll("item");
                    
                    const parsedItems = Array.from(items).slice(0, 3).map(item => {
                        const title = item.querySelector("title")?.textContent || "Sin título";
                        const link = item.querySelector("link")?.textContent || "#";
                        const pubDateStr = item.querySelector("pubDate")?.textContent || new Date().toISOString();
                        
                        return {
                            title: title,
                            link: link,
                            pubDate: new Date(pubDateStr),
                            source: feed.name
                        };
                    });
                    
                    allNews.push(...parsedItems);
                } catch (fallbackError) {
                    console.error(`No se pudo cargar el feed de ${feed.name}:`, fallbackError);
                }
            }
        }

        // Ordenar por fecha (más reciente primero) y tomar las 6 más recientes
        return allNews
            .sort((a, b) => b.pubDate - a.pubDate)
            .slice(0, 6);
    }

    async init() {
        const container = document.getElementById('news-container');
        if (!container) return;

        container.innerHTML = '<div class="loading-state">Cargando noticias...</div>';

        try {
            const news = await this.fetchNews();
            
            if (news.length === 0) {
                container.innerHTML = '<p class="text-center" style="color: var(--text-tertiary);">No se pudieron cargar las noticias en este momento.</p>';
                return;
            }

            container.innerHTML = '';
            const list = document.createElement('div');
            list.className = 'news-list';

            news.forEach(item => {
                const dateStr = item.pubDate.toLocaleDateString('es-VE', { 
                    day: 'numeric', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });

                const card = document.createElement('a');
                card.className = 'news-card';
                card.href = item.link;
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
                card.innerHTML = `
                    <div class="news-source">${item.source}</div>
                    <h4 class="news-title">${item.title}</h4>
                    <div class="news-date">${dateStr}</div>
                `;
                list.appendChild(card);
            });

            container.appendChild(list);
        } catch (error) {
            console.error('Error al cargar noticias:', error);
            container.innerHTML = '<p class="text-center" style="color: var(--text-tertiary);">Error al cargar las noticias.</p>';
        }
    }
}