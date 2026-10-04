/* =========================================================
   Bug Hunter — educatieve game (Bloom: Analyseren)
   Thema: ongediertebestrijding voor websites. Per klus: lokaliseer de bug,
   stel de oorzaak vast en repareer de code.
   ========================================================= */

/* ---------- vaste gamestekker ---------- */
const gameInfo = {
  gameId: 'bug-hunter',
  learningGoal: 'De leerling kan eenvoudige fouten in HTML en CSS vinden, de oorzaak aanwijzen en de fout herstellen.',
  bloom: 'Analyseren',
  successCriterion: 'De speler voltooit alle drie de rondes en wijst bij minimaal 80% van de bugs de juiste regel én de juiste oorzaak bij de eerste poging aan.'
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
  const norm = (t) => t.replace(/\s+/g, ' ').trim();

  function scrollIntoViewIfNeeded(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 8 || r.bottom > window.innerHeight - 8) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------- de bug-determinatiekaarten ---------- */
  const CAUSES = [
    { id: 'unclosed', name: 'Tag niet goed gesloten', desc: 'Een sluit-tag mist of is fout geschreven.' },
    { id: 'nesting', name: 'Verkeerde nesting', desc: 'Een element staat in de verkeerde ouder.' },
    { id: 'classname', name: 'Classnaam klopt niet', desc: 'HTML en CSS gebruiken niet precies dezelfde naam.' },
    { id: 'selector', name: 'Verkeerde selector', desc: 'De selector kiest niet het element dat je bedoelt.' },
    { id: 'value', name: 'Foute CSS-waarde', desc: 'De waarde is ongeldig, dus de browser negeert hem.' },
    { id: 'property', name: 'Property mist of is fout', desc: 'Er ontbreekt een property, of hij is verkeerd gespeld.' },
    { id: 'punctuation', name: 'Leesteken mist', desc: 'Er mist een ; : { } = of aanhalingsteken.' }
  ];
  const causeName = (id) => CAUSES.find((c) => c.id === id).name;

  /* ---------- de klussen ---------- */
  // Per klus: de kapotte HTML en CSS, de klacht van de klant en de bugs.
  // Een bug beslaat de regels `from`–`to` (0-geteld, in de kapotte code) van `file`; `fix` is de juiste code daarvoor.
  // lineHints: aanwijzing als de speler op een bepaalde regel zonder bug klikt (`bestand:regel`).
  const ROUNDS = [
    {
      name: 'Eén bug per klus',
      tag: 'Ronde 1',
      goal: 'Elke klus heeft precies één bug. Zoek hem, benoem de oorzaak en repareer hem.',
      takeaway: 'Een bug zie je aan het resultaat, maar je vindt hem in de code. Vergelijk eerst wat er anders is, en zoek dan de regel die dat veroorzaakt.',
      jobs: [
        {
          client: 'Bakkerij De Krentenbol',
          complaint: 'Ineens is ál onze tekst enorm groot en dik geworden!',
          html: '<h1>Mijn website<h1>\n<p class="intro">Hallo! Welkom op mijn site.</p>',
          css: 'h1 {\n  color: darkblue;\n}\n.intro {\n  color: dimgray;\n}',
          bugs: [{
            file: 'html', from: 0, to: 0, cause: 'unclosed', fix: '<h1>Mijn website</h1>',
            causeHint: 'Kijk naar het einde van de regel. Hoe ziet een sluit-tag eruit?',
            fixHint: 'Een sluit-tag heeft een schuine streep: `</…>`.',
            why: 'Zonder `/` opent `<h1>` een tweede kop in plaats van de eerste te sluiten. Daardoor werd de alinea ook een deel van een kop.'
          }],
          lineHints: { 'css:0': 'Deze CSS maakt de kop donkerblauw, dat klopt. Maar waarom is de alinea ook zo groot? Kijk naar de HTML.' }
        },
        {
          client: 'Fietsenmaker Snelle Spaak',
          complaint: 'De introtekst moet rood zijn, maar hij blijft gewoon zwart.',
          html: '<h2>Welkom!</h2>\n<p class="intro">Wij repareren elke fiets.</p>',
          css: 'h2 {\n  font-size: 22px;\n}\n.inrto {\n  color: red;\n}',
          bugs: [{
            file: 'css', from: 3, to: 3, cause: 'classname', fix: '.intro {',
            causeHint: 'Lees de selector letter voor letter, en vergelijk hem met de class in de HTML.',
            fixHint: 'De selector moet precies dezelfde naam hebben als `class="intro"`.',
            why: '`.inrto` en `intro` lijken op elkaar, maar de browser kijkt letter voor letter. Geen enkel element heeft `class="inrto"`, dus de regel deed niets.'
          }],
          lineHints: { 'html:1': 'Deze HTML is in orde: de alinea heeft `class="intro"`. Welke CSS-regel zou dit element rood moeten maken?' }
        },
        {
          client: 'Sportclub De Sprinters',
          complaint: 'We hebben een font-size voor de kop ingesteld, maar hij wordt niet groter.',
          html: '<h2 class="title">Uitslagen</h2>\n<p>Zaterdag wonnen we met 3-1.</p>',
          css: '.title {\n  font-size: 32 px;\n  color: teal;\n}',
          bugs: [{
            file: 'css', from: 1, to: 1, cause: 'value', fix: '  font-size: 32px;',
            causeHint: 'De property is goed gespeld. Kijk heel precies naar de waarde.',
            fixHint: 'Tussen een getal en zijn eenheid mag geen spatie staan.',
            why: '`32 px` met een spatie is geen geldige waarde, dus de browser negeert die hele regel. `32px` hoort aan elkaar.'
          }],
          lineHints: { 'css:2': 'De kleur werkt wel: de kop is teal. Welke regel doet níet wat hij moet doen?' }
        },
        {
          client: 'Pizzeria Bella',
          complaint: 'De bestelknop moet oranje zijn met witte tekst, maar hij ziet er heel gewoon uit.',
          html: '<p>Honger?</p>\n<button class="btn">Bestel nu</button>',
          css: '.btn {\n  background: orange\n  color: white;\n  padding: 8px 16px;\n}',
          bugs: [{
            file: 'css', from: 1, to: 1, cause: 'punctuation', fix: '  background: orange;',
            causeHint: 'Kijk naar het einde van elke regel in `.btn`. Eindigen ze allemaal hetzelfde?',
            fixHint: 'Elke declaratie eindigt met een puntkomma.',
            why: 'Zonder `;` leest de browser `orange color: white` als één waarde. Die is ongeldig, dus de achtergrond én de tekstkleur vielen weg.'
          }],
          lineHints: { 'css:2': 'Deze regel zelf is goed geschreven. Maar de browser leest hem samen met de regel erboven. Eindigt die goed?' }
        }
      ]
    },
    {
      name: 'Twee bugs per klus',
      tag: 'Ronde 2',
      goal: 'Nu zitten er twee bugs in elke klus. Los ze een voor een op.',
      takeaway: 'Meerdere bugs los je een voor een op. Na elke reparatie kijk je opnieuw: wat is er nu nog anders dan de werkbon?',
      jobs: [
        {
          client: 'Gamewinkel Level Up',
          complaint: 'Het menu moet op één regel staan, in het paars. Nu staat alles onder elkaar en zwart.',
          html: '<ul class="menu">\n  <li>Home</li>\n  <li>Games</li>\n  <li>Contact</li>\n</ul>',
          css: '.menu {\n  gap: 16px;\n  list-style: none;\n  padding: 0;\n}\n#menu li {\n  color: purple;\n}',
          bugs: [
            {
              file: 'css', from: 0, to: 4, cause: 'property', fix: '.menu {\n  display: flex;\n  gap: 16px;\n  list-style: none;\n  padding: 0;\n}',
              causeHint: 'Alles in deze regel is goed gespeld. Maar zet iets hier de items naast elkaar?',
              fixHint: '`gap` werkt alleen in een flex-container. Welke declaratie maakt van `.menu` een flex-container?',
              why: '`gap` doet pas iets als `.menu` een flex-container is. Er ontbrak `display: flex`.'
            },
            {
              file: 'css', from: 5, to: 5, cause: 'selector', fix: '.menu li {',
              causeHint: 'De naam `menu` klopt wel. Kijk naar het teken ervoor: kiest dat een class?',
              fixHint: 'Een class kies je met een punt, een id met een hekje.',
              why: '`#menu` zoekt een element met `id="menu"`. De lijst heeft `class="menu"`, dus de selector moet `.menu li` zijn.'
            }
          ]
        },
        {
          client: 'Gamestudio Pixelpret',
          complaint: 'Alleen het woord "nu" moet dik, maar de hele zin is dik. En de knop moet witte tekst hebben.',
          html: '<div class="card">\n  <h2>Nieuwe game!</h2>\n  <p>Speel <strong>nu<strong> Bug Hunter.</p>\n  <button class="btn">Spelen</button>\n</div>',
          css: '.card {\n  border: 2px solid black;\n  padding: 16px;\n}\n.btn {\n  background: purple;\n  colr: white;\n}',
          bugs: [
            {
              file: 'html', from: 2, to: 2, cause: 'unclosed', fix: '  <p>Speel <strong>nu</strong> Bug Hunter.</p>',
              causeHint: 'Tel de `<strong>`-tags. Welke opent er, en welke sluit er?',
              fixHint: 'Sluit `<strong>` met `</strong>`.',
              why: 'De tweede `<strong>` had geen `/`, dus de browser opende een nieuw dik stuk in plaats van het eerste te sluiten.'
            },
            {
              file: 'css', from: 6, to: 6, cause: 'property', fix: '  color: white;',
              causeHint: 'Lees de property letter voor letter. Kent de browser dit woord?',
              fixHint: 'De property voor tekstkleur is `color`.',
              why: '`colr` is geen property, dus de browser sloeg die regel over. Met `color` wordt de tekst wit.'
            }
          ],
          lineHints: { 'css:5': 'De achtergrond werkt: de knop is paars. Welke regel in `.btn` doet níets?' }
        },
        {
          client: 'Codeclub De Bytes',
          complaint: 'Alle skills moeten als ronde labeltjes in de lijst staan. JavaScript staat er los onder, en de hoeken zijn niet rond.',
          html: '<ul class="skills">\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>\n  <li>JavaScript</li>',
          css: '.skills {\n  list-style: none;\n  padding: 0;\n}\n.skills li {\n  display: inline-block;\n  background: lightblue;\n  padding: 4px 10px;\n  border-radius: 99;\n}',
          bugs: [
            {
              file: 'html', from: 3, to: 4, cause: 'nesting', fix: '  <li>JavaScript</li>\n</ul>',
              causeHint: 'Waar sluit de lijst? En waar staat `<li>JavaScript</li>`?',
              fixHint: 'Alle `<li>`-items moeten vóór `</ul>` staan.',
              why: '`</ul>` sloot de lijst te vroeg. JavaScript stond daardoor buiten `.skills`, dus de CSS voor `.skills li` raakte hem niet.'
            },
            {
              file: 'css', from: 8, to: 8, cause: 'value', fix: '  border-radius: 99px;',
              causeHint: 'De property is goed. Wat mist er aan de waarde?',
              fixHint: 'Een maat zoals `99` heeft een eenheid nodig, bijvoorbeeld `px`.',
              why: 'Een lengte zonder eenheid (behalve 0) is ongeldig. `99px` werkt wel.'
            }
          ]
        }
      ]
    },
    {
      name: 'HTML en CSS samen',
      tag: 'Ronde 3',
      goal: 'De oorzaak zit nu tussen HTML en CSS in. Lees ze samen.',
      takeaway: 'HTML en CSS moeten bij elkaar passen: dezelfde classnamen, en een structuur die past bij de selectors. Vind je de bug niet in het ene bestand, kijk dan in het andere.',
      jobs: [
        {
          client: 'Webshop Klikklak',
          complaint: 'De producttitel moet donkerblauw zijn en de prijs groen en dik. Allebei werkt niet.',
          html: '<div class="product">\n  <h3 class="product-title">Gamer-muis</h3>\n  <p class"price">€ 29,95</p>\n</div>',
          css: '.product {\n  border: 2px solid #333;\n  padding: 12px;\n}\n.product-titel {\n  color: darkblue;\n}\n.price {\n  font-weight: bold;\n  color: green\n}',
          bugs: [
            {
              file: 'css', from: 4, to: 4, cause: 'classname', fix: '.product-title {',
              causeHint: 'Vergelijk de selector met de class in de HTML. Zijn ze precies gelijk?',
              fixHint: 'In de HTML heet de class `product-title`.',
              why: '`titel` is Nederlands, `title` Engels: de browser ziet twee verschillende namen. CSS en HTML moeten precies dezelfde naam gebruiken.'
            },
            {
              file: 'html', from: 2, to: 2, cause: 'punctuation', fix: '  <p class="price">€ 29,95</p>',
              causeHint: 'De naam `price` klopt met de CSS. Kijk naar hoe het attribuut geschreven is.',
              fixHint: 'Een attribuut schrijf je als `naam="waarde"`.',
              why: 'Zonder `=` leest de browser `class"price"` niet als een class. De alinea had dus helemaal geen class.'
            }
          ],
          lineHints: {
            'css:9': 'Goed gekeken, maar de laatste declaratie in een regel mag zonder puntkomma. Dat is geen bug.',
            'css:7': 'Deze selector is goed: `.price` bestaat in de HTML. Raakt hij het element ook echt? Kijk in de HTML.'
          }
        },
        {
          client: 'Schoolkrant De Pen',
          complaint: 'Het nieuwsbericht hoort bij de nieuwssectie: rood en schuin. Nu is het gewoon zwart.',
          html: '<section class="news">\n  <h2>Nieuws</h2>\n</section>\n  <p>Bug Hunter is uit!</p>',
          css: '.news {\n  border-left: 4px solid crimson;\n  padding-left: 12px;\n}\n.news p {\n  color: crimson;\n  font-style: italic;\n}',
          bugs: [{
            file: 'html', from: 2, to: 3, cause: 'nesting', fix: '  <p>Bug Hunter is uit!</p>\n</section>',
            causeHint: 'De CSS kiest `p` binnen `.news`. Staat de alinea in de HTML wel binnen `.news`?',
            fixHint: 'De alinea moet vóór `</section>` staan.',
            why: '`.news p` kiest alleen alinea\'s ín `.news`. Omdat `</section>` te vroeg sloot, stond de alinea erbuiten.'
          }],
          lineHints: { 'css:4': 'Deze selector is precies goed: hij kiest alinea\'s binnen `.news`. Maar staat de alinea daar wel? Kijk in de HTML.' }
        },
        {
          client: 'Insectenmuseum',
          complaint: 'De drie foto\'s moeten naast elkaar staan, met ruimte ertussen. Nu staan ze onder elkaar, en één zit raar in een andere.',
          html: '<div class="gallery">\n  <div class="photo">🐞</div>\n  <div class="photo">🦋<div>\n  <div class="photo">🐝</div>\n</div>',
          css: '.gallery {\n  gap: 12px;\n}\n.photo {\n  background: #fde68a;\n  padding: 16px;\n}',
          bugs: [
            {
              file: 'html', from: 2, to: 2, cause: 'unclosed', fix: '  <div class="photo">🦋</div>',
              causeHint: 'Waarom zit de bij ín de vlinder? Kijk hoe de vlinder-div eindigt.',
              fixHint: 'Sluit de div met `</div>`.',
              why: 'Zonder `/` opende `<div>` een nieuwe div, en de bij kwam daarin terecht in plaats van ernaast.'
            },
            {
              file: 'css', from: 0, to: 2, cause: 'property', fix: '.gallery {\n  display: flex;\n  gap: 12px;\n}',
              causeHint: 'Er staat een `gap`, maar de foto\'s staan nog onder elkaar. Wat mist er om ze naast elkaar te zetten?',
              fixHint: 'Maak `.gallery` een flex-container.',
              why: '`gap` en "naast elkaar" werken pas met `display: flex` op de ouder, `.gallery`.'
            }
          ],
          lineHints: { 'css:3': 'De foto\'s zelf zijn goed gestyled. Moeten ze zelf iets naast elkaar zetten, of hun ouder?' }
        }
      ]
    }
  ];

  const ALL_BUGS = ROUNDS.reduce((n, r) => n + r.jobs.reduce((m, j) => m + j.bugs.length, 0), 0);
  const MAX_SCORE = ALL_BUGS * 2;   // per bug: juiste regel + juiste oorzaak, bij de eerste poging
  const PASS_RATIO = 0.8;

  /* ---------- code als segmenten: een bug is één segment, andere regels elk een eigen segment ---------- */
  function segmentsOf(job, file) {
    const lines = job[file].split('\n');
    const segs = [];
    for (let i = 0; i < lines.length; i++) {
      const bi = job.bugs.findIndex((b) => b.file === file && b.from === i);
      if (bi >= 0) {
        const b = job.bugs[bi];
        segs.push({ text: lines.slice(b.from, b.to + 1).join('\n'), bug: bi, orig: i, fixed: false });
        i = b.to;
      } else {
        segs.push({ text: lines[i], bug: -1, orig: i });
      }
    }
    return segs;
  }
  // De code als tekst. `pick(seg)` geeft per bug-segment de tekst die je wilt gebruiken.
  const codeOf = (segs, pick) => segs.map((s) => (s.bug >= 0 ? pick(s) : s.text)).join('\n');

  /* ---------- de site renderen en vergelijken ---------- */
  const SITE_CSS = `
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .site { padding: 14px; font: 15px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; color: #222; background: #fff; min-height: 100%; }
    /* :where() = specificiteit 0, zodat de CSS van de klus altijd wint */
    :where(.site) h1 { font-size: 26px; margin: 0 0 8px; }
    :where(.site) h2 { font-size: 20px; margin: 0 0 8px; }
    :where(.site) h3 { font-size: 17px; margin: 0 0 6px; }
    :where(.site) p { margin: 0 0 8px; }
    :where(.site) ul { margin: 0 0 8px; }
    :where(.site) button { font: inherit; padding: 6px 12px; }`;

  function mountSite(host, html, css) {
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${SITE_CSS}</style><style>${css.replace(/<\/style/gi, '')}</style><div class="site">${html}</div>`;
    return root;
  }

  const STYLE_PROPS = ['color', 'background-color', 'font-size', 'font-weight', 'font-style', 'display', 'flex-direction', 'row-gap', 'column-gap',
    'list-style-type', 'border-radius', 'border-top-left-radius', 'width',
    ...['top', 'right', 'bottom', 'left'].flatMap((s) => [`padding-${s}`, `margin-${s}`, `border-${s}-width`, `border-${s}-style`, `border-${s}-color`])];

  // Vingerafdruk van een site: structuur (tag, class, eigen tekst, ouder) en de stijl van elk element.
  function fingerprint(root) {
    const site = root.querySelector('.site');
    const els = [...site.querySelectorAll('*')];
    return els.map((el) => {
      const cs = getComputedStyle(el);
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
      return JSON.stringify([el.tagName, el.className, norm(own), els.indexOf(el.parentElement), STYLE_PROPS.map((p) => cs.getPropertyValue(p))]);
    }).join('\n');
  }

  function renderPrint(html, css) {
    const host = document.createElement('div');
    host.className = 'offstage';
    document.body.appendChild(host);
    const print = fingerprint(mountSite(host, html, css));
    host.remove();
    return print;
  }

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
      segs: null,           // { html: [...], css: [...] }
      phase: 'locate',      // locate → diagnose → fix → (volgende bug) → done
      current: -1,          // de bug waar de speler nu mee bezig is
      missed: false,        // al een keer mis geklikt bij het zoeken van de volgende bug?
      wrongCauses: [],
      flash: null
    };
  }

  const job = () => ROUNDS[state.level].jobs[state.idx];
  const key = (level, idx, bug, part) => `R${level + 1}:${idx}:${bug}:${part}`;
  function attempt(k, correct) {
    const t = state.tasks[k] || (state.tasks[k] = { level: state.level, first: correct, done: false });
    if (correct) t.done = true;
    return t;
  }
  const score = () => Object.values(state.tasks).filter((t) => t.first).length;
  const levelScore = (i) => Object.values(state.tasks).filter((t) => t.level === i && t.first).length;
  const levelMax = (i) => ROUNDS[i].jobs.reduce((m, j) => m + j.bugs.length * 2, 0);
  const allSegs = () => [...state.segs.html, ...state.segs.css];
  const bugSeg = (bi) => allSegs().find((s) => s.bug === bi);
  const openBugs = () => job().bugs.map((_, i) => i).filter((i) => !bugSeg(i).fixed);

  /* ---------- kop + vangst ---------- */
  const LOGO = `<svg class="logo" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill="#fff" stroke="#e23d28" stroke-width="6"/>
    <g fill="#16140f"><ellipse cx="32" cy="36" rx="9" ry="12"/><circle cx="32" cy="22" r="5"/></g>
    <g stroke="#16140f" stroke-width="2.5" stroke-linecap="round"><path d="M23 30l-7-4M23 37h-8M24 44l-7 4M41 30l7-4M41 37h8M40 44l7 4M29 18l-3-5M35 18l3-5"/></g>
    <path d="M13 51 51 13" stroke="#e23d28" stroke-width="6" stroke-linecap="round"/></svg>`;
  const BUG = '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="14" rx="5" ry="6.5"/><circle cx="12" cy="6.5" r="3"/><path d="M7 11 3 9M7 14H2.5M7.5 17.5 3.5 20M17 11l4-2M17 14h4.5M16.5 17.5l4 2.5M10.5 4 9 1.5M13.5 4 15 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  function header() {
    return `
      <header class="masthead">
        <div class="brand">${LOGO}<div><h1>Bug Hunter</h1><p>Ongediertebestrijding voor websites</p></div></div>
        <div class="warn-label"><span>Bloom</span><b>Analyseren</b></div>
      </header>`;
  }

  // Elke bug een silhouet: gevangen (beide in één keer goed), gevangen met moeite, nu op jacht, of nog los.
  function tally() {
    const cells = [];
    ROUNDS.forEach((r, ri) => r.jobs.forEach((j, ji) => j.bugs.forEach((_, bi) => {
      const w = state.tasks[key(ri, ji, bi, 'where')];
      const c = state.tasks[key(ri, ji, bi, 'why')];
      const seg = ri === state.level && ji === state.idx && state.segs ? bugSeg(bi) : null;
      const done = (seg && seg.fixed) || (ri < state.level || (ri === state.level && ji < state.idx)) || state.finished;
      const clean = w && c && w.first && c.first;
      const hunting = ri === state.level && ji === state.idx && !done && !state.finished;
      const cls = done ? (clean ? 'caught' : 'caught messy') : hunting ? 'hunting' : '';
      cells.push(`<span class="tbug ${cls}" title="Ronde ${ri + 1}, klus ${ji + 1}">${BUG}</span>`);
    })));
    return `<div class="tally" aria-label="Vangst: ${score()} van ${MAX_SCORE} punten"><span class="tally-label">Vangst</span><div class="tally-bugs">${cells.join('')}</div><span class="tally-score">${score()} / ${MAX_SCORE} pnt</span></div>`;
  }
  function refreshTally() {
    const el = document.getElementById('tally');
    if (el) el.innerHTML = tally();
  }

  /* ---------- startscherm ---------- */
  function renderStart() {
    window.scrollTo(0, 0);
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    app.innerHTML = `
      ${header()}
      <main class="sheet intro">
        <p class="kicker">Skill 5 van 8 · Analyseren</p>
        <h2>Welkom bij de ploeg!</h2>
        <p class="lead">Je hebt geleerd hoe je een pagina bouwt, stylet en indeelt. Maar websites gaan ook kapot. Klanten bellen met een klacht, en jij gaat op pad: <b>zoek de bug, stel de oorzaak vast en repareer hem</b>. Niet zomaar wat proberen: een echte Bug Hunter weet wáárom iets kapot is.</p>
        <div class="intro-grid">
          <section class="card-plain">
            <h3>Zo werkt een klus</h3>
            <ol class="steps">
              <li><b>Lees de werkbon</b> en vergelijk <i>Zo hoort het</i> met <i>Zo is het nu</i>.</li>
              <li><b>Lokaliseer</b>: klik op de regel code waar de bug zit.</li>
              <li><b>Diagnose</b>: kies de oorzaak op een determinatiekaart.</li>
              <li><b>Repareer</b> de code en kijk of de site weer klopt.</li>
            </ol>
          </section>
          <section class="card-plain">
            <h3>Bekende soorten bugs</h3>
            <ul class="species">${CAUSES.map((c) => `<li><span class="sp-icon">${BUG}</span><b>${c.name}</b></li>`).join('')}</ul>
          </section>
        </div>
        <div class="rounds">
          ${ROUNDS.map((r) => `<div class="round-card"><span class="round-tag">${r.tag}</span><b>${r.name}</b><span>${r.goal}</span></div>`).join('')}
        </div>
        <p class="rule"><b>${ALL_BUGS} bugs, ${MAX_SCORE} punten.</b> Per bug krijg je een punt voor de juiste regel en een punt voor de juiste oorzaak, maar alleen bij je <b>eerste poging</b>. Haal je minimaal <b>${need}</b> punten (80%), dan ben je gecertificeerd.</p>
        <button class="btn" id="startBtn">Spuitbus mee, op pad →</button>
      </main>`;
    document.getElementById('startBtn').addEventListener('click', () => {
      newRound();
      startLevel(0);
    });
  }

  function startLevel(i) {
    state.level = i;
    state.idx = 0;
    startJob();
  }

  function startJob() {
    const j = job();
    state.segs = { html: segmentsOf(j, 'html'), css: segmentsOf(j, 'css') };
    state.phase = 'locate';
    state.current = -1;
    state.missed = false;
    state.wrongCauses = [];
    renderJob();
  }

  /* =========================================================
     DE KLUS
     ========================================================= */
  const currentCode = (file) => codeOf(state.segs[file], (s) => s.text);
  const targetCode = (file) => codeOf(state.segs[file], (s) => job().bugs[s.bug].fix);

  function renderJob() {
    const j = job();
    const r = ROUNDS[state.level];
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <div id="tally">${tally()}</div>
      <div class="jobsite">
        <section class="workorder" aria-label="Werkbon">
          <div class="wo-head"><span>Werkbon</span><span>${r.tag} · klus ${state.idx + 1} van ${r.jobs.length}</span></div>
          <p class="wo-client">Klant: <b>${esc(j.client)}</b></p>
          <blockquote class="wo-complaint">“${esc(j.complaint)}”</blockquote>
          <p class="wo-count" id="bugCount"></p>
        </section>
        <section class="monitors" aria-label="De site">
          <figure class="monitor good"><figcaption><span class="tape">Zo hoort het</span></figcaption><div class="screen"><div id="goodSite"></div></div></figure>
          <figure class="monitor now"><figcaption><span class="tape" id="nowTape">Zo is het nu</span></figcaption><div class="screen"><div id="nowSite"></div></div></figure>
        </section>
        <section class="toolbox" aria-label="Code en gereedschap">
          <ol class="phases" id="phases"></ol>
          <div class="code-pair">
            <div class="codefile"><div class="file-tab">index.html</div><div class="lines" id="code-html"></div></div>
            <div class="codefile"><div class="file-tab">style.css</div><div class="lines" id="code-css"></div></div>
          </div>
          <div class="action" id="action" aria-live="polite"></div>
        </section>
      </div>`;
    mountSite(document.getElementById('goodSite'), targetCode('html'), targetCode('css'));
    renderAll();
  }

  function renderAll() {
    renderCode('html');
    renderCode('css');
    renderPhases();
    renderAction();
    mountSite(document.getElementById('nowSite'), currentCode('html'), currentCode('css'));
    const open = openBugs().length;
    document.getElementById('bugCount').innerHTML = open
      ? `Gemelde bugs: <b>${job().bugs.length}</b> · nog <b>${open}</b> los`
      : `<b>${job().bugs.length === 1 ? 'De bug is' : `Alle ${job().bugs.length} bugs zijn`} verwijderd.</b>`;
    const tape = document.getElementById('nowTape');
    tape.textContent = open ? 'Zo is het nu' : 'Gerepareerd';
    tape.parentElement.parentElement.classList.toggle('fixed', !open);
  }

  function renderCode(file) {
    let n = 0;
    const html = state.segs[file].map((s, si) => {
      const isBug = s.bug >= 0;
      const cur = isBug && s.bug === state.current && state.phase !== 'locate';
      const cls = isBug && s.fixed ? ' fixed' : cur ? ' caught' : '';
      const lines = s.text.split('\n');
      const rows = lines.map((t, li) => {
        n += 1;
        const flash = state.flash && state.flash.file === file && state.flash.seg === si ? ` ${state.flash.kind}` : '';
        return `<button type="button" class="line${cls}${flash}" data-file="${file}" data-seg="${si}" data-sub="${li}"${state.phase !== 'locate' ? ' tabindex="-1"' : ''}>
          <span class="ln">${n}</span><code>${esc(t) || ' '}</code>${cur && li === 0 ? '<span class="mark">🐞</span>' : ''}${isBug && s.fixed && li === 0 ? '<span class="mark ok">✓</span>' : ''}</button>`;
      }).join('');
      return `<div class="seg${cls}">${rows}</div>`;
    }).join('');
    const box = document.getElementById('code-' + file);
    box.innerHTML = html;
    box.classList.toggle('hunting', state.phase === 'locate');
  }

  function renderPhases() {
    const order = ['locate', 'diagnose', 'fix'];
    const names = { locate: 'Lokaliseer', diagnose: 'Diagnose', fix: 'Repareer' };
    const at = state.phase === 'done' ? 3 : order.indexOf(state.phase);
    document.getElementById('phases').innerHTML = order.map((p, i) =>
      `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"><span>${i + 1}</span>${names[p]}</li>`).join('');
  }

  function renderAction(note) {
    const box = document.getElementById('action');
    const j = job();
    const noteHtml = note ? `<div class="note ${note.kind}">${note.head ? `<b class="note-head">${note.head}</b>` : ''}${fmt(note.text)}</div>` : '';
    if (state.phase === 'locate') {
      box.innerHTML = `<p class="prompt"><b>Waar zit de bug?</b> Klik op de regel code die het probleem veroorzaakt.</p>${noteHtml}`;
      return;
    }
    if (state.phase === 'diagnose') {
      box.innerHTML = `<p class="prompt"><b>Wat voor bug is dit?</b> Kies de juiste determinatiekaart.</p>
        <div class="cards">${CAUSES.map((c) => {
          const out = state.wrongCauses.includes(c.id);
          return `<button type="button" class="idcard${out ? ' out' : ''}" data-cause="${c.id}"${out ? ' disabled' : ''}><span class="id-icon">${BUG}</span><b>${c.name}</b><span>${c.desc}</span></button>`;
        }).join('')}</div>${noteHtml}`;
      return;
    }
    if (state.phase === 'fix') {
      const b = j.bugs[state.current];
      const seg = bugSeg(state.current);
      const rows = Math.max(2, seg.text.split('\n').length + 1);
      box.innerHTML = `<p class="prompt"><b>Repareer de code.</b> Diagnose: <span class="diag">${causeName(b.cause)}</span></p>
        <label class="sr-only" for="fixer">Gerepareerde code</label>
        <textarea id="fixer" class="fixer" rows="${rows}" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(state.draft != null ? state.draft : seg.text)}</textarea>
        <div class="row"><button class="btn" id="fixBtn" type="button">Repareer</button><button class="btn ghost" id="resetBtn" type="button">Begin opnieuw</button></div>${noteHtml}`;
      const ta = document.getElementById('fixer');
      ta.addEventListener('input', () => { state.draft = ta.value; });
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); state.draft = ta.value; }
      });
      document.getElementById('fixBtn').addEventListener('click', tryFix);
      document.getElementById('resetBtn').addEventListener('click', () => { state.draft = null; renderAction(); document.getElementById('fixer').focus(); });
      return;
    }
    // klaar
    const r = ROUNDS[state.level];
    const lastJob = state.idx === r.jobs.length - 1;
    box.innerHTML = `${noteHtml}<div class="cleared"><b>Klus geklaard!</b> De site ziet er weer uit zoals de klant wil.</div>
      <button class="btn" id="nextBtn" type="button">${lastJob ? `${r.tag} afronden →` : 'Volgende klus →'}</button>`;
    document.getElementById('nextBtn').addEventListener('click', () => {
      if (lastJob) renderLevelDone();
      else { state.idx += 1; startJob(); }
    }, { once: true });
  }

  /* ---------- stap 1: lokaliseren ---------- */
  function clickLine(file, si) {
    if (state.phase !== 'locate') return;
    const seg = state.segs[file][si];
    if (seg.bug >= 0 && !seg.fixed) {
      state.current = seg.bug;
      attempt(key(state.level, state.idx, seg.bug, 'where'), !state.missed);
      state.missed = false;
      state.phase = 'diagnose';
      state.wrongCauses = [];
      state.flash = null;
      refreshTally();
      renderAll();
      renderAction({ kind: 'good', head: 'Bug gevonden!', text: 'Op deze plek zit de bug. Wat voor bug is het?' });
      scrollIntoViewIfNeeded(document.getElementById('action'));
      return;
    }
    state.missed = true;
    state.flash = { file, seg: si, kind: 'miss' };
    renderCode(file);
    state.flash = null;
    const j = job();
    const specific = seg.bug < 0 ? j.lineHints && j.lineHints[`${file}:${seg.orig}`] : null;
    const text = seg.bug >= 0
      ? 'Deze bug heb je al gerepareerd. Er zit nog een andere bug in de code.'
      : specific || 'Op deze regel zit geen bug. Vergelijk "Zo hoort het" met "Zo is het nu": welk element ziet er anders uit? Zoek de HTML die dat element maakt, en de CSS die het stijlt.';
    renderAction({ kind: 'bad', head: 'Mis!', text });
  }

  /* ---------- stap 2: diagnose ---------- */
  function chooseCause(id) {
    if (state.phase !== 'diagnose' || state.wrongCauses.includes(id)) return;
    const b = job().bugs[state.current];
    const ok = id === b.cause;
    attempt(key(state.level, state.idx, state.current, 'why'), ok);
    refreshTally();
    if (!ok) {
      state.wrongCauses.push(id);
      renderAction({ kind: 'bad', head: 'Dat is het niet.', text: `Het is geen "${causeName(id)}". ${b.causeHint}` });
      return;
    }
    state.phase = 'fix';
    state.draft = null;
    renderPhases();
    renderCode('html');
    renderCode('css');
    renderAction({ kind: 'good', head: 'Juiste diagnose!', text: `${causeName(b.cause)}. Nu repareren.` });
    const ta = document.getElementById('fixer');
    if (ta) ta.focus({ preventScroll: true });
  }

  /* ---------- stap 3: repareren ---------- */
  // Klopt deze reparatie? Bouw de code met alleen déze bug door de speler gerepareerd en alle andere bugs goed,
  // en vergelijk het resultaat met de werkbon. Zo telt elke reparatie die hetzelfde oplevert.
  function fixWorks(bi, text) {
    const pick = (s) => (s.bug === bi ? text : job().bugs[s.bug].fix);
    const target = renderPrint(targetCode('html'), targetCode('css'));
    const mine = renderPrint(codeOf(state.segs.html, pick), codeOf(state.segs.css, pick));
    return target === mine;
  }

  function tryFix() {
    const b = job().bugs[state.current];
    const seg = bugSeg(state.current);
    const text = document.getElementById('fixer').value.replace(/\s+$/, '');
    if (norm(text) === norm(seg.text)) {
      renderAction({ kind: 'bad', head: 'Nog niets veranderd.', text: 'Pas de code aan om de bug te verwijderen.' });
      return;
    }
    if (!fixWorks(state.current, text)) {
      state.draft = text;
      renderAction({ kind: 'bad', head: 'De bug leeft nog.', text: `Met deze code ziet de site er nog niet uit zoals de werkbon. ${b.fixHint}` });
      return;
    }
    seg.text = text;
    seg.fixed = true;
    state.draft = null;
    state.current = -1;
    state.phase = openBugs().length ? 'locate' : 'done';
    refreshTally();
    renderAll();
    renderAction({ kind: 'good', head: 'Bug verwijderd!', text: b.why + (state.phase === 'locate' ? ' Er zit nog een bug in de code. Op naar de volgende!' : '') });
    scrollIntoViewIfNeeded(document.getElementById('action'));
  }

  app.addEventListener('click', (e) => {
    if (!state || !document.getElementById('action')) return;
    const line = e.target.closest('.line');
    if (line) { clickLine(line.dataset.file, Number(line.dataset.seg)); return; }
    const card = e.target.closest('.idcard');
    if (card && !card.disabled) chooseCause(card.dataset.cause);
  });

  /* ---------- tussenscherm: ronde afgerond ---------- */
  function renderLevelDone() {
    const i = state.level;
    const r = ROUNDS[i];
    const next = ROUNDS[i + 1];
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <div id="tally">${tally()}</div>
      <main class="sheet done">
        <p class="kicker">${r.tag} afgerond</p>
        <h2>${r.name}</h2>
        <p class="muted">${levelScore(i)} van ${levelMax(i)} punten bij de eerste poging</p>
        <p class="takeaway">${fmt(r.takeaway)}</p>
        <button class="btn" id="goNext">${next ? `Naar ${next.tag}: ${next.name} →` : 'Naar de factuur →'}</button>
      </main>`;
    document.getElementById('goNext').addEventListener('click', () => (next ? startLevel(i + 1) : finishGame()));
  }

  /* =========================================================
     EINDE — de factuur
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
      ${header()}
      <main class="end">
        <section class="invoice" aria-label="Factuur">
          <div class="inv-head"><b>FACTUUR</b><span>Bug Hunter B.V.</span></div>
          <p class="inv-line">Ongediertebestrijding · ${ALL_BUGS} bugs</p>
          <table>
            <thead><tr><th>Omschrijving</th><th>Punten</th></tr></thead>
            <tbody>${ROUNDS.map((r, i) => `<tr><td>${r.tag}: ${r.name}</td><td>${levelScore(i)} / ${levelMax(i)}</td></tr>`).join('')}</tbody>
            <tfoot><tr><td>Totaal (eerste poging)</td><td>${s} / ${MAX_SCORE}</td></tr></tfoot>
          </table>
          <p class="inv-due">Te betalen: <b>€ 0,00</b> <span>(stagiairs werken gratis)</span></p>
        </section>
        <section class="verdict">
          <div class="patch ${state.passed ? 'pass' : 'fail'}"><span>${state.passed ? 'Gecertificeerd' : 'Nog in'}</span><b>Bug<br>Hunter</b><span>${state.passed ? `${pct}%` : 'opleiding'}</span></div>
          <h2>${state.passed ? 'Je bent gecertificeerd!' : 'Bijna gecertificeerd'}</h2>
          <p>${state.passed
            ? 'Je vindt bugs, benoemt de oorzaak en repareert ze, in HTML én CSS. Op naar Code Detective!'
            : `Je hebt minimaal ${need} van ${MAX_SCORE} punten (80%) nodig bij de eerste poging. Lees de uitleg bij de bugs nog eens en ga opnieuw op pad. Je kunt het!`}</p>
          <div class="row">
            <button class="btn ghost" id="exit">← Terug naar de skilltree</button>
            <button class="btn" id="again">↺ Nieuwe dienst</button>
          </div>
        </section>
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
  window.bugHunter = Object.freeze({
    info: gameInfo,
    maxScore: MAX_SCORE,
    rounds: ROUNDS.map((r) => r.jobs.map((j) => ({ client: j.client, bugs: j.bugs.map((b) => ({ file: b.file, from: b.from, to: b.to, cause: b.cause, fix: b.fix })) }))),
    // Werkt deze reparatie voor bug `bi` van klus (level, idx)? En is de kapotte code echt anders dan de werkbon?
    check: (level, idx, bi, text) => {
      const j = ROUNDS[level].jobs[idx];
      const segs = { html: segmentsOf(j, 'html'), css: segmentsOf(j, 'css') };
      const fixOf = (s) => j.bugs[s.bug].fix;
      const target = renderPrint(codeOf(segs.html, fixOf), codeOf(segs.css, fixOf));
      if (bi == null) {
        // per bug: alleen die ene bug kapot laten moet een zichtbaar verschil geven
        return j.bugs.map((_, b) => renderPrint(codeOf(segs.html, (s) => (s.bug === b ? s.text : fixOf(s))), codeOf(segs.css, (s) => (s.bug === b ? s.text : fixOf(s)))) !== target);
      }
      const pick = (s) => (s.bug === bi ? text : fixOf(s));
      return renderPrint(codeOf(segs.html, pick), codeOf(segs.css, pick)) === target;
    },
    snapshot: () => state && JSON.parse(JSON.stringify({
      round: state.round, level: state.level, idx: state.idx, phase: state.phase, current: state.current,
      score: score(), finished: state.finished, passed: !!state.passed, reported: state.reported
    }))
  });

  renderStart();
})();
