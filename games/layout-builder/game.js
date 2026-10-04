/* =========================================================
   Layout Builder — educatieve game (Bloom: Toepassen)
   Thema: de bouwtekening. Het ontwerp ligt als stippellijn over je pagina;
   jij kiest een element en stelt zijn CSS in tot alles in de lijnen past.
   ========================================================= */

/* ---------- vaste gamestekker ---------- */
const gameInfo = {
  gameId: 'layout-builder',
  learningGoal: 'De leerling kan basis-CSS (display, flex-direction, justify-content, align-items, gap, width, padding en margin) toepassen om elementen volgens een gegeven layout te positioneren.',
  bloom: 'Toepassen',
  successCriterion: 'De speler voltooit alle drie de levels en bouwt minimaal 80% van de layouts bij de eerste keuring correct na.'
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
  const propOf = (decl) => decl.split(':')[0].trim();
  const valOf = (decl) => decl.slice(decl.indexOf(':') + 1).trim();

  // Tekst met `code` tussen backticks wordt een code-label.
  const fmt = (str) => esc(str).replace(/`([^`]+)`/g, '<code>$1</code>');

  function scrollIntoViewIfNeeded(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 8 || r.bottom > window.innerHeight - 8) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------- de mini-pagina's: blokken op de tekentafel ---------- */
  // Kleuren en randen staan al vast; de speler regelt alleen de layout.
  const BOX = 'background:rgba(234,242,255,.05);outline:1.5px dashed rgba(234,242,255,.5);outline-offset:-1.5px;border-radius:5px;';
  const CARD = 'background:rgba(234,242,255,.07);border:1.5px solid rgba(234,242,255,.75);border-radius:8px;';
  const ITEM = {
    cyan: 'background:rgba(127,211,255,.2);border:1.5px solid #7fd3ff;border-radius:4px;padding:6px 10px;',
    mint: 'background:rgba(127,240,193,.18);border:1.5px solid #7ff0c1;border-radius:4px;padding:6px 10px;',
    peach: 'background:rgba(255,184,107,.2);border:1.5px solid #ffb86b;border-radius:4px;padding:6px 10px;',
    lilac: 'background:rgba(201,167,255,.22);border:1.5px solid #c9a7ff;border-radius:4px;padding:6px 10px;font:inherit;color:inherit;'
  };
  const ROUND = (size) => `width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,184,107,.22);border:1.5px solid #ffb86b;text-align:center;line-height:${size - 3}px;font-size:${Math.round(size / 2.2)}px;`;
  const BASE_CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; }
    :host { display: block; }
    .screen { padding: 12px; font: 600 13px/1.3 "IBM Plex Sans", system-ui, sans-serif; color: #eaf2ff; }
    .screen p { font-weight: 400; }
    .screen h2, .screen h3 { font-size: 14px; }
    .screen a { color: inherit; text-decoration: none; }
    .screen a, .screen button { display: block; }   /* zonder flex: alles onder elkaar */
    [data-pick] { cursor: pointer; transition: box-shadow .12s ease; }
    [data-pick]:hover { box-shadow: 0 0 0 2px rgba(255,255,255,.55); }
    [data-pick][data-picked] { box-shadow: 0 0 0 3px #ff8fa3; }`;

  /* ---------- inhoud ---------- */
  // Per tekening: HTML, de elementen die je mag aanpassen (`rules`), het ontwerp (`solution`)
  // en het gereedschap: welke property-waarden je kunt kiezen. `fixed` staat al vast.
  // Hints: `soort:property` of `soort:selector:property`.
  const LEVELS = [
    {
      name: 'Naast of onder elkaar',
      phase: 'Ruwbouw',
      goal: 'Zet elementen naast elkaar met flexbox, en weer onder elkaar.',
      summary: '.ouder {\n  display: flex;            /* kinderen naast elkaar */\n  flex-direction: column;   /* of onder elkaar */\n}',
      takeaway: '`display: flex` zet je op de óuder. Daarna staan de kind-elementen naast elkaar; `flex-direction: column` zet ze onder elkaar.',
      challenges: [
        {
          title: 'Een menu op één regel',
          task: 'De links van het menu staan onder elkaar. Zet ze naast elkaar, zoals op de tekening.',
          html: '<nav class="menu">\n  <a>Home</a>\n  <a>Games</a>\n  <a>Contact</a>\n</nav>',
          base: `.menu{${BOX}padding:6px} .menu a{${ITEM.cyan}}`,
          rules: [{ sel: '.menu' }],
          solution: { '.menu': ['display: flex'] },
          tools: ['display: flex', 'display: block', 'flex-direction: column', 'text-align: center'],
          hints: { 'missing:display': 'De links staan nog onder elkaar. Welke property verandert hoe de kind-elementen van `.menu` worden geplaatst?' },
          good: 'Met `display: flex` wordt `.menu` een flex-container: zijn kind-elementen, de links, komen naast elkaar te staan.'
        },
        {
          title: 'Foto naast tekst',
          task: 'Zet de foto links náást de tekst. Je kunt hier twee elementen aanpassen: welk element is de ouder van de foto en de tekst?',
          html: '<h2>Mijn hobby</h2>\n<div class="row">\n  <div class="photo">⚽</div>\n  <p class="text">Elke zaterdag speel ik voetbal met mijn team.</p>\n</div>',
          base: `h2{margin-bottom:8px} .row{${BOX}padding:6px} .photo{width:84px;height:64px;border-radius:4px;background:rgba(127,211,255,.14);border:1.5px solid #7fd3ff;text-align:center;line-height:61px;font-size:26px} .text{${ITEM.peach}}`,
          rules: [{ sel: '.row' }, { sel: '.photo' }],
          solution: { '.row': ['display: flex'] },
          tools: ['display: flex', 'display: block', 'flex-direction: column'],
          good: '`.row` is de ouder van de foto en de tekst. Door `display: flex` op `.row` komen zijn kinderen naast elkaar.'
        },
        {
          title: 'Knoppen onder elkaar',
          task: 'Op een smal scherm wil je de knoppen onder elkaar. `.buttons` is al een flex-container: verander de richting.',
          html: '<div class="buttons">\n  <button>Start</button>\n  <button>Opties</button>\n  <button>Stoppen</button>\n</div>',
          base: `.buttons{${BOX}padding:6px} .buttons button{${ITEM.lilac}}`,
          rules: [{ sel: '.buttons', fixed: ['display: flex'] }],
          solution: { '.buttons': ['flex-direction: column'] },
          tools: ['flex-direction: column', 'flex-direction: row', 'justify-content: center', 'align-items: center'],
          good: '`flex-direction: column` draait de richting om: de kinderen staan nu onder elkaar. Zonder die regel is de richting `row`: naast elkaar.'
        },
        {
          title: 'Een header met menu',
          task: 'Zet het logo naast het menu, én de links in het menu naast elkaar.',
          html: '<header class="site">\n  <div class="logo">Logo</div>\n  <nav class="menu">\n    <a>Home</a>\n    <a>Over mij</a>\n  </nav>\n</header>',
          base: `.site{${BOX}padding:6px} .logo{${ITEM.mint}} .menu{background:rgba(234,242,255,.06);border-radius:4px;padding:3px} .menu a{${ITEM.cyan}}`,
          rules: [{ sel: '.site' }, { sel: '.menu' }],
          solution: { '.site': ['display: flex'], '.menu': ['display: flex'] },
          tools: ['display: flex', 'flex-direction: column'],
          hints: {
            'missing:.menu:display': 'Het logo en het menu staan naast elkaar, maar de links in het menu nog niet. `display: flex` werkt alleen op de dírecte kinderen: de links zijn kleinkinderen van `.site`.',
            'missing:.site:display': 'De links staan naast elkaar, maar het logo en het menu nog niet. Die twee zijn de kinderen van een ander element. Welk?'
          },
          good: 'Flexbox werkt alleen op directe kinderen. `.site` plaatst het logo en het menu, `.menu` plaatst de links.'
        }
      ]
    },
    {
      name: 'Ruimte en uitlijning',
      phase: 'Inrichting',
      goal: 'Verdeel de ruimte en lijn elementen uit.',
      summary: '.ouder {\n  display: flex;\n  gap: 16px;                       /* ruimte tússen de kinderen */\n  justify-content: space-between;  /* langs de richting */\n  align-items: center;             /* dwars op de richting */\n}',
      takeaway: '`gap` zet ruimte tussen de kinderen. `justify-content` verdeelt ze langs de richting, `align-items` lijnt ze uit dwars daarop.',
      challenges: [
        {
          title: 'Ruimte tussen kaarten',
          task: 'De kaarten plakken tegen elkaar. Zet er ruimte tússen, zoals op de tekening.',
          html: '<div class="cards">\n  <div class="card">🎮 Games</div>\n  <div class="card">🎵 Muziek</div>\n  <div class="card">⚽ Sport</div>\n</div>',
          base: `.cards{${BOX}padding:6px} .card{${ITEM.peach}padding:14px 10px}`,
          rules: [{ sel: '.cards', fixed: ['display: flex'] }],
          solution: { '.cards': ['gap: 16px'] },
          tools: ['gap: 16px', 'gap: 40px', 'padding: 16px', 'margin: 16px'],
          good: '`gap` zet ruimte tússen de kinderen van een flex-container. `padding` en `margin` maken ruimte aan de binnen- of buitenkant van het element zelf.'
        },
        {
          title: 'Logo links, knop rechts',
          task: 'Zet het logo helemaal links en de knop helemaal rechts.',
          html: '<header class="bar">\n  <div class="logo">Logo</div>\n  <button>Inloggen</button>\n</header>',
          base: `.bar{${BOX}padding:6px} .logo{${ITEM.mint}} .bar button{${ITEM.lilac}}`,
          rules: [{ sel: '.bar', fixed: ['display: flex'] }],
          solution: { '.bar': ['justify-content: space-between'] },
          tools: ['justify-content: space-between', 'justify-content: center', 'justify-content: flex-end', 'gap: 40px'],
          good: '`justify-content: space-between` verdeelt de lege ruimte tússen de kinderen: het eerste kind gaat naar het begin, het laatste naar het eind.'
        },
        {
          title: 'Naam naast de avatar',
          task: 'De naam is uitgerekt tot de hoogte van de avatar. Zet hem verticaal in het midden, zoals op de tekening.',
          html: '<div class="profile">\n  <div class="avatar">🙂</div>\n  <p class="name">Sam · level 12</p>\n</div>',
          base: `.profile{${BOX}padding:6px} .avatar{${ROUND(56)}} .name{${ITEM.cyan}}`,
          rules: [{ sel: '.profile', fixed: ['display: flex', 'gap: 10px'] }],
          solution: { '.profile': ['align-items: center'] },
          tools: ['align-items: center', 'align-items: flex-end', 'justify-content: center', 'flex-direction: column'],
          good: '`align-items` lijnt de kinderen uit dwars op de richting; in een rij is dat verticaal. Standaard (`stretch`) rekken ze uit tot dezelfde hoogte.'
        },
        {
          title: 'Precies in het midden',
          task: 'Zet de knop precies in het midden van het vak: horizontaal én verticaal.',
          html: '<section class="hero">\n  <button>▶ Speel nu</button>\n</section>',
          base: `.hero{${BOX}} .hero button{${ITEM.lilac}padding:8px 16px}`,
          rules: [{ sel: '.hero', fixed: ['display: flex', 'height: 120px'] }],
          solution: { '.hero': ['justify-content: center', 'align-items: center'] },
          tools: ['justify-content: center', 'justify-content: flex-end', 'align-items: center', 'align-items: flex-end', 'text-align: center'],
          hints: {
            'extra:text-align': '`text-align: center` centreert alleen tekst binnen een element; het verplaatst de knop zelf niet. Welke flex-properties doen dat wel?'
          },
          good: 'In een rij centreert `justify-content: center` horizontaal en `align-items: center` verticaal. Samen zetten ze iets precies in het midden.'
        }
      ]
    },
    {
      name: 'Een kaart-layout',
      phase: 'Afwerking',
      goal: 'Combineer meerdere properties op meerdere elementen.',
      summary: '.card {\n  display: flex;\n  gap: 12px;\n  padding: 12px;   /* ruimte binnen de rand */\n}\n.sidebar {\n  width: 30%;      /* hoe breed */\n}',
      takeaway: 'Een layout bouw je stap voor stap: kies eerst de ouder en de richting, dan de ruimte en de uitlijning, en geef elementen waar nodig een breedte.',
      challenges: [
        {
          title: 'Productkaart',
          task: 'Zet de foto naast de info, met 12px ruimte ertussen en 12px ruimte binnen de rand van de kaart.',
          html: '<article class="card">\n  <div class="photo">👟</div>\n  <div class="info">\n    <h3>Sneakers</h3>\n    <p>€ 59,95</p>\n  </div>\n</article>',
          base: `.card{${CARD}} .photo{width:72px;height:72px;border-radius:6px;background:rgba(255,184,107,.2);border:1.5px solid #ffb86b;text-align:center;line-height:69px;font-size:30px} .info{${ITEM.cyan}}`,
          rules: [{ sel: '.card' }, { sel: '.info' }],
          solution: { '.card': ['display: flex', 'gap: 12px', 'padding: 12px'] },
          tools: ['display: flex', 'flex-direction: column', 'gap: 12px', 'padding: 12px', 'margin: 12px'],
          good: '`.card` is de flex-container, `gap` zet ruimte tussen de foto en de info, en `padding` houdt alles van de rand af.'
        },
        {
          title: 'Pagina met zijbalk',
          task: 'Zet de zijbalk naast de inhoud, met 12px ertussen. De zijbalk is 30% breed.',
          html: '<div class="layout">\n  <nav class="sidebar">Menu</nav>\n  <main class="content">Welkom op mijn site!</main>\n</div>',
          base: `.layout{${BOX}padding:6px} .sidebar{${ITEM.mint}} .content{${ITEM.cyan}min-height:80px}`,
          rules: [{ sel: '.layout' }, { sel: '.sidebar' }, { sel: '.content', fixed: ['flex: 1'], note: 'neemt de rest van de ruimte' }],
          solution: { '.layout': ['display: flex', 'gap: 12px'], '.sidebar': ['width: 30%'] },
          tools: ['display: flex', 'gap: 12px', 'margin: 12px', 'width: 30%', 'width: 70%'],
          good: '`.layout` zet de zijbalk en de inhoud naast elkaar. `width: 30%` maakt de zijbalk 30% van zijn ouder breed, en `.content` vult de rest.'
        },
        {
          title: 'Knoppen onder een kaart',
          task: 'Zet de knoppen naast elkaar rechts onderin, met 8px ertussen. Geef de kaart 16px ruimte binnen de rand.',
          html: '<article class="card">\n  <h3>Nieuw level!</h3>\n  <p>Wil je meteen verder spelen?</p>\n  <div class="actions">\n    <button>Later</button>\n    <button>Spelen</button>\n  </div>\n</article>',
          base: `.card{${CARD}} .card h3{margin-bottom:4px} .card p{margin-bottom:10px} .actions{background:rgba(234,242,255,.06);border-radius:4px;padding:4px} .actions button{${ITEM.lilac}}`,
          rules: [{ sel: '.card' }, { sel: '.actions' }],
          solution: { '.card': ['padding: 16px'], '.actions': ['display: flex', 'justify-content: flex-end', 'gap: 8px'] },
          tools: ['display: flex', 'justify-content: flex-end', 'justify-content: space-between', 'gap: 8px', 'padding: 16px', 'margin: 16px'],
          good: '`.actions` is de flex-container voor de knoppen: `justify-content: flex-end` zet ze rechts, `gap` ertussen. `padding` geeft de kaart lucht.'
        },
        {
          title: 'Profielkaart',
          task: 'Zet de avatar, de naam en de knop onder elkaar en horizontaal in het midden, met 16px ruimte binnen de rand.',
          html: '<div class="profile">\n  <div class="avatar">🙂</div>\n  <h3>Sam</h3>\n  <button>Volgen</button>\n</div>',
          base: `.profile{${CARD}} .avatar{${ROUND(56)}} .profile h3{margin:6px 0} .profile button{${ITEM.lilac}}`,
          rules: [{ sel: '.profile' }, { sel: '.avatar' }],
          solution: { '.profile': ['display: flex', 'flex-direction: column', 'align-items: center', 'padding: 16px'] },
          tools: ['display: flex', 'flex-direction: column', 'justify-content: center', 'align-items: center', 'padding: 16px', 'margin: 16px'],
          hints: {
            'missing:align-items': 'In een kolom loopt de richting van boven naar beneden. `justify-content` werkt langs die richting, dus verticaal. Welke property lijnt de kinderen dan horizontaal uit?'
          },
          good: 'In een kolom draaien de assen om: `align-items: center` centreert nu horizontaal. `justify-content` zou verticaal werken.'
        }
      ]
    }
  ];

  // Elke tekening = 1 punt, als de eerste keuring meteen goed is.
  const LEVEL_TASKS = LEVELS.map((l) => l.challenges.length);
  const MAX_SCORE = LEVEL_TASKS.reduce((a, b) => a + b, 0);
  const PASS_RATIO = 0.8;
  const sheetNo = (level, idx) => `${level + 1}.${idx + 1}`;

  /* ---------- state ---------- */
  let state = null;
  let roundCounter = 0;
  let resizeObs = null;

  function newRound() {
    roundCounter += 1;
    state = {
      round: roundCounter,
      level: 0,
      idx: 0,               // tekening binnen het level
      tasks: {},            // key -> { level, first: bool, done: bool }
      finished: false,
      reported: false,      // voorkomt meerdere GAME_COMPLETED-berichten per ronde
      rules: [],            // [{ sel, fixed, note, decls }]
      picked: 0,            // welk element staat in het gereedschap
      solved: false
    };
  }

  const taskKey = (level, idx) => `L${level + 1}:${idx}`;
  function attempt(key, correct) {
    const t = state.tasks[key] || (state.tasks[key] = { level: state.level, first: correct, done: false });
    if (correct) t.done = true;
    return t;
  }
  const score = () => Object.values(state.tasks).filter((t) => t.first).length;
  const levelScore = (i) => Object.values(state.tasks).filter((t) => t.level === i && t.first).length;
  const challenge = () => LEVELS[state.level].challenges[state.idx];

  /* ---------- kop: titel + tekeningstempel ---------- */
  function masthead(sheet) {
    return `
      <header class="masthead">
        <div class="masthead-text">
          <h1>Layout Builder</h1>
          <p>Teken met CSS waar alles op de pagina staat.</p>
        </div>
        <table class="titleblock" aria-label="Tekeninggegevens">
          <tr><th>Bloom</th><td>Toepassen</td></tr>
          <tr><th>Blad</th><td>${sheet}</td></tr>
          <tr><th>Getekend</th><td>${state ? `${score()} ✓ / ${MAX_SCORE}` : '—'}</td></tr>
        </table>
      </header>`;
  }

  // Bladenindex: elke tekening een blaadje, gegroepeerd per bouwfase.
  function sheetIndex() {
    return `<nav class="sheets" aria-label="Tekeningen">${LEVELS.map((l, li) => `
      <div class="sheet-group">
        <span class="sheet-phase">${l.phase}</span>
        <div class="sheet-row">${l.challenges.map((_, ci) => {
          const t = state.tasks[taskKey(li, ci)];
          const cur = li === state.level && ci === state.idx && !state.finished;
          const cls = t && t.done ? (t.first ? 'ok' : 'retry') : cur ? 'current' : t ? 'tried' : '';
          const label = `Blad ${sheetNo(li, ci)}${t && t.done ? (t.first ? ', in één keer goedgekeurd' : ', goedgekeurd na herkansing') : cur ? ', nu bezig' : ''}`;
          return `<span class="sheet-tab ${cls}" aria-label="${label}">${sheetNo(li, ci)}</span>`;
        }).join('')}</div>
      </div>`).join('')}</nav>`;
  }

  function refreshChrome() {
    const top = document.getElementById('chrome');
    if (top) top.innerHTML = masthead(sheetNo(state.level, state.idx)) + sheetIndex();
  }

  /* ---------- startscherm ---------- */
  function renderStart() {
    window.scrollTo(0, 0);
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    app.innerHTML = `
      ${masthead('—')}
      <main class="drafting intro">
        <p class="kicker">Skill 4 van 8 · Toepassen</p>
        <h2>Jij bent de architect van de pagina</h2>
        <p class="lead">In <b>Build the DOM</b> leerde je welk element ín welk ander element zit. Nu bepaal je met CSS <b>waar</b> die elementen staan. Op elke tekening ligt het ontwerp als <span class="ghost-word">gele stippellijn</span> over je pagina. Zet jouw blokken met CSS precies in de lijnen.</p>

        <section class="intro-grid">
          <div class="note-card">
            <h3>Wat is flexbox?</h3>
            <p>Normaal staan blokken <b>onder elkaar</b>. Zet je <code>display: flex</code> op een <b>ouder</b>, dan komen zijn <b>kind-elementen</b> naast elkaar te staan. Daarna bepaal jij de richting, de ruimte en de uitlijning.</p>
            <div class="demo-pair">
              <figure><figcaption><code>.menu</code></figcaption>
                <div class="demo"><span>Home</span><span>Games</span><span>Contact</span></div></figure>
              <span class="demo-arrow" aria-hidden="true">⟶</span>
              <figure><figcaption><code>.menu { display: flex }</code></figcaption>
                <div class="demo flex"><span>Home</span><span>Games</span><span>Contact</span></div></figure>
            </div>
          </div>
          <div class="note-card">
            <h3>Zo werk je</h3>
            <ol class="steps">
              <li><b>Klik een element aan</b> op je tekening (of kies het boven het gereedschap).</li>
              <li><b>Stel zijn CSS in</b> met het gereedschap. Je tekening verandert meteen mee.</li>
              <li><b>Past alles in de lijnen?</b> Lijnen die kloppen worden groen.</li>
              <li><b>Laat keuren.</b> Nog niet goed? De inspecteur geeft je een aanwijzing.</li>
            </ol>
          </div>
        </section>

        <section class="phases">
          ${LEVELS.map((l, i) => `<div class="phase-card"><span class="phase-no">Fase ${i + 1}</span><b>${l.phase}: ${l.name}</b><span>${l.goal}</span></div>`).join('')}
        </section>

        <p class="pass-rule">📐 <b>${MAX_SCORE} tekeningen.</b> Alleen de <b>eerste keuring</b> per tekening telt. Keurt de inspecteur er minimaal <b>${need}</b> (80%) meteen goed, dan heb je de game behaald.</p>

        <button class="btn" id="startBtn">Pak je potlood →</button>
      </main>`;
    document.getElementById('startBtn').addEventListener('click', () => {
      newRound();
      startLevel(0);
    });
  }

  function startLevel(i) {
    state.level = i;
    state.idx = 0;
    startChallenge();
  }

  function startChallenge() {
    const c = challenge();
    state.rules = c.rules.map((r) => ({ sel: r.sel, fixed: r.fixed || [], note: r.note || '', decls: [] }));
    state.picked = 0;
    state.solved = false;
    renderChallenge();
  }

  /* =========================================================
     TEKENING — element kiezen, CSS instellen, laten keuren
     ========================================================= */
  const PROP_ORDER = ['display', 'flex-direction', 'justify-content', 'align-items', 'gap', 'padding', 'margin', 'width', 'height', 'flex', 'text-align'];
  const byProp = (a, b) => PROP_ORDER.indexOf(propOf(a)) - PROP_ORDER.indexOf(propOf(b));
  const ruleCss = (rules) => rules.map((r) => `${r.sel} { ${[...r.fixed, ...r.decls].map((d) => d + ';').join(' ')} }`).join('\n');
  const targetRules = (c) => c.rules.map((r) => ({ sel: r.sel, fixed: r.fixed || [], decls: c.solution[r.sel] || [] }));

  // Gereedschap: per property de waarden die je kunt kiezen.
  function toolProps(c) {
    const map = new Map();
    for (const d of c.tools) {
      const p = propOf(d);
      if (!map.has(p)) map.set(p, []);
      if (!map.get(p).includes(valOf(d))) map.get(p).push(valOf(d));
    }
    return [...map.entries()].sort((a, b) => PROP_ORDER.indexOf(a[0]) - PROP_ORDER.indexOf(b[0]));
  }

  // Een mini-pagina in een eigen shadow root, zodat de CSS van de tekening niets anders raakt.
  function mountPage(host, c, rules) {
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${BASE_CSS}\n${c.base}</style><style data-player>${ruleCss(rules)}</style><div class="screen">${c.html}</div>`;
    return root;
  }

  const boxesOf = (root) => {
    const screen = root.querySelector('.screen');
    const o = screen.getBoundingClientRect();
    return {
      height: o.height,
      boxes: [...screen.querySelectorAll('*')].map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height, parent: !!el.firstElementChild };
      })
    };
  };
  const sameBox = (a, b) => Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && Math.abs(a.w - b.w) <= 1 && Math.abs(a.h - b.h) <= 1;

  // Ontwerp en pagina op dezelfde breedte meten.
  function measure(c, rules, width) {
    const stage = document.createElement('div');
    stage.className = 'measure';
    stage.style.width = width + 'px';
    const host = document.createElement('div');
    stage.appendChild(host);
    document.body.appendChild(stage);
    const m = boxesOf(mountPage(host, c, rules));
    stage.remove();
    return m;
  }

  // Keuring: klopt elk element in plek en maat met het ontwerp? Elke CSS die er hetzelfde uitziet telt.
  function layoutMatches(c, rules) {
    const a = measure(c, targetRules(c), 340).boxes;
    const b = measure(c, rules, 340).boxes;
    return a.length === b.length && a.every((box, i) => sameBox(box, b[i]));
  }

  // Wat wijkt af van het ontwerp? Gebruikt voor de opmerking van de inspecteur.
  const KIND_ORDER = ['place', 'missing', 'value', 'extra'];
  function diagnose(c, rules) {
    const want = (sel) => c.solution[sel] || [];
    const issues = [];
    for (const r of rules) {
      for (const w of want(r.sel)) {
        if (r.decls.includes(w)) continue;
        const prop = propOf(w);
        const have = r.decls.find((d) => propOf(d) === prop);
        const from = rules.find((o) => o !== r && o.decls.includes(w) && !want(o.sel).includes(w));
        if (have) issues.push({ kind: 'value', sel: r.sel, prop, want: w, have });
        else if (from) issues.push({ kind: 'place', sel: r.sel, prop, want: w, from: from.sel });
        else issues.push({ kind: 'missing', sel: r.sel, prop, want: w });
      }
    }
    for (const r of rules) {
      for (const d of r.decls) {
        if (want(r.sel).includes(d)) continue;
        if (issues.some((i) => (i.kind === 'value' && i.sel === r.sel && i.have === d) || (i.kind === 'place' && i.from === r.sel && i.want === d))) continue;
        issues.push({ kind: 'extra', sel: r.sel, prop: propOf(d), have: d });
      }
    }
    // Eerst een bekende misvatting (eigen hint bij iets overbodigs), dan wat ontbreekt of fout staat, als laatste wat overbodig is.
    const h = c.hints || {};
    const rank = (i) => {
      const p = PROP_ORDER.indexOf(i.prop);
      const base = (p < 0 ? PROP_ORDER.length : p) * KIND_ORDER.length + KIND_ORDER.indexOf(i.kind);
      if (i.kind !== 'extra') return base;
      return h[`extra:${i.sel}:${i.prop}`] || h[`extra:${i.prop}`] ? base - 1000 : base + 1000;
    };
    return issues.sort((x, y) => rank(x) - rank(y));
  }

  const FLEX_PROPS = ['display', 'flex-direction', 'justify-content', 'align-items', 'gap'];
  const NOUN = { width: 'breedte', padding: 'ruimte aan de binnenkant', margin: 'ruimte aan de buitenkant' };
  const MISSING = {
    display: (s) => `De kind-elementen van ${s} staan nog onder elkaar. Welke property maakt van ${s} een flex-container, zodat ze naast elkaar komen?`,
    'flex-direction': (s) => `${s} zet zijn kinderen nu naast elkaar, maar op de tekening staan ze onder elkaar. Welke property bepaalt de richting van een flex-container?`,
    'justify-content': (s) => `Langs de richting van ${s} (in een rij: horizontaal) staan de kinderen nog niet op de goede plek. Welke property verdeelt de lege ruimte langs die richting?`,
    'align-items': (s) => `Kijk dwars op de richting van ${s} (in een rij: verticaal): daar staan de kinderen nog niet zoals op de tekening. Welke property lijnt ze uit op die as?`,
    gap: (s) => `De kinderen van ${s} plakken nog tegen elkaar. Welke property zet ruimte tússen de kinderen van een flex-container?`,
    padding: (s) => `Kijk naar de rand van ${s}: op de tekening zit er ruimte tussen de rand en de inhoud. Welke property maakt ruimte aan de binnenkant?`,
    margin: (s) => `Op de tekening zit er ruimte rond ${s}, aan de buitenkant. Welke property doet dat?`,
    width: (s) => `Vergelijk de breedte van ${s} met de tekening. Welke property bepaalt hoe breed een element is?`
  };
  const WRONG_VALUE = {
    display: 'blijven de kinderen onder elkaar staan. Welke waarde maakt er een flex-container van?',
    'flex-direction': 'gaat de richting de verkeerde kant op. Staan de kinderen op de tekening naast elkaar (`row`) of onder elkaar (`column`)?',
    'justify-content': 'wordt de ruimte anders verdeeld. Kijk waar op de tekening de lege ruimte zit.',
    'align-items': 'staan de kinderen op een andere plek. Kijk of ze op de tekening aan het begin, in het midden of aan het eind staan.',
    width: 'klopt de breedte nog niet. Vergelijk met de tekening.'
  };

  function hintFor(issue, c) {
    const h = c.hints || {};
    const custom = h[`${issue.kind}:${issue.sel}:${issue.prop}`] || h[`${issue.kind}:${issue.prop}`];
    if (custom) return custom;
    const s = '`' + issue.sel + '`';
    switch (issue.kind) {
      case 'place':
        return FLEX_PROPS.includes(issue.prop)
          ? `\`${issue.want}\` is goed, maar staat bij \`${issue.from}\`. Een flex-property werkt op de kind-elementen van het element waar je hem op zet. Welk element is de ouder van de blokken die moeten bewegen?`
          : `\`${issue.want}\` is goed, maar hoort niet bij \`${issue.from}\`. Kijk op de tekening welk element die ${NOUN[issue.prop] || 'waarde'} heeft.`;
      case 'missing':
        return (MISSING[issue.prop] || ((x) => `Er ontbreekt nog iets bij ${x}. Vergelijk je blokken met de lijnen.`))(s);
      case 'value':
        return `\`${issue.prop}\` is de goede property voor ${s}, maar met \`${issue.have}\` ${WRONG_VALUE[issue.prop] || 'klopt de hoeveelheid ruimte nog niet. Vergelijk de afstand met de tekening.'}`;
      default:
        return `\`${issue.have}\` bij ${s} hoort niet bij deze tekening. Zet hem terug op — en kijk wat er verandert.`;
    }
  }

  // Na een goede keuring: instellingen die niets doen mogen weg.
  function extraNote(c, rules) {
    const extras = diagnose(c, rules).filter((i) => i.kind === 'extra');
    if (!extras.length) return '';
    const why = (i) => i.have === 'flex-direction: row' ? 'dat is al de standaard'
      : i.prop === 'text-align' ? 'dat centreert alleen tekst, niet de blokken'
      : 'dat verandert hier niets aan de layout';
    return `<p class="inspect-tip">${extras.map((i) => fmt(`Tip: \`${i.have}\` bij \`${i.sel}\` mag weg: ${why(i)}.`)).join('<br>')}</p>`;
  }

  function renderChallenge() {
    const c = challenge();
    const lvl = LEVELS[state.level];
    window.scrollTo(0, 0);
    app.innerHTML = `
      <div id="chrome">${masthead(sheetNo(state.level, state.idx))}${sheetIndex()}</div>
      <div class="workbench">
        <section class="brief">
          <p class="kicker">Fase ${state.level + 1} · ${lvl.phase} · Blad ${sheetNo(state.level, state.idx)}</p>
          <h2>${esc(c.title)}</h2>
          <p>${fmt(c.task)}</p>
        </section>
        <section class="board" aria-label="Je tekening">
          <div class="board-bar">
            <div class="peek-flag" aria-hidden="true"><span class="only-target">Je ziet nu alleen het ontwerp</span><span class="only-mine">Je ziet nu alleen jouw pagina</span></div>
            <div class="board-legend">
              <span><i class="lg lg-ghost"></i>ontwerp</span><span><i class="lg lg-fit"></i>past</span><span><i class="lg lg-pick"></i>gekozen element</span>
            </div>
            <div class="peek" role="group" aria-label="Ingedrukt houden om te vergelijken">
              <button type="button" class="peek-btn" data-peek="target" aria-pressed="false" title="Houd ingedrukt om alleen het ontwerp te zien">Alleen ontwerp</button>
              <button type="button" class="peek-btn" data-peek="mine" aria-pressed="false" title="Houd ingedrukt om alleen jouw pagina te zien">Alleen jouw pagina</button>
            </div>
          </div>
          <div class="sheet" id="sheet">
            <div class="page-host" id="yourPage"></div>
            <div class="page-host target-page" id="targetPage" aria-hidden="true"></div>
            <div class="ghosts" id="ghosts" aria-hidden="true"></div>
            <div class="pick-label" id="pickLabel" aria-hidden="true"></div>
            <div class="stamp" id="stamp" aria-hidden="true">Goed<br>gekeurd</div>
          </div>
          <details class="html-view">
            <summary>Bekijk de HTML</summary>
            <pre>${esc(c.html)}</pre>
          </details>
        </section>
        <section class="tools" aria-label="Gereedschap">
          <div class="tools-head">Gereedschap</div>
          <div class="pick-tabs" id="pickTabs" role="tablist" aria-label="Kies een element"></div>
          <div class="props" id="props"></div>
          <div class="spec-head">Jouw CSS</div>
          <pre class="spec" id="spec"></pre>
          <div class="tools-actions" id="actions"><button class="btn" id="checkBtn" type="button">Laat keuren</button></div>
          <div class="inspect" id="inspect" aria-live="polite"></div>
        </section>
      </div>`;

    const host = document.getElementById('yourPage');
    const root = mountPage(host, c, state.rules);
    root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-pick]');
      if (el && !state.solved) pick(Number(el.dataset.pick));
    });
    mountPage(document.getElementById('targetPage'), c, targetRules(c));
    bindPeek();
    document.getElementById('checkBtn').addEventListener('click', check);
    if (resizeObs) resizeObs.disconnect();
    resizeObs = new ResizeObserver(() => drawOverlay());
    resizeObs.observe(document.getElementById('sheet'));
    renderTools();
    updatePage();
    // Lettertypes kunnen later binnenkomen dan de eerste meting: dan de lijnen opnieuw tekenen.
    if (document.fonts) document.fonts.ready.then(() => { if (document.getElementById('sheet')) drawOverlay(); });
  }

  // Vergelijken: zolang je een knop ingedrukt houdt, zie je alleen het ontwerp of alleen je eigen pagina.
  function bindPeek() {
    const board = document.querySelector('.board');
    document.querySelectorAll('.peek-btn').forEach((btn) => {
      const mode = btn.dataset.peek;
      const on = () => { board.classList.add('peek-' + mode); btn.setAttribute('aria-pressed', 'true'); };
      const off = () => { board.classList.remove('peek-' + mode); btn.setAttribute('aria-pressed', 'false'); };
      btn.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        try { btn.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        on();
      });
      ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach((t) => btn.addEventListener(t, off));
      btn.addEventListener('keydown', (e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); on(); }
      });
      btn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') off(); });
      btn.addEventListener('contextmenu', (e) => e.preventDefault());   // lang drukken op touch: geen menu
    });
  }

  // Elementen die je mag aanpassen krijgen een data-pick, zodat je ze op de tekening kunt aanklikken.
  function markPickable() {
    const root = document.getElementById('yourPage').shadowRoot;
    root.querySelectorAll('[data-pick]').forEach((el) => { el.removeAttribute('data-pick'); el.removeAttribute('data-picked'); });
    if (state.solved) return;
    state.rules.forEach((r, i) => {
      const el = root.querySelector('.screen ' + r.sel);
      if (!el) return;
      el.dataset.pick = i;
      if (i === state.picked) el.dataset.picked = '';
    });
  }

  // Het ontwerp als stippellijnen over je pagina; wat al past wordt groen.
  function drawOverlay() {
    const c = challenge();
    const sheet = document.getElementById('sheet');
    const host = document.getElementById('yourPage');
    if (!sheet || !host.shadowRoot) return;
    const target = measure(c, targetRules(c), host.clientWidth);
    const mine = boxesOf(host.shadowRoot).boxes;
    sheet.style.minHeight = Math.ceil(target.height) + 'px';
    document.getElementById('ghosts').innerHTML = target.boxes.map((b, i) =>
      `<span class="ghost${b.parent ? ' outer' : ''}${mine[i] && sameBox(b, mine[i]) ? ' fit' : ''}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px"></span>`).join('');
    const label = document.getElementById('pickLabel');
    const el = host.shadowRoot.querySelector('[data-picked]');
    if (el && !state.solved) {
      const o = host.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      label.textContent = state.rules[state.picked].sel;
      label.style.left = (r.right - o.left) + 'px';   // rechtsboven: daar staat meestal geen tekst
      label.style.top = (r.top - o.top) + 'px';
      label.classList.toggle('inside', r.top - o.top < 18);   // geen ruimte erboven: label binnen het element
      label.hidden = false;
    } else {
      label.hidden = true;
    }
  }

  function updatePage() {
    const host = document.getElementById('yourPage');
    host.shadowRoot.querySelector('style[data-player]').textContent = ruleCss(state.rules);
    markPickable();
    drawOverlay();
    renderSpec();
    document.getElementById('checkBtn').disabled = state.solved || state.rules.every((r) => !r.decls.length);
  }

  function renderTools() {
    const c = challenge();
    const r = state.rules[state.picked];
    document.getElementById('pickTabs').innerHTML = state.rules.map((x, i) =>
      `<button type="button" role="tab" class="pick-tab${i === state.picked ? ' on' : ''}" data-tab="${i}" aria-selected="${i === state.picked}"${state.solved ? ' disabled' : ''}><code>${esc(x.sel)}</code></button>`).join('');

    const fixedRows = r.fixed.map((d) => `
      <div class="prop-row fixed">
        <span class="prop-name">${esc(propOf(d))}</span>
        <span class="prop-fixed"><code>${esc(valOf(d))}</code> <span class="lock">vast${r.note ? ` · ${esc(r.note)}` : ''}</span></span>
      </div>`);
    const fixedProps = r.fixed.map(propOf);
    const toolRows = toolProps(c).filter(([p]) => !fixedProps.includes(p)).map(([p, vals]) => {
      const cur = r.decls.find((d) => propOf(d) === p);
      const curVal = cur ? valOf(cur) : '';
      const opts = ['', ...vals].map((v) => `<button type="button" role="radio" class="seg-btn${v === curVal ? ' on' : ''}${v ? '' : ' none'}" data-prop="${p}" data-val="${esc(v)}" aria-checked="${v === curVal}"${state.solved ? ' disabled' : ''}>${v ? esc(v) : '—'}</button>`).join('');
      return `<div class="prop-row"><span class="prop-name" id="p-${p}">${esc(p)}</span><div class="seg" role="radiogroup" aria-labelledby="p-${p}">${opts}</div></div>`;
    });
    document.getElementById('props').innerHTML = [...fixedRows, ...toolRows].join('');
  }

  function renderSpec() {
    document.getElementById('spec').innerHTML = state.rules.map((r, i) => {
      const lines = [...r.fixed.map((d) => `  <span class="spec-fixed">${esc(d)};</span>`), ...r.decls.slice().sort(byProp).map((d) => `  <span class="spec-own">${esc(d)};</span>`)];
      return `<span class="spec-rule${i === state.picked && !state.solved ? ' on' : ''}"><span class="spec-sel">${esc(r.sel)}</span> {\n${lines.length ? lines.join('\n') + '\n' : '  <span class="spec-empty">/* nog leeg */</span>\n'}}</span>`;
    }).join('\n');
  }

  function pick(i) {
    if (i === state.picked || !state.rules[i]) return;
    state.picked = i;
    renderTools();
    updatePage();
  }

  function setValue(prop, val) {
    const r = state.rules[state.picked];
    if (state.solved || r.fixed.some((d) => propOf(d) === prop)) return;
    r.decls = r.decls.filter((d) => propOf(d) !== prop).concat(val ? [`${prop}: ${val}`] : []);
    renderTools();
    updatePage();
  }

  app.addEventListener('click', (e) => {
    if (!state || !document.getElementById('props')) return;
    const seg = e.target.closest('.seg-btn');
    if (seg && !seg.disabled) { setValue(seg.dataset.prop, seg.dataset.val); return; }
    const tab = e.target.closest('.pick-tab');
    if (tab && !tab.disabled) pick(Number(tab.dataset.tab));
  });

  function check() {
    const c = challenge();
    if (state.solved || state.rules.every((r) => !r.decls.length)) return;
    const ok = layoutMatches(c, state.rules);
    attempt(taskKey(state.level, state.idx), ok);
    const box = document.getElementById('inspect');
    if (!ok) {
      refreshChrome();
      const issue = diagnose(c, state.rules)[0];
      box.className = 'inspect rejected';
      box.innerHTML = `<span class="inspect-head">Afgekeurd — opmerking van de inspecteur</span>${fmt(issue ? hintFor(issue, c) : 'Vergelijk je blokken met de lijnen van de tekening.')}`;
      void box.offsetWidth;
      box.classList.add('pop');
      scrollIntoViewIfNeeded(box);
      return;
    }
    state.solved = true;
    refreshChrome();
    renderTools();
    updatePage();
    document.getElementById('sheet').classList.add('approved');
    const lvl = LEVELS[state.level];
    const lastInLevel = state.idx === lvl.challenges.length - 1;
    document.getElementById('actions').innerHTML =
      `<button class="btn" id="nextBtn" type="button">${lastInLevel ? `Fase ${state.level + 1} opleveren →` : 'Volgende tekening →'}</button>`;
    document.getElementById('nextBtn').addEventListener('click', () => {
      if (lastInLevel) renderLevelDone();
      else { state.idx += 1; startChallenge(); }
    }, { once: true });
    box.className = 'inspect approved';
    box.innerHTML = `<span class="inspect-head">Goedgekeurd</span>${fmt(c.good)}${extraNote(c, state.rules)}`;
    scrollIntoViewIfNeeded(box);
  }

  /* ---------- tussenscherm: fase opgeleverd ---------- */
  function renderLevelDone() {
    const i = state.level;
    const lvl = LEVELS[i];
    const next = LEVELS[i + 1];
    if (resizeObs) resizeObs.disconnect();
    window.scrollTo(0, 0);
    app.innerHTML = `
      <div id="chrome">${masthead(`Fase ${i + 1}`)}${sheetIndex()}</div>
      <main class="drafting handover">
        <p class="kicker">Fase ${i + 1} van ${LEVELS.length} opgeleverd</p>
        <h2>${lvl.phase}: ${lvl.name}</h2>
        <p class="muted">${levelScore(i)} van ${LEVEL_TASKS[i]} tekeningen in één keer goedgekeurd</p>
        <div class="handover-grid">
          <pre class="spec big">${esc(lvl.summary)}</pre>
          <p class="takeaway">${fmt(lvl.takeaway)}</p>
        </div>
        <button class="btn" id="goNext">${next ? `Naar fase ${i + 2}: ${next.phase} →` : 'Naar het opleveringsrapport →'}</button>
      </main>`;
    document.getElementById('goNext').addEventListener('click', () => (next ? startLevel(i + 1) : finishGame()));
  }

  /* =========================================================
     EINDE — opleveringsrapport
     ========================================================= */
  function finishGame() {
    if (state.finished) { renderEnd(); return; }
    state.finished = true;
    const s = score();
    state.passed = s / MAX_SCORE >= PASS_RATIO;
    if (state.passed && !state.reported) {
      state.reported = true; // eerst markeren: nooit twee keer per ronde
      try {
        reportCompletion(s, MAX_SCORE);
      } catch (err) {
        console.warn('reportCompletion kon het bericht niet versturen:', err);
      }
    }
    renderEnd();
  }

  function renderEnd() {
    const s = score();
    const pct = Math.round((s / MAX_SCORE) * 100);
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${masthead('Oplevering')}
      <main class="drafting report">
        <p class="kicker">Opleveringsrapport</p>
        <div class="report-top">
          <div>
            <div class="big-score">${s}<span>/${MAX_SCORE}</span></div>
            <p class="muted">tekeningen in één keer goedgekeurd · ${pct}%</p>
          </div>
          <div class="final-stamp ${state.passed ? 'pass' : 'fail'}">${state.passed ? 'Bouw<br>goedgekeurd' : 'Nog niet<br>goedgekeurd'}</div>
        </div>
        <p class="report-text">${state.passed
          ? 'Je kunt een layout nabouwen met flexbox: richting, ruimte, uitlijning en breedte. Samen met Style Lab opent dit Bug Hunter!'
          : `Je hebt minimaal ${need} van ${MAX_SCORE} (80%) nodig bij de eerste keuring. Lees de opmerkingen van de inspecteur nog eens en probeer het opnieuw — je kunt het!`}</p>
        <table class="report-table">
          <thead><tr><th>Fase</th><th>Onderdeel</th><th>In één keer</th></tr></thead>
          <tbody>${LEVELS.map((l, i) => `<tr><td>${i + 1}</td><td>${l.phase}: ${l.name}</td><td>${levelScore(i)} / ${LEVEL_TASKS[i]}</td></tr>`).join('')}</tbody>
        </table>
        <div class="report-actions">
          <button class="btn secondary" id="exit">← Terug naar de skilltree</button>
          <button class="btn" id="again">↺ Opnieuw tekenen</button>
        </div>
      </main>`;
    // Stoppen: in de skilltree vraagt de game de pagina om het spelvenster te sluiten; los geopend gaat hij naar /games/.
    document.getElementById('exit').addEventListener('click', () => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'GAME_EXIT', gameId: gameInfo.gameId }, window.location.origin);
      } else {
        window.location.href = '/games/';
      }
    });
    document.getElementById('again').addEventListener('click', () => {
      newRound();
      startLevel(0);
    });
  }

  // Alleen-lezen inzicht voor testen/debuggen.
  window.layoutBuilder = Object.freeze({
    info: gameInfo,
    maxScore: MAX_SCORE,
    levels: LEVELS.map((l) => l.challenges.map((c) => ({ title: c.title, rules: c.rules.map((r) => r.sel), tools: c.tools, solution: c.solution }))),
    // Zou deze CSS goedgekeurd worden, en welke opmerking komt er anders? decls: { selector: [declaraties] }
    judge: (level, idx, decls) => {
      const c = LEVELS[level].challenges[idx];
      const rules = c.rules.map((r) => ({ sel: r.sel, fixed: r.fixed || [], decls: decls[r.sel] || [] }));
      const issue = diagnose(c, rules)[0];
      return { ok: layoutMatches(c, rules), hint: issue ? hintFor(issue, c) : null };
    },
    snapshot: () => state && JSON.parse(JSON.stringify({
      round: state.round, level: state.level, idx: state.idx, score: score(),
      solved: state.solved, finished: state.finished, passed: !!state.passed, reported: state.reported,
      picked: state.picked, rules: state.rules.map((r) => ({ sel: r.sel, decls: r.decls }))
    }))
  });

  renderStart();
})();
