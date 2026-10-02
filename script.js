const TARGET_GAME_SLOTS = 3;

function initials(title) {
  return title
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderGameTile(item) {
  const el = document.createElement("a");
  el.className = "tile";
  el.href = item.path;
  el.target = "_blank";
  el.rel = "noopener";
  el.innerHTML = `
    <span class="tile-badge">${initials(item.title)}</span>
    <h3>${item.title}</h3>
    <p>${item.description ?? ""}</p>
    <span class="tile-play">Play</span>`;
  return el;
}

function renderSoonTile() {
  const el = document.createElement("div");
  el.className = "tile tile--soon";
  el.innerHTML = `
    <span class="tile-badge">?</span>
    <h3>New game</h3>
    <p>Not built yet. Reserved for a later part of the minor.</p>
    <span class="chip">Coming soon</span>`;
  return el;
}

async function main() {
  const res = await fetch("manifest.json");
  const { items } = await res.json();
  const games = items.filter((item) => item.type === "game");

  const countEl = document.querySelector('[data-count="games"]');
  if (countEl) countEl.textContent = games.length;

  const shelf = document.querySelector("[data-games]");
  if (!shelf) return;

  const tiles = [
    ...games.map(renderGameTile),
    ...Array.from({ length: Math.max(0, TARGET_GAME_SLOTS - games.length) }, renderSoonTile),
  ];

  if (tiles.length === 0) {
    shelf.innerHTML = '<p class="empty">Nothing here yet.</p>';
    return;
  }
  shelf.append(...tiles);
}

main();
