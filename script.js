async function main() {
  const res = await fetch("manifest.json");
  const { items } = await res.json();

  const sections = {
    pdf: document.querySelector('[data-section="pdf"] .grid'),
    game: document.querySelector('[data-section="game"] .grid'),
  };

  for (const key of Object.keys(sections)) {
    const inSection = items.filter((item) => item.type === key);
    if (inSection.length === 0) {
      sections[key].innerHTML = '<p class="empty">Nothing here yet.</p>';
      continue;
    }
    sections[key].innerHTML = inSection
      .map(
        (item) => `
        <a class="card" href="${item.path}" target="_blank" rel="noopener">
          <h3>${item.title}</h3>
          <p>${item.description ?? ""}</p>
        </a>`
      )
      .join("");
  }
}

main();
