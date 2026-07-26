export class News {
  constructor() {
    this.api = "https://jairo-news-api.jairocardenas05.workers.dev";

    this.cacheKey = "currency-news-cache";
  }

  async fetchNews() {
    const cached = localStorage.getItem(this.cacheKey);

    if (cached) {
      const data = JSON.parse(cached);

      const age = Date.now() - data.timestamp;

      if (age < 900000) {
        return data.news;
      }
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const response = await fetch(this.api, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(response.status);
      }

      const data = await response.json();

      console.log("[News API]", data.version);

      const news = data.news || [];

      localStorage.setItem(
        this.cacheKey,

        JSON.stringify({
          timestamp: Date.now(),

          news,
        }),
      );

      return news;
    } catch (error) {
      console.error("[News]", error);

      if (cached) {
        return JSON.parse(cached).news;
      }

      return [];
    }
  }

  createCard(item) {
    const card = document.createElement("article");

    card.className = "news-card";

    const image = item.image
      ? `
<img 
class="news-image"
src="${item.image}"
loading="lazy"
alt="${item.title}">
`
      : "";

    card.innerHTML = `


<a href="${item.link}"
target="_blank"
rel="noopener noreferrer">



${image}



<div class="news-content">


<span class="news-category">

${item.category}

</span>



<h3 class="news-title">

${item.title}

</h3>



<p class="news-description">

${item.description}

</p>



<div class="news-meta">


<span>

${item.source}

</span>


<span>

${new Date(item.date).toLocaleDateString("es-VE", {
  day: "numeric",
  month: "short",
})}

</span>


</div>


</div>


</a>


`;

    return card;
  }

  async render() {
    const container = document.getElementById("news-container");

    if (!container) return;

    container.innerHTML = `

    <div class="news-loading">

        <span></span>
        <span></span>
        <span></span>

    </div>

    `;

    const news = await this.fetchNews();

    console.log("Noticias cargadas:", news);

    if (!news.length) {
      container.innerHTML = `

        <div class="news-empty">

        No hay noticias disponibles

        </div>

        `;

      return;
    }

    const fragment = document.createDocumentFragment();

    news.forEach((item) => {
      fragment.appendChild(this.createCard(item));
    });

    container.innerHTML = "";

    container.appendChild(fragment);
  }

  async init() {
    await this.render();

    const refresh = document.getElementById("refresh-news");

    if (refresh) {
      refresh.addEventListener("click", async () => {
        localStorage.removeItem(this.cacheKey);

        await this.render();
      });
    }
  }
}
