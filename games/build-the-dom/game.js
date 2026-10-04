/* =========================================================
   Build the DOM — educatieve game (Bloom: Begrijpen)
   ========================================================= */

/* ---------- vaste gamestekker ---------- */
const gameInfo = {
  gameId: 'build-the-dom',
  learningGoal: 'De leerling kan herkennen en uitleggen hoe HTML-elementen samen de structuur van een webpagina vormen, elementen correct nesten en eenvoudige structuurfouten herkennen en verklaren.',
  bloom: 'Begrijpen',
  successCriterion: 'De speler voltooit alle drie de levels en beantwoordt minimaal 80% van de beoordeelde opdrachten bij de eerste poging correct.'
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
  const scroller = document.getElementById('scroller');

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const COLOR = { document: 'doc', html: 'html', head: 'head', title: 'head', body: 'body', ul: 'list', li: 'list' };
  const colorOf = (tag) => 'c-' + (COLOR[tag] || 'content');

  // Tekst met `<tag>` tussen backticks wordt een gekleurde code-chip.
  function fmt(str) {
    return esc(str).replace(/`([^`]+)`/g, (_, code) => {
      const name = code.replace(/&lt;|&gt;|\//g, '').trim().split(/\s/)[0];
      return `<code class="tag ${colorOf(name)}">${code}</code>`;
    });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Scroll alleen binnen de game zelf (niet de pagina om de iframe heen).
  function ensureVisible(el) {
    if (!el) return;
    const s = scroller.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const margin = 12;
    if (r.top < s.top + margin) {
      scroller.scrollTop += r.top - s.top - margin;
    } else if (r.bottom > s.bottom - margin) {
      scroller.scrollTop += Math.min(r.bottom - s.bottom + margin, r.top - s.top - margin);
    }
  }

  /* ---------- inhoud ---------- */
  const ORDER = ['html', 'head', 'title', 'body', 'h1', 'p', 'img', 'ul', 'li', 'button'];
  const byOrder = (a, b) => ORDER.indexOf(a.tag) - ORDER.indexOf(b.tag);
  const VOID = ['img'];
  const TEXT_ONLY = ['title', 'h1', 'p', 'button', 'li'];

  const LEVELS = [
    {
      type: 'tree',
      name: 'De hoofdstructuur',
      goal: 'Bouw het skelet van een HTML-pagina.',
      instruction: 'Sleep elk blok ín het element waar het thuishoort — of tik eerst op een blok en daarna op de plek.',
      start: () => ({ tag: 'document', children: [] }),
      pieces: [
        { tag: 'html', parent: 'document', desc: 'de hele pagina',
          good: 'Goed! `<html>` is het buitenste element: alle andere elementen zitten daarin.' },
        { tag: 'head', parent: 'html', desc: 'info over de pagina',
          good: 'Goed! `<head>` is een kind van `<html>` en bevat informatie óver de pagina.' },
        { tag: 'body', parent: 'html', desc: 'zichtbare inhoud',
          good: 'Goed! `<body>` is ook een kind van `<html>` en bevat alles wat je op de pagina ziet.' },
        { tag: 'title', parent: 'head', text: 'Mijn eerste website', desc: 'tekst in het tabblad',
          good: 'Goed! `<title>` is informatie over de pagina (de tekst in het tabblad) en hoort daarom in `<head>`.' }
      ],
      ascii: 'html\n├── head\n│   └── title\n└── body',
      takeaway: '`<head>` en `<body>` zijn allebei kinderen van `<html>`. `<title>` is een kind van `<head>`.'
    },
    {
      type: 'tree',
      name: 'Content structureren',
      goal: 'Vul de pagina met zichtbare inhoud.',
      instruction: 'Zet elk blok in het juiste ouder-element. Kijk in de preview wat de browser laat zien.',
      start: () => ({
        tag: 'document', children: [{
          tag: 'html', children: [
            { tag: 'head', children: [{ tag: 'title', text: 'Mijn eerste website', children: [] }] },
            { tag: 'body', children: [] }
          ]
        }]
      }),
      pieces: [
        { tag: 'h1', parent: 'body', text: 'Welkom op mijn site!', desc: 'hoofdtitel',
          good: 'Goed! `<h1>` is zichtbare pagina-inhoud en hoort daarom binnen `<body>`.' },
        { tag: 'p', parent: 'body', text: 'Hier vertel ik over mijn hobby’s.', desc: 'alinea tekst',
          good: 'Goed! `<p>` is tekst die je op de pagina leest, dus hoort hij in `<body>`.' },
        { tag: 'img', parent: 'body', desc: 'afbeelding',
          good: 'Goed! Een afbeelding is zichtbaar op de pagina, dus `<img>` staat in `<body>`.' },
        { tag: 'button', parent: 'body', text: 'Stuur een bericht', desc: 'knop',
          good: 'Goed! Op een `<button>` moet je kunnen klikken, dus hij staat zichtbaar in `<body>`.' },
        { tag: 'ul', parent: 'body', desc: 'lijst',
          good: 'Goed! Een `<ul>` is een zichtbare lijst en hoort dus in `<body>`.' },
        { tag: 'li', parent: 'ul', text: 'Gamen', desc: 'lijst-item',
          good: 'Goed! `<li>` is een kind van `<ul>`, en `<ul>` is zelf weer een kind van `<body>`.' }
      ],
      ascii: 'html\n├── head\n│   └── title\n└── body\n    ├── h1\n    ├── p\n    ├── img\n    ├── ul\n    │   └── li\n    └── button',
      takeaway: 'Alles wat je op de pagina ziet staat in `<body>`. Een `<li>` heeft een lijst als ouder.'
    },
    {
      type: 'bugs',
      name: 'Structuurfouten herkennen',
      goal: 'Zoek de fout — en leg uit waarom het fout is.',
      // {{ }} markeert de tags die de fout vormen.
      cases: [
        {
          code: '<html>\n  <head>\n    <title>Mijn site</title>\n    {{<h1>}}Welkom!{{</h1>}}\n  </head>\n  <body>\n    <p>Leuk dat je er bent.</p>\n  </body>\n</html>',
          hint: 'Loop de elementen in `<head>` langs. Welk element is zichtbare inhoud die je óp de pagina zou zien?',
          found: 'Goed gevonden! `<h1>` staat hier op de verkeerde plek. Maar waarom?',
          options: [
            { text: '`<h1>` is zichtbare pagina-inhoud en hoort daarom in `<body>`, niet in `<head>`.', ok: true },
            { text: 'Een pagina mag maar één `<h1>` hebben.', fb: 'Hier staat maar één `<h1>`, dus dat is het probleem niet. Kijk naar de ouder van `<h1>`.' },
            { text: '`<h1>` moet boven `<title>` staan.', fb: 'De volgorde is niet het probleem. De vraag is of `<h1>` überhaupt in `<head>` hoort.' }
          ],
          why: 'Goed! `<head>` is voor informatie óver de pagina; een zichtbare kop zoals `<h1>` hoort in `<body>`.',
          fix: '<head>\n  <title>Mijn site</title>\n</head>\n<body>\n  <h1>Welkom!</h1>\n  <p>Leuk dat je er bent.</p>\n</body>'
        },
        {
          code: '<html>\n  <head>\n  </head>\n  <body>\n    {{<title>}}Mijn hobby’s{{</title>}}\n    <h1>Voetbal</h1>\n  </body>\n</html>',
          hint: 'Kijk naar elk element in `<body>`: wordt het echt óp de pagina getoond, of ergens anders in de browser?',
          found: 'Goed gevonden! `<title>` staat hier niet goed. Maar waarom?',
          options: [
            { text: '`<title>` is informatie over de pagina (de tekst in het tabblad) en hoort in `<head>`.', ok: true },
            { text: '`<title>` moet altijd onder `<h1>` staan.', fb: 'De volgorde is niet het probleem: `<title>` hoort helemaal niet in `<body>`. Waar verschijnt de titel in de browser?' },
            { text: '`<title>` en `<h1>` doen hetzelfde, dus één van de twee is overbodig.', fb: 'Ze doen niet hetzelfde: `<h1>` is een kop óp de pagina, `<title>` verschijnt in het tabblad. Welk deel van de pagina bewaart zulke informatie?' }
          ],
          why: 'Goed! `<title>` verschijnt in het tabblad, niet op de pagina, en hoort daarom in `<head>`.',
          fix: '<head>\n  <title>Mijn hobby’s</title>\n</head>\n<body>\n  <h1>Voetbal</h1>\n</body>'
        },
        {
          code: '<html>\n  <head>\n    <title>Recepten</title>\n  </head>\n  <body>\n    <h1>Pannenkoeken</h1>\n    <img src="pannenkoek.jpg">\n    <p>Makkelijk en lekker!</p>\n  </body>\n</html>',
          correct: true,
          hint: 'Controleer per element: staat het binnen de juiste ouder? Misschien klopt deze structuur wel helemaal.',
          found: 'Goed gezien! In deze structuur zit geen fout. Maar waaróm klopt hij?',
          options: [
            { text: 'Informatie over de pagina staat in `<head>` en alle zichtbare inhoud staat in `<body>`.', ok: true },
            { text: 'Hij klopt omdat alle regels netjes zijn ingesprongen.', fb: 'Inspringen maakt code leesbaar, maar de browser kijkt naar de tags, niet naar spaties. Waar staan de elementen?' },
            { text: 'Hij klopt omdat elke tag een sluit-tag heeft.', fb: 'Niet helemaal: `<img>` is een leeg element zonder sluit-tag. Het gaat erom dat elk element in de juiste ouder staat.' }
          ],
          why: 'Goed! `<title>` staat in `<head>` en `<h1>`, `<img>` en `<p>` staan als zichtbare inhoud in `<body>`.'
        },
        {
          code: '<body>\n  <p>Lees <a href="#">meer{{</p>}}{{</a>}}\n</body>',
          hint: 'Kijk naar de sluit-tags. Een element dat ín een ander element opent, moet daar ook weer sluiten.',
          found: 'Goed gevonden! De sluit-tags staan in de verkeerde volgorde. Maar waarom is dat fout?',
          options: [
            { text: '`<a>` is binnen `<p>` geopend, dus moet `</a>` eerst sluiten en daarna pas `</p>`.', ok: true },
            { text: 'Een `<a>` mag nooit binnen een `<p>` staan.', fb: 'Dat mag juist wel: een link in een zin is heel normaal. Kijk naar de volgorde van de sluit-tags.' },
            { text: 'Er ontbreekt een sluit-tag.', fb: 'Tel ze maar: `</p>` en `</a>` zijn er allebei. Het gaat om de volgorde waarin ze sluiten.' }
          ],
          why: 'Goed! Een kind moet volledig binnen zijn ouder sluiten: eerst `</a>`, dan `</p>`.',
          fix: '<body>\n  <p>Lees <a href="#">meer</a></p>\n</body>'
        },
        {
          code: '<body>\n  <h2>Menu</h2>\n  {{<li>}}Pizza{{</li>}}\n  {{<li>}}Pasta{{</li>}}\n</body>',
          hint: 'Welke elementen hebben een speciaal ouder-element nodig om te kunnen bestaan?',
          found: 'Goed gevonden! Deze `<li>`-elementen staan niet goed. Maar waarom?',
          options: [
            { text: '`<li>` is een lijst-item en heeft een lijst zoals `<ul>` als ouder nodig.', ok: true },
            { text: '`<li>` hoort in `<head>` te staan.', fb: '`<li>` is zichtbare inhoud, dus `<body>` klopt wel. Maar welk element ontbreekt er tussen `<body>` en `<li>`?' },
            { text: 'Na een `<h2>` mag geen ander element meer komen.', fb: 'Na een kop mag gewoon meer inhoud komen. Kijk naar de ouder van `<li>`.' }
          ],
          why: 'Goed! Een `<li>` hoort altijd in een lijst: hier ontbreekt het ouder-element `<ul>`.',
          fix: '<body>\n  <h2>Menu</h2>\n  <ul>\n    <li>Pizza</li>\n    <li>Pasta</li>\n  </ul>\n</body>'
        },
        {
          code: '<body>\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</body>',
          correct: true,
          hint: 'Controleer per element of het binnen zijn ouder opent én sluit. Misschien klopt alles wel.',
          found: 'Goed gezien! Deze structuur klopt. Maar waaróm?',
          options: [
            { text: 'Elke `<a>` opent en sluit binnen een `<li>`, en elke `<li>` staat binnen `<ul>`.', ok: true },
            { text: 'Hij klopt omdat een `<a>` altijd in een `<li>` moet staan.', fb: 'Een `<a>` mag ook op andere plekken staan, bijvoorbeeld in een `<p>`. Het gaat erom dat hij helemaal binnen zijn ouder sluit.' },
            { text: 'Hij klopt omdat elk element op een eigen regel staat.', fb: 'Regels maken code leesbaar, maar de browser kijkt naar welke tag binnen welke tag opent en sluit.' }
          ],
          why: 'Goed! `<a>` is een kind van `<li>`, `<li>` een kind van `<ul>` — en elk kind sluit binnen zijn ouder.'
        },
        {
          code: '<html>\n  <head>\n    <title>Blog</title>\n  </head>\n{{</html>}}\n{{<body>}}\n  <h1>Mijn blog</h1>\n</body>',
          hint: 'Kijk naar de buitenste laag. Zitten alle elementen wel binnen `<html>`?',
          found: 'Goed gevonden! Hier gaat iets mis met `<html>` en `<body>`. Maar wat precies?',
          options: [
            { text: '`<body>` moet een kind van `<html>` zijn, maar `</html>` sluit te vroeg.', ok: true },
            { text: '`<body>` moet vóór `<head>` staan.', fb: 'In een HTML-pagina komt `<head>` juist eerst. Kijk naar waar `<html>` sluit.' },
            { text: '`<h1>` hoort in `<head>` te staan.', fb: '`<h1>` is zichtbare inhoud en staat terecht in `<body>`. Het probleem zit een laag hoger.' }
          ],
          why: 'Goed! `<head>` én `<body>` zijn kinderen van `<html>`, dus `</html>` hoort helemaal onderaan.',
          fix: '<html>\n  <head>\n    <title>Blog</title>\n  </head>\n  <body>\n    <h1>Mijn blog</h1>\n  </body>\n</html>'
        }
      ],
      takeaway: 'Je kunt structuurfouten herkennen én uitleggen.'
    }
  ];

  // Elk geplaatst blok = 1 opdracht; elke situatie in level 3 = 2 opdrachten (aanwijzen + waarom).
  const LEVEL_TASKS = LEVELS.map((l) => (l.type === 'tree' ? l.pieces.length : l.cases.length * 2));
  const MAX_SCORE = LEVEL_TASKS.reduce((a, b) => a + b, 0);
  const PASS_RATIO = 0.8;

  /* ---------- state ---------- */
  let state = null;
  let roundCounter = 0;

  function newRound() {
    roundCounter += 1;
    state = {
      round: roundCounter,
      level: 0,
      tasks: {},          // key -> { level, first: bool, done: bool }
      finished: false,
      reported: false,    // voorkomt meerdere GAME_COMPLETED-berichten per ronde
      tree: null,
      tray: [],
      selected: null,
      caseIdx: 0,
      step: 1,
      optionOrder: []
    };
  }

  function attempt(key, correct) {
    const t = state.tasks[key] || (state.tasks[key] = { level: state.level, first: correct, done: false });
    if (correct) t.done = true;
    return t;
  }
  const score = () => Object.values(state.tasks).filter((t) => t.first).length;
  const doneCount = () => Object.values(state.tasks).filter((t) => t.done).length;
  const levelScore = (i) => Object.values(state.tasks).filter((t) => t.level === i && t.first).length;

  /* ---------- gedeelde UI ---------- */
  function topbar() {
    const pct = Math.round((doneCount() / MAX_SCORE) * 100);
    return `
      <div class="topbar">
        <div class="brand"><span class="lt">&lt;</span>Build the DOM<span class="lt">/&gt;</span></div>
        <div class="level-pill">Level <b>${state.level + 1}</b> van ${LEVELS.length}</div>
      </div>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${MAX_SCORE}" aria-valuenow="${doneCount()}"><span style="width:${pct}%"></span></div>
      <div class="progress-meta"><span>${doneCount()} / ${MAX_SCORE} opdrachten</span><span>⭐ ${score()} direct goed</span></div>`;
  }

  function refreshTopbar() {
    const el = document.getElementById('topbar');
    if (el) el.innerHTML = topbar();
  }

  function setFeedback(el, kind, msg) {
    el.className = 'feedback ' + kind;
    el.innerHTML = `<span class="fb-icon">${kind === 'good' ? '✓' : '✗'}</span>${fmt(msg)}`;
    void el.offsetWidth; // herstart animatie
    el.classList.add('pop');
    ensureVisible(el);
  }

  /* ---------- startscherm ---------- */
  function renderStart() {
    scroller.scrollTop = 0;
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    app.innerHTML = `
      <div class="hero intro">
        <h1><span class="lt">&lt;</span>Build the DOM<span class="lt">/&gt;</span></h1>
        <p class="lead">In <b>HTML Hunter</b> leerde je wát HTML-elementen zijn. Nu leer je hoe ze samen één pagina vormen: welk element zit <b>in</b> welk ander element?</p>

        <section class="intro-block">
          <h2>Wat is de DOM?</h2>
          <p>De browser leest je HTML als een <b>boom</b>: de DOM. Staat een element <b>ín</b> een ander element, dan is het daar een <b>kind</b> van. Het element eromheen is de <b>ouder</b>.</p>
          <div class="explain">
            <pre class="codebox explain-code"><span class="tag c-html">&lt;html&gt;</span>
  <span class="tag c-head">&lt;head&gt;</span>…<span class="tag c-head">&lt;/head&gt;</span>
  <span class="tag c-body">&lt;body&gt;</span>
    <span class="tag c-content">&lt;h1&gt;</span>Hoi<span class="tag c-content">&lt;/h1&gt;</span>
  <span class="tag c-body">&lt;/body&gt;</span>
<span class="tag c-html">&lt;/html&gt;</span></pre>
            <div class="explain-arrow" aria-hidden="true">→</div>
            <div class="mini-tree" aria-label="Dezelfde code als boom">
              <div class="mt c-html"><code>html</code>
                <div class="mt c-head"><code>head</code></div>
                <div class="mt c-body"><code>body</code>
                  <div class="mt c-content"><code>h1</code></div>
                </div>
              </div>
            </div>
          </div>
          <p class="small muted" style="margin:6px 0 0">${fmt('`<h1>` is een kind van `<body>`; `<head>` en `<body>` zijn allebei kinderen van `<html>`.')}</p>
        </section>

        <section class="intro-block">
          <h2>Zo speel je</h2>
          <ol class="steps">
            <li><span class="num">1</span><span><b>Kies een codeblok</b> onder de opdracht.</span></li>
            <li><span class="num">2</span><span><b>Sleep</b> het naar zijn ouder in de boom — of <b>tik</b> eerst op het blok en daarna op de plek.</span></li>
            <li><span class="num">3</span><span><b>Lees de feedback.</b> Fout? Je krijgt een hint en probeert het gewoon opnieuw.</span></li>
          </ol>
          <p class="small muted" style="margin:6px 0 0">Een browservenster bij de boom laat meteen zien wat er op de pagina verschijnt.</p>
        </section>

        <section class="intro-block">
          <h2>De 3 levels</h2>
          <ol class="level-list">
            <li><span class="num">1</span><span><b>${LEVELS[0].name}</b><br><span class="muted small">${fmt('Zet `<html>`, `<head>`, `<body>` en `<title>` op hun plek.')}</span></span></li>
            <li><span class="num">2</span><span><b>${LEVELS[1].name}</b><br><span class="muted small">${fmt('Plaats zichtbare inhoud zoals `<h1>`, `<img>` en een lijst.')}</span></span></li>
            <li><span class="num">3</span><span><b>${LEVELS[2].name}</b><br><span class="muted small">Tik de fout in een stukje code aan en kies waaróm het fout is.</span></span></li>
          </ol>
        </section>

        <section class="intro-block score-rule">
          <h2>Wanneer heb je het gehaald?</h2>
          <p style="margin:0">Er zijn <b>${MAX_SCORE} opdrachten</b>. Alleen je <b>eerste poging</b> telt voor de score. Heb je er minimaal <b>${need}</b> (80%) in één keer goed, dan heb je de game behaald.</p>
        </section>

        <button class="btn" id="startBtn">Start level 1 →</button>
      </div>`;
    document.getElementById('startBtn').addEventListener('click', () => {
      newRound();
      startLevel(0);
    });
  }

  function startLevel(i) {
    state.level = i;
    state.selected = null;
    const lvl = LEVELS[i];
    if (lvl.type === 'tree') {
      state.tree = lvl.start();
      state.tray = shuffle(lvl.pieces.map((p) => p.tag));
      renderTreeLevel();
    } else {
      state.caseIdx = 0;
      renderCase();
    }
  }

  /* =========================================================
     LEVEL 1 & 2 — boom bouwen
     ========================================================= */
  function findNode(node, tag) {
    if (node.tag === tag) return node;
    for (const c of node.children) {
      const f = findNode(c, tag);
      if (f) return f;
    }
    return null;
  }
  function parentOf(node, tag, parent = null) {
    if (node.tag === tag) return parent;
    for (const c of node.children) {
      const f = parentOf(c, tag, node);
      if (f) return f;
    }
    return null;
  }

  function renderTreeLevel() {
    const lvl = LEVELS[state.level];
    scroller.scrollTop = 0;
    app.innerHTML = `
      <div id="topbar">${topbar()}</div>
      <div class="level-grid">
        <section class="dock" aria-label="Opdracht">
          <div class="card task-card">
            <div class="step-label">Level ${state.level + 1} · ${lvl.name}</div>
            <p style="margin:0">${fmt(lvl.instruction)}</p>
          </div>
          <div class="tray-wrap">
            <div class="step-label">Codeblokken</div>
            <div class="tray" id="tray" aria-label="Codeblokken"></div>
            <div class="select-hint" id="selectHint" aria-live="polite"></div>
          </div>
          <div class="feedback" id="feedback" aria-live="polite"></div>
        </section>
        <section class="card tree-card" aria-label="DOM-boom">
          <div class="tree-title"><h3>DOM-boom</h3><span class="muted small">binnen = kind van</span></div>
          <div class="tree" id="tree"></div>
        </section>
        <aside class="card preview-card" aria-label="Browser-preview">
          <div class="tree-title"><h3>Zo toont de browser het</h3></div>
          <div id="preview"></div>
          <details class="codeview" style="margin-top:8px">
            <summary>Bekijk als HTML-code</summary>
            <pre class="codebox" id="codeview"></pre>
          </details>
        </aside>
      </div>`;
    renderTray();
    renderTree();
    renderPreview();
  }

  function renderTray() {
    const lvl = LEVELS[state.level];
    const tray = document.getElementById('tray');
    if (!state.tray.length) {
      tray.innerHTML = '<span class="tray-empty">Alle blokken staan op hun plek!</span>';
    } else {
      tray.innerHTML = state.tray.map((tag) => {
        const p = lvl.pieces.find((x) => x.tag === tag);
        const sel = state.selected === tag;
        return `<button type="button" class="piece ${colorOf(tag)}${sel ? ' selected' : ''}" data-piece="${tag}" aria-pressed="${sel}">
          <code>&lt;${tag}&gt;</code><small>${esc(p.desc)}</small></button>`;
      }).join('');
    }
    const hint = document.getElementById('selectHint');
    hint.innerHTML = state.selected ? fmt(`Tik nu op het element waarin \`<${state.selected}>\` hoort.`) : '';
    document.body.classList.toggle('picking', !!state.selected);
  }

  function nodeHtml(n, flash) {
    const color = colorOf(n.tag);
    const isNew = flash && flash.tag === n.tag && flash.kind === 'new';
    if (n.tag === 'document') {
      const kids = n.children.map((c) => nodeHtml(c, flash)).join('');
      return `<div class="node ${color}" data-drop="document">
        <button type="button" class="node-head" data-drop="document" aria-label="Plaats in document"><span class="node-text">📄 document</span><span class="node-rel">het HTML-bestand</span></button>
        ${kids ? `<div class="children">${kids}</div>` : '<div class="slot in-doc">nog leeg</div>'}
      </div>`;
    }
    const attrs = n.tag === 'img' ? ' src="foto.jpg"' : '';
    const open = `<code class="open">&lt;${n.tag}${esc(attrs)}&gt;</code>`;
    const close = `<code>&lt;/${n.tag}&gt;</code>`;
    const cls = `node ${color}${isNew ? ' new' : ''}`;
    const label = `aria-label="Plaats in ${n.tag}"`;

    if (VOID.includes(n.tag)) {
      return `<div class="${cls}" data-drop="${n.tag}">
        <button type="button" class="node-head" data-drop="${n.tag}" ${label}>${open}<span class="node-rel">leeg element</span></button></div>`;
    }
    if (TEXT_ONLY.includes(n.tag) && !n.children.length) {
      return `<div class="${cls}" data-drop="${n.tag}">
        <button type="button" class="node-head" data-drop="${n.tag}" ${label}>${open}<span class="node-text">${esc(n.text || '')}</span><code style="color:var(--c);font-weight:700">&lt;/${n.tag}&gt;</code></button></div>`;
    }
    const kids = n.children.slice().sort(byOrder).map((c) => nodeHtml(c, flash)).join('');
    const par = parentOf(state.tree, n.tag);
    const rel = par && par.tag !== 'document' ? `kind van ${par.tag}` : '';
    return `<div class="${cls}" data-drop="${n.tag}">
      <button type="button" class="node-head" data-drop="${n.tag}" ${label}>${open}<span class="node-rel">${rel}</span></button>
      <div class="children">${kids || '<div class="slot">leeg</div>'}</div>
      <div class="node-close">${close}</div>
    </div>`;
  }

  function renderTree(flash) {
    const tree = document.getElementById('tree');
    tree.innerHTML = nodeHtml(state.tree, flash);
    if (flash && flash.kind !== 'new') {
      const el = tree.querySelector(`.node[data-drop="${flash.tag}"]`);
      if (el) el.classList.add(flash.kind === 'good' ? 'flash-good' : 'flash-bad');
    }
    if (flash && flash.kind === 'new' && flash.parent) {
      const el = tree.querySelector(`.node[data-drop="${flash.parent}"]`);
      if (el) el.classList.add('flash-good');
    }
  }

  function toCode(n, depth) {
    const pad = '  '.repeat(depth);
    if (n.tag === 'document') return n.children.map((c) => toCode(c, 0)).join('\n');
    if (VOID.includes(n.tag)) return `${pad}<img src="foto.jpg">`;
    if (TEXT_ONLY.includes(n.tag) && !n.children.length) return `${pad}<${n.tag}>${n.text || ''}</${n.tag}>`;
    const kids = n.children.slice().sort(byOrder).map((c) => toCode(c, depth + 1)).join('\n');
    return `${pad}<${n.tag}>${kids ? '\n' + kids + '\n' + pad : ''}</${n.tag}>`;
  }

  function renderPreview(highlightTab) {
    const title = findNode(state.tree, 'title');
    const head = findNode(state.tree, 'head');
    const body = findNode(state.tree, 'body');
    const titleOk = title && head && findNode(head, 'title');
    let content = '';
    if (!body) {
      content = '<span class="none">Nog geen &lt;body&gt;: er is niets zichtbaars op de pagina.</span>';
    } else if (!body.children.length) {
      content = '<span class="none">&lt;body&gt; is nog leeg — hier komt de zichtbare inhoud.</span>';
    } else {
      content = body.children.slice().sort(byOrder).map((c) => {
        switch (c.tag) {
          case 'h1': return `<div class="pv-h1">${esc(c.text)}</div>`;
          case 'p': return `<p class="pv-p">${esc(c.text)}</p>`;
          case 'img': return '<div class="pv-img" aria-hidden="true">🖼️</div>';
          case 'button': return `<div><span class="pv-btn">${esc(c.text)}</span></div>`;
          case 'ul': return `<ul class="pv-ul">${c.children.map((li) => `<li>${esc(li.text)}</li>`).join('') || '<li style="list-style:none;color:#8a93a6;font-family:var(--sans);font-size:.85rem;font-style:italic;margin-left:-22px">lege lijst</li>'}</ul>`;
          default: return '';
        }
      }).join('');
    }
    document.getElementById('preview').innerHTML = `
      <div class="browser">
        <div class="browser-bar"><span class="dots"><i></i><i></i><i></i></span>
          <span class="btab${titleOk ? '' : ' empty'}${highlightTab ? ' hl' : ''}">${titleOk ? esc(title.text) : 'naamloos tabblad'}</span></div>
        <div class="viewport">${content}</div>
      </div>
      <div class="preview-note">${fmt(titleOk ? 'De `<title>` zie je in het tabblad, niet op de pagina zelf.' : 'Alleen wat in `<body>` staat, verschijnt op de pagina.')}</div>`;
    document.getElementById('codeview').textContent = toCode(state.tree, 0) || '(nog leeg)';
  }

  // Hint bij een fout — zonder direct de oplossing te geven.
  function wrongMessage(pieceTag, targetTag) {
    const P = `\`<${pieceTag}>\``;
    const T = `\`<${targetTag}>\``;
    const hasUl = !!findNode(state.tree, 'ul');

    if (targetTag === 'document') {
      if (state.level === 0) return `Nog niet helemaal. Een HTML-document heeft precies één buitenste element, en alle andere elementen zitten dáárin. Welk element is dat?`;
      return `Nog niet. Direct in het document staat alleen \`<html>\`. Zoek een plek dieper in de boom.`;
    }
    if (targetTag === 'img') return `Nog niet. \`<img>\` is een leeg element: het heeft geen sluit-tag en kan dus geen andere elementen bevatten.`;
    if (targetTag === 'title') return `Nog niet helemaal. \`<title>\` bevat alleen de tekst voor het tabblad, geen andere elementen. Kies een ander ouder-element.`;
    if (pieceTag === 'li') {
      return `Nog niet helemaal. \`<li>\` is een lijst-item en heeft altijd een lijst als ouder nodig. ${hasUl ? 'Welk element in de boom is een lijst?' : 'Zet eerst de lijst zelf in de boom.'}`;
    }
    if (['h1', 'p', 'button', 'li'].includes(targetTag)) {
      return `Nog niet helemaal. ${T} is zelf al een stukje inhoud. ${P} hoort er niet ín, maar ernaast — in dezelfde ouder als ${T}.`;
    }
    if (targetTag === 'ul') return `Nog niet. In een \`<ul>\` staan alleen lijst-items (\`<li>\`). ${P} hoort een niveau hoger.`;

    if (pieceTag === 'head' || pieceTag === 'body') {
      return `Nog niet helemaal. \`<head>\` en \`<body>\` staan náást elkaar: ze zijn allebei een kind van hetzelfde element. Welk element is hun ouder?`;
    }
    if (pieceTag === 'title') {
      if (targetTag === 'html') return `Bijna! \`<title>\` zit wel in \`<html>\`, maar niet direct. Het is informatie óver de pagina — welk kind van \`<html>\` bewaart die informatie?`;
      if (targetTag === 'body') return `Nog niet helemaal. \`<body>\` is voor wat je óp de pagina ziet, maar de titel verschijnt in het tabblad van de browser. Waar hoort informatie over de pagina?`;
    }
    // zichtbare content: h1, p, img, button, ul
    if (targetTag === 'head') return `Nog niet helemaal. \`<head>\` bevat informatie over de pagina die niet als gewone content op de pagina verschijnt. ${P} is zichtbare inhoud — waar zou die beter passen?`;
    if (targetTag === 'html') return `Bijna. \`<html>\` heeft maar twee directe kinderen: \`<head>\` en \`<body>\`. In welk van die twee staat de zichtbare pagina-inhoud?`;
    return `Nog niet helemaal. Bedenk wat ${P} doet: is het informatie óver de pagina, of iets wat je óp de pagina ziet?`;
  }

  function tryPlace(pieceTag, targetTag) {
    const lvl = LEVELS[state.level];
    const piece = lvl.pieces.find((p) => p.tag === pieceTag);
    const target = findNode(state.tree, targetTag);
    if (!piece || !target || !state.tray.includes(pieceTag)) return;

    const correct = piece.parent === targetTag;
    attempt(`L${state.level + 1}:${pieceTag}`, correct);
    const fb = document.getElementById('feedback');

    if (correct) {
      target.children.push({ tag: pieceTag, text: piece.text, children: [] });
      state.tray = state.tray.filter((t) => t !== pieceTag);
      state.selected = null;
      renderTray();
      renderTree({ tag: pieceTag, kind: 'new', parent: targetTag });
      renderPreview(pieceTag === 'title');
      refreshTopbar();
      if (!state.tray.length) {
        fb.className = 'feedback good';
        fb.innerHTML = `<span class="fb-icon">✓</span>${fmt(piece.good)}
          <div style="margin-top:10px"><button class="btn" id="nextLevel">Level afronden →</button></div>`;
        document.getElementById('nextLevel').addEventListener('click', () => renderLevelDone());
        ensureVisible(fb);
      } else {
        setFeedback(fb, 'good', piece.good);
      }
    } else {
      // blok blijft geselecteerd, zodat de speler meteen opnieuw kan proberen
      state.selected = pieceTag;
      renderTray();
      renderTree({ tag: targetTag, kind: 'bad' });
      refreshTopbar();
      setFeedback(fb, 'bad', wrongMessage(pieceTag, targetTag));
    }
  }

  /* ---------- tik-selectie & slepen (muis + touch via pointer events) ---------- */
  let drag = null;
  let suppressClick = false;

  function dropTargetAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('#tree [data-drop]') : null;
  }
  function nodeFor(el) { return el ? el.closest('.node') : null; }

  function setOver(nodeEl) {
    if (drag.over === nodeEl) return;
    if (drag.over) drag.over.classList.remove('is-over');
    drag.over = nodeEl;
    if (nodeEl) nodeEl.classList.add('is-over');
  }

  function autoScroll() {
    if (!drag || !drag.active) return;
    const r = scroller.getBoundingClientRect();
    const edge = 60;
    let dy = 0;
    if (drag.y < r.top + edge) dy = -Math.ceil((r.top + edge - drag.y) / 4);
    else if (drag.y > r.bottom - edge) dy = Math.ceil((drag.y - (r.bottom - edge)) / 4);
    if (dy) {
      scroller.scrollTop += dy;
      setOver(nodeFor(dropTargetAt(drag.x, drag.y)));
    }
    drag.raf = requestAnimationFrame(autoScroll);
  }

  app.addEventListener('pointerdown', (e) => {
    const piece = e.target.closest('.piece');
    if (!piece || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { tag: piece.dataset.piece, src: piece, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, active: false, over: null, id: e.pointerId };
    try { piece.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  });

  app.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.x = e.clientX; drag.y = e.clientY;
    if (!drag.active) {
      if (Math.hypot(drag.x - drag.x0, drag.y - drag.y0) < 8) return;
      drag.active = true;
      const g = drag.src.cloneNode(true);
      g.classList.add('ghost');
      g.classList.remove('selected');
      document.body.appendChild(g);
      drag.ghost = g;
      drag.src.classList.add('dragging-src');
      document.body.classList.add('picking');
      drag.raf = requestAnimationFrame(autoScroll);
    }
    e.preventDefault();
    drag.ghost.style.left = drag.x + 'px';
    drag.ghost.style.top = drag.y + 'px';
    setOver(nodeFor(dropTargetAt(drag.x, drag.y)));
  });

  function endDrag(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (!d.active) return; // gewone tik: afgehandeld door click
    cancelAnimationFrame(d.raf);
    if (d.over) d.over.classList.remove('is-over');
    d.ghost.remove();
    d.src.classList.remove('dragging-src');
    document.body.classList.toggle('picking', !!state.selected);
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    if (!cancelled) {
      const target = dropTargetAt(e.clientX, e.clientY);
      if (target) tryPlace(d.tag, target.dataset.drop);
    }
  }
  app.addEventListener('pointerup', (e) => endDrag(e, false));
  app.addEventListener('pointercancel', (e) => endDrag(e, true));

  app.addEventListener('click', (e) => {
    if (!state || LEVELS[state.level].type !== 'tree' || !document.getElementById('tree')) return;
    if (suppressClick) { e.preventDefault(); return; }
    const piece = e.target.closest('.piece');
    if (piece) {
      state.selected = state.selected === piece.dataset.piece ? null : piece.dataset.piece;
      renderTray();
      return;
    }
    const target = e.target.closest('#tree [data-drop]');
    if (target) {
      if (state.selected) {
        tryPlace(state.selected, target.dataset.drop);
      } else if (state.tray.length) {
        const hint = document.getElementById('selectHint');
        hint.textContent = 'Kies eerst een codeblok, en tik dan op de plek waar het hoort.';
      }
    }
  });

  /* ---------- tussenscherm na een level ---------- */
  function renderLevelDone() {
    const i = state.level;
    const lvl = LEVELS[i];
    const next = LEVELS[i + 1];
    scroller.scrollTop = 0;
    document.body.classList.remove('picking');
    app.innerHTML = `
      <div id="topbar">${topbar()}</div>
      <div class="hero">
        <div class="step-label">Level ${i + 1} van ${LEVELS.length} voltooid</div>
        <h2>🎉 ${lvl.name}</h2>
        <p class="muted">${levelScore(i)} van ${LEVEL_TASKS[i]} opdrachten direct goed</p>
        <div class="ascii" aria-label="Structuur die je hebt gebouwd">${esc(lvl.ascii)}</div>
        <p style="max-width:460px;margin:0 auto 14px">${fmt(lvl.takeaway)}</p>
        <button class="btn" id="goNext">Naar level ${i + 2}: ${next.name} →</button>
      </div>`;
    document.getElementById('goNext').addEventListener('click', () => startLevel(i + 1));
  }

  /* =========================================================
     LEVEL 3 — structuurfouten herkennen
     ========================================================= */
  function codeWithTokens(code) {
    let idx = 0;
    return code.split('\n').map((line) => {
      const parts = [];
      let last = 0;
      const re = /\{\{(<[^>]+>)\}\}|(<[^>]+>)/g;
      let m;
      while ((m = re.exec(line))) {
        if (m.index > last) parts.push(`<span class="txt">${esc(line.slice(last, m.index))}</span>`);
        const tagText = m[1] || m[2];
        const name = tagText.replace(/[<>/]/g, '').split(/\s/)[0];
        parts.push(`<button type="button" class="tok ${colorOf(name)}" data-tok="${idx++}" data-err="${m[1] ? 1 : 0}">${esc(tagText)}</button>`);
        last = re.lastIndex;
      }
      if (last < line.length) parts.push(`<span class="txt">${esc(line.slice(last))}</span>`);
      return parts.join('');
    }).join('\n');
  }

  function renderCase() {
    const lvl = LEVELS[state.level];
    const c = lvl.cases[state.caseIdx];
    state.step = 1;
    state.optionOrder = shuffle(c.options.map((_, i) => i));
    scroller.scrollTop = 0;
    app.innerHTML = `
      <div id="topbar">${topbar()}</div>
      <div class="stack" style="max-width:720px;margin:0 auto">
        <div class="card">
          <div class="step-label">Level 3 · Situatie ${state.caseIdx + 1} van ${lvl.cases.length}</div>
          <h3 id="stepTitle">Stap 1 — Wijs de fout aan</h3>
          <p class="muted small" id="stepText" style="margin:0">Tik op een tag die niet op de goede plek staat. Klopt alles? Kies dan <b>Geen fout</b>.</p>
        </div>
        <pre class="codebox case-code" id="caseCode">${codeWithTokens(c.code)}</pre>
        <div class="row" id="step1Row">
          <button type="button" class="btn secondary" id="noError">✓ Geen fout — dit klopt</button>
        </div>
        <div class="feedback" id="fb1" aria-live="polite"></div>
        <div id="step2" class="stack hidden">
          <div>
            <h3>Stap 2 — Waarom?</h3>
            <p class="muted small" style="margin:0">Kies de beste verklaring.</p>
          </div>
          <div class="options" id="options"></div>
          <div class="feedback" id="fb2" aria-live="polite"></div>
          <div id="fixBox"></div>
          <div id="nextRow"></div>
        </div>
      </div>`;

    const codeEl = document.getElementById('caseCode');
    codeEl.addEventListener('click', (e) => {
      const tok = e.target.closest('.tok');
      if (!tok || state.step !== 1) return;
      answerStep1(tok.dataset.err === '1', tok);
    });
    document.getElementById('noError').addEventListener('click', () => {
      if (state.step !== 1) return;
      answerStep1(!!c.correct, null);
    });
  }

  function answerStep1(isCorrectChoice, tokEl) {
    const c = LEVELS[state.level].cases[state.caseIdx];
    // correct = foute tag aangewezen in een foute structuur, of "Geen fout" bij een correcte structuur
    const correct = c.correct ? tokEl === null : isCorrectChoice;
    attempt(`L3:${state.caseIdx}:where`, correct);
    const fb = document.getElementById('fb1');
    const codeEl = document.getElementById('caseCode');

    if (!correct) {
      let msg;
      if (tokEl === null) msg = 'Nog niet: in deze code zit wél een fout. ' + c.hint;
      else if (c.correct) msg = 'Nog niet: deze tag staat op een logische plek. ' + c.hint;
      else msg = 'Nog niet: deze tag staat goed. ' + c.hint;
      if (tokEl) {
        tokEl.classList.remove('miss');
        void tokEl.offsetWidth;
        tokEl.classList.add('miss');
      }
      refreshTopbar();
      setFeedback(fb, 'bad', msg);
      return;
    }

    state.step = 2;
    codeEl.classList.add('locked');
    if (c.correct) codeEl.classList.add('solved-ok');
    else codeEl.querySelectorAll('.tok[data-err="1"]').forEach((t) => t.classList.add('found'));
    codeEl.querySelectorAll('.tok').forEach((t) => { t.tabIndex = -1; t.setAttribute('aria-disabled', 'true'); });
    document.getElementById('step1Row').classList.add('hidden');
    document.getElementById('stepTitle').textContent = 'Stap 1 ✓';
    document.getElementById('stepText').innerHTML = c.correct ? 'Deze structuur klopt.' : 'De foute tag is rood gemarkeerd.';
    refreshTopbar();

    const opts = document.getElementById('options');
    opts.innerHTML = state.optionOrder.map((i) =>
      `<button type="button" class="option" data-opt="${i}">${fmt(c.options[i].text)}</button>`).join('');
    opts.addEventListener('click', (e) => {
      const b = e.target.closest('.option');
      if (!b || b.disabled || state.step !== 2) return;
      answerStep2(Number(b.dataset.opt), b);
    });
    document.getElementById('step2').classList.remove('hidden');
    setFeedback(fb, 'good', c.found);
  }

  function answerStep2(i, btn) {
    const lvl = LEVELS[state.level];
    const c = lvl.cases[state.caseIdx];
    const opt = c.options[i];
    attempt(`L3:${state.caseIdx}:why`, !!opt.ok);
    const fb = document.getElementById('fb2');
    refreshTopbar();

    if (!opt.ok) {
      btn.classList.add('wrong');
      btn.disabled = true;
      setFeedback(fb, 'bad', 'Nog niet helemaal. ' + opt.fb);
      return;
    }
    state.step = 3;
    document.querySelectorAll('#options .option').forEach((b) => { b.disabled = true; });
    btn.classList.remove('wrong');
    btn.classList.add('right');
    if (c.fix) {
      document.getElementById('fixBox').innerHTML =
        `<div class="fix-label">✓ Zo klopt de structuur wel:</div><pre class="codebox">${esc(c.fix)}</pre>`;
    }
    const last = state.caseIdx === lvl.cases.length - 1;
    const nextRow = document.getElementById('nextRow');
    nextRow.innerHTML = `<button class="btn" id="nextCase">${last ? 'Bekijk je resultaat →' : 'Volgende situatie →'}</button>`;
    document.getElementById('nextCase').addEventListener('click', () => {
      if (last) finishGame();
      else { state.caseIdx += 1; renderCase(); }
    }, { once: true });
    setFeedback(fb, 'good', c.why);
  }

  /* =========================================================
     EINDE
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
    scroller.scrollTop = 0;
    app.innerHTML = `
      <div class="hero">
        <div class="brand" style="margin-bottom:10px"><span class="lt">&lt;</span>Build the DOM<span class="lt">/&gt;</span></div>
        <div class="step-label">Alle 3 levels voltooid</div>
        <div class="big-score">${s} / ${MAX_SCORE}</div>
        <p class="muted" style="margin:0">direct goed · ${pct}%</p>
        ${state.passed
          ? '<div class="verdict pass">✓ Behaald!</div><p style="max-width:460px;margin:0 auto 14px">Je begrijpt hoe HTML-elementen samen een pagina vormen. Op naar Style Lab en Layout Builder!</p>'
          : `<div class="verdict fail">Nog niet behaald</div><p style="max-width:460px;margin:0 auto 14px">Je hebt minimaal ${need} van ${MAX_SCORE} (80%) nodig bij de eerste poging. Bekijk de uitleg nog eens en probeer het opnieuw — je kunt het!</p>`}
        <ol class="level-list">
          ${LEVELS.map((l, i) => `<li><span class="num">${i + 1}</span><span><b>${l.name}</b></span><span class="res">${levelScore(i)} / ${LEVEL_TASKS[i]}</span></li>`).join('')}
        </ol>
        <div class="actions">
          <button class="btn secondary" id="exit">← Terug naar de skilltree</button>
          <button class="btn" id="again">↺ Opnieuw spelen</button>
        </div>
      </div>`;
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
  window.buildTheDom = Object.freeze({
    info: gameInfo,
    maxScore: MAX_SCORE,
    snapshot: () => state && JSON.parse(JSON.stringify({
      round: state.round, level: state.level, score: score(), done: doneCount(),
      finished: state.finished, passed: !!state.passed, reported: state.reported
    }))
  });

  renderStart();
})();
