export class News {
  constructor() {
    this.api = "https://jairo-news-api.jairocardenas05.workers.dev/";
  }

  async fetchNews() {
    try {
      const response = await fetch(this.api);

      if (!response.ok) throw new Error();

      return await response.json();
    } catch (error) {
      console.error("[News]", error);

      return [];
    }
  }

  async init() {
    const container = document.getElementById("news-container");

    if (!container) return;

    container.innerHTML = `
<div class="loading-state">
Cargando noticias...
</div>
`;

    const news = await this.fetchNews();

    if (news.length === 0) {
      container.innerHTML = `
<p>
No hay noticias disponibles
</p>
`;

      return;
    }

    container.innerHTML = "";

    const list = document.createElement("div");

    list.className = "news-list";

    news.forEach((item) => {
      const card = document.createElement("a");

      card.className = "news-card";

      card.href = item.link;

      card.target = "_blank";

      card.rel = "noopener noreferrer";

      card.innerHTML = `

<div class="news-source">
${item.source}
</div>

<h4 class="news-title">
${item.title}
</h4>

<div class="news-date">
${new Date(item.date).toLocaleDateString("es-VE", {
  day: "numeric",
  month: "short",
})}
</div>

`;

      list.appendChild(card);
    });

    container.appendChild(list);
  }
}
