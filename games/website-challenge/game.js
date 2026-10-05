/* =========================================================
   Website Challenge — educatieve game (Bloom: Creëren)
   Thema: missiecontrole. Bouw zelf een website (HTML + CSS) vanuit requirements;
   het Go/No-Go-bord controleert live, en bij de lancering zie je per onderdeel hoe je ervoor staat.
   ========================================================= */

/* ---------- vaste gamestekker ---------- */
const gameInfo = {
  gameId: 'website-challenge',
  learningGoal: 'De leerling kan zelfstandig HTML en CSS combineren om vanuit requirements een eenvoudige, werkende website te bouwen.',
  bloom: 'Creëren',
  successCriterion: 'Bij de lancering staat minimaal 80% van de automatische checks (HTML-structuur, CSS-styling, layout en codekwaliteit) op GO.'
};

function reportCompletion(score, maxScore) {
  const message = {
    type: 'GAME_COMPLETED',
    gameId: gameInfo.gameId,
    score,
    maxScore
  };
  console.info('GAME_COMPLETED', message);
  if (window.parent !== window) {
    window.parent.postMessage(message, window.location.origin);
  }
}

(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const app = document.getElementById('app');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Tekst met `code` tussen backticks wordt een code-label.
  const fmt = (str) => esc(str).replace(/`([^`]+)`/g, '<code>$1</code>');
  const STORE_KEY = 'website-challenge:v1';

  /* ---------- de klanten en hun materiaal ---------- */
  const svg = (w, h, body) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
  const BRIEFS = [
    {
      id: 'gamewinkel',
      client: 'Gamewinkel Level Up',
      pitch: 'Een gamewinkel wil een simpele site: een welkom, een knop naar het aanbod en twee uitgelichte games met prijs.',
      texts: ['Level Up', 'Welkom bij Level Up', 'De gezelligste gamewinkel van de stad. Kom spelen, kopen en ruilen!', 'Bekijk games', 'Turbo Racer · € 29,99', 'Puzzle Planet · € 39,99'],
      assets: {
        'logo.svg': svg(140, 44, '<rect width="140" height="44" rx="10" fill="#6d28d9"/><text x="70" y="29" font-family="sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">LEVEL UP</text>'),
        'controller.svg': svg(240, 140, '<rect width="240" height="140" fill="#ede9fe"/><rect x="50" y="45" width="140" height="56" rx="28" fill="#6d28d9"/><circle cx="85" cy="73" r="10" fill="#fff"/><circle cx="155" cy="66" r="6" fill="#fde047"/><circle cx="170" cy="80" r="6" fill="#f472b6"/>'),
        'racer.svg': svg(200, 110, '<rect width="200" height="110" fill="#fee2e2"/><rect x="40" y="50" width="120" height="28" rx="10" fill="#dc2626"/><circle cx="70" cy="82" r="11" fill="#111"/><circle cx="130" cy="82" r="11" fill="#111"/>'),
        'puzzle.svg': svg(200, 110, '<rect width="200" height="110" fill="#dcfce7"/><rect x="60" y="25" width="36" height="36" fill="#16a34a"/><rect x="100" y="25" width="36" height="36" fill="#22c55e"/><rect x="60" y="65" width="36" height="20" fill="#22c55e"/><rect x="100" y="65" width="36" height="20" fill="#16a34a"/>')
      }
    },
    {
      id: 'dierenasiel',
      client: 'Dierenasiel Pootjes',
      pitch: 'Een dierenasiel zoekt baasjes. De site moet uitnodigen om langs te komen en twee dieren laten zien die een thuis zoeken.',
      texts: ['Pootjes', 'Een nieuw thuis voor elk dier', 'Bij Pootjes wachten honden en katten op een lief baasje. Kom eens kennismaken!', 'Plan een bezoek', 'Bobbie · hond, 3 jaar', 'Minoes · kat, 1 jaar'],
      assets: {
        'logo.svg': svg(140, 44, '<rect width="140" height="44" rx="10" fill="#c2410c"/><text x="70" y="29" font-family="sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">POOTJES</text>'),
        'pootje.svg': svg(240, 140, '<rect width="240" height="140" fill="#ffedd5"/><circle cx="120" cy="86" r="26" fill="#c2410c"/><circle cx="88" cy="52" r="11" fill="#c2410c"/><circle cx="110" cy="40" r="11" fill="#c2410c"/><circle cx="132" cy="40" r="11" fill="#c2410c"/><circle cx="154" cy="52" r="11" fill="#c2410c"/>'),
        'hond.svg': svg(200, 110, '<rect width="200" height="110" fill="#fef3c7"/><circle cx="100" cy="58" r="30" fill="#b45309"/><ellipse cx="70" cy="44" rx="10" ry="20" fill="#78350f"/><ellipse cx="130" cy="44" rx="10" ry="20" fill="#78350f"/><circle cx="90" cy="54" r="4" fill="#111"/><circle cx="110" cy="54" r="4" fill="#111"/>'),
        'kat.svg': svg(200, 110, '<rect width="200" height="110" fill="#e0f2fe"/><circle cx="100" cy="60" r="30" fill="#475569"/><path d="M74 42l6-22 14 14zM126 42l-6-22-14 14z" fill="#475569"/><circle cx="90" cy="56" r="4" fill="#fde047"/><circle cx="110" cy="56" r="4" fill="#fde047"/>')
      }
    },
    {
      id: 'bakkerij',
      client: 'Bakkerij De Krentenbol',
      pitch: 'Een bakkerij wil laten zien wat er vandaag uit de oven komt, met een knop om te bestellen en twee lekkernijen in de etalage.',
      texts: ['De Krentenbol', 'Vers uit de oven', 'Elke ochtend om zes uur staat de oven aan. Proef het verschil!', 'Bestel nu', 'Krentenbol · € 0,85', 'Appeltaart · € 12,50'],
      assets: {
        'logo.svg': svg(140, 44, '<rect width="140" height="44" rx="10" fill="#a16207"/><text x="70" y="29" font-family="sans-serif" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">KRENTENBOL</text>'),
        'oven.svg': svg(240, 140, '<rect width="240" height="140" fill="#fef9c3"/><rect x="60" y="30" width="120" height="86" rx="10" fill="#57534e"/><rect x="76" y="54" width="88" height="44" rx="6" fill="#f97316"/><circle cx="84" cy="42" r="4" fill="#fde047"/><circle cx="100" cy="42" r="4" fill="#fde047"/>'),
        'bol.svg': svg(200, 110, '<rect width="200" height="110" fill="#fef3c7"/><ellipse cx="100" cy="62" rx="44" ry="30" fill="#d97706"/><circle cx="86" cy="56" r="4" fill="#451a03"/><circle cx="108" cy="66" r="4" fill="#451a03"/><circle cx="116" cy="52" r="4" fill="#451a03"/>'),
        'taart.svg': svg(200, 110, '<rect width="200" height="110" fill="#ffe4e6"/><path d="M50 80h100l-10-34H60z" fill="#d97706"/><path d="M60 46h80" stroke="#fde68a" stroke-width="8"/><path d="M50 80h100v8H50z" fill="#92400e"/>')
      }
    }
  ];

  // De bestanden beginnen leeg; de uitleg staat als placeholder in het invulveld en verdwijnt zodra je typt.
  const PLACEHOLDER = {
    html: 'Missie: bouw hier je website.\n\nBegin met de basisstructuur: doctype, html,\nhead (met een title en een link naar style.css)\nen body.',
    css: 'Schrijf hier je CSS.\n\nVergeet niet: zonder <link rel="stylesheet" href="style.css">\nin je HTML leest de browser dit bestand niet.'
  };
  // Oude startteksten van eerdere versies: wie die nog bewaard heeft, krijgt gewoon een leeg veld met placeholder.
  const OLD_STARTERS = ['<!-- Missie: bouw hier je website.\n     Begin met de basisstructuur: doctype, html, head (met een title\n     en een link naar style.css) en body. -->\n', '/* Schrijf hier je CSS. */\n'];
  const fromSaved = (v) => (OLD_STARTERS.includes(v) ? '' : v);

  /* ---------- de stations en hun checks (de requirements uit het plan) ---------- */
  // Elke check krijgt het document van de preview (gemeten op desktopbreedte) en de broncode.
  const SEMANTIC = ['header', 'nav', 'main', 'section', 'article', 'footer'];
  const cardsOf = (doc) => [...doc.querySelectorAll('[class]')].filter((el) => [...el.classList].some((c) => /card/i.test(c)));
  const STATIONS = [
    {
      id: 'html', name: 'HTML-structuur', from: 'HTML Hunter en Build the DOM',
      checks: [
        { id: 'skeleton', label: 'Geldige basisstructuur: doctype, `<html>`, `<head>` met `<title>`, `<body>`',
          test: (d, s) => /<!doctype html>/i.test(s.html) && /<html[\s>]/i.test(s.html) && /<head[\s>]/i.test(s.html) && /<body[\s>]/i.test(s.html) && !!d.title.trim(),
          hint: 'Elke pagina begint met `<!doctype html>`, daarna `<html>` met daarin `<head>` (met een `<title>`) en `<body>`. Weet je het nog uit Build the DOM?' },
        { id: 'h1', label: 'Precies één `<h1>`', test: (d) => d.querySelectorAll('h1').length === 1,
          hint: 'Een pagina heeft één hoofdtitel: één `<h1>`. Andere koppen worden `<h2>` of `<h3>`.' },
        { id: 'intro', label: 'Een introductietekst in een `<p>`', test: (d) => [...d.querySelectorAll('p')].some((p) => p.textContent.trim().length >= 20),
          hint: 'Schrijf een paar zinnen over de klant in een `<p>`, zodat bezoekers weten waar de site over gaat.' },
        { id: 'img', label: 'Minstens één afbeelding die echt laadt', test: (d) => [...d.querySelectorAll('img')].some((i) => i.getAttribute('src') && i.complete && i.naturalWidth > 0),
          hint: 'Gebruik `<img src="…">` met precies een bestandsnaam uit de materiaalkist. Zie je een kapot plaatje? Dan klopt de naam niet.' },
        { id: 'navlink', label: 'Een navigatielink in een `<nav>`', test: (d) => !!d.querySelector('nav a[href]'),
          hint: 'Een menu is een `<nav>` met links: `<a href="…">`. Uit Code Review weet je: naar een andere pagina gaan doe je met een link.' },
        { id: 'button', label: 'Een knop', test: (d) => !!d.querySelector('button') || [...d.querySelectorAll('a[class]')].some((a) => /btn|button|knop/i.test(a.className)),
          hint: 'Voeg een `<button>` toe, of een link met een class als `btn` die eruitziet als knop.' },
        { id: 'cards', label: 'Minstens twee cards (een class met "card" erin)', test: (d) => cardsOf(d).length >= 2,
          hint: 'Maak twee blokken voor de uitgelichte producten of dieren, elk met een class zoals `card`.' }
      ]
    },
    {
      id: 'css', name: 'CSS-styling', from: 'Style Lab',
      checks: [
        { id: 'external', label: 'Externe CSS: `style.css` is gelinkt en niet leeg',
          test: (d, s) => /<link[^>]+rel=["']?stylesheet["']?[^>]*href=["']?style\.css["']?|<link[^>]+href=["']?style\.css["']?[^>]*rel=["']?stylesheet/i.test(s.html) && /[a-z-]+\s*:\s*[^;{}]+/i.test(s.css.replace(/\/\*[\s\S]*?\*\//g, '')),
          hint: 'Zet in `<head>` een `<link rel="stylesheet" href="style.css">`. Zonder die link leest de browser je CSS niet, hoe goed hij ook is.' },
        { id: 'colors', label: 'Kleuren: een gekleurde achtergrond én gekleurde tekst',
          test: (d) => {
            const els = [d.body, ...d.body.querySelectorAll('*')];
            const bg = els.some((el) => { const c = getComputedStyle(el).backgroundColor; return c !== 'rgba(0, 0, 0, 0)' && c !== 'rgb(255, 255, 255)'; });
            const fg = els.some((el) => getComputedStyle(el).color !== 'rgb(0, 0, 0)' && !['A', 'BUTTON'].includes(el.tagName));
            return bg && fg;
          },
          hint: 'Geef iets een `background` (bijvoorbeeld de kop of de cards) en geef tekst een eigen `color`.' },
        { id: 'spacing', label: 'Spacing: de cards hebben `padding`',
          test: (d) => { const cs = cardsOf(d); return cs.length > 0 && cs.every((c) => parseFloat(getComputedStyle(c).paddingTop) >= 6); },
          hint: 'Geef je cards ruimte bínnen de rand met `padding`, zodat de tekst niet tegen de rand plakt.' }
      ]
    },
    {
      id: 'layout', name: 'Layout', from: 'Layout Builder',
      checks: [
        { id: 'flex', label: 'Een flexbox-layout (`display: flex`)', test: (d) => [...d.body.querySelectorAll('*')].some((el) => getComputedStyle(el).display === 'flex'),
          hint: 'Zet `display: flex` op een ouder-element om de kinderen naast elkaar te krijgen.' },
        { id: 'side', label: 'De cards staan naast elkaar',
          test: (d) => {
            const r = cardsOf(d).map((c) => c.getBoundingClientRect());
            return r.some((a, i) => r.some((b, j) => j > i && Math.abs(a.top - b.top) < 12 && Math.abs(a.left - b.left) > 40));
          },
          hint: 'Zet de cards samen in één ouder-element en maak díe ouder een flex-container. Flexbox werkt op de kinderen.' },
        { id: 'header', label: 'Kop: titel of logo en navigatie op één rij',
          test: (d) => {
            const nav = d.querySelector('nav');
            if (!nav) return false;
            const n = nav.getBoundingClientRect();
            const others = [...d.querySelectorAll('header > *, header h1, header img, header .logo')].filter((el) => el !== nav && !nav.contains(el) && !el.contains(nav));
            return others.some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.top < n.bottom && n.top < r.bottom && Math.abs(r.left - n.left) > 40; });
          },
          hint: 'Zet het logo of de sitenaam en de `<nav>` samen in een `<header>`, en maak die header een flex-container (denk aan `justify-content`).' }
      ]
    },
    {
      id: 'quality', name: 'Codekwaliteit', from: 'Code Review',
      checks: [
        { id: 'semantic', label: 'Semantische tags: minstens twee van `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`',
          test: (d) => SEMANTIC.filter((t) => d.querySelector(t)).length >= 2,
          hint: 'Gebruik tags die zeggen wat iets ís: `<header>` voor de kop, `<main>` voor de inhoud, `<section>` of `<article>` voor blokken.' },
        { id: 'alt', label: 'Elke afbeelding heeft een `alt`-attribuut', test: (d) => { const imgs = d.querySelectorAll('img'); return imgs.length > 0 && [...imgs].every((i) => i.hasAttribute('alt')); },
          hint: 'Geef elke `<img>` een `alt`: een beschrijving als het plaatje informatie geeft, of `alt=""` als het alleen versiering is.' },
        { id: 'inline', label: 'Geen inline styles (`style="…"`)', test: (d, s) => s.html.trim().length > 0 && !d.querySelector('[style]'),
          hint: 'Zet je stijlen in `style.css` in plaats van in een `style`-attribuut. Dan staat alle opmaak op één plek.' },
        { id: 'names', label: 'Duidelijke classnamen (geen `a`, `x1` of `div2`)',
          test: (d) => {
            const names = [...new Set([...d.querySelectorAll('[class]')].flatMap((el) => [...el.classList]))];
            return names.length > 0 && names.every((n) => n.length >= 3 && !/^[a-z]{1,3}\d+$/i.test(n) && !/^(div|box|item|thing|klasse)\d*$/i.test(n));
          },
          hint: 'Kies namen die zeggen wat iets is, zoals `card`, `hero` of `price`, in plaats van `a`, `x1` of `div2`.' }
      ]
    }
  ];
  const ALL_CHECKS = STATIONS.flatMap((st) => st.checks.map((c) => ({ ...c, station: st.id })));
  const MAX_SCORE = ALL_CHECKS.length;
  const PASS_RATIO = 0.8;
  const NEED = Math.ceil(MAX_SCORE * PASS_RATIO);

  /* ---------- state ---------- */
  let state = null;
  let roundCounter = 0;

  function newRound(brief, saved) {
    roundCounter += 1;
    state = {
      round: roundCounter,
      brief: brief.id,
      html: saved ? fromSaved(saved.html) : '',
      css: saved ? fromSaved(saved.css) : '',
      tab: 'html',
      results: {},       // check-id → true/false
      launched: false,
      reported: false,   // voorkomt meerdere GAME_COMPLETED-berichten per ronde
      best: 0
    };
  }
  const brief = () => BRIEFS.find((b) => b.id === state.brief);
  const score = () => ALL_CHECKS.filter((c) => state.results[c.id]).length;

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ brief: state.brief, html: state.html, css: state.css })); } catch (_) { /* geen opslag: gewoon doorgaan */ }
  }
  function loadSaved() {
    try { const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); return s && BRIEFS.some((b) => b.id === s.brief) && typeof s.html === 'string' ? s : null; } catch (_) { return null; }
  }

  /* ---------- kop + lanceertoren ---------- */
  const PATCH = '<svg class="patch" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#e8361a"/><circle cx="32" cy="32" r="24" fill="none" stroke="#fff" stroke-width="2"/><path d="M32 14l4.6 11.8 12.6.8-9.8 8.1 3.2 12.3L32 40.2l-10.6 6.8 3.2-12.3-9.8-8.1 12.6-.8z" fill="#fff"/></svg>';

  function header() {
    return `
      <header class="mast">
        <div class="mast-left">${PATCH}<div><p class="mast-kicker">Missie 8 van 8</p><h1>Website Challenge</h1></div></div>
        <div class="mast-right"><span>Bloom</span><b>Creëren</b></div>
      </header>`;
  }

  // De vier trappen van de raket: vol als alle checks van dat station GO zijn.
  function stages() {
    const nogo = ALL_CHECKS.filter((c) => !state.results[c.id]).length;
    return `<div class="stages" aria-label="Status per station">
      ${STATIONS.map((st) => {
        const ok = st.checks.filter((c) => state.results[c.id]).length;
        const all = ok === st.checks.length;
        return `<div class="stage-cell${all ? ' go' : ''}"><span class="st-name">${st.name}</span><span class="st-count">${ok}/${st.checks.length}</span><span class="st-bar"><i style="width:${Math.round((ok / st.checks.length) * 100)}%"></i></span></div>`;
      }).join('')}
      <div class="countdown"><span>No-go</span><b>${nogo}</b></div>
    </div>`;
  }

  /* ---------- startscherm: kies je klant ---------- */
  function renderStart() {
    window.scrollTo(0, 0);
    const saved = loadSaved();
    app.innerHTML = `
      ${header()}
      <main class="sheet intro">
        <div class="cols">
          <section>
            <p class="label">01 · Briefing</p>
            <h2>Je laatste missie: lanceer je eigen website.</h2>
            <p class="lead">Je kunt elementen herkennen, structureren, stylen, indelen, debuggen, voorspellen en beoordelen. Nu komt alles samen. Je krijgt <b>geen code</b>, alleen een klant en een lijst requirements. De rest bepaal jij.</p>
          </section>
          <section>
            <p class="label">02 · Procedure</p>
            <ol class="steps">
              <li>Kies een klant.</li>
              <li>Schrijf zelf <code>index.html</code> en <code>style.css</code>.</li>
              <li>Het <b>Go/No-Go-bord</b> controleert live ${MAX_SCORE} requirements.</li>
              <li>Lanceer. Staan er minimaal <b>${NEED}</b> (80%) op GO, dan is de missie geslaagd.</li>
            </ol>
          </section>
        </div>
        ${saved ? `<div class="resume"><span>Je hebt al een missie lopen voor <b>${esc(BRIEFS.find((b) => b.id === saved.brief).client)}</b>.</span><button class="btn" id="resumeBtn" type="button">Ga verder met bouwen →</button></div>` : ''}
        <p class="label">03 · Kies je klant</p>
        <div class="briefs">${BRIEFS.map((b) => `
          <button type="button" class="brief-card" data-brief="${b.id}">
            <img src="${b.assets['logo.svg']}" alt="" width="140" height="44">
            <b>${esc(b.client)}</b>
            <span>${esc(b.pitch)}</span>
            <em>${saved ? 'Nieuwe missie starten →' : 'Start de missie →'}</em>
          </button>`).join('')}</div>
      </main>`;
    app.querySelectorAll('[data-brief]').forEach((b) => b.addEventListener('click', () => {
      newRound(BRIEFS.find((x) => x.id === b.dataset.brief), null);
      save();
      renderWorkshop();
    }));
    const r = document.getElementById('resumeBtn');
    if (r) r.addEventListener('click', () => { newRound(BRIEFS.find((x) => x.id === saved.brief), saved); renderWorkshop(); });
  }

  /* =========================================================
     DE WERKPLAATS
     ========================================================= */
  // De pagina zoals de browser hem ziet: style.css wordt alleen geladen als hij gelinkt is, plaatjes uit de materiaalkist.
  function buildDoc() {
    const b = brief();
    let html = state.html;
    html = html.replace(/<link\b[^>]*href=["']?style\.css["']?[^>]*>/gi, (tag) => (/stylesheet/i.test(tag) ? `<style>${state.css.replace(/<\/style/gi, '')}</style>` : tag));
    html = html.replace(/(src|href)=(["'])([\w.-]+\.svg)\2/gi, (m, attr, q, name) => (b.assets[name] ? `${attr}=${q}${b.assets[name]}${q}` : m));
    html = html.replace(/url\((["']?)([\w.-]+\.svg)\1\)/gi, (m, q, name) => (b.assets[name] ? `url("${b.assets[name]}")` : m));
    // Geen scripts in de preview, en links openen niets: target="_blank" plus een sandbox zonder pop-ups.
    html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
    // In <head> zetten: vóór het doctype zou de pagina in quirks mode belanden.
    const base = '<base target="_blank">';
    if (/<head\b[^>]*>/i.test(html)) return html.replace(/<head\b[^>]*>/i, (h) => h + base);
    if (/<!doctype[^>]*>/i.test(html)) return html.replace(/<!doctype[^>]*>/i, (d) => d + base);
    return base + html;
  }

  function renderWorkshop() {
    const b = brief();
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <div id="stages">${stages()}</div>
      <div class="workshop">
        <section class="sheet editor-pane" aria-label="Code">
          <div class="pane-head"><p class="label">Klant · ${esc(b.client)}</p><button class="link" id="switchBtn" type="button">Andere klant</button></div>
          <p class="pitch">${esc(b.pitch)}</p>
          <div class="tabs" role="tablist">
            <button type="button" role="tab" class="tab" data-tab="html" aria-selected="${state.tab === 'html'}">index.html</button>
            <button type="button" role="tab" class="tab" data-tab="css" aria-selected="${state.tab === 'css'}">style.css</button>
          </div>
          <textarea id="editor" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code van ${state.tab === 'html' ? 'index.html' : 'style.css'}"></textarea>
          <details class="kit" open>
            <summary>Materiaalkist</summary>
            <p class="kit-note">Afbeeldingen: gebruik de bestandsnaam, bijvoorbeeld <code>&lt;img src="logo.svg" alt="…"&gt;</code>.</p>
            <div class="assets">${Object.entries(b.assets).map(([n, src]) => `<figure><img src="${src}" alt=""><figcaption><code>${n}</code></figcaption></figure>`).join('')}</div>
            <p class="kit-note">Teksten om te gebruiken (of verzin je eigen):</p>
            <ul class="texts">${b.texts.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          </details>
        </section>
        <section class="right-pane">
          <div class="preview-head"><p class="label">Live preview</p><span class="muted" id="previewNote"></span></div>
          <div class="frame"><iframe id="preview" title="Preview van je website" sandbox="allow-same-origin"></iframe></div>
          <section class="board" aria-label="Go/No-Go-bord">
            <p class="label">Go/No-Go-bord</p>
            <div id="board"></div>
          </section>
          <div class="launch" id="launch"></div>
        </section>
      </div>
      <iframe id="measure" class="measure" title="" aria-hidden="true" tabindex="-1" sandbox="allow-same-origin"></iframe>`;
    const ta = document.getElementById('editor');
    ta.value = state[state.tab];
    ta.placeholder = PLACEHOLDER[state.tab];
    ta.addEventListener('input', () => { state[state.tab] = ta.value; save(); schedule(); });
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
    });
    app.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => {
      state.tab = t.dataset.tab;
      app.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x.dataset.tab === state.tab)));
      ta.value = state[state.tab];
      ta.placeholder = PLACEHOLDER[state.tab];
      ta.setAttribute('aria-label', `Code van ${state.tab === 'html' ? 'index.html' : 'style.css'}`);
      ta.focus();
    }));
    document.getElementById('switchBtn').addEventListener('click', renderStart);
    refresh();
  }

  let timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(refresh, 450);
  }

  // Preview bijwerken en alle checks draaien op een vaste desktopbreedte.
  async function refresh() {
    const doc = buildDoc();
    const preview = document.getElementById('preview');
    const measure = document.getElementById('measure');
    if (!preview || !measure) return;
    preview.srcdoc = doc;
    await new Promise((resolve) => { measure.onload = resolve; measure.srcdoc = doc; });
    const d = measure.contentDocument;
    if (!d || !d.body) return;
    const src = { html: state.html, css: state.css };
    for (const c of ALL_CHECKS) {
      let ok = false;
      try { ok = !!c.test(d, src); } catch (_) { ok = false; }
      state.results[c.id] = ok;
    }
    document.getElementById('stages').innerHTML = stages();
    renderBoard();
    renderLaunch();
    document.getElementById('previewNote').textContent = /<link\b[^>]*style\.css/i.test(state.html) ? '' : 'style.css is nog niet gelinkt';
  }

  function renderBoard() {
    document.getElementById('board').innerHTML = STATIONS.map((st) => `
      <div class="station">
        <div class="station-head"><b>${st.name}</b><span>geleerd in ${st.from}</span></div>
        <ul>${st.checks.map((c) => {
          const ok = state.results[c.id];
          return `<li class="${ok ? 'go' : 'nogo'}"><span class="flag">${ok ? 'GO' : 'NO-GO'}</span><span class="what">${fmt(c.label)}${ok ? '' : `<details><summary>Hint</summary>${fmt(c.hint)}</details>`}</span></li>`;
        }).join('')}</ul>
      </div>`).join('');
  }

  function renderLaunch(confirming) {
    const box = document.getElementById('launch');
    if (!box) return;
    const s = score();
    const ready = s >= NEED;
    box.innerHTML = confirming
      ? `<p class="warn">Nog <b>${MAX_SCORE - s}</b> stations op NO-GO. Je hebt er minimaal ${NEED} op GO nodig voor een geslaagde missie. Toch lanceren?</p>
         <div class="row"><button class="btn" id="goAnyway" type="button">Ja, lanceer</button><button class="btn ghost" id="notYet" type="button">Nee, verder bouwen</button></div>`
      : `<div class="row"><button class="btn${ready ? ' armed' : ''}" id="launchBtn" type="button">${ready ? 'Klaar voor lancering: lanceer! 🚀' : 'Lanceer de website'}</button><span class="muted">${s} van ${MAX_SCORE} op GO · minimaal ${NEED} nodig</span></div>`;
    if (confirming) {
      document.getElementById('goAnyway').addEventListener('click', launch);
      document.getElementById('notYet').addEventListener('click', () => renderLaunch(false));
    } else {
      document.getElementById('launchBtn').addEventListener('click', () => (ready ? launch() : renderLaunch(true)));
    }
  }

  /* =========================================================
     LANCERING — telemetrie per onderdeel
     ========================================================= */
  async function launch() {
    // Een dubbelklik mag niet twee lanceringen (en twee GAME_COMPLETED-berichten) starten.
    if (state.launching) return;
    state.launching = true;
    clearTimeout(timer);
    try { await refresh(); } finally { state.launching = false; }
    const s = score();
    const passed = s >= NEED;
    state.launched = true;
    state.best = Math.max(state.best, s);
    if (passed && !state.reported) {
      state.reported = true; // eerst markeren: nooit twee keer per ronde
      try {
        reportCompletion(s, MAX_SCORE);
      } catch (err) {
        console.warn('reportCompletion kon het bericht niet versturen:', err);
      }
    }
    renderEnd(s, passed);
    playLaunch(outcomeOf(s));
  }

  /* ---------- de afloop van de lancering hangt af van het aantal GO's ---------- */
  const OUTCOMES = [
    { id: 'fizzle', max: 3, label: 'Lancering afgebroken', title: 'Vonken, rook… en geen liftoff',
      text: 'De motor sputtert, maar de raket komt geen centimeter van het platform. Zonder stevig fundament vliegt niets: begin bij de basis van je pagina.' },
    { id: 'explode', max: 9, label: 'Lancering mislukt', title: 'Uit elkaar onder de druk',
      text: 'Hij komt los en klimt, maar bij Max Q, het moment van de hoogste luchtdruk, houdt de constructie het niet. Er zitten nog te veel zwakke plekken in.' },
    { id: 'fallback', max: 13, label: 'Lancering mislukt', title: 'Zó dichtbij de ruimte',
      text: 'Een prachtige klim, tot vlak onder de ruimtegrens. Daar valt de motor stil en zakt de raket terug naar de aarde. Nog een paar requirements op GO, en je haalt de baan.' },
    { id: 'orbit', max: 16, label: 'Missie geslaagd', title: 'In een baan om de aarde',
      text: 'Een foutloze klim, de motor precies op tijd uit, een strakke trapscheiding en een stabiele baan. Je website draait nu zijn rondjes om de aarde.' },
    { id: 'deep', max: Infinity, label: 'Missie geslaagd · bonus ontgrendeld', title: 'Voorbij de horizon',
      text: 'Elke requirement op GO. Waar andere raketten in een baan blijven hangen, blijft de jouwe doorvliegen: langs de maan, de sterren tegemoet. Hoger dan dit kan niet.' }
  ];
  const outcomeOf = (n) => OUTCOMES.find((o) => n <= o.max);
  // Het zwakste station, zodat een mislukte lancering meteen vertelt waar je aan moet werken.
  function weakestStation() {
    if (!state || !state.results) return null;
    const rows = STATIONS.map((st) => ({ name: st.name, ok: st.checks.filter((c) => state.results[c.id]).length, all: st.checks.length }))
      .filter((r) => r.ok < r.all)
      .sort((a, b) => a.ok / a.all - b.ok / b.all);
    return rows[0] || null;
  }
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ROCKET_BODY = '<svg class="body" viewBox="0 0 80 126" aria-hidden="true"><path d="M40 6c16 18 22 42 22 70v38H18V76c0-28 6-52 22-70z" fill="#fff" stroke="#111" stroke-width="4"/><circle cx="40" cy="62" r="10" fill="#e8361a" stroke="#111" stroke-width="4"/><path d="M18 96 4 124h14zM62 96l14 28H62z" fill="#e8361a" stroke="#111" stroke-width="4" stroke-linejoin="round"/><path d="M26 114h28v8H26z" fill="#111"/></svg>';
  const rocketHtml = (cls = '') => `<div class="rk ${cls}"><div class="rk-flame"></div>${ROCKET_BODY}</div>`;

  // Sterren als box-shadows op één puntje: goedkoop en scherp. Vaste seed, zodat de hemel elke keer hetzelfde is.
  function starShadows(n, w, h, seed) {
    let x = seed;
    const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: n }, () => `${Math.round(rnd() * w)}px ${Math.round(rnd() * h)}px 0 ${rnd() < 0.15 ? 1 : 0}px rgba(255,255,255,${(0.45 + rnd() * 0.55).toFixed(2)})`).join(',');
  }

  /* =========================================================
     DE LANCERING — eerst op volledig scherm, daarna eindigt hij in het rapport
     ========================================================= */
  let cinema = null;

  function playLaunch(outcome) {
    if (reducedMotion()) return;
    closeLaunch();
    const sw = Math.max(window.innerWidth, 400);
    const sh = Math.max(window.innerHeight, 400);
    const el = document.createElement('div');
    el.className = 'cinema';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'De lancering');
    el.innerHTML = `
      <div class="cin-scene">
        <div class="cin-sky"></div>
        <div class="cin-space"></div>
        <div class="cin-stars"><i style="box-shadow:${starShadows(170, sw, sh * 2, 7)}"></i></div>
        <div class="cin-stars far"><i style="box-shadow:${starShadows(120, sw, sh * 2, 31)}"></i></div>
        <div class="cin-earth"></div>
        <div class="cin-world">
          <div class="cin-cloud c1"></div><div class="cin-cloud c2"></div><div class="cin-cloud c3"></div>
          <div class="cin-ground"></div><div class="cin-tower"></div><div class="cin-platform"></div>
        </div>
        <div class="cin-rocket">${rocketHtml()}</div>
        <div class="cin-fx"></div>
      </div>
      <div class="cin-flash"></div>
      <div class="cin-count" aria-live="assertive"></div>
      <div class="cin-caption" hidden>
        <p class="label">${outcome.label}</p>
        <h2>${outcome.title}</h2>
        <p>${outcome.text}</p>
        ${['fizzle', 'explode', 'fallback'].includes(outcome.id) && weakestStation() ? `<p class="cin-fix">Grootste probleem: <b>${weakestStation().name}</b> (${weakestStation().ok} van ${weakestStation().all} GO). Daar begint je volgende poging.</p>` : ''}
        <button class="btn" type="button" data-close>Naar het missierapport →</button>
      </div>
      <button class="cin-skip" type="button" data-close>Overslaan ✕</button>`;
    document.body.appendChild(el);
    document.body.classList.add('no-scroll');
    cinema = { el, stopped: false, rocket: { x: 0, y: 0, r: 0, s: 1 } };
    mcMount(cinema, outcome.id);
    el.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeLaunch));
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLaunch(); });
    el.querySelector('.cin-skip').focus({ preventScroll: true });
    const run = { fizzle: runFizzle, explode: runExplode, fallback: runFallback, orbit: runOrbit, deep: runDeep }[outcome.id];
    const me = cinema;
    run(me).then(() => mcIdle(me)).then(() => {
      if (me.stopped) return;
      const cap = me.el.querySelector('.cin-caption');
      cap.hidden = false;
      cap.animate([{ opacity: 0, transform: 'translate(-50%, 20px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 500, easing: 'ease-out', fill: 'forwards' });
      cap.querySelector('button').focus({ preventScroll: true });
    }).catch((err) => { if (err !== STOP) console.warn(err); });
  }

  function closeLaunch() {
    if (!cinema) return;
    cinema.stopped = true;
    if (cinema.mc) clearInterval(cinema.mc.clock);
    cinema.el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    cinema.el.remove();
    cinema = null;
    document.body.classList.remove('no-scroll');
    const replay = document.getElementById('replay');
    if (replay) replay.focus({ preventScroll: true });
  }

  /* ---------- bouwstenen van de film ---------- */
  const STOP = {};
  const $c = (c, sel) => c.el.querySelector(sel);
  const wait = (c, ms) => new Promise((res, rej) => setTimeout(() => (c.stopped ? rej(STOP) : res()), ms));
  function go(c, el, frames, opts) {
    if (c.stopped) return Promise.reject(STOP);
    const a = el.animate(frames, { fill: 'forwards', easing: 'ease-in-out', ...opts });
    return a.finished.then(() => { if (c.stopped) throw STOP; }, () => { throw STOP; });
  }
  const rkTransform = (r) => `translate(${r.x}vw, ${r.y}vh) rotate(${r.r}deg) scale(${r.s})`;
  // De raket beweegt altijd vanaf waar hij nu is, zodat animaties netjes op elkaar aansluiten.
  function moveRocket(c, to, duration, easing = 'ease-in-out') {
    const from = rkTransform(c.rocket);
    Object.assign(c.rocket, to);
    return go(c, $c(c, '.cin-rocket'), [{ transform: from }, { transform: rkTransform(c.rocket) }], { duration, easing });
  }
  const flame = (c, on) => $c(c, '.rk').classList.toggle('lit', on);

  /* ---------- mission control: een checklist per fase, die afvinkt wat de raket haalt ---------- */
  const ICON = {
    flame: '<path d="M8 1.5c1.8 2.4 3.5 4 3.5 6.6a3.5 3.5 0 0 1-7 0C4.5 6.3 5.6 5 6.2 3.6 6.8 4.8 7.6 5.3 8 5.5z"/>',
    rocket: '<path d="M8 1.5c2 2 2.8 4.6 2.8 7.2v3H5.2v-3C5.2 6.1 6 3.5 8 1.5zM5.2 9.5 3 12.5h2.2M10.8 9.5l2.2 3h-2.2M7 13.5h2"/>',
    gyro: '<circle cx="8" cy="8" r="5.5"/><path d="M8 1v3M8 12v3M1 8h3M12 8h3"/><circle cx="8" cy="8" r="1.4"/>',
    gauge: '<path d="M2.5 11a5.5 5.5 0 1 1 11 0"/><path d="M8 11l3-4"/>',
    cloud: '<path d="M4.5 12h7a2.5 2.5 0 0 0 .2-5 3.5 3.5 0 0 0-6.8-.6A2.8 2.8 0 0 0 4.5 12z"/>',
    wave: '<path d="M1.5 8c1.5-3 3-3 4.3 0s2.9 3 4.4 0 2.8-3 4.3 0"/>',
    line: '<path d="M1.5 10.5h13"/><path d="M8 2.5v6M5.5 5 8 2.5 10.5 5"/>',
    orbit: '<ellipse cx="8" cy="8" rx="6.5" ry="3"/><circle cx="8" cy="8" r="1.8"/>',
    power: '<path d="M8 1.5v6"/><path d="M4.4 4.2a5 5 0 1 0 7.2 0"/>',
    split: '<path d="M5 2h6v5H5zM5 9.5h6v4.5H5z"/>',
    check: '<path d="M2.5 8.5l3.5 3.5 7.5-8"/>',
    speed: '<path d="M2 11.5a6 6 0 0 1 12 0"/><path d="M8 11.5l4-5"/><path d="M1.5 4.5h3M1 7h2"/>',
    earth: '<circle cx="8" cy="8" r="6"/><path d="M4 5.5c2 0 2 2 4 2s1 3 3 3M9 2.3c-.5 1.5.5 2.2 2 2.2"/>',
    star: '<path d="M8 1.8l1.8 4 4.4.4-3.3 2.9 1 4.3L8 11.1l-3.9 2.3 1-4.3L1.8 6.2l4.4-.4z"/>'
  };
  function phasesFor(outcomeId) {
    const launch = { name: 'Lancering', items: [['ignition', 'Ontsteking', 'flame'], ['liftoff', 'Liftoff', 'rocket'], ['stable', 'Raket stabiel', 'gyro'], ['thrust', 'Stuwkracht stabiel', 'gauge']] };
    const ascent = { name: 'Baanhoogte', items: [['clouds', 'Wolkengrens · 10 km', 'cloud'], ['maxq', 'Max Q · max. luchtdruk', 'wave'], ['karman', 'Ruimtegrens · 100 km', 'line'], ['altitude', 'Baanhoogte · 200 km', 'orbit']] };
    const orbit = outcomeId === 'deep'
      ? { name: 'Baan', items: [['inorbit', 'Baan bereikt', 'orbit'], ['nominal', 'Systemen nominaal', 'check'], ['boost', 'Motor op vol vermogen', 'flame']] }
      : { name: 'Baan', items: [['meco', 'MECO · motor uit', 'power'], ['staging', 'Trapscheiding', 'split'], ['stableorbit', 'Baan stabiel', 'orbit']] };
    const deep = { name: 'Diepe ruimte', bonus: true, items: [['escape', 'Ontsnappingssnelheid', 'speed'], ['leave', 'Aarde verlaten', 'earth'], ['course', 'Koers: diepe ruimte', 'star']] };
    return outcomeId === 'deep' ? [launch, ascent, orbit, deep] : [launch, ascent, orbit];
  }
  const svgIcon = (k) => `<svg viewBox="0 0 16 16" aria-hidden="true">${ICON[k]}</svg>`;
  const FLAG = { standby: 'STANDBY', active: 'BEZIG', go: 'GO', fail: 'NO-GO' };

  function mcMount(c, outcomeId) {
    const phases = phasesFor(outcomeId);
    c.mc = { phases, current: 0, status: {}, failed: false, done: false, start: 0, clock: null, queue: [], pumping: false, shownAt: performance.now() };
    const box = document.createElement('section');
    box.className = 'mc';
    box.setAttribute('aria-label', 'Mission control');
    box.innerHTML = `
      <header class="mc-head"><span class="mc-live"><i></i>Live</span><b>Mission control</b><span class="mc-clock">T−00:10</span></header>
      <ol class="mc-phases">${phases.map((p, i) => `<li data-ph="${i}"${p.bonus ? ' class="bonus" hidden' : ''}><span>${p.bonus ? '★' : i + 1}</span><em>${p.name}</em></li>`).join('')}</ol>
      <div class="mc-block" aria-live="polite"></div>
      <p class="mc-status">Aftellen…</p>`;
    c.el.appendChild(box);
    mcRender(c);
  }

  function mcRender(c) {
    const m = c.mc;
    const box = $c(c, '.mc');
    if (!box) return;
    const ph = m.phases[m.current];
    if (!ph) return;
    box.querySelector('.mc-block').innerHTML = `
      <p class="mc-title">Fase ${m.current + 1} · ${ph.name}${ph.bonus ? ' <span class="mc-bonus">bonus</span>' : ''}</p>
      <ul class="mc-items">${ph.items.map(([id, name, icon]) => {
        const st = m.status[id] || 'standby';
        return `<li class="st-${st}"><span class="mc-ic">${svgIcon(icon)}</span><span class="mc-name">${name}</span><span class="mc-flag">${st === 'go' ? '✓ ' : st === 'fail' ? '✕ ' : ''}${FLAG[st]}</span></li>`;
      }).join('')}</ul>`;
    box.querySelectorAll('.mc-phases li').forEach((li, i) => {
      const all = m.phases[i].items.every(([id]) => m.status[id] === 'go');
      const fail = m.phases[i].items.some(([id]) => m.status[id] === 'fail');
      li.classList.toggle('done', all);
      li.classList.toggle('fail', fail);
      li.classList.toggle('now', i === m.current && !all && !fail);
    });
    box.classList.toggle('failed', m.failed);
    box.classList.toggle('complete', m.done);
  }

  function mcStatus(c, text) {
    const el = $c(c, '.mc-status');
    if (el) el.textContent = text;
  }

  // Zet een check op 'active', 'go' of 'fail'. Meldingen gaan in een wachtrij: het paneel laat ze één voor één zien,
  // met genoeg tijd per vinkje, en schuift pas door naar de volgende fase als iedereen het vorige blok heeft kunnen zien.
  const PACE = { go: 220, fail: 300, active: 60 };   // vlot achter elkaar
  const BLOCK_MIN = 1500;                            // een blok staat minstens zo lang in beeld
  function mc(c, id, status) {
    const m = c.mc;
    if (!m || c.stopped) return;
    m.queue.push([id, status]);
    if (!m.pumping) mcPump(c);
  }

  async function mcPump(c) {
    const m = c.mc;
    m.pumping = true;
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    while (m.queue.length && !c.stopped) {
      const [id, status] = m.queue.shift();
      if (m.failed || m.done) continue;
      if (m.status[id] === status) continue;
      m.status[id] = status;
      const ph = m.phases[m.current];
      if (status === 'fail') {
        m.failed = true;
        clearInterval(m.clock);
        mcStatus(c, `NO-GO · missie afgebroken in fase ${m.current + 1}`);
        mcRender(c);
        const li = $c(c, '.mc-items .st-fail');
        if (li) li.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 260, iterations: 2 });
        break;
      }
      mcRender(c);
      if (status === 'go') {
        const li = [...c.el.querySelectorAll('.mc-items li')][ph.items.findIndex(([x]) => x === id)];
        if (li) li.animate([{ background: 'rgba(15, 123, 75, .25)' }, { background: 'transparent' }], { duration: 700, easing: 'ease-out' });
        mcStatus(c, 'Alle systemen GO');
      }
      await pause(PACE[status] || 200);
      if (ph.items.every(([x]) => m.status[x] === 'go')) await mcAdvance(c);
    }
    m.pumping = false;
  }

  // Wacht tot het paneel alle meldingen heeft laten zien (de film gebruikt dit op natuurlijke rustpunten).
  function mcIdle(c) {
    return new Promise((res, rej) => {
      const check = () => {
        if (c.stopped) return rej(STOP);
        if (!c.mc || (!c.mc.pumping && !c.mc.queue.length)) return res();
        setTimeout(check, 60);
      };
      check();
    });
  }

  async function mcAdvance(c) {
    const m = c.mc;
    if (m.current === m.phases.length - 1) {
      m.done = true;
      clearInterval(m.clock);
      mcStatus(c, m.phases[m.current].bonus ? '★ Missie geslaagd + bonus: diepe ruimte' : 'Missie geslaagd · baan bereikt');
      mcRender(c);
      return;
    }
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const block = $c(c, '.mc-block');
    const next = m.phases[m.current + 1];
    mcStatus(c, next.bonus ? '★ Bonus ontgrendeld: diepe ruimte' : `Fase ${m.current + 1} voltooid → fase ${m.current + 2}`);
    await pause(Math.max(350, BLOCK_MIN - (performance.now() - m.shownAt)));   // het blok heeft lang genoeg gestaan
    if (c.stopped) return;
    if (next.bonus) { revealBonus(c, m.current + 1); await pause(900); }
    await block.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 280, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
    if (c.stopped) return;
    m.current += 1;
    mcRender(c);
    mcStatus(c, next.bonus ? '★ Bonusfase: diepe ruimte' : `Fase ${m.current + 1} · ${next.name}`);
    m.shownAt = performance.now();
    await block.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
  }

  // Het paaseitje: de bonusfase verschijnt pas op de fasebalk als de raket hem echt haalt.
  function revealBonus(c, i) {
    const box = $c(c, '.mc');
    const li = box.querySelector(`.mc-phases li[data-ph="${i}"]`);
    box.querySelector('.mc-phases').style.setProperty('--n', String(i + 1));
    li.hidden = false;
    li.classList.add('revealed');
    li.animate([
      { opacity: 0, transform: 'scale(.2) rotate(-90deg)' },
      { opacity: 1, transform: 'scale(1.35) rotate(10deg)', offset: 0.6 },
      { opacity: 1, transform: 'none' }
    ], { duration: 700, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    box.animate([{ boxShadow: '0 0 0 0 rgba(253, 230, 138, .9)' }, { boxShadow: '0 0 0 14px rgba(253, 230, 138, 0)' }], { duration: 900, easing: 'ease-out' });
  }

  // De missieklok: T− tijdens het aftellen, T+ vanaf de ontsteking.
  const fmtClock = (sec, minus) => `T${minus ? '−' : '+'}${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  function clockSet(c, minusSec) { const el = $c(c, '.mc-clock'); if (el) el.textContent = fmtClock(minusSec, true); }
  function clockRun(c) {
    const m = c.mc;
    m.start = performance.now();
    m.clock = setInterval(() => {
      const el = $c(c, '.mc-clock');
      if (!el || c.stopped) { clearInterval(m.clock); return; }
      el.textContent = fmtClock((performance.now() - m.start) / 1000, false);
    }, 200);
  }
  const at = (c, ms, fn) => wait(c, ms).then(fn, () => {});

  async function countdown(c) {
    const box = $c(c, '.cin-count');
    for (const [i, t] of ['3', '2', '1', 'Ontsteking!'].entries()) {
      clockSet(c, 3 - i);
      if (i === 2) mc(c, 'ignition', 'active');
      box.textContent = t;
      box.classList.toggle('word', t.length > 1);
      box.animate([{ opacity: 0, transform: 'translate(-50%, -50%) scale(1.6)' }, { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.25 }, { opacity: 0, transform: 'translate(-50%, -50%) scale(.9)' }], { duration: 650, easing: 'ease-out' });
      await wait(c, 600);
    }
    box.textContent = '';
  }

  // Rookwolkjes aan de voet van de raket (in de wereld, zodat ze met de grond meeschuiven).
  function puffs(c, n, spread = 1, xOff = 0) {
    const world = $c(c, '.cin-world');
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'puff';
      const size = 40 + Math.random() * 60;
      p.style.width = p.style.height = size + 'px';
      p.style.marginLeft = -size / 2 + 'px';
      if (xOff) p.style.left = `calc(50% + ${xOff}vw)`;
      world.appendChild(p);
      const dir = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 220) * spread;
      p.animate([
        { transform: 'translate(0, 0) scale(.3)', opacity: 0.95 },
        { transform: `translate(${dir}px, ${-20 - Math.random() * 70}px) scale(${1.2 + Math.random()})`, opacity: 0 }
      ], { duration: 1400 + Math.random() * 1200, delay: i * 60, easing: 'ease-out', fill: 'forwards' }).finished.then(() => p.remove(), () => {});
    }
  }

  function sparks(c, n) {
    const world = $c(c, '.cin-world');
    for (let i = 0; i < n; i++) {
      const sp = document.createElement('i');
      sp.className = 'spark';
      world.appendChild(sp);
      const a = Math.PI * (1.1 + Math.random() * 0.8);
      const d = 40 + Math.random() * 120;
      sp.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d * -0.6 + 30}px)`, opacity: 0 }
      ], { duration: 500 + Math.random() * 500, delay: Math.random() * 200, easing: 'ease-out', fill: 'forwards' }).finished.then(() => sp.remove(), () => {});
    }
  }

  function shake(c, duration, strength = 6) {
    const frames = Array.from({ length: 10 }, (_, i) => ({ transform: i === 9 ? 'none' : `translate(${(Math.random() - 0.5) * 2 * strength}px, ${(Math.random() - 0.5) * 2 * strength}px)` }));
    return $c(c, '.cin-scene').animate(frames, { duration }).finished.catch(() => {});
  }

  // Een ontploffing op de plek waar de raket nu is.
  function explosion(c, big = true) {
    const fx = $c(c, '.cin-fx');
    const r = $c(c, '.rk').getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height * 0.55;
    const ball = document.createElement('i');
    ball.className = 'fireball';
    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
    fx.appendChild(ball);
    ball.animate([
      { transform: 'translate(-50%, -50%) scale(.1)', opacity: 1 },
      { transform: `translate(-50%, -50%) scale(${big ? 1 : 0.6})`, opacity: 1, offset: 0.35 },
      { transform: `translate(-50%, -50%) scale(${big ? 1.4 : 0.8})`, opacity: 0 }
    ], { duration: big ? 1500 : 1000, easing: 'ease-out', fill: 'forwards' });
    for (let i = 0; i < (big ? 14 : 6); i++) {
      const d = document.createElement('i');
      d.className = 'debris' + (i % 3 === 0 ? ' red' : '');
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      fx.appendChild(d);
      const a = Math.random() * Math.PI * 2;
      const v = 120 + Math.random() * 260;
      const dx = Math.cos(a) * v;
      const up = Math.sin(a) * v;
      d.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${-up * 0.6}px) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${-up + 420}px) rotate(${Math.random() * 900}deg)`, opacity: 0 }
      ], { duration: 2000 + Math.random() * 800, easing: 'cubic-bezier(.3,.6,.6,1)', fill: 'forwards' });
    }
    // een rookwolk die blijft hangen en langzaam opstijgt
    for (let i = 0; i < (big ? 9 : 5); i++) {
      const sm = document.createElement('i');
      sm.className = 'smoke';
      const size = (big ? 70 : 50) + Math.random() * 60;
      Object.assign(sm.style, { left: x + (Math.random() - 0.5) * 90 + 'px', top: y + (Math.random() - 0.5) * 60 + 'px', width: size + 'px', height: size + 'px' });
      fx.appendChild(sm);
      sm.animate([
        { transform: 'translate(-50%, -50%) scale(.2)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.85, offset: 0.2 },
        { transform: `translate(calc(-50% + ${(Math.random() - 0.5) * 80}px), calc(-50% - ${60 + Math.random() * 80}px)) scale(1.6)`, opacity: 0 }
      ], { duration: 3600 + Math.random() * 1200, delay: 200 + i * 60, easing: 'ease-out', fill: 'forwards' });
    }
    const flash = $c(c, '.cin-flash');
    flash.animate([{ opacity: big ? 0.85 : 0.5 }, { opacity: 0 }], { duration: 600, easing: 'ease-out' });
    shake(c, 700, big ? 14 : 8);
  }

  // De camera volgt de raket omhoog: de wereld schuift naar beneden, de lucht wordt de ruimte in.
  function climb(c, { depth, space, duration }) {
    const ease = 'cubic-bezier(.45,0,.55,1)';
    return Promise.all([
      go(c, $c(c, '.cin-world'), [{ transform: 'translateY(0)' }, { transform: `translateY(${depth}vh)` }], { duration, easing: ease }),
      go(c, $c(c, '.cin-space'), [{ opacity: 0 }, { opacity: space }], { duration, easing: 'ease-in' }),
      go(c, $c(c, '.cin-stars'), [{ opacity: 0 }, { opacity: space }], { duration, easing: 'ease-in' }),
      go(c, $c(c, '.cin-stars.far'), [{ opacity: 0 }, { opacity: space * 0.8 }], { duration, easing: 'ease-in' })
    ]);
  }

  async function liftoff(c, rise = -26) {
    await countdown(c);
    clockRun(c);
    flame(c, true);
    mc(c, 'ignition', 'go');
    mc(c, 'liftoff', 'active');
    sparks(c, 14);
    puffs(c, 14);
    shake(c, 900, 5);
    await wait(c, 700);
    puffs(c, 10, 1.4);
    at(c, 450, () => { mc(c, 'liftoff', 'go'); mc(c, 'stable', 'active'); });
    await moveRocket(c, { y: rise }, 1900, 'cubic-bezier(.55,0,.75,.45)');
    mc(c, 'stable', 'go');
    mc(c, 'thrust', 'active');
    at(c, 450, () => mc(c, 'thrust', 'go'));
  }
  // Tijdens de klim: de checks van fase 2 op vaste momenten (in ms na de start van de klim).
  function ascentChecks(c, times) {
    const order = ['clouds', 'maxq', 'karman', 'altitude'];
    at(c, 700, () => mc(c, 'clouds', 'active'));
    times.forEach((t, i) => at(c, t, () => { mc(c, order[i], 'go'); if (order[i + 1]) mc(c, order[i + 1], 'active'); }));
  }

  /* ---------- de vijf scenario's ---------- */
  // 0–3: de motor sputtert, vonkt en sterft af. De raket blijft staan.
  async function runFizzle(c) {
    await countdown(c);
    for (let i = 0; i < 4; i++) {
      flame(c, true);
      $c(c, '.rk').classList.add('weak');
      sparks(c, 8);
      shake(c, 260, 3);
      await wait(c, 160 + Math.random() * 140);
      flame(c, false);
      await wait(c, 260 + i * 120);
    }
    puffs(c, 6, 0.5);
    mc(c, 'ignition', 'fail');
    $c(c, '.rk').classList.add('sooty');
    await moveRocket(c, { r: -3 }, 220);
    await moveRocket(c, { r: 2 }, 220);
    await moveRocket(c, { r: 0 }, 260);
    // een laatste zuchtje rook
    const world = $c(c, '.cin-world');
    const wisp = document.createElement('i');
    wisp.className = 'puff dark';
    wisp.style.width = wisp.style.height = '70px';
    wisp.style.marginLeft = '-35px';
    world.appendChild(wisp);
    await go(c, wisp, [{ transform: 'translate(0,0) scale(.4)', opacity: 0.9 }, { transform: 'translate(20px,-180px) scale(2)', opacity: 0 }], { duration: 2200, easing: 'ease-out' });
  }

  // 4–9: de raket stijgt op, klimt een stukje en ontploft niet lang daarna.
  async function runExplode(c) {
    await liftoff(c, -22);
    ascentChecks(c, [1500]);
    await Promise.all([
      climb(c, { depth: 55, space: 0.08, duration: 2100 }),
      moveRocket(c, { y: -30, r: 5 }, 2100, 'ease-in')
    ]);
    $c(c, '.rk').classList.add('weak');
    await Promise.all([shake(c, 700, 4), moveRocket(c, { x: 2, r: -10 }, 350), wait(c, 350)]);
    await moveRocket(c, { x: 3, r: 14 }, 350);
    mc(c, 'maxq', 'fail');
    explosion(c, true);
    $c(c, '.cin-rocket').style.visibility = 'hidden';
    await wait(c, 2600);
  }

  // 10–13: een hoge klim tot bijna in de ruimte, dan valt de motor uit en valt de raket terug naar de aarde.
  async function runFallback(c) {
    await liftoff(c);
    ascentChecks(c, [1400, 2600]);
    await climb(c, { depth: 115, space: 0.65, duration: 3400 });
    // motor sputtert en valt uit
    for (let i = 0; i < 3; i++) { flame(c, false); await wait(c, 160); flame(c, true); await wait(c, 200); }
    flame(c, false);
    mc(c, 'karman', 'fail');
    await moveRocket(c, { y: -34, r: 8 }, 900, 'ease-out');          // remt af
    await moveRocket(c, { r: 170 }, 1100, 'ease-in-out');             // kantelt
    // valt terug: de camera zakt mee tot de grond weer in beeld is
    await Promise.all([
      go(c, $c(c, '.cin-world'), [{ transform: 'translateY(115vh)' }, { transform: 'translateY(0)' }], { duration: 2800, easing: 'cubic-bezier(.5,0,.9,.6)' }),
      go(c, $c(c, '.cin-space'), [{ opacity: 0.65 }, { opacity: 0 }], { duration: 2800 }),
      go(c, $c(c, '.cin-stars'), [{ opacity: 0.65 }, { opacity: 0 }], { duration: 2800 }),
      go(c, $c(c, '.cin-stars.far'), [{ opacity: 0.5 }, { opacity: 0 }], { duration: 2800 }),
      moveRocket(c, { x: -14, y: 4, r: 200 }, 2800, 'cubic-bezier(.5,0,.9,.6)')
    ]);
    explosion(c, false);
    puffs(c, 12, 1.6, c.rocket.x);   // stof op de plek van de inslag
    await wait(c, 2000);
  }

  // Trapscheiding: het onderste deel van de raket koppelt los en valt weg.
  function stageSeparation(c) {
    const rk = $c(c, '.rk');
    const r = rk.querySelector('.body').getBoundingClientRect();
    const stage = document.createElement('div');
    stage.className = 'booster';
    Object.assign(stage.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    stage.innerHTML = ROCKET_BODY;
    $c(c, '.cin-fx').appendChild(stage);
    rk.classList.add('staged');
    stage.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${-r.width * 0.15}px, ${r.height * 0.5}px) rotate(-10deg)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${-r.width * 0.7}px, ${r.height * 2.6}px) rotate(-50deg)`, opacity: 0 }
    ], { duration: 4200, easing: 'cubic-bezier(.3,0,.7,1)', fill: 'forwards' });
    // een wolkje van de ontkoppelbouten
    const ring = document.createElement('i');
    ring.className = 'sep-puff';
    Object.assign(ring.style, { left: r.left + r.width / 2 + 'px', top: r.top + r.height * 0.7 + 'px' });
    $c(c, '.cin-fx').appendChild(ring);
    ring.animate([{ transform: 'translate(-50%, -50%) scale(.3)', opacity: 0.9 }, { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 0 }], { duration: 900, easing: 'ease-out', fill: 'forwards' });
  }

  // Kleine stuurstootjes aan de neus: de raket draait gecontroleerd.
  function thrusters(c, side) {
    const r = $c(c, '.rk .body').getBoundingClientRect();
    const fx = $c(c, '.cin-fx');
    for (let i = 0; i < 4; i++) {
      const p = document.createElement('i');
      p.className = 'rcs';
      Object.assign(p.style, { left: r.left + r.width / 2 + 'px', top: r.top + r.height * 0.2 + 'px' });
      fx.appendChild(p);
      const dir = side === 'left' ? -1 : 1;
      p.animate([{ transform: 'translate(-50%, -50%) scale(.4)', opacity: 0.95 }, { transform: `translate(calc(-50% + ${dir * (50 + i * 12)}px), calc(-50% - ${i * 6}px)) scale(1.4)`, opacity: 0 }],
        { duration: 650, delay: i * 140, easing: 'ease-out', fill: 'forwards' });
    }
  }

  // 14–16: missie geslaagd. Klim tot in de ruimte, motor volgens plan uit, trapscheiding, en een stabiele baan om de aarde.
  async function runOrbit(c) {
    await liftoff(c);
    const earthUp = 'translateY(calc(-24vh - 120px))';
    // een lange klim: als de motor uitgaat, staat fase 3 al in beeld
    ascentChecks(c, [1400, 2600, 3700, 4000]);
    await Promise.all([
      climb(c, { depth: 175, space: 1, duration: 4800 }),
      go(c, $c(c, '.cin-earth'), [{ transform: 'translateY(0)' }, { transform: earthUp }], { duration: 4300, delay: 1400, easing: 'ease-out' }),
      moveRocket(c, { y: -24 }, 4800, 'ease-in-out')
    ]);
    // de motor gaat in één keer netjes uit: zo is het gepland
    mc(c, 'meco', 'active');
    await wait(c, 500);
    flame(c, false);
    mc(c, 'meco', 'go');
    mc(c, 'staging', 'active');
    await wait(c, 800);
    stageSeparation(c);
    mc(c, 'staging', 'go');
    mc(c, 'stableorbit', 'active');
    await moveRocket(c, { y: -28 }, 1600, 'ease-out');                  // glijdt door terwijl de trap wegvalt
    thrusters(c, 'left');
    await moveRocket(c, { r: 90, x: -3 }, 2200, 'ease-in-out');         // draait gecontroleerd de baan in
    thrusters(c, 'right');
    await wait(c, 500);
    mc(c, 'stableorbit', 'go');
    // in de baan: de aarde draait onder de raket door, de raket glijdt rustig mee
    $c(c, '.cin-earth').animate([{ transform: `${earthUp} rotate(0deg)` }, { transform: `${earthUp} rotate(-14deg)` }], { duration: 70000, iterations: Infinity, easing: 'linear' });
    $c(c, '.cin-rocket').animate([
      { transform: rkTransform(c.rocket) },
      { transform: rkTransform({ ...c.rocket, y: c.rocket.y - 1.2 }) }
    ], { duration: 3200, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    await wait(c, 1400);
  }

  // 17: de raket vliegt de ruimte in en blijft doorvliegen, diep de ruimte in.
  async function runDeep(c) {
    await liftoff(c);
    ascentChecks(c, [1000, 1800, 2600, 3000]);
    await Promise.all([
      climb(c, { depth: 140, space: 1, duration: 3000 }),
      go(c, $c(c, '.cin-earth'), [{ transform: 'translateY(0)' }, { transform: 'translateY(calc(-34vh - 120px))' }], { duration: 3000, delay: 800, easing: 'ease-out' }),
      moveRocket(c, { y: -20 }, 3000, 'ease-in-out')
    ]);
    // in de baan: de raket glijdt nog even door terwijl mission control fase 3 afvinkt
    mc(c, 'inorbit', 'active');
    at(c, 900, () => { mc(c, 'inorbit', 'go'); mc(c, 'nominal', 'active'); });
    at(c, 1700, () => { mc(c, 'nominal', 'go'); mc(c, 'boost', 'active'); });
    await moveRocket(c, { y: -23 }, 2500, 'ease-in-out');
    // vol vermogen: de aarde zakt weg, de sterren schieten voorbij
    const stars = c.el.querySelectorAll('.cin-stars i');
    go(c, $c(c, '.cin-earth'), [{ transform: 'translateY(calc(-34vh - 120px))' }, { transform: 'translateY(40vh)' }], { duration: 2400, easing: 'ease-in' }).catch(() => {});
    stars.forEach((st, i) => st.animate([{ transform: 'translateY(-100vh) scaleY(1)' }, { transform: 'translateY(0) scaleY(1)' }], { duration: i ? 1800 : 1100, iterations: Infinity, easing: 'linear' }));
    c.el.querySelectorAll('.cin-stars').forEach((l) => l.classList.add('warp'));
    $c(c, '.rk').classList.add('boost');
    mc(c, 'boost', 'go');
    mc(c, 'escape', 'active');
    at(c, 2400, () => { mc(c, 'escape', 'go'); mc(c, 'leave', 'active'); });
    at(c, 3600, () => { mc(c, 'leave', 'go'); mc(c, 'course', 'active'); });
    // lichtstrepen: zo snel gaat hij nu
    const fx = $c(c, '.cin-fx');
    for (let i = 0; i < 46; i++) {
      const st = document.createElement('i');
      st.className = 'streak';
      st.style.left = Math.random() * 100 + 'vw';
      st.style.height = 40 + Math.random() * 140 + 'px';
      fx.appendChild(st);
      st.animate([{ transform: 'translateY(-30vh)', opacity: 0 }, { opacity: 0.9, offset: 0.2 }, { transform: 'translateY(130vh)', opacity: 0 }],
        { duration: 500 + Math.random() * 700, delay: Math.random() * 900, iterations: Infinity, easing: 'linear' });
    }
    await moveRocket(c, { y: -26 }, 1800, 'ease-in-out');
    // en weg is hij: steeds kleiner, tot een lichtpuntje
    await moveRocket(c, { y: -62, s: 0.06 }, 3200, 'cubic-bezier(.6,0,.9,.5)');
    $c(c, '.cin-rocket').classList.add('gone');
    mc(c, 'course', 'go');
    await wait(c, 900);
  }

  /* ---------- het tafereeltje in het rapport: de eindstand van jouw lancering ---------- */
  function miniScene(o) {
    const space = o.id === 'orbit' || o.id === 'deep';
    return `<div class="mini mini-${o.id}${space ? ' space' : ''}" role="img" aria-label="${o.title}">
      ${space ? `<i class="mini-stars" style="box-shadow:${starShadows(40, 150, 230, 11)}"></i>` : '<i class="mini-ground"></i><i class="mini-tower"></i>'}
      ${o.id === 'orbit' ? '<i class="mini-orbit-path"></i><i class="mini-earth"></i>' : ''}
      ${o.id === 'explode' ? '<i class="scorch"></i><i class="bit b1"></i><i class="bit b2"></i><i class="bit b3"></i>' : ''}
      ${o.id === 'deep' ? '<i class="trail"></i><i class="dot"></i>' : `<div class="mini-rocket">${o.id === 'explode' ? '' : rocketHtml(o.id === 'fizzle' ? 'sooty' : '')}</div>`}
      ${['fizzle', 'explode', 'fallback'].includes(o.id) ? '<i class="wisp w1"></i><i class="wisp w2"></i>' : ''}
    </div>`;
  }

  function renderEnd(s, passed) {
    const pct = Math.round((s / MAX_SCORE) * 100);
    const o = outcomeOf(s);
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <main class="sheet end">
        <div class="end-top">
          <div class="pad-wrap">
            ${miniScene(o)}
            ${reducedMotion() ? '' : '<button class="link replay" id="replay" type="button">↻ Bekijk de lancering opnieuw</button>'}
          </div>
          <div>
            <p class="label">${o.label} · ${o.title}</p>
            <h2>${passed ? `${esc(brief().client)} staat online!` : 'Bijna klaar voor de lancering'}</h2>
            <div class="big"><b>${s}</b><span>/ ${MAX_SCORE} requirements · ${pct}%</span></div>
            <p class="end-text">${passed
              ? 'Je hebt zelf een werkende website gebouwd, van structuur tot stijl en layout. Daarmee is de hele skill tree rond: van je eerste HTML-tag tot een eigen site.'
              : `Voor een geslaagde missie zijn ${NEED} van de ${MAX_SCORE} requirements nodig. Bekijk de telemetrie: daar zie je welk onderdeel nog aandacht nodig heeft.`}</p>
          </div>
        </div>
        <p class="label">Telemetrie</p>
        <div class="telemetry">${STATIONS.map((st) => {
          const ok = st.checks.filter((c) => state.results[c.id]).length;
          const p = Math.round((ok / st.checks.length) * 100);
          return `<div class="tel-row"><span class="tel-name">${st.name}</span><span class="tel-bar" role="img" aria-label="${p}%"><i style="--w:${p}%"></i></span><span class="tel-pct">${p}%</span></div>`;
        }).join('')}</div>
        <p class="label">De payload</p>
        <div class="payload"><iframe id="payload" title="Je website" sandbox="allow-same-origin"></iframe></div>
        <div class="row end-actions">
          <button class="btn ghost" id="exit" type="button">← Terug naar de skilltree</button>
          <button class="btn" id="build" type="button">${passed ? 'Verder bouwen' : 'Terug naar de werkplaats'}</button>
        </div>
      </main>`;
    document.getElementById('payload').srcdoc = buildDoc();
    const replay = document.getElementById('replay');
    if (replay) replay.addEventListener('click', () => playLaunch(o));
    // Stoppen: in de skilltree vraagt de game de pagina om het spelvenster te sluiten; los geopend gaat hij naar /games/.
    document.getElementById('exit').addEventListener('click', () => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'GAME_EXIT', gameId: gameInfo.gameId }, window.location.origin);
      } else {
        window.location.href = '/games/';
      }
    });
    document.getElementById('build').addEventListener('click', () => { closeLaunch(); renderWorkshop(); });
  }

  // Alleen-lezen inzicht voor testen/debuggen.
  window.websiteChallenge = Object.freeze({
    info: gameInfo,
    maxScore: MAX_SCORE,
    need: NEED,
    checks: ALL_CHECKS.map((c) => ({ id: c.id, station: c.station })),
    // Zet code in de werkplaats (alsof de speler hem typt) en wacht op de checks.
    type: async (html, css) => {
      if (!state || !document.getElementById('editor')) return null;
      state.html = html; state.css = css; save();
      const ta = document.getElementById('editor'); ta.value = state[state.tab];
      await refresh();
      return { ...state.results };
    },
    outcomes: OUTCOMES.map((o) => ({ id: o.id, max: o.max })),
    play: (id) => playLaunch(OUTCOMES.find((o) => o.id === id)),
    snapshot: () => state && JSON.parse(JSON.stringify({
      round: state.round, brief: state.brief, score: score(), launched: state.launched, reported: state.reported, results: state.results
    }))
  });

  renderStart();
})();
