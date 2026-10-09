// Photo lightbox for the fabrication detail pages, modelled on the portfolio's project screenshots.
// Each thumbnail is a plain link to the full image, so without JS the photos still open.
const strip = document.querySelector("[data-lightbox]");

if (strip) {
  const links = [...strip.querySelectorAll("a.photo-thumb")];
  const photos = links.map((a) => ({ src: a.href, alt: a.querySelector("img")?.alt ?? "" }));
  let active = null;
  let opener = null;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Fotoviewer");
  box.hidden = true;
  box.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Sluiten">&times;</button>
    <button type="button" class="lightbox-nav lightbox-nav--prev" aria-label="Vorige foto">&larr;</button>
    <img class="lightbox-image" alt="" />
    <button type="button" class="lightbox-nav lightbox-nav--next" aria-label="Volgende foto">&rarr;</button>
    <div class="lightbox-count" aria-live="polite"></div>`;
  document.body.append(box);

  const img = box.querySelector(".lightbox-image");
  const count = box.querySelector(".lightbox-count");
  const closeBtn = box.querySelector(".lightbox-close");

  function show(index) {
    active = (index + photos.length) % photos.length;
    img.src = photos[active].src;
    img.alt = photos[active].alt;
    count.textContent = `${active + 1} / ${photos.length}`;
  }

  function open(index) {
    opener = document.activeElement;
    show(index);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    box.hidden = true;
    active = null;
    document.body.style.overflow = "";
    opener?.focus();
  }

  links.forEach((a, i) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(i);
    })
  );
  closeBtn.addEventListener("click", close);
  box.querySelector(".lightbox-nav--prev").addEventListener("click", () => show(active - 1));
  box.querySelector(".lightbox-nav--next").addEventListener("click", () => show(active + 1));
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  document.addEventListener("keydown", (e) => {
    if (active === null) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(active + 1);
    if (e.key === "ArrowLeft") show(active - 1);
  });
}
