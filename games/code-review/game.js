/* =========================================================
   Code Review — educatieve game (Bloom: Evalueren)
   Thema: een tv-spelshow uit de jaren 70. Twee developers, twee werkende oplossingen:
   jij zit in de jury, kiest de winnaar en onderbouwt je oordeel.
   ========================================================= */

/* ---------- vaste gamestekker ---------- */
const gameInfo = {
  gameId: 'code-review',
  learningGoal: 'De leerling kan twee werkende oplossingen vergelijken en met concrete kwaliteitscriteria (semantiek, leesbaarheid, toegankelijkheid, onderhoudbaarheid, duidelijke classnamen en structuur) onderbouwen welke beter is.',
  bloom: 'Evalueren',
  successCriterion: 'De speler voltooit alle drie de rondes en geeft bij minimaal 80% van de beoordelingen bij de eerste poging het juiste oordeel met de juiste onderbouwing.'
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

  /* ---------- de previews op de podia ---------- */
  const PAGE_CSS = `
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .page { display: block; padding: 12px; font: 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; color: #222; background: #fff; text-align: left; }
    :where(.page) h1 { font-size: 22px; margin: 0 0 6px; }
    :where(.page) h2 { font-size: 17px; margin: 0 0 6px; }
    :where(.page) p { margin: 0 0 6px; }
    :where(.page) button { font: inherit; }
    :where(.page) img { display: block; max-width: 100%; }
    :where(.page) a { color: #1d4ed8; }`;
  // Plaatjes zonder internet: kleine inline-svg's.
  const IMG = {
    chart: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="70"><rect width="180" height="70" fill="#f4f1ea"/><rect x="20" y="30" width="30" height="32" fill="#e8336d"/><rect x="70" y="14" width="30" height="48" fill="#1fb5ac"/><rect x="120" y="40" width="30" height="22" fill="#ffc93c"/></svg>'),
    wave: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="16"><path d="M0 8q15-8 30 0t30 0 30 0 30 0 30 0 30 0" fill="none" stroke="#e8336d" stroke-width="3"/></svg>'),
    logo: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect width="120" height="40" rx="8" fill="#ff7a1a"/><text x="60" y="26" font-family="sans-serif" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">KRENTENBOL</text></svg>')
  };
  // In de code staat een gewone bestandsnaam; de preview krijgt het plaatje.
  const withImages = (html) => html.replace(/src="(chart|wave|logo)\.svg"/g, (_, k) => `src="${IMG[k]}"`);
  function mountPage(host, html, css) {
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    // Een eigen omhulsel-element (geen <div>), zodat selectors als `div div` alleen de code van de developer raken.
    root.innerHTML = `<style>${PAGE_CSS}</style><style>${css || ''}</style><x-page class="page">${withImages(html)}</x-page>`;
    return root;
  }

  /* ---------- de criteria (de onderwerpen uit het plan) ---------- */
  const CRITERIA = {
    semantics: 'Semantiek',
    readability: 'Leesbaarheid',
    accessibility: 'Toegankelijkheid',
    maintainability: 'Onderhoudbaarheid',
    naming: 'Duidelijke classnamen',
    structure: 'Logische structuur'
  };

  /* ---------- de afleveringen ---------- */
  // duel:   twee werkende oplossingen; kies de winnaar (`better`) en de beste onderbouwing (`reasons`, één is `ok`).
  //         `situation` maakt van een duel een afweging: met een andere situatie wint de andere oplossing.
  // review: een kleine pagina; geef per criterium je oordeel (`good` true = in orde, false = kan beter).
  const ROUNDS = [
    {
      name: 'Een duidelijke keuze',
      tag: 'Ronde 1',
      goal: 'Eén oplossing is duidelijk beter. Wijs de winnaar aan en zeg waarom.',
      takeaway: 'Werkt het? Dat is pas het begin. Goede code beschrijft ook wát iets is, is te lezen voor anderen, werkt voor iedereen en is makkelijk aan te passen.',
      items: [
        {
          kind: 'duel',
          title: 'De welkomstpagina',
          question: 'Welke oplossing heeft de voorkeur?',
          a: { html: '<div>\n  <div>Mijn titel</div>\n  <div>Welkom op mijn website</div>\n</div>', css: 'div div:first-child {\n  font-size: 22px;\n  font-weight: bold;\n  margin-bottom: 6px;\n}' },
          b: { html: '<main>\n  <h1>Mijn titel</h1>\n  <p>Welkom op mijn website</p>\n</main>', css: '' },
          better: 'b',
          hintPick: 'Ze zien er hetzelfde uit. Welke code vertelt ook wát elk stuk tekst is?',
          reasons: [
            { text: 'B beschrijft de betekenis: `<h1>` is de titel en `<p>` een alinea. Browsers, zoekmachines en schermlezers begrijpen dat.', ok: true, crit: 'semantics' },
            { text: 'B is korter, en kortere code is altijd beter.', why: 'Korter is niet vanzelf beter. Het gaat erom wát de tags betekenen.' },
            { text: 'B ziet er mooier uit in de browser.', why: 'Kijk naar de previews: ze zien er hetzelfde uit. Het verschil zit in de code.' },
            { text: 'Met `<div>` kun je later meer kanten op, dus eigenlijk is A flexibeler.', why: 'Een `<div>` zegt niets over de inhoud. Dat is juist het nadeel van A.' }
          ],
          explain: 'Semantische HTML beschrijft wat de inhoud ís. Een schermlezer kondigt een `<h1>` aan als kop; drie `<div>`\'s zijn voor hem alleen maar tekst.'
        },
        {
          kind: 'duel',
          title: 'De productkaart',
          question: 'Welke CSS zou jij willen onderhouden?',
          a: { html: '<div class="x1">\n  <h2 class="blue-big">Gamer-muis</h2>\n  <p class="t2">€ 29,95</p>\n</div>', css: '.x1 { border: 1px solid #ccc; padding: 10px; }\n.blue-big { color: navy; }\n.t2 { font-weight: bold; }' },
          b: { html: '<div class="product">\n  <h2 class="product-title">Gamer-muis</h2>\n  <p class="price">€ 29,95</p>\n</div>', css: '.product { border: 1px solid #ccc; padding: 10px; }\n.product-title { color: navy; }\n.price { font-weight: bold; }' },
          better: 'b',
          hintPick: 'Stel dat je deze code over een jaar weer opent. Bij welke weet je meteen wat elke class is?',
          reasons: [
            { text: 'B\'s classnamen zeggen wát iets is (`product`, `price`), dus iedereen snapt de code meteen, ook als de kleur verandert.', ok: true, crit: 'naming' },
            { text: 'A is beter: `blue-big` vertelt je precies hoe het eruitziet.', why: 'Tot de titel groen wordt: dan klopt `blue-big` niet meer. Een naam die de betekenis beschrijft blijft kloppen.' },
            { text: 'B werkt sneller in de browser.', why: 'De browser maakt geen verschil tussen deze namen. Het gaat om mensen die de code lezen.' },
            { text: 'Het maakt niet uit, want ze zien er precies hetzelfde uit.', why: 'Voor de bezoeker niet, maar wel voor de volgende developer die deze code moet aanpassen.' }
          ],
          explain: 'Goede classnamen beschrijven de rol van een element, niet het uiterlijk. `x1` en `t2` zeggen niets, en `blue-big` klopt niet meer zodra het ontwerp verandert.'
        },
        {
          kind: 'duel',
          title: 'De verstuurknop',
          question: 'Welke knop is beter?',
          a: { html: '<div class="btn" onclick="verstuur()">\n  Verstuur\n</div>', css: '.btn {\n  display: inline-block;\n  padding: 6px 14px;\n  background: #1fb5ac;\n  color: white;\n  cursor: pointer;\n}' },
          b: { html: '<button class="btn" onclick="verstuur()">\n  Verstuur\n</button>', css: '.btn {\n  padding: 6px 14px;\n  background: #1fb5ac;\n  color: white;\n  border: 0;\n}' },
          better: 'b',
          hintPick: 'Probeer in gedachten de knop te gebruiken zonder muis, alleen met het toetsenbord.',
          reasons: [
            { text: 'Een `<button>` kun je met Tab en Enter bedienen, en een schermlezer meldt hem als knop. Een `<div>` niet.', ok: true, crit: 'accessibility' },
            { text: 'B heeft minder CSS nodig, dus is hij beter.', why: 'Het verschil in CSS is klein. Het echte verschil is wie de knop kan gebruiken.' },
            { text: 'A is beter, want met een `<div>` kun je de knop helemaal zelf vormgeven.', why: 'Een `<button>` kun je net zo goed vormgeven, zie B. En hij werkt voor iedereen.' },
            { text: 'B is mooier, want hij heeft geen rand.', why: 'Uiterlijk kun je bij allebei regelen. Kijk naar wat het element ís.' }
          ],
          explain: 'Een `<button>` is vanzelf bereikbaar met het toetsenbord en wordt door hulpmiddelen herkend als knop. Een klikbare `<div>` sluit mensen zonder muis buiten.'
        },
        {
          kind: 'duel',
          title: 'Drie knoppen',
          question: 'Welke CSS is beter?',
          a: { html: '<button class="save">Opslaan</button>\n<button class="send">Versturen</button>\n<button class="print">Printen</button>', css: '.save { padding: 6px 12px; background: #e8336d; color: white; border: 0; }\n.send { padding: 6px 12px; background: #e8336d; color: white; border: 0; }\n.print { padding: 6px 12px; background: #e8336d; color: white; border: 0; }' },
          b: { html: '<button class="btn">Opslaan</button>\n<button class="btn">Versturen</button>\n<button class="btn">Printen</button>', css: '.btn {\n  padding: 6px 12px;\n  background: #e8336d;\n  color: white;\n  border: 0;\n}' },
          better: 'b',
          hintPick: 'De klant wil morgen alle knoppen blauw. Bij welke oplossing ben je sneller klaar?',
          reasons: [
            { text: 'B schrijft de stijl één keer op. Wil je een kleur aanpassen, dan doe je dat op één plek in plaats van drie.', ok: true, crit: 'maintainability' },
            { text: 'A is beter: elke knop heeft zijn eigen class, dus alles is duidelijk.', why: 'Drie keer exact dezelfde regels is herhaling. Eén aanpassing moet je dan drie keer doen, en vergeet je er één, dan klopt het niet meer.' },
            { text: 'B laadt sneller, omdat hij minder regels heeft.', why: 'Het verschil in snelheid is hier niet te merken. Het gaat om aanpassen zonder fouten.' },
            { text: 'Ze zijn gelijk, want het resultaat is hetzelfde.', why: 'Voor de bezoeker wel, maar niet voor wie de code onderhoudt.' }
          ],
          explain: 'Herhaal jezelf niet: dezelfde stijl op één plek opschrijven maakt code onderhoudbaar. Eén wijziging, één plek.'
        }
      ]
    },
    {
      name: 'Afwegingen',
      tag: 'Ronde 2',
      goal: 'Beide oplossingen hebben voordelen. De situatie bepaalt welke het best past.',
      takeaway: 'Soms is er geen oplossing die altijd wint. Een goede reviewer vraagt eerst: wat moet dit element doen, en voor wie? Daarna kies je.',
      items: [
        {
          kind: 'duel',
          title: 'Naar de winkelwagen',
          situation: 'Deze knop brengt de bezoeker naar een andere pagina: de winkelwagen.',
          question: 'Welke oplossing past het best bij deze situatie?',
          a: { html: '<a href="/winkelwagen" class="btn">\n  Naar winkelwagen\n</a>', css: '.btn {\n  display: inline-block;\n  padding: 6px 14px;\n  background: #ff7a1a;\n  color: white;\n  text-decoration: none;\n}' },
          b: { html: '<button class="btn" onclick="location.href=\'/winkelwagen\'">\n  Naar winkelwagen\n</button>', css: '.btn {\n  padding: 6px 14px;\n  background: #ff7a1a;\n  color: white;\n  border: 0;\n}' },
          better: 'a',
          hintPick: 'Wat gebeurt er als je klikt: ga je naar een andere pagina, of gebeurt er iets op deze pagina?',
          reasons: [
            { text: 'Naar een andere pagina gaan is wat een link doet. Een `<a>` kun je ook openen in een nieuw tabblad en hij werkt zonder JavaScript.', ok: true, crit: 'semantics' },
            { text: 'Een `<button>` is altijd beter dan een link.', why: 'Niet altijd: een knop is voor een actie op de pagina. Voor naar een andere pagina gaan is een link gemaakt.' },
            { text: 'De link is beter omdat hij oranje is.', why: 'Ze zijn allebei oranje. Het verschil zit in wat het element ís.' },
            { text: 'Ze zijn gelijk, want ze brengen je allebei naar de winkelwagen.', why: 'Ze werken allebei, maar alleen de link gedraagt zich als link: rechtsklikken, nieuw tabblad, en een schermlezer zegt "link".' }
          ],
          explain: 'Navigeren naar een andere pagina? Gebruik een `<a href>`. Dat is de bedoeling van een link, en browsers en hulpmiddelen behandelen hem ook zo.'
        },
        {
          kind: 'duel',
          title: 'Het menu openen',
          situation: 'Deze knop klapt een menu open op dezelfde pagina. Er is geen andere pagina.',
          question: 'Welke oplossing past het best bij deze situatie?',
          a: { html: '<a href="#" class="btn" onclick="openMenu()">\n  Menu\n</a>', css: '.btn {\n  display: inline-block;\n  padding: 6px 14px;\n  background: #ff7a1a;\n  color: white;\n  text-decoration: none;\n}' },
          b: { html: '<button class="btn" onclick="openMenu()">\n  Menu\n</button>', css: '.btn {\n  padding: 6px 14px;\n  background: #ff7a1a;\n  color: white;\n  border: 0;\n}' },
          better: 'b',
          hintPick: 'Dezelfde twee als net. Maar wat doet deze knop nu: naar een andere pagina gaan, of iets op deze pagina?',
          reasons: [
            { text: 'Iets op dezelfde pagina doen is een actie, en daar is `<button>` voor. Een link met `href="#"` belooft een pagina die er niet is.', ok: true, crit: 'semantics' },
            { text: 'Een link is altijd beter, dat was bij de winkelwagen ook zo.', why: 'Bij de winkelwagen ging je naar een andere pagina. Hier niet: de situatie bepaalt de keuze.' },
            { text: 'De knop is beter omdat hij geen onderstreping heeft.', why: 'Die onderstreping is bij beide al weggehaald met CSS. Kijk naar wat het element doet.' },
            { text: 'Ze zijn gelijk, want openMenu() werkt bij allebei.', why: 'Het werkt, maar `href="#"` springt naar boven en een schermlezer zegt "link" terwijl het een knop is.' }
          ],
          explain: 'Hetzelfde duel, een andere winnaar. Een actie op de pagina hoort bij `<button>`, navigatie bij `<a>`. Eerst kijken wat het element moet doen, dan kiezen.'
        },
        {
          kind: 'duel',
          title: 'De uitslag in een grafiek',
          situation: 'Het plaatje is een grafiek met de uitslag van de klassenverkiezing. De uitslag staat nergens anders op de pagina.',
          question: 'Welke alt-tekst past het best?',
          a: { html: '<h2>Uitslag</h2>\n<img src="chart.svg" alt="">', css: '' },
          b: { html: '<h2>Uitslag</h2>\n<img src="chart.svg" alt="Grafiek: Sam 9 stemmen, Noor 14, Jesse 6">', css: '' },
          better: 'b',
          hintPick: 'Iemand die niet kan zien, laat de pagina voorlezen. Wat hoort die persoon bij elke oplossing?',
          reasons: [
            { text: 'De grafiek bevat informatie die nergens anders staat. Met een beschrijvende alt-tekst krijgt iemand met een schermlezer die informatie ook.', ok: true, crit: 'accessibility' },
            { text: 'Een lege alt is altijd fout.', why: 'Niet altijd: bij een plaatje dat alleen versiering is, is een lege alt juist goed. Hier draagt het plaatje informatie.' },
            { text: 'B is beter voor de vormgeving.', why: 'De alt-tekst zie je niet op het scherm. Hij is er voor wie het plaatje niet kan zien.' },
            { text: 'Het maakt niet uit, het plaatje staat er bij allebei.', why: 'Voor wie kan kijken wel. Een schermlezer slaat het plaatje bij A helemaal over.' }
          ],
          explain: 'Een plaatje met informatie heeft een alt-tekst nodig die die informatie geeft. Anders mist een deel van je bezoekers de uitslag.'
        },
        {
          kind: 'duel',
          title: 'Het golvende lijntje',
          situation: 'Het plaatje is alleen versiering: een golvend lijntje onder de kop. Het vertelt niets.',
          question: 'Welke alt-tekst past het best?',
          a: { html: '<h2>Uitslag</h2>\n<img src="wave.svg" alt="">', css: '' },
          b: { html: '<h2>Uitslag</h2>\n<img src="wave.svg" alt="Een golvend roze lijntje als versiering">', css: '' },
          better: 'a',
          hintPick: 'Laat de pagina in gedachten voorlezen. Heeft de luisteraar iets aan de beschrijving van dit lijntje?',
          reasons: [
            { text: 'Het lijntje is alleen versiering. Met `alt=""` slaat een schermlezer het over, zodat de luisteraar niet afgeleid wordt.', ok: true, crit: 'accessibility' },
            { text: 'Elk plaatje moet een beschrijving hebben, dus B.', why: 'Elk plaatje heeft een alt-attribuut nodig, maar bij versiering mag dat leeg zijn. Dan weet de schermlezer: overslaan.' },
            { text: 'A is beter, want minder tekst is altijd beter.', why: 'Bij de grafiek was een lange alt juist nodig. Het gaat om wat het plaatje betekent.' },
            { text: 'Ze zijn gelijk, want het lijntje ziet er bij allebei hetzelfde uit.', why: 'Op het scherm wel, maar een schermlezer leest bij B een zinnetje voor dat niemand helpt.' }
          ],
          explain: 'Hetzelfde duel als de grafiek, een andere winnaar. Een decoratief plaatje krijgt `alt=""`: niet weglaten, maar leeg laten. De situatie bepaalt de keuze.'
        }
      ]
    },
    {
      name: 'De mini code review',
      tag: 'Ronde 3',
      goal: 'Beoordeel een kleine pagina op meerdere criteria tegelijk.',
      takeaway: 'Een code review is geen ja of nee. Je loopt de criteria langs en geeft per punt een onderbouwd oordeel: dit is goed, en dit kan beter.',
      items: [
        {
          kind: 'review',
          title: 'De bakkerij',
          question: 'Beoordeel deze pagina op vier criteria.',
          html: '<header>\n  <img src="logo.svg">\n  <nav>\n    <a href="/">Home</a>\n    <a href="/brood">Brood</a>\n  </nav>\n</header>\n<main>\n  <h1>Vers brood, elke dag</h1>\n  <p class="a">Open om 7 uur.</p>\n  <p class="b">Ma t/m za</p>\n</main>',
          css: 'nav a {\n  margin-right: 8px;\n}\n.a {\n  font-weight: bold;\n}\n.b {\n  color: gray;\n}',
          criteria: [
            { id: 'semantics', good: true, explain: 'Goed: `<header>`, `<nav>`, `<main>`, `<h1>` en `<p>` beschrijven precies wat elk deel is.' },
            { id: 'naming', good: false, explain: 'Kan beter: `.a` en `.b` zeggen niets. Namen als `.opening-hours` en `.days` vertellen wat het is.' },
            { id: 'accessibility', good: false, explain: 'Kan beter: het logo heeft geen `alt`. Een schermlezer leest dan de bestandsnaam voor, of niets.' },
            { id: 'readability', good: true, explain: 'Goed: de code springt netjes in, zodat je in één oogopslag ziet wat waarin zit.' }
          ]
        },
        {
          kind: 'review',
          title: 'De fietsenwinkel',
          question: 'Beoordeel deze pagina op vier criteria.',
          html: '<div class="header">\n  <div class="site-title">Snelle Spaak</div>\n</div>\n<div class="intro">\n  <img src="logo.svg" alt="Logo van Snelle Spaak">\n  <div class="intro-text">Wij repareren elke fiets.</div>\n  <button class="cta">Maak een afspraak</button>\n</div>',
          css: '.site-title {\n  font-size: 22px;\n  font-weight: bold;\n  color: #e8336d;\n}\n.intro-text {\n  color: #e8336d;\n  font-weight: bold;\n}\n.cta {\n  color: #e8336d;\n  font-weight: bold;\n}',
          criteria: [
            { id: 'semantics', good: false, explain: 'Kan beter: alles is een `<div>`. De titel hoort een `<h1>` te zijn, de tekst een `<p>`, en de kop een `<header>`.' },
            { id: 'naming', good: true, explain: 'Goed: `site-title`, `intro-text` en `cta` vertellen wat elk element is.' },
            { id: 'accessibility', good: true, explain: 'Goed: het logo heeft een beschrijvende `alt`, en de afspraak-knop is een echte `<button>`.' },
            { id: 'maintainability', good: false, explain: 'Kan beter: dezelfde kleur en `font-weight` staan drie keer in de CSS. Wil je een andere kleur, dan moet je drie plekken aanpassen.' }
          ]
        }
      ]
    }
  ];

  const pointsOf = (item) => (item.kind === 'duel' ? 2 : item.criteria.length);
  const levelMax = (i) => ROUNDS[i].items.reduce((n, it) => n + pointsOf(it), 0);
  const MAX_SCORE = ROUNDS.reduce((n, _, i) => n + levelMax(i), 0);
  const PASS_RATIO = 0.8;

  /* ---------- state ---------- */
  let state = null;
  let roundCounter = 0;

  function newRound() {
    roundCounter += 1;
    state = {
      round: roundCounter,
      level: 0,
      idx: 0,
      tasks: {},          // key -> { level, first: bool, done: bool }
      finished: false,
      reported: false,    // voorkomt meerdere GAME_COMPLETED-berichten per ronde
      step: 'pick',       // duel: pick → why → done; review: judge → done
      wrongPicks: [],
      wrongReasons: [],
      reasonOrder: [],
      verdicts: {},       // review: criterium → true (goed) / false (kan beter)
      flagged: [],        // review: criteria die na inleveren nog fout staan
      done: false
    };
  }

  const key = (l, i, part) => `R${l + 1}:${i}:${part}`;
  function attempt(k, correct) {
    const t = state.tasks[k] || (state.tasks[k] = { level: state.level, first: correct, done: false });
    if (correct) t.done = true;
    return t;
  }
  const score = () => Object.values(state.tasks).filter((t) => t.first).length;
  const levelScore = (i) => Object.values(state.tasks).filter((t) => t.level === i && t.first).length;
  const item = () => ROUNDS[state.level].items[state.idx];

  /* ---------- kop + scorebord ---------- */
  function header() {
    return `
      <header class="marquee">
        <div class="bulbs" aria-hidden="true"></div>
        <h1><small>De</small> Code Jury</h1>
        <p>De spelshow waar jij oordeelt over code</p>
        <span class="bloom-sign">Bloom · <b>Evalueren</b></span>
      </header>`;
  }

  // Het scorebord: één lamp per aflevering. Vol licht = alles in één keer goed.
  function scoreboard() {
    return `<nav class="board" aria-label="Scorebord">${ROUNDS.map((r, ri) => `
      <div class="board-round"><span>${r.tag}</span><div class="lamps">${r.items.map((it, ii) => {
        const keys = it.kind === 'duel' ? ['pick', 'why'] : it.criteria.map((c) => c.id);
        const ts = keys.map((k) => state.tasks[key(ri, ii, k)]);
        const cur = ri === state.level && ii === state.idx && !state.finished;
        const past = ri < state.level || (ri === state.level && ii < state.idx) || state.finished || (cur && state.done);
        const clean = ts.every((t) => t && t.first);
        const cls = past ? (clean ? 'lit' : 'dim') : cur ? 'now' : '';
        return `<span class="lamp ${cls}" title="${r.tag}, aflevering ${ii + 1}"></span>`;
      }).join('')}</div></div>`).join('')}
      <span class="board-score">${score()}<small> / ${MAX_SCORE} pnt</small></span></nav>`;
  }
  function refreshBoard() {
    const el = document.getElementById('board');
    if (el) el.innerHTML = scoreboard();
  }

  /* ---------- startscherm ---------- */
  function renderStart() {
    window.scrollTo(0, 0);
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    app.innerHTML = `
      ${header()}
      <main class="stage intro">
        <p class="kicker">Skill 7 van 8 · Evalueren</p>
        <h2>Goedenavond, jurylid!</h2>
        <p class="lead">Tot nu toe ging het om de vraag: <b>werkt</b> de code? Vanavond gaat het om een nieuwe vraag: is het ook een <b>goede</b> oplossing? Twee developers lossen hetzelfde probleem op. Vaak werken ze allebei. Jij kiest de winnaar, en onderbouwt waarom.</p>
        <div class="intro-grid">
          <section class="card">
            <h3>Zo jureer je</h3>
            <ol class="steps">
              <li>Bekijk de code en de preview op allebei de podia.</li>
              <li><b>Wijs de winnaar aan.</b></li>
              <li><b>Steek de juiste jurykaart op</b>: het argument dat je keuze onderbouwt.</li>
              <li>In ronde 3 geef je een hele pagina punten per criterium.</li>
            </ol>
          </section>
          <section class="card">
            <h3>De criteria</h3>
            <ul class="crit-list">${Object.values(CRITERIA).map((c) => `<li>${c}</li>`).join('')}</ul>
          </section>
        </div>
        <div class="rounds">${ROUNDS.map((r) => `<div class="round-card"><span>${r.tag}</span><b>${r.name}</b><small>${r.goal}</small></div>`).join('')}</div>
        <p class="rule"><b>${MAX_SCORE} punten.</b> Per duel krijg je een punt voor de juiste winnaar en een punt voor de juiste onderbouwing, en in ronde 3 een punt per criterium. Alleen je <b>eerste poging</b> telt. Haal je er minimaal <b>${need}</b> (80%), dan win je de Gouden Hamer.</p>
        <button class="btn" id="startBtn">Applaus! De show begint →</button>
      </main>`;
    document.getElementById('startBtn').addEventListener('click', () => {
      newRound();
      startLevel(0);
    });
  }

  function startLevel(i) {
    state.level = i;
    state.idx = 0;
    startItem();
  }

  function startItem() {
    const it = item();
    state.step = it.kind === 'duel' ? 'pick' : 'judge';
    state.done = false;
    state.wrongPicks = [];
    state.wrongReasons = [];
    state.reasonOrder = it.reasons ? shuffle(it.reasons.map((_, i) => i)) : [];
    state.verdicts = {};
    state.flagged = [];
    if (it.kind === 'duel') renderDuel();
    else renderReview();
  }

  /* =========================================================
     DUEL
     ========================================================= */
  function codeBlock(label, code) {
    return code ? `<div class="code-label">${label}</div><pre class="code">${esc(code)}</pre>` : '';
  }

  function podium(side, sol, it) {
    const name = side === 'a' ? 'Developer A' : 'Developer B';
    const won = state.step !== 'pick' && it.better === side;
    const out = state.wrongPicks.includes(side);
    return `
      <section class="podium ${side}${won ? ' winner' : ''}${out ? ' out' : ''}" aria-label="${name}">
        <div class="nameplate">${name}${won ? ' <span class="crown">★</span>' : ''}</div>
        <div class="screen">
          ${codeBlock('HTML', sol.html)}${codeBlock('CSS', sol.css)}
          <div class="code-label">Preview <span class="works">✓ werkt</span></div>
          <div class="preview" inert><div data-preview="${side}"></div></div>
        </div>
        ${state.step === 'pick' ? `<button type="button" class="btn vote" data-pick="${side}"${out ? ' disabled' : ''}>${side.toUpperCase()} wint!</button>` : ''}
      </section>`;
  }

  function renderDuel(note) {
    const it = item();
    const r = ROUNDS[state.level];
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <div id="board">${scoreboard()}</div>
      <section class="host">
        <p class="kicker">${r.tag} · ${r.name} · aflevering ${state.idx + 1} van ${r.items.length}</p>
        <h2>${esc(it.title)}</h2>
        ${it.situation ? `<div class="situation"><b>De situatie</b>${fmt(it.situation)}</div>` : ''}
        <p class="question">${fmt(it.question)}</p>
      </section>
      <div class="podia">${podium('a', it.a, it)}<div class="vs" aria-hidden="true">VS</div>${podium('b', it.b, it)}</div>
      <section class="jury" id="jury"></section>`;
    document.querySelectorAll('[data-preview]').forEach((h) => mountPage(h, it[h.dataset.preview].html, it[h.dataset.preview].css));
    renderJury(note);
  }

  function renderJury(note) {
    const it = item();
    const box = document.getElementById('jury');
    const noteHtml = note ? `<div class="note ${note.kind}">${note.head ? `<b class="note-head">${note.head}</b>` : ''}${fmt(note.text)}</div>` : '';
    if (state.step === 'pick') {
      box.innerHTML = noteHtml;
      return;
    }
    const cards = state.reasonOrder.map((i) => {
      const rs = it.reasons[i];
      const out = state.wrongReasons.includes(i);
      const right = state.step === 'done' && rs.ok;
      return `<button type="button" class="jcard${out ? ' out' : ''}${right ? ' right' : ''}" data-reason="${i}"${out || state.step === 'done' ? ' disabled' : ''}>${right ? `<span class="crit">${CRITERIA[rs.crit]}</span>` : ''}${fmt(rs.text)}</button>`;
    }).join('');
    const winner = it.better === 'a' ? 'Developer A' : 'Developer B';
    box.innerHTML = `
      <h3>${state.step === 'done' ? 'Het oordeel van de jury' : `${winner} wint. Maar waarom? Steek de juiste jurykaart op.`}</h3>
      <div class="jcards">${cards}</div>
      ${noteHtml}
      ${state.step === 'done' ? `<div class="next"><button class="btn" id="nextBtn" type="button">${nextLabel()}</button></div>` : ''}`;
    if (state.step === 'done') document.getElementById('nextBtn').addEventListener('click', goNext, { once: true });
  }

  function pickWinner(side) {
    const it = item();
    if (state.step !== 'pick' || state.wrongPicks.includes(side)) return;
    const ok = side === it.better;
    attempt(key(state.level, state.idx, 'pick'), ok);
    refreshBoard();
    if (!ok) {
      state.wrongPicks.push(side);
      renderDuel({ kind: 'bad', head: 'Boe! De zaal is het niet met je eens.', text: it.hintPick });
      document.querySelector('.podia').classList.add('shake');
      return;
    }
    state.step = 'why';
    renderDuel({ kind: 'good', head: 'Applaus!', text: 'Juiste winnaar. Nu de onderbouwing.' });
    scrollIntoViewIfNeeded(document.getElementById('jury'));
  }

  function pickReason(i) {
    const it = item();
    if (state.step !== 'why' || state.wrongReasons.includes(i)) return;
    const rs = it.reasons[i];
    attempt(key(state.level, state.idx, 'why'), !!rs.ok);
    if (!rs.ok) {
      state.wrongReasons.push(i);
      refreshBoard();
      renderJury({ kind: 'bad', head: 'Die kaart overtuigt de zaal niet.', text: rs.why });
      return;
    }
    state.step = 'done';
    state.done = true;
    refreshBoard();
    renderDuel({ kind: 'good', head: 'De zaal staat op z\'n kop!', text: it.explain });
    const jury = document.getElementById('jury');
    jury.classList.add('cheer');
    scrollIntoViewIfNeeded(jury);
  }

  /* =========================================================
     MINI CODE REVIEW
     ========================================================= */
  function numbered(code) {
    return code.split('\n').map((l, i) => `<span class="ln">${i + 1}</span>${esc(l) || ' '}`).join('\n');
  }

  function renderReview(note) {
    const it = item();
    const r = ROUNDS[state.level];
    window.scrollTo(0, 0);
    const rows = it.criteria.map((c) => {
      const v = state.verdicts[c.id];
      const flagged = state.flagged.includes(c.id);
      const right = state.done || (state.submitted && !flagged);
      const lock = state.done ? ' disabled' : '';
      return `<tr class="${flagged ? 'flag' : right && state.submitted ? 'ok' : ''}">
        <th scope="row">${CRITERIA[c.id]}</th>
        <td><div class="thumbs" role="radiogroup" aria-label="${CRITERIA[c.id]}">
          <button type="button" role="radio" class="thumb up${v === true ? ' on' : ''}" data-crit="${c.id}" data-val="1" aria-checked="${v === true}"${lock}>👍 Goed</button>
          <button type="button" role="radio" class="thumb down${v === false ? ' on' : ''}" data-crit="${c.id}" data-val="0" aria-checked="${v === false}"${lock}>👎 Kan beter</button>
        </div>${state.done ? `<p class="crit-explain">${fmt(c.explain)}</p>` : ''}</td></tr>`;
    }).join('');
    app.innerHTML = `
      ${header()}
      <div id="board">${scoreboard()}</div>
      <section class="host">
        <p class="kicker">${r.tag} · ${r.name} · aflevering ${state.idx + 1} van ${r.items.length}</p>
        <h2>${esc(it.title)}</h2>
        <p class="question">${fmt(it.question)} De pagina werkt; het gaat om de kwaliteit van de code.</p>
      </section>
      <div class="review">
        <section class="podium solo">
          <div class="nameplate">Ingezonden pagina</div>
          <div class="screen">
            <div class="code-label">HTML</div><pre class="code numbered">${numbered(it.html)}</pre>
            <div class="code-label">CSS</div><pre class="code numbered">${numbered(it.css)}</pre>
            <div class="code-label">Preview <span class="works">✓ werkt</span></div>
            <div class="preview" inert><div id="reviewPreview"></div></div>
          </div>
        </section>
        <section class="scorecard">
          <h3>Jurykaart</h3>
          <table class="sheet"><tbody>${rows}</tbody></table>
          ${note ? `<div class="note ${note.kind}">${note.head ? `<b class="note-head">${note.head}</b>` : ''}${fmt(note.text)}</div>` : ''}
          <div class="next" id="reviewActions">${state.done
            ? `<button class="btn" id="nextBtn" type="button">${nextLabel()}</button>`
            : `<button class="btn" id="submitBtn" type="button"${Object.keys(state.verdicts).length < it.criteria.length ? ' disabled' : ''}>Lever je oordeel in</button>`}</div>
        </section>
      </div>`;
    mountPage(document.getElementById('reviewPreview'), it.html, it.css);
    if (state.done) document.getElementById('nextBtn').addEventListener('click', goNext, { once: true });
    else document.getElementById('submitBtn').addEventListener('click', submitReview);
  }

  function setVerdict(id, good) {
    if (state.done) return;
    state.verdicts[id] = good;
    state.flagged = state.flagged.filter((f) => f !== id);
    const it = item();
    // alleen de knoppen bijwerken, zodat de pagina niet verspringt
    document.querySelectorAll(`.thumb[data-crit="${id}"]`).forEach((b) => {
      const on = (b.dataset.val === '1') === good;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
    });
    const row = document.querySelector(`.thumb[data-crit="${id}"]`).closest('tr');
    row.className = '';
    document.getElementById('submitBtn').disabled = Object.keys(state.verdicts).length < it.criteria.length;
  }

  function submitReview() {
    const it = item();
    if (state.done || Object.keys(state.verdicts).length < it.criteria.length) return;
    state.submitted = true;
    state.flagged = [];
    for (const c of it.criteria) {
      const ok = state.verdicts[c.id] === c.good;
      attempt(key(state.level, state.idx, c.id), ok);
      if (!ok) state.flagged.push(c.id);
    }
    refreshBoard();
    if (state.flagged.length) {
      const names = state.flagged.map((id) => CRITERIA[id]);
      renderReview({ kind: 'bad', head: 'De andere juryleden fronsen…', text: `Je oordeel over ${names.join(' en ')} klopt nog niet. Kijk bij elk criterium opnieuw naar de code: wat is er goed, en wat kan beter?` });
      return;
    }
    state.done = true;
    state.submitted = false;
    renderReview({ kind: 'good', head: 'Een unaniem oordeel!', text: 'Je beoordeling klopt op alle punten. Lees per criterium de toelichting.' });
    document.querySelector('.scorecard').classList.add('cheer');
  }

  /* ---------- volgende ---------- */
  function nextLabel() {
    const r = ROUNDS[state.level];
    return state.idx === r.items.length - 1 ? `${r.tag} afsluiten →` : 'Volgende aflevering →';
  }
  function goNext() {
    const r = ROUNDS[state.level];
    if (state.idx === r.items.length - 1) renderLevelDone();
    else { state.idx += 1; startItem(); }
  }

  app.addEventListener('click', (e) => {
    if (!state) return;
    const v = e.target.closest('[data-pick]');
    if (v && !v.disabled) { pickWinner(v.dataset.pick); return; }
    const c = e.target.closest('.jcard');
    if (c && !c.disabled) { pickReason(Number(c.dataset.reason)); return; }
    const t = e.target.closest('.thumb');
    if (t && !t.disabled) setVerdict(t.dataset.crit, t.dataset.val === '1');
  });

  /* ---------- tussenscherm: ronde afgerond ---------- */
  function renderLevelDone() {
    const i = state.level;
    const r = ROUNDS[i];
    const next = ROUNDS[i + 1];
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <div id="board">${scoreboard()}</div>
      <main class="stage done">
        <p class="kicker">${r.tag} afgelopen</p>
        <h2>${r.name}</h2>
        <p class="muted">${levelScore(i)} van ${levelMax(i)} punten bij de eerste poging</p>
        <p class="takeaway">${fmt(r.takeaway)}</p>
        <button class="btn" id="goNext">${next ? `Na de reclame: ${next.tag}, ${next.name} →` : 'Naar de finale →'}</button>
      </main>`;
    document.getElementById('goNext').addEventListener('click', () => (next ? startLevel(i + 1) : finishGame()));
  }

  /* =========================================================
     FINALE — de Gouden Hamer
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

  const GAVEL = '<svg viewBox="0 0 120 120" aria-hidden="true"><g transform="rotate(-35 60 60)"><rect x="30" y="22" width="60" height="26" rx="8" fill="#ffc93c" stroke="#3b1d2b" stroke-width="5"/><rect x="24" y="18" width="10" height="34" rx="4" fill="#ff7a1a" stroke="#3b1d2b" stroke-width="5"/><rect x="86" y="18" width="10" height="34" rx="4" fill="#ff7a1a" stroke="#3b1d2b" stroke-width="5"/><rect x="55" y="48" width="10" height="56" rx="4" fill="#ffc93c" stroke="#3b1d2b" stroke-width="5"/></g><rect x="14" y="100" width="92" height="12" rx="6" fill="#e8336d" stroke="#3b1d2b" stroke-width="5"/></svg>';

  function renderEnd() {
    const s = score();
    const pct = Math.round((s / MAX_SCORE) * 100);
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <main class="stage finale ${state.passed ? 'won' : ''}">
        ${state.passed ? '<div class="confetti" aria-hidden="true">' + Array.from({ length: 26 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.25}s;--c:${['#ff7a1a', '#e8336d', '#ffc93c', '#1fb5ac'][i % 4]}"></i>`).join('') + '</div>' : ''}
        <div class="trophy ${state.passed ? 'gold' : ''}">${GAVEL}</div>
        <p class="kicker">De finale</p>
        <h2>${state.passed ? 'De Gouden Hamer gaat naar… jou!' : 'Bijna de Gouden Hamer!'}</h2>
        <div class="final-score"><b>${s}</b><span>/ ${MAX_SCORE} punten · ${pct}%</span></div>
        <p class="end-text">${state.passed
          ? 'Je kiest niet alleen de beste oplossing, je onderbouwt hem ook met echte criteria: semantiek, toegankelijkheid, onderhoudbaarheid en duidelijke namen. Op naar de Website Challenge!'
          : `Voor de Gouden Hamer heb je minimaal ${need} van ${MAX_SCORE} punten (80%) nodig bij de eerste poging. Lees de toelichtingen nog eens en kom terug in de volgende uitzending!`}</p>
        <table class="results">${ROUNDS.map((r, i) => `<tr><th>${r.tag}</th><td>${r.name}</td><td>${levelScore(i)} / ${levelMax(i)}</td></tr>`).join('')}</table>
        <div class="end-actions">
          <button class="btn ghost" id="exit">← Terug naar de skilltree</button>
          <button class="btn" id="again">↺ Nieuwe uitzending</button>
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
  window.codeReview = Object.freeze({
    info: gameInfo,
    maxScore: MAX_SCORE,
    rounds: ROUNDS.map((r) => r.items.map((it) => (it.kind === 'duel'
      ? { kind: 'duel', title: it.title, better: it.better, okReason: it.reasons.findIndex((x) => x.ok), a: it.a, b: it.b }
      : { kind: 'review', title: it.title, criteria: it.criteria.map((c) => ({ id: c.id, good: c.good })) }))),
    mountPage,
    snapshot: () => state && JSON.parse(JSON.stringify({
      round: state.round, level: state.level, idx: state.idx, step: state.step, done: state.done, score: score(),
      finished: state.finished, passed: !!state.passed, reported: state.reported
    }))
  });

  renderStart();
})();
