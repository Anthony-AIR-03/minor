const DEFAULT_ICON = { game: "🎮", pdf: "📄" };

async function main() {
  const res = await fetch("manifest.json");
  const { items } = await res.json();

  const grids = {
    game: document.querySelector('[data-grid="game"]'),
    pdf: document.querySelector('[data-grid="pdf"]'),
  };

  document.getElementById("stat-games").textContent = items.filter((i) => i.type === "game").length;
  document.getElementById("stat-pdfs").textContent = items.filter((i) => i.type === "pdf").length;

  for (const type of Object.keys(grids)) {
    const inType = items.filter((item) => item.type === type);
    if (inType.length === 0) {
      grids[type].innerHTML = '<p class="empty">Nog niks hier — binnenkort meer.</p>';
      continue;
    }
    grids[type].innerHTML = inType
      .map(
        (item) => `
        <a class="item-card" href="${item.path}" target="_blank" rel="noopener">
          <div class="item-icon">${item.icon ?? DEFAULT_ICON[type]}</div>
          <h3>${item.title}</h3>
          <p>${item.description ?? ""}</p>
          <span class="item-link">Open <span class="arrow">→</span></span>
        </a>`
      )
      .join("");
  }
}

main();
