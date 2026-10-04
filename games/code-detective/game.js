/* =========================================================
   Code Detective — educatieve game (Bloom: Analyseren)
   Thema: film noir. Lees de code in het dossier en wijs de dader aan:
   welke preview hoort erbij, welk element wordt geraakt, wat verandert er?
   Het echte resultaat zie je pas als je hebt gekozen.
   ========================================================= */

/* ---------- vaste gamestekker ---------- */
const gameInfo = {
  gameId: 'code-detective',
  learningGoal: 'De leerling kan HTML- en CSS-code analyseren en voorspellen welk visueel resultaat deze code zal opleveren.',
  bloom: 'Analyseren',
  successCriterion: 'De speler voltooit alle drie de dossiers en lost minimaal 80% van de zaken bij de eerste poging op.'
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
  const LETTERS = 'ABCD';

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function scrollIntoViewIfNeeded(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 8 || r.bottom > window.innerHeight - 8) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------- de mini-pagina's (het "bewijs") ---------- */
  const PAGE_CSS = `
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .page { padding: 12px; font: 14px/1.35 system-ui, -apple-system, "Segoe UI", sans-serif; color: #222; background: #fff; text-align: left; }
    /* :where() = specificiteit 0: de CSS van de zaak wint altijd */
    :where(.page) h1 { font-size: 20px; margin: 0 0 6px; }
    :where(.page) h2 { font-size: 16px; margin: 0 0 6px; }
    :where(.page) p { margin: 0 0 6px; }
    :where(.page) ul { margin: 0; padding-left: 18px; }
    :where(.page) a { color: #222; }
    :where(.page) button { font: inherit; padding: 4px 10px; }
    :where(.page) .box { padding: 6px 10px; background: #e9e4d8; border: 1px solid #b9b09b; }
    [data-mark] { outline: 3px dashed #b3202a; outline-offset: 2px; }
    [data-proof] { outline: 3px solid #f2c14e; outline-offset: 2px; }
    [data-pick] { cursor: crosshair; }`;

  function mountPage(host, html, css) {
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${PAGE_CSS}</style><style data-case>${css}</style><div class="page">${html}</div>`;
    return root;
  }

  /* ---------- de dossiers ---------- */
  // lineup: lees `css` en kies het resultaat uit een rij van vier previews (de echte + drie `decoys` met hun alibi).
  // select: wijs alle elementen aan die `rule` raakt (de pagina toont de regel nog niet).
  // change: zie de pagina vóór de wijziging (`diff`: [' ', '-', '+'] per regel) en kies hoe hij erna uitziet.
  const DOSSIERS = [
    {
      name: 'Ooggetuige',
      no: 'Dossier 1',
      goal: 'Lees de code en wijs in de rij de preview aan die erbij hoort.',
      takeaway: 'Een detective ziet het resultaat al voordat de browser het tekent. `padding` zit binnen de rand, `color` kleurt tekst, `background` het vlak, en flexbox bepaalt waar de kinderen staan.',
      cases: [
        {
          kind: 'lineup',
          title: 'De kaart van Pikachu',
          question: 'Welke preview hoort bij deze code?',
          html: '<div class="card">\n  <h2>Pikachu</h2>\n  <p>Electric</p>\n</div>',
          css: '.card {\n  padding: 20px;\n  border: 1px solid black;\n}',
          decoys: [
            { css: '.card {\n  margin: 20px;\n  border: 1px solid black;\n}', why: 'Deze verdachte heeft de ruimte búiten de rand. Dat doet `margin`, niet `padding`.' },
            { css: '.card {\n  border: 1px solid black;\n}', why: 'Hier zit de tekst tegen de rand aan. Dan zou er geen `padding` zijn.' },
            { css: '.card {\n  padding: 20px;\n}', why: 'Hier ontbreekt de rand. Maar er staat wel een `border` in de code.' }
          ],
          explain: '`padding: 20px` zet ruimte tussen de rand en de inhoud, en `border` tekent de dunne zwarte rand eromheen.'
        },
        {
          kind: 'lineup',
          title: 'Het labeltje',
          question: 'Hoe ziet het label eruit?',
          html: '<p>Status: <span class="tag">Nieuw</span></p>',
          css: '.tag {\n  background: navy;\n  color: white;\n}',
          decoys: [
            { css: '.tag {\n  color: navy;\n}', why: 'Hier is alleen de tekst blauw. Maar de code geeft het label ook een `background`.' },
            { css: '.tag {\n  background: white;\n  color: navy;\n  border: 1px solid navy;\n}', why: 'Hier zijn de kleuren omgedraaid. Kijk goed: welke kleur hoort bij `color` en welke bij `background`?' },
            { css: '.tag {\n  background: navy;\n  color: white;\n  font-weight: bold;\n  padding: 4px 10px;\n}', why: 'Kleuren kloppen, maar dit label is vet en heeft extra ruimte. Dat staat niet in de code.' }
          ],
          explain: '`background: navy` kleurt het vlak van de `<span>` donkerblauw, en `color: white` maakt de tekst wit.'
        },
        {
          kind: 'lineup',
          title: 'Het menu',
          question: 'Waar staan de drie links?',
          html: '<nav class="menu">\n  <a class="box">Home</a>\n  <a class="box">Games</a>\n  <a class="box">Contact</a>\n</nav>',
          css: '.menu {\n  display: flex;\n  justify-content: space-between;\n}',
          decoys: [
            { css: '.menu {\n  display: flex;\n  justify-content: center;\n}', why: 'Hier staan ze samen in het midden. Dat doet `center`, niet `space-between`.' },
            { css: '.menu {\n  display: flex;\n}', why: 'Hier staan ze links tegen elkaar aan. Dan zou er geen `justify-content` zijn.' },
            { css: '.menu a {\n  display: block;\n}', why: 'Hier staan ze onder elkaar. Maar `.menu` is een flex-container, dus de kinderen staan in een rij.' }
          ],
          explain: '`display: flex` zet de links naast elkaar, en `space-between` verdeelt de lege ruimte ertussen: eerste link links, laatste rechts.'
        },
        {
          kind: 'lineup',
          title: 'De avatar',
          question: 'Welke avatar maakt deze code?',
          html: '<div class="avatar">🕵️</div>',
          css: '.avatar {\n  width: 60px;\n  height: 60px;\n  background: gold;\n  border: 4px solid black;\n  border-radius: 50%;\n}',
          base: ':where(.avatar) { text-align: center; line-height: 52px; font-size: 26px; }',
          decoys: [
            { css: '.avatar {\n  width: 60px;\n  height: 60px;\n  background: gold;\n  border: 4px solid black;\n}', why: 'Deze is vierkant. Maar `border-radius: 50%` maakt hem rond.' },
            { css: '.avatar {\n  width: 60px;\n  height: 60px;\n  background: gold;\n  border-radius: 50%;\n}', why: 'Deze heeft geen rand. Maar de code geeft hem `border: 4px solid black`.' },
            { css: '.avatar {\n  width: 60px;\n  height: 60px;\n  background: gold;\n  border: 4px solid black;\n  border-radius: 12px;\n}', why: 'Deze heeft alleen afgeronde hoeken. Met `50%` wordt een vierkant helemaal rond.' }
          ],
          explain: '`border-radius: 50%` maakt van het vierkant een cirkel, met een zwarte rand van 4px eromheen.'
        }
      ]
    },
    {
      name: 'Vingerafdrukken',
      no: 'Dossier 2',
      goal: 'Wijs elk element aan dat de selector raakt, en geen enkel ander.',
      takeaway: 'Een selector lees je van rechts naar links: `.card p` is "een `p`, ergens binnen `.card`". Met `>` moet het een direct kind zijn, met een komma kies je twee groepen tegelijk.',
      cases: [
        {
          kind: 'select',
          title: 'Wie wordt blauw?',
          question: 'Welke elementen worden blauw?',
          html: '<div class="card">\n  <h2>Pikachu</h2>\n  <p>Electric</p>\n</div>\n<p>Pokémon van de week</p>',
          base: ':where(.card) { border: 1px solid #999; padding: 8px; margin-bottom: 8px; }',
          rule: '.card p {\n  color: blue;\n}',
          hint: '`.card p` kiest alleen alinea\'s die ergens binnen `.card` staan.',
          explain: 'Alleen "Electric" is een `<p>` binnen `.card`. De andere alinea staat erbuiten, en de `<h2>` is geen `p`.'
        },
        {
          kind: 'select',
          title: 'De afgevinkte taken',
          question: 'Welke elementen worden doorgestreept?',
          html: '<ul>\n  <li class="done">Boodschappen</li>\n  <li>Huiswerk</li>\n  <li class="done">Sporten</li>\n</ul>\n<p class="done">Klaar voor vandaag?</p>',
          rule: 'li.done {\n  text-decoration: line-through;\n}',
          hint: '`li.done` betekent: een `<li>` die óók `class="done"` heeft. Beide moeten kloppen.',
          explain: 'Alleen de twee `<li>`-elementen met `class="done"`. De `<p class="done">` heeft de class wel, maar is geen `li`.'
        },
        {
          kind: 'select',
          title: 'Alleen de directe kinderen',
          question: 'Welke links worden vet?',
          html: '<nav>\n  <a>Home</a>\n  <div class="more">\n    <a>Games</a>\n  </div>\n  <a>Contact</a>\n</nav>',
          base: ':where(nav) a { display: inline-block; margin-right: 10px; } :where(.more) { display: inline-block; padding: 2px 6px; border: 1px dashed #999; margin-right: 10px; }',
          rule: 'nav > a {\n  font-weight: bold;\n}',
          hint: 'Het `>`-teken betekent: alleen een direct kind, niet een kleinkind.',
          explain: '`nav > a` kiest alleen links die direct in `<nav>` staan: Home en Contact. Games zit in een `<div>`, dus is een kleinkind.'
        },
        {
          kind: 'select',
          title: 'Twee verdachten tegelijk',
          question: 'Welke elementen worden rood?',
          html: '<h1>Het lab</h1>\n<h2>Proef 1</h2>\n<p class="intro">Vandaag mengen we kleuren.</p>\n<p>Draag een bril.</p>',
          rule: 'h2, .intro {\n  color: crimson;\n}',
          hint: 'Een komma tussen twee selectors betekent: deze groep én die groep.',
          explain: '`h2, .intro` zijn twee selectors in één regel: de `<h2>` en de alinea met `class="intro"`. De `<h1>` en de andere `<p>` blijven zwart.'
        }
      ]
    },
    {
      name: 'Reconstructie',
      no: 'Dossier 3',
      goal: 'De code wordt aangepast. Voorspel wat er op de pagina verandert.',
      takeaway: 'Bij een wijziging vraag je: welke property verandert, en wat doet die property? Soms is het antwoord "niets", bijvoorbeeld als een sterkere selector toch al wint.',
      cases: [
        {
          kind: 'change',
          title: 'De verdwenen padding',
          question: 'De regel met `padding` wordt verwijderd. Hoe ziet de kaart er daarna uit?',
          html: '<div class="card">\n  <h2>Pikachu</h2>\n  <p>Electric</p>\n</div>',
          diff: [[' ', '.card {'], ['-', '  padding: 20px;'], [' ', '  border: 1px solid black;'], [' ', '}']],
          decoys: [
            { css: '.card {\n  padding: 20px;\n}', why: 'Hier is de rand weg in plaats van de ruimte. Maar alleen `padding` is verwijderd.' },
            { css: '.card {\n  margin: 20px;\n  border: 1px solid black;\n}', why: 'Hier is de ruimte naar buiten verplaatst. Dat zou gebeuren met `margin`, maar die staat er niet.' },
            { css: '.card {\n  padding: 20px;\n  border: 1px solid black;\n}', why: 'Dit is hoe het er nú uitziet. Maar er verandert wel iets.' }
          ],
          explain: 'Zonder `padding` zit de tekst direct tegen de rand. De rand zelf blijft gewoon staan.'
        },
        {
          kind: 'change',
          title: 'De gedraaide rij',
          question: '`row` wordt `column`. Waar staan de blokken daarna?',
          html: '<div class="row">\n  <span class="box">1</span>\n  <span class="box">2</span>\n  <span class="box">3</span>\n</div>',
          diff: [[' ', '.row {'], [' ', '  display: flex;'], ['-', '  flex-direction: row;'], ['+', '  flex-direction: column;'], [' ', '  align-items: center;'], [' ', '  gap: 6px;'], [' ', '}']],
          decoys: [
            { css: '.row {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}', why: 'Onder elkaar klopt, maar deze blokken zijn helemaal uitgerekt. `align-items: center` blijft staan, en in een kolom centreert dat horizontaal.' },
            { css: '.row {\n  display: flex;\n  flex-direction: row-reverse;\n  align-items: center;\n  gap: 6px;\n}', why: 'Hier is de volgorde omgedraaid. Dat doet `row-reverse`, niet `column`.' },
            { css: '.row {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 6px;\n}', why: 'Hier staan ze nog naast elkaar, alleen in het midden. Maar `column` verandert de richting.' }
          ],
          explain: 'Met `column` komen de blokken onder elkaar. `align-items` werkt dwars op de richting, dus in een kolom centreert het ze horizontaal.'
        },
        {
          kind: 'change',
          title: 'Ruimte verdelen',
          question: '`flex-start` wordt `space-between`. Wat gebeurt er met de knoppen?',
          html: '<div class="bar">\n  <button>Terug</button>\n  <button>Opslaan</button>\n</div>',
          base: ':where(.bar) { padding: 6px; border: 1px dashed #999; }',
          diff: [[' ', '.bar {'], [' ', '  display: flex;'], ['-', '  justify-content: flex-start;'], ['+', '  justify-content: space-between;'], [' ', '}']],
          decoys: [
            { css: '.bar {\n  display: flex;\n  justify-content: center;\n}', why: 'Hier staan ze samen in het midden. Dat zou `center` doen.' },
            { css: '.bar {\n  display: flex;\n  justify-content: flex-end;\n}', why: 'Hier staan ze allebei rechts. Dat zou `flex-end` doen.' },
            { css: '.bar {\n  display: flex;\n  justify-content: flex-start;\n}', why: 'Dit is de oude situatie. Maar `space-between` verdeelt de ruimte anders.' }
          ],
          explain: '`space-between` zet de lege ruimte tússen de knoppen: Terug gaat helemaal naar links, Opslaan helemaal naar rechts.'
        },
        {
          kind: 'change',
          title: 'De omgewisselde regels',
          question: 'De twee regels wisselen van plek. Welke kleur krijgt de tekst daarna?',
          html: '<p class="note">Let op: dit is belangrijk!</p>',
          diff: [['-', '.note { color: green; }'], [' ', 'p { color: red; }'], ['+', '.note { color: green; }']],
          decoys: [
            { css: '.note { color: red; }', why: 'Dan zou de laatste regel winnen. Maar een class-selector is sterker dan een element-selector, waar hij ook staat.' },
            { css: '', why: 'Dan zou geen van beide regels werken. Maar de `<p>` heeft wel `class="note"`, dus beide regels raken hem.' },
            { css: '.note { color: green; font-weight: bold; }', why: 'De kleur klopt, maar waarom zou de tekst vet worden? Daar staat niets over in de code.' }
          ],
          explain: 'Er verandert niets: de tekst blijft groen. `.note` (een class) is specifieker dan `p` (een element), dus wint hij, of hij nu boven of onder staat.'
        }
      ]
    }
  ];

  const ALL = DOSSIERS.flatMap((d) => d.cases);
  const MAX_SCORE = ALL.length;
  const PASS_RATIO = 0.8;

  // Voor 'change'-zaken: de CSS vóór en na de wijziging.
  const cssBefore = (c) => c.diff.filter(([m]) => m !== '+').map(([, t]) => t).join('\n');
  const cssAfter = (c) => c.diff.filter(([m]) => m !== '-').map(([, t]) => t).join('\n');
  const truthCss = (c) => (c.kind === 'change' ? cssAfter(c) : c.css);

  /* ---------- state ---------- */
  let state = null;
  let roundCounter = 0;

  function newRound() {
    roundCounter += 1;
    state = {
      round: roundCounter,
      level: 0,
      idx: 0,
      tasks: {},            // key -> { level, first: bool, done: bool }
      finished: false,
      reported: false,      // voorkomt meerdere GAME_COMPLETED-berichten per ronde
      order: [],            // lineup: volgorde van de verdachten (-1 = de echte)
      cleared: [],          // lineup: verdachten met een alibi
      marked: new Set(),    // select: aangewezen elementen (index)
      solved: false
    };
  }

  const key = (l, i) => `D${l + 1}:${i}`;
  function attempt(k, correct) {
    const t = state.tasks[k] || (state.tasks[k] = { level: state.level, first: correct, done: false });
    if (correct) t.done = true;
    return t;
  }
  const score = () => Object.values(state.tasks).filter((t) => t.first).length;
  const levelScore = (i) => Object.values(state.tasks).filter((t) => t.level === i && t.first).length;
  const theCase = () => DOSSIERS[state.level].cases[state.idx];

  /* ---------- kop + dossierkast ---------- */
  const LENS = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="27" cy="27" r="17" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 40l15 15" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M18 24a10 10 0 0 1 9-8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".6"/></svg>';

  function header() {
    return `
      <header class="office">
        <div class="nameplate"><span class="lens">${LENS}</span><div><h1>Code Detective</h1><p>Bureau voor onopgeloste code</p></div></div>
        <div class="press"><span>Bloom</span><b>Analyseren</b></div>
      </header>`;
  }

  function cabinet() {
    let n = 0;
    return `<nav class="cabinet" aria-label="Zaken">${DOSSIERS.map((d, di) => `
      <div class="drawer"><span class="drawer-label">${d.no}</span><div class="tabs">${d.cases.map((_, ci) => {
        n += 1;
        const t = state.tasks[key(di, ci)];
        const cur = di === state.level && ci === state.idx && !state.finished;
        const cls = t && t.done ? (t.first ? 'solved' : 'late') : cur ? 'open' : t ? 'cold' : '';
        const label = `Zaak ${String(n).padStart(2, '0')}${t && t.done ? (t.first ? ': in één keer opgelost' : ': opgelost na een nieuwe poging') : cur ? ': nu open' : ''}`;
        return `<span class="ftab ${cls}" aria-label="${label}">${String(n).padStart(2, '0')}</span>`;
      }).join('')}</div></div>`).join('')}
      <span class="cab-score">${score()} / ${MAX_SCORE} opgelost</span></nav>`;
  }
  function refreshCabinet() {
    const el = document.getElementById('cabinet');
    if (el) el.innerHTML = cabinet();
  }
  const caseNo = () => String(DOSSIERS.slice(0, state.level).reduce((n, d) => n + d.cases.length, 0) + state.idx + 1).padStart(2, '0');

  /* ---------- startscherm ---------- */
  function renderStart() {
    window.scrollTo(0, 0);
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    app.innerHTML = `
      ${header()}
      <main class="folder intro">
        <div class="folder-tab">Briefing</div>
        <div class="paper">
          <p class="stamp-line">Skill 6 van 8 · Analyseren</p>
          <h2>Er is code gevonden. Niemand weet wat hij doet.</h2>
          <p class="lead">In Bug Hunter zag je meteen wat er kapot was. Nu niet: <b>jij krijgt alleen de code</b>, en moet voorspellen wat de browser ervan maakt. Pas als je de dader aanwijst, zie je het bewijs.</p>
          <div class="brief-grid">
            ${DOSSIERS.map((d) => `<section><span class="dossier-no">${d.no}</span><h3>${d.name}</h3><p>${d.goal}</p></section>`).join('')}
          </div>
          <p class="rule">${MAX_SCORE} zaken. Alleen je <b>eerste aanwijzing</b> per zaak telt. Los je er minimaal <b>${need}</b> (80%) in één keer op, dan krijg je je badge.</p>
          <button class="btn" id="startBtn">Open het eerste dossier →</button>
        </div>
      </main>`;
    document.getElementById('startBtn').addEventListener('click', () => {
      newRound();
      startLevel(0);
    });
  }

  function startLevel(i) {
    state.level = i;
    state.idx = 0;
    startCase();
  }

  function startCase() {
    const c = theCase();
    state.solved = false;
    state.cleared = [];
    state.marked = new Set();
    state.order = c.decoys ? shuffle([-1, ...c.decoys.map((_, i) => i)]) : [];
    renderCase();
  }

  /* =========================================================
     DE ZAAK
     ========================================================= */
  function typed(css) {
    return esc(css);
  }
  function diffHtml(c) {
    return c.diff.map(([m, t]) => `<span class="dl ${m === '-' ? 'del' : m === '+' ? 'add' : ''}">${esc(t) || ' '}</span>`).join('\n');
  }

  function renderCase() {
    const c = theCase();
    const d = DOSSIERS[state.level];
    window.scrollTo(0, 0);
    const code = c.kind === 'change' ? diffHtml(c) : typed(c.kind === 'select' ? c.rule : c.css);
    app.innerHTML = `
      ${header()}
      <div id="cabinet">${cabinet()}</div>
      <div class="desk">
        <section class="folder casefile">
          <div class="folder-tab">Zaak ${caseNo()} · ${d.no}: ${d.name}</div>
          <div class="paper">
            <h2>${esc(c.title)}</h2>
            <p class="question">${fmt(c.question)}</p>
            <div class="evidence">
              <div class="exhibit"><span class="exhibit-label">Bewijsstuk A · HTML</span><pre class="typed">${esc(c.html)}</pre></div>
              <div class="exhibit"><span class="exhibit-label">Bewijsstuk B · CSS${c.kind === 'change' ? ' <em>met wijziging</em>' : ''}</span><pre class="typed">${code}</pre></div>
            </div>
          </div>
        </section>
        <section class="scene" id="scene"></section>
      </div>`;
    if (c.kind === 'select') renderSelect();
    else renderLineup();
  }

  /* ---------- de rij verdachten ---------- */
  function renderLineup(note) {
    const c = theCase();
    const scene = document.getElementById('scene');
    const before = c.kind === 'change'
      ? `<figure class="before"><figcaption>Zo ziet het er nú uit</figcaption><div class="mug"><div id="beforePage"></div></div></figure>` : '';
    scene.innerHTML = `
      ${before}
      <div class="lineup-head">${c.kind === 'change' ? 'Hoe ziet het eruit ná de wijziging?' : 'De rij verdachten'} <span>· wijs de dader aan</span></div>
      <div class="lineup">${state.order.map((o, i) => {
        const cleared = state.cleared.includes(o);
        const guilty = state.solved && o === -1;
        const off = cleared || state.solved;
        return `<div class="suspect${cleared ? ' cleared' : ''}${guilty ? ' guilty' : ''}${off ? ' off' : ''}" data-suspect="${o}">
          <div class="mug"><div class="mug-page" data-host="${o}"></div></div>
          <button type="button" class="placard" data-suspect="${o}"${off ? ' disabled' : ''} aria-label="Wijs verdachte ${LETTERS[i]} aan">${LETTERS[i]}</button>${cleared ? '<span class="alibi-tag">alibi</span>' : ''}${guilty ? '<span class="guilty-tag">dader</span>' : ''}</div>`;
      }).join('')}</div>
      <div class="notes" id="notes" aria-live="polite">${note || ''}</div>
      <div class="next" id="next"></div>`;
    scene.querySelectorAll('[data-host]').forEach((h) => {
      const o = Number(h.dataset.host);
      mountPage(h, c.html, (c.base || '') + '\n' + (o === -1 ? truthCss(c) : c.decoys[o].css));
    });
    if (c.kind === 'change') mountPage(document.getElementById('beforePage'), c.html, (c.base || '') + '\n' + cssBefore(c));
    if (state.solved) showNext();
  }

  function accuse(o) {
    const c = theCase();
    if (state.solved || state.cleared.includes(o)) return;
    const ok = o === -1;
    attempt(key(state.level, state.idx), ok);
    refreshCabinet();
    if (!ok) {
      state.cleared.push(o);
      renderLineup(`<div class="note alibi"><b class="note-head">Verkeerde verdachte.</b>${fmt(c.decoys[o].why)}</div>`);
      return;
    }
    state.solved = true;
    renderLineup(`<div class="note solved"><b class="note-head">Zaak opgelost!</b>${fmt(c.explain)}</div>`);
    scrollIntoViewIfNeeded(document.getElementById('notes'));
  }

  /* ---------- vingerafdrukken: elementen aanwijzen ---------- */
  function renderSelect(note) {
    const c = theCase();
    const scene = document.getElementById('scene');
    scene.innerHTML = `
      <div class="lineup-head">De plaats delict <span>· de regel is nog niet toegepast</span></div>
      <p class="how">Klik op elk element dat de regel raakt. Klik nog eens om een markering weg te halen.</p>
      <div class="crime"><div id="crimePage"></div></div>
      <div class="row"><button class="btn" id="arrestBtn" type="button">Arresteer de verdachten</button><span class="count" id="count"></span></div>
      <div class="notes" id="notes" aria-live="polite">${note || ''}</div>
      <div class="next" id="next"></div>`;
    const root = mountPage(document.getElementById('crimePage'), c.html, (c.base || '') + (state.solved ? '\n' + c.rule : ''));
    const els = [...root.querySelectorAll('.page *')];
    els.forEach((el, i) => {
      if (state.marked.has(i)) el.dataset.mark = '';
      if (!state.solved) el.dataset.pick = '';
    });
    if (state.solved) {
      const hit = new Set(root.querySelectorAll(selectorOf(c)));
      els.forEach((el) => { if (hit.has(el)) el.dataset.proof = ''; el.removeAttribute('data-mark'); });
      document.getElementById('arrestBtn').disabled = true;
      showNext();
    }
    root.addEventListener('click', (e) => {
      if (state.solved) return;
      const el = e.target.closest('[data-pick]');
      if (!el) return;
      e.preventDefault();
      const i = els.indexOf(el);
      if (state.marked.has(i)) { state.marked.delete(i); el.removeAttribute('data-mark'); }
      else { state.marked.add(i); el.dataset.mark = ''; }
      updateCount();
    });
    document.getElementById('arrestBtn').addEventListener('click', arrest);
    updateCount();
  }
  const selectorOf = (c) => c.rule.slice(0, c.rule.indexOf('{')).trim().split(',').map((s) => '.page ' + s.trim()).join(', ');

  function updateCount() {
    const n = state.marked.size;
    const el = document.getElementById('count');
    if (el) el.textContent = state.solved ? '' : `${n} ${n === 1 ? 'element' : 'elementen'} aangewezen`;
    const b = document.getElementById('arrestBtn');
    if (b && !state.solved) b.disabled = n === 0;
  }

  function arrest() {
    const c = theCase();
    if (state.solved || !state.marked.size) return;
    const root = document.getElementById('crimePage').shadowRoot;
    const els = [...root.querySelectorAll('.page *')];
    const hit = new Set([...root.querySelectorAll(selectorOf(c))].map((el) => els.indexOf(el)));
    const extra = [...state.marked].filter((i) => !hit.has(i)).length;
    const missing = [...hit].filter((i) => !state.marked.has(i)).length;
    const ok = !extra && !missing;
    attempt(key(state.level, state.idx), ok);
    refreshCabinet();
    if (!ok) {
      const parts = [];
      if (extra) parts.push(`${extra} ${extra === 1 ? 'onschuldig element' : 'onschuldige elementen'} aangewezen`);
      if (missing) parts.push(`${missing} ${missing === 1 ? 'verdachte' : 'verdachten'} gemist`);
      const notes = document.getElementById('notes');
      notes.innerHTML = `<div class="note alibi"><b class="note-head">Nog niet sluitend.</b>Je hebt ${parts.join(' en ')}. ${fmt(c.hint)}</div>`;
      return;
    }
    state.solved = true;
    renderSelect(`<div class="note solved"><b class="note-head">Zaak opgelost!</b>${fmt(c.explain)} <span class="proof-key">Geel omlijnd: wat de regel echt raakt.</span></div>`);
    scrollIntoViewIfNeeded(document.getElementById('notes'));
  }

  function showNext() {
    const d = DOSSIERS[state.level];
    const last = state.idx === d.cases.length - 1;
    const box = document.getElementById('next');
    box.innerHTML = `<button class="btn" id="nextBtn" type="button">${last ? `${d.no} sluiten →` : 'Volgende zaak →'}</button>`;
    document.getElementById('nextBtn').addEventListener('click', () => {
      if (last) renderLevelDone();
      else { state.idx += 1; startCase(); }
    }, { once: true });
  }

  app.addEventListener('click', (e) => {
    // de hele kaart is klikbaar; het bordje met de letter is de echte knop (ook voor het toetsenbord)
    const s = e.target.closest('.suspect');
    if (s && !s.classList.contains('off') && state && !state.solved) accuse(Number(s.dataset.suspect));
  });

  /* ---------- tussenscherm: dossier gesloten ---------- */
  function renderLevelDone() {
    const i = state.level;
    const d = DOSSIERS[i];
    const next = DOSSIERS[i + 1];
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <div id="cabinet">${cabinet()}</div>
      <main class="folder done">
        <div class="folder-tab">${d.no} gesloten</div>
        <div class="paper">
          <h2>${d.name}</h2>
          <p class="muted">${levelScore(i)} van ${d.cases.length} zaken in één keer opgelost</p>
          <p class="takeaway">${fmt(d.takeaway)}</p>
          <button class="btn" id="goNext">${next ? `Open ${next.no}: ${next.name} →` : 'Naar de krant van morgen →'}</button>
        </div>
      </main>`;
    document.getElementById('goNext').addEventListener('click', () => (next ? startLevel(i + 1) : finishGame()));
  }

  /* =========================================================
     EINDE — de voorpagina van de krant
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

  const NUMBERS = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf'];
  function renderEnd() {
    const s = score();
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    const word = (n) => NUMBERS[n] || String(n);
    window.scrollTo(0, 0);
    const date = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    app.innerHTML = `
      ${header()}
      <main class="newspaper">
        <div class="np-mast"><span>${date}</span><b>De Avondpost</b><span>Editie: Code</span></div>
        <h2 class="np-head">${state.passed ? `Detective lost ${word(s)} van ${word(MAX_SCORE)} zaken op` : `Detective lost ${word(s)} zaken op, onderzoek gaat door`}</h2>
        <p class="np-sub">${state.passed
          ? 'Geen regel code ontsnapt aan deze detective: het resultaat is al duidelijk voordat de browser het tekent. "Code Review is de volgende stap," zegt het bureau.'
          : `Voor een badge zijn ${need} van de ${MAX_SCORE} zaken (80%) in één keer nodig. "De dossiers liggen klaar voor een nieuwe poging," aldus het bureau.`}</p>
        <div class="np-cols">
          <div class="np-photo ${state.passed ? 'pass' : ''}" role="img" aria-label="${state.passed ? 'Detectivebadge' : 'Vergrootglas'}">${state.passed ? '<span class="badge-star">★</span><span>Code<br>Detective</span>' : LENS}</div>
          <div>
            <p class="np-kicker">Het verslag</p>
            <table class="np-table">
              ${DOSSIERS.map((d, i) => `<tr><td>${d.no}: ${d.name}</td><td>${levelScore(i)} / ${d.cases.length}</td></tr>`).join('')}
              <tr class="tot"><td>Totaal, in één keer</td><td>${s} / ${MAX_SCORE}</td></tr>
            </table>
          </div>
        </div>
        <div class="np-actions">
          <button class="btn ghost" id="exit">← Terug naar de skilltree</button>
          <button class="btn" id="again">↺ Nieuwe dienst</button>
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
  window.codeDetective = Object.freeze({
    info: gameInfo,
    maxScore: MAX_SCORE,
    dossiers: DOSSIERS.map((d) => d.cases.map((c) => ({ kind: c.kind, title: c.title, html: c.html, base: c.base || '', truth: c.kind === 'select' ? c.rule : truthCss(c), before: c.kind === 'change' ? cssBefore(c) : null, decoys: (c.decoys || []).map((x) => x.css), selector: c.kind === 'select' ? selectorOf(c) : null }))),
    mountPage,
    snapshot: () => state && JSON.parse(JSON.stringify({
      round: state.round, level: state.level, idx: state.idx, score: score(), solved: state.solved,
      finished: state.finished, passed: !!state.passed, reported: state.reported, order: state.order
    }))
  });

  renderStart();
})();
