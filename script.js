const TARGET_GAME_SLOTS = 3;

// Each game has a one-colour emblem in games/emblems/<id>.svg (drawn in currentColor).
function gameBadge(game) {
  return `<svg viewBox="0 0 256 256" width="24" height="24" aria-hidden="true"><use href="games/emblems/${game.id}.svg#i" /></svg>`;
}

function renderGameTile(game) {
  const el = document.createElement("a");
  el.className = "tile";
  el.href = game.path;
  el.target = "_blank";
  el.rel = "noopener";
  el.innerHTML = `
    <span class="tile-badge">${gameBadge(game)}</span>
    <h3>${game.title}</h3>
    <p>${game.learningGoal}</p>
    <span class="tile-play">Spelen</span>`;
  return el;
}

function renderSoonTile() {
  const el = document.createElement("div");
  el.className = "tile tile--soon";
  el.innerHTML = `
    <span class="tile-badge">?</span>
    <h3>Nieuwe game</h3>
    <p>Nog niet gebouwd. Gereserveerd voor een later deel van de minor.</p>
    <span class="chip">Binnenkort</span>`;
  return el;
}

async function main() {
  // games/games.json is the one register of games (see games/registry.js).
  const { games, errors } = await window.GameRegistry.load("games/games.json");
  if (errors.length) console.warn("games.json:", errors);

  const countEl = document.querySelector('[data-count="games"]');
  if (countEl) countEl.textContent = games.length;

  const shelf = document.querySelector("[data-games]");
  if (!shelf) return;

  const tiles = [
    ...games.map(renderGameTile),
    ...Array.from({ length: Math.max(0, TARGET_GAME_SLOTS - games.length) }, renderSoonTile),
  ];

  if (tiles.length === 0) {
    shelf.innerHTML = '<p class="empty">Nog niets te zien.</p>';
    return;
  }
  shelf.append(...tiles);
}

main();
