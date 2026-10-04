/* =========================================================
   Style Lab — educatieve game (Bloom: Toepassen)
   Thema: het lab. Elke opdracht is een experiment: maak met een CSS-recept
   jouw monster gelijk aan het referentiemonster, en laat het analyseren.
   ========================================================= */

/* ---------- vaste gamestekker ---------- */
const gameInfo = {
  gameId: 'style-lab',
  learningGoal: 'De leerling kan eenvoudige CSS-properties (color, background, font-size, font-weight, border, border-radius, padding en margin) en selectors toepassen om HTML-elementen visueel vorm te geven.',
  bloom: 'Toepassen',
  successCriterion: 'De speler voltooit alle drie de reeksen en laat minimaal 80% van de experimenten bij de eerste analyse slagen.'
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
  const COLOR_PROPS = ['color', 'background'];

  function scrollIntoViewIfNeeded(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 8 || r.bottom > window.innerHeight - 8) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------- de petrischaaltjes: een mini-pagina in een eigen shadow root ---------- */
  const DISH_CSS = `
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .dish { padding: 16px; font: 15px/1.4 "Nunito", system-ui, sans-serif; color: #1d3a40; }
    /* :where() = specificiteit 0: elke regel van de speler wint van deze basisstijl */
    :where(.dish) h1 { font-size: 24px; margin: 0 0 6px; }
    :where(.dish) h2 { font-size: 18px; margin: 0 0 6px; }
    :where(.dish) p { margin: 0 0 8px; }
    :where(.dish p:last-child) { margin-bottom: 0; }
    :where(.dish) button { font: inherit; padding: 6px 12px; border: 1px solid #9fb5b8; border-radius: 0; background: #edf3f4; color: #1d3a40; }
    :where(.dish button + button) { margin-left: 8px; }`;

  /* ---------- inhoud ---------- */
  // Elk experiment: HTML, het referentiemonster (`target`), de eisen (`checks`) en het materiaal.
  //  - reeks 1 (pick):  één flesje kiezen uit `bottles` voor de regel `selector`.
  //  - reeks 2 (mix):   property-flesjes uit `palette` + per property een waarde; soms ook de selector kiezen.
  //  - reeks 3 (write): zelf de CSS typen, vanaf `start`.
  // checks: { label, sel, groups } — `groups` uit GROUPS; `hint` overschrijft de standaard-aanwijzing.
  const LEVELS = [
    {
      name: 'Eén property',
      series: 'Reeks A',
      mode: 'pick',
      goal: 'Kies het ene flesje dat precies doet wat de opdracht vraagt.',
      takeaway: 'Elke property doet één ding: `color` kleurt de tekst, `background` het vlak erachter, `font-size` maakt tekst groter en `border-radius` rondt de hoeken af.',
      summary: 'h1      { color: red; }\n.note   { background: gold; }\np       { font-size: 24px; }\nbutton  { border-radius: 12px; }',
      experiments: [
        {
          title: 'Een rode titel',
          task: 'Maak de titel rood.',
          html: '<h1>Welkom in het lab</h1>\n<p>Vandaag testen we CSS.</p>',
          selector: 'h1',
          target: 'h1 { color: red; }',
          checks: [{ label: 'De titel is rood', sel: 'h1', groups: ['color'] }],
          bottles: ['color: red', 'background: red', 'border: 3px solid red', 'font-weight: bold'],
          good: '`color` bepaalt de kleur van de tekst zelf. `background` zou het vlak áchter de tekst kleuren.'
        },
        {
          title: 'Een gele melding',
          task: 'Geef de melding een gele (gold) achtergrond.',
          html: '<p class="note">Let op: draag altijd een labjas!</p>',
          selector: '.note',
          target: '.note { background: gold; }',
          checks: [{ label: 'De melding heeft een gele achtergrond', sel: '.note', groups: ['background'] }],
          bottles: ['color: gold', 'background: gold', 'border: 3px solid gold', 'padding: 12px'],
          good: '`background` kleurt het hele vlak van het element, áchter de tekst.'
        },
        {
          title: 'Leesbare tekst',
          task: 'De tekst is veel te klein. Maak hem 24px groot.',
          html: '<h2>Proef 3</h2>\n<p>Deze tekst is te klein om te lezen.</p>',
          base: ':where(.dish) p { font-size: 11px; }',
          selector: 'p',
          target: 'p { font-size: 24px; }',
          checks: [{ label: 'De tekst is 24px groot', sel: 'p', groups: ['font-size'] }],
          bottles: ['font-size: 24px', 'font-weight: bold', 'padding: 24px', 'margin: 24px'],
          good: '`font-size` bepaalt hoe groot de letters zijn. `font-weight` maakt ze alleen dikker, niet groter.'
        },
        {
          title: 'Ronde hoeken',
          task: 'Geef de knop afgeronde hoeken.',
          html: '<button>Start experiment</button>',
          selector: 'button',
          target: 'button { border-radius: 12px; }',
          checks: [{ label: 'De knop heeft ronde hoeken', sel: 'button', groups: ['border-radius'] }],
          bottles: ['border-radius: 12px', 'border: 12px solid teal', 'padding: 12px', 'margin: 12px'],
          good: '`border-radius` rondt de hoeken van een element af. Hoe groter de waarde, hoe ronder.'
        }
      ]
    },
    {
      name: 'Meerdere properties',
      series: 'Reeks B',
      mode: 'mix',
      goal: 'Combineer properties en kies zelf de waarden — en soms de selector.',
      takeaway: 'Een regel kan meerdere properties hebben. De selector bepaalt wélke elementen ze krijgen: `p` kiest alle alinea\'s, `.tip` alleen elementen met `class="tip"`.',
      summary: '.cta {\n  background: purple;\n  color: white;\n  border-radius: 8px;\n}\n.tip {\n  font-weight: bold;\n  color: green;\n}',
      experiments: [
        {
          title: 'Een opvallende knop',
          task: 'Maak van de knop een duidelijke call-to-action.',
          html: '<button class="cta">Doe mee!</button>',
          selector: '.cta',
          target: '.cta { background: purple; color: white; border-radius: 8px; }',
          checks: [
            { label: 'Paarse achtergrond', sel: '.cta', groups: ['background'] },
            { label: 'Witte tekst', sel: '.cta', groups: ['color'] },
            { label: 'Afgeronde hoeken', sel: '.cta', groups: ['border-radius'] }
          ],
          palette: { color: ['white', 'purple', 'black'], background: ['purple', 'white', 'gold'], 'border-radius': ['8px', '50%'], 'font-weight': ['bold'], margin: ['16px'] },
          good: 'Drie properties in één regel: `background` voor het vlak, `color` voor de tekst en `border-radius` voor de hoeken.'
        },
        {
          title: 'Een nette kaart',
          task: 'Geef de kaart ruimte tussen de rand en de tekst, een dunne teal rand en ronde hoeken.',
          html: '<div class="card">\n  <h2>Proef 7</h2>\n  <p>Water + kleurstof = blauw.</p>\n</div>',
          selector: '.card',
          target: '.card { padding: 16px; border: 2px solid teal; border-radius: 12px; }',
          checks: [
            { label: '16px ruimte binnen de rand', sel: '.card', groups: ['padding'] },
            { label: 'Een rand van 2px, teal', sel: '.card', groups: ['border'] },
            { label: 'Ronde hoeken', sel: '.card', groups: ['border-radius'] }
          ],
          palette: { background: ['teal'], border: ['2px solid teal', '6px dashed teal'], 'border-radius': ['12px', '50%'], padding: ['16px', '2px'], margin: ['16px'] },
          good: '`padding` maakt ruimte bínnen de rand, `border` tekent de rand zelf en `border-radius` rondt hem af.'
        },
        {
          title: 'Alleen de tip',
          task: 'Maak alléén de tip vet en groen. De andere tekst blijft zoals hij is. Kies eerst de juiste selector.',
          html: '<h2>Resultaten</h2>\n<p>Alle buisjes zijn getest.</p>\n<p class="tip">Tip: was je handen na de proef.</p>',
          selectors: ['h2', 'p', '.tip'],
          target: '.tip { font-weight: bold; color: green; }',
          checks: [
            { label: 'De tip is vet', sel: '.tip', groups: ['font-weight'] },
            { label: 'De tip is groen', sel: '.tip', groups: ['color'] },
            { label: 'De andere tekst blijft gewoon', sel: 'h2, p:not(.tip)', groups: 'all',
              hint: 'Je recept verandert ook andere tekst. `p` kiest álle alinea\'s en `h2` de kop. Welke selector kiest alleen het element met `class="tip"`?' }
          ],
          palette: { color: ['green', 'red'], background: ['green'], 'font-size': ['20px'], 'font-weight': ['bold', 'normal'] },
          good: 'Een selector met een punt, zoals `.tip`, kiest alleen elementen met die class. Zo raak je precies één alinea.'
        },
        {
          title: 'Een statuslabel',
          task: 'Maak van "Geslaagd" een groen pil-label met witte tekst en wat ruimte rondom de tekst.',
          html: '<p>Status: <span class="badge">Geslaagd</span></p>',
          selector: '.badge',
          target: '.badge { background: green; color: white; padding: 2px 10px; border-radius: 999px; }',
          checks: [
            { label: 'Groene achtergrond', sel: '.badge', groups: ['background'] },
            { label: 'Witte tekst', sel: '.badge', groups: ['color'] },
            { label: 'Ruimte rond de tekst (2px boven/onder, 10px opzij)', sel: '.badge', groups: ['padding'] },
            { label: 'Helemaal ronde uiteinden', sel: '.badge', groups: ['border-radius'] }
          ],
          palette: { color: ['white', 'green'], background: ['green', 'white'], padding: ['2px 10px', '10px 2px'], margin: ['2px 10px'], 'border-radius': ['999px', '4px'] },
          good: 'Een `padding` met twee waarden betekent: eerst boven/onder, dan links/rechts. Met een grote `border-radius` worden de uiteinden helemaal rond.'
        }
      ]
    },
    {
      name: 'Zelf invullen',
      series: 'Reeks C',
      mode: 'write',
      goal: 'Geen flesjes meer: schrijf het recept zelf.',
      takeaway: 'Je schrijft nu zelf CSS: een selector, accolades `{ }` en per regel een property, een dubbele punt, een waarde en een puntkomma.',
      summary: '.buy {\n  background: green;\n  color: white;\n}\n\nh2 {\n  color: purple;\n  font-size: 28px;\n}',
      experiments: [
        {
          title: 'Een foutmelding',
          task: 'Maak er een duidelijke foutmelding van. De selector staat er al; schrijf de properties zelf.',
          html: '<p class="error">Oeps! Het reageerbuisje is gebroken.</p>',
          start: '.error {\n  \n}',
          target: '.error { color: darkred; background: mistyrose; padding: 12px; }',
          checks: [
            { label: 'Tekstkleur `darkred`', sel: '.error', groups: ['color'] },
            { label: 'Achtergrond `mistyrose`', sel: '.error', groups: ['background'] },
            { label: '`12px` ruimte binnen het vlak', sel: '.error', groups: ['padding'] }
          ],
          good: '`color`, `background` en `padding` zonder hulp geschreven. Elke regel: property, dubbele punt, waarde, puntkomma.'
        },
        {
          title: 'Een ronde foto',
          task: 'Geef de foto een rand en maak hem helemaal rond.',
          html: '<div class="avatar">🧪</div>',
          base: ':where(.avatar) { width: 80px; height: 80px; background: #dff5f1; font-size: 38px; text-align: center; line-height: 80px; }',
          start: '.avatar {\n  \n}',
          target: '.avatar { border: 3px solid teal; border-radius: 50%; }',
          checks: [
            { label: 'Rand: `3px`, `solid`, `teal`', sel: '.avatar', groups: ['border'] },
            { label: 'Helemaal rond: `50%`', sel: '.avatar', groups: ['border-radius'] }
          ],
          good: 'De `border`-shorthand neemt drie waarden: dikte, stijl en kleur. `border-radius: 50%` maakt van een vierkant een cirkel.'
        },
        {
          title: 'De juiste knop',
          task: 'Maak alléén de knop "Bestellen" groen met witte tekst. Schrijf nu ook de selector zelf: de knop heeft `class="buy"`.',
          html: '<button>Annuleren</button>\n<button class="buy">Bestellen</button>',
          start: '',
          target: '.buy { background: green; color: white; }',
          checks: [
            { label: 'Bestellen: achtergrond `green`', sel: '.buy', groups: ['background'] },
            { label: 'Bestellen: tekst `white`', sel: '.buy', groups: ['color'] },
            { label: 'Annuleren blijft zoals hij is', sel: 'button:not(.buy)', groups: 'all',
              hint: 'Je recept verandert ook de knop Annuleren. `button` kiest álle knoppen. Hoe schrijf je een selector voor een class?' }
          ],
          good: 'Een class-selector schrijf je met een punt: `.buy`. Zo raak je alleen de knop met `class="buy"`.'
        },
        {
          title: 'Het eindexperiment',
          task: 'Style de kaart én de titel. Schrijf twee regels: één voor `.card` en één voor `h2`.',
          html: '<div class="card">\n  <h2>Eindproef</h2>\n  <p>Alles in het lab werkt!</p>\n</div>',
          start: '',
          target: '.card { padding: 20px; margin: 10px; border: 2px solid purple; }\nh2 { color: purple; font-size: 28px; }',
          checks: [
            { label: 'Kaart: `20px` ruimte binnen de rand', sel: '.card', groups: ['padding'] },
            { label: 'Kaart: `10px` ruimte buiten de rand', sel: '.card', groups: ['margin'] },
            { label: 'Kaart: rand `2px solid purple`', sel: '.card', groups: ['border'] },
            { label: 'Titel: kleur `purple`', sel: 'h2', groups: ['color'] },
            { label: 'Titel: `28px` groot', sel: 'h2', groups: ['font-size'] }
          ],
          good: 'Twee regels, elk met hun eigen selector. `padding` zit binnen de rand, `margin` erbuiten.'
        }
      ]
    }
  ];

  // Elk experiment = 1 punt, als de eerste analyse meteen slaagt.
  const LEVEL_TASKS = LEVELS.map((l) => l.experiments.length);
  const MAX_SCORE = LEVEL_TASKS.reduce((a, b) => a + b, 0);
  const PASS_RATIO = 0.8;

  /* ---------- analyse: computed styles van beide monsters vergelijken ---------- */
  const SIDES = ['top', 'right', 'bottom', 'left'];
  const CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
  const GROUPS = {
    color: (cs) => cs.color,
    background: (cs) => cs.backgroundColor,
    'font-size': (cs) => cs.fontSize,
    'font-weight': (cs) => cs.fontWeight,
    // Zonder randstijl telt de rand niet mee (dan doen dikte en kleur niets).
    border: (cs) => SIDES.map((s) => cs.getPropertyValue(`border-${s}-style`) === 'none' ? 'none'
      : ['width', 'style', 'color'].map((k) => cs.getPropertyValue(`border-${s}-${k}`)).join(' ')).join('|'),
    'border-radius': (cs) => CORNERS.map((c) => cs.getPropertyValue(`border-${c}-radius`)).join('|'),
    padding: (cs) => SIDES.map((s) => cs.getPropertyValue(`padding-${s}`)).join('|'),
    margin: (cs) => SIDES.map((s) => cs.getPropertyValue(`margin-${s}`)).join('|')
  };
  const GROUP_NAMES = Object.keys(GROUPS);

  function mountDish(host, x, css) {
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${DISH_CSS}\n${x.base || ''}</style><style data-recipe></style><div class="dish">${x.html}</div>`;
    root.querySelector('style[data-recipe]').textContent = css;
    return root;
  }
  const elementsOf = (root) => [...root.querySelector('.dish').querySelectorAll('*')];
  const styleMap = (root) => elementsOf(root).map((el) => {
    const cs = getComputedStyle(el);
    return Object.fromEntries(GROUP_NAMES.map((g) => [g, GROUPS[g](cs)]));
  });

  // Een onzichtbaar schaaltje voor het monster zonder recept: wat heeft de speler veranderd?
  function baseMap(x) {
    const host = document.createElement('div');
    host.className = 'offstage';
    document.body.appendChild(host);
    const m = styleMap(mountDish(host, x, ''));
    host.remove();
    return m;
  }

  function analyse(x, targetRoot, mineRoot) {
    const want = styleMap(targetRoot);
    const have = styleMap(mineRoot);
    const base = baseMap(x);
    const els = elementsOf(mineRoot);
    const indexOf = (sel) => { const hit = new Set(mineRoot.querySelectorAll('.dish ' + sel.split(',').join(', .dish '))); return els.map((el, i) => (hit.has(el) ? i : -1)).filter((i) => i >= 0); };
    const groupsOf = (c) => (c.groups === 'all' ? GROUP_NAMES : c.groups);
    const checks = x.checks.map((c) => {
      const idx = indexOf(c.sel);
      const fails = [];
      for (const i of idx) for (const g of groupsOf(c)) if (have[i][g] !== want[i][g]) fails.push({ i, g });
      return { ...c, ok: fails.length === 0, fails };
    });
    // Alles wat verder nog afwijkt (een property te veel, of op een element zonder eis).
    const extras = [];
    have.forEach((h, i) => GROUP_NAMES.forEach((g) => {
      if (h[g] !== want[i][g] && !checks.some((c) => c.fails.some((f) => f.i === i && f.g === g))) extras.push({ i, g });
    }));
    const changed = (i, g) => have[i][g] !== base[i][g];
    return { ok: checks.every((c) => c.ok) && !extras.length, checks, extras, changed, els, have, want, root: mineRoot };
  }

  /* ---------- aanwijzingen van de laborant ---------- */
  const WHAT = {
    color: 'de tekstkleur', background: 'de achtergrond', 'font-size': 'de lettergrootte', 'font-weight': 'de letterdikte',
    border: 'de rand', 'border-radius': 'de hoeken', padding: 'de ruimte binnen de rand', margin: 'de ruimte buiten de rand'
  };
  const ASK = {
    color: 'Welke property kleurt de tekst zelf?',
    background: 'Welke property kleurt het vlak áchter de tekst?',
    'font-size': 'Welke property maakt letters groter of kleiner?',
    'font-weight': 'Welke property maakt letters dikker (vet)?',
    border: 'Welke property tekent een rand om het element?',
    'border-radius': 'Welke property rondt de hoeken af?',
    padding: 'Welke property maakt ruimte bínnen de rand, tussen de rand en de inhoud?',
    margin: 'Welke property maakt ruimte búiten de rand?'
  };
  // Bekende verwarringen: de speler veranderde `wrong` terwijl de eis over `want` ging.
  const MIXUP = {
    color: { background: 'Je hebt de áchtergrond gekleurd, maar de eis gaat over de tekst.', border: 'Je hebt de rand gekleurd, maar de eis gaat over de tekst.' },
    background: { color: 'Je hebt de tekst gekleurd, maar de eis gaat over het vlak erachter.', border: 'Je hebt een rand getekend, maar de eis gaat over het hele vlak.' },
    'font-size': { 'font-weight': 'Je letters zijn dikker geworden, maar niet groter.', padding: 'Je hebt ruimte rond de tekst gemaakt, maar de letters zelf zijn niet groter.' },
    'font-weight': { 'font-size': 'Je letters zijn groter geworden, maar niet dikker.' },
    'border-radius': { border: 'Je hebt een rand getekend, maar de hoeken zijn nog niet rond.', padding: 'Je hebt ruimte binnenin gemaakt, maar de hoeken zijn nog niet rond.' },
    padding: { margin: 'Je hebt ruimte búiten de rand gemaakt (`margin`), maar de eis gaat over ruimte bínnen de rand.' },
    margin: { padding: 'Je hebt ruimte bínnen de rand gemaakt (`padding`), maar de eis gaat over ruimte búiten de rand.' },
    border: { background: 'Je hebt het vlak gekleurd, maar de eis gaat over een rand.', 'border-radius': 'Je hebt de hoeken afgerond, maar er is nog geen rand.' }
  };

  // Hoe heet dit element in de HTML? Bijvoorbeeld `<p class="error">`.
  const nameOf = (el) => `\`<${el.tagName.toLowerCase()}${el.className ? ` class="${el.className}"` : ''}>\``;
  const cap = (t) => t[0].toUpperCase() + t.slice(1);

  function hintFor(x, res, css) {
    // Een selector die niets raakt verklaart alles wat verder misgaat.
    for (const m of (css || '').matchAll(/([^{}]+)\{/g)) {
      const sel = m[1].trim();
      let hits = 1;
      try { hits = res.root.querySelectorAll('.dish ' + sel.split(',').join(', .dish ')).length; } catch (_) { /* ongeldige selector: dat meldt de laborant */ }
      if (!hits) {
        let cls = 0;
        try { cls = /^[a-z][\w-]*$/i.test(sel) ? res.root.querySelectorAll('.dish .' + sel).length : 0; } catch (_) { /* negeren */ }
        return `\`${sel}\` raakt geen enkel element in het monster.${cls ? ` Er is wel een element met \`class="${sel}"\`: een class-selector begint met een punt.` : ' Kijk in de HTML welke elementen en classes er zijn.'}`;
      }
    }
    const failed = res.checks.find((c) => !c.ok);
    if (failed) {
      if (failed.hint) return failed.hint;
      const { i, g } = failed.fails[0];
      const el = nameOf(res.els[i]);
      const other = g === 'color' ? 'background' : g === 'background' ? 'color' : null;
      if (other && res.have[i][g] === res.want[i][other] && res.have[i][other] === res.want[i][g]) {
        return `Bij ${el} zijn de tekstkleur en de achtergrondkleur omgewisseld. \`color\` is de tekst, \`background\` het vlak erachter.`;
      }
      for (const [wrong, msg] of Object.entries(MIXUP[g] || {})) {
        if (res.extras.some((e) => e.i === i && e.g === wrong)) return `${msg} ${ASK[g]}`;
      }
      if (g === 'border' && !res.changed(i, g) && /border\s*:/.test(css || '')) {
        return `Er staat wel een \`border\` in je recept, maar je ziet geen rand. Een rand heeft drie dingen nodig: een dikte, een stijl (zoals \`solid\`) en een kleur.`;
      }
      if (res.changed(i, g)) return `Je past ${WHAT[g]} van ${el} al aan, maar de waarde klopt nog niet. Vergelijk je monster goed met de referentie.`;
      return `${cap(WHAT[g])} van ${el} klopt nog niet. ${ASK[g]}`;
    }
    const e = res.extras[0];
    return `Alle eisen kloppen, maar je recept verandert ook ${WHAT[e.g]} van ${nameOf(res.els[e.i])}, en dat zit niet in de referentie. Haal dat ingrediënt weg.`;
  }

  /* ---------- reeks 3: de laborant leest mee terwijl je typt ---------- */
  const KNOWN = ['color', 'background', 'background-color', 'font-size', 'font-weight', 'border', 'border-radius', 'padding', 'margin', 'border-color', 'border-width', 'border-style'];
  function closest(word) {
    const d = (a, b) => {
      const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
      for (let j = 1; j <= b.length; j++) m[0][j] = j;
      for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
        m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      return m[a.length][b.length];
    };
    const best = KNOWN.map((k) => [k, d(word, k)]).sort((a, b) => a[1] - b[1])[0];
    return best[1] <= 3 ? best[0] : null;
  }
  function lint(css) {
    const notes = [];
    const opens = (css.match(/\{/g) || []).length;
    const closes = (css.match(/\}/g) || []).length;
    if (opens !== closes) notes.push(opens > closes ? 'Er mist een sluitende accolade `}`.' : 'Er staat een `}` te veel, of er mist een `{`.');
    const ruleRe = /([^{}]*)\{([^{}]*)\}?/g;
    let m;
    while ((m = ruleRe.exec(css))) {
      const sel = m[1].trim();
      if (!sel) { if (m[2].trim()) notes.push('Er staat een regel zonder selector. Wat moet deze CSS kiezen?'); }
      else {
        try { document.createDocumentFragment().querySelector(sel); } catch (_) { notes.push(`\`${sel}\` is geen geldige selector.`); }
      }
      for (const raw of m[2].split(';')) {
        const decl = raw.trim();
        if (!decl) continue;
        if (!decl.includes(':')) { notes.push(`\`${decl}\` mist een dubbele punt \`:\` tussen property en waarde.`); continue; }
        const prop = propOf(decl).toLowerCase();
        const val = valOf(decl);
        if (!val) { notes.push(`\`${prop}\` heeft nog geen waarde.`); continue; }
        if (!CSS.supports(prop, 'initial')) {
          const s = closest(prop);
          notes.push(`De browser kent de property \`${prop}\` niet.${s ? ` Bedoel je \`${s}\`?` : ''}`);
        } else if (/\n/.test(val) && /:/.test(val)) {
          notes.push(`Na \`${prop}: ${val.split('\n')[0].trim()}\` mist een puntkomma \`;\`.`);
        } else if (!CSS.supports(prop, val)) {
          notes.push(`\`${val}\` is geen geldige waarde voor \`${prop}\`.`);
        }
      }
      if (m.index === ruleRe.lastIndex) ruleRe.lastIndex++;
    }
    return notes.slice(0, 3);
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
      decls: [],            // reeks 1 & 2: gekozen declaraties ('prop: waarde' of 'prop:' zonder waarde)
      selector: null,       // reeks 2: gekozen selector
      text: '',             // reeks 3: getypt recept
      solved: false,
      last: null            // laatste analyse
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
  const experiment = () => LEVELS[state.level].experiments[state.idx];
  const mode = () => LEVELS[state.level].mode;

  /* ---------- kop + buisjesrek ---------- */
  const FLASK = '<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><path d="M24 6h16M27 6v16L12 50a6 6 0 0 0 5 8h30a6 6 0 0 0 5-8L37 22V6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 44h30l4 8a3 3 0 0 1-3 4H16a3 3 0 0 1-3-4z" fill="currentColor" opacity=".35"/><circle cx="27" cy="38" r="2.5" fill="currentColor"/><circle cx="35" cy="32" r="1.8" fill="currentColor"/></svg>';

  function header() {
    return `
      <header class="lab-head">
        <div class="lab-title">${FLASK}<div><h1>Style Lab</h1><p>Geef elementen met CSS precies de juiste stijl.</p></div></div>
        <div class="lab-badge"><span>Bloom</span><b>Toepassen</b></div>
      </header>`;
  }

  // Elk experiment een reageerbuisje: gevuld bij succes (vol bij de eerste keer), bubbelend wanneer je ermee bezig bent.
  function rack() {
    return `<nav class="rack" aria-label="Voortgang">${LEVELS.map((l, li) => `
      <div class="rack-group"><span class="rack-label">${l.series}</span><div class="tubes">${l.experiments.map((_, xi) => {
        const t = state.tasks[taskKey(li, xi)];
        const cur = li === state.level && xi === state.idx && !state.finished;
        const cls = t && t.done ? (t.first ? 'full' : 'half') : cur ? 'current' : t ? 'tried' : '';
        const label = `Experiment ${li + 1}.${xi + 1}${t && t.done ? (t.first ? ': in één keer geslaagd' : ': geslaagd na nieuwe poging') : cur ? ': nu bezig' : ''}`;
        return `<span class="tube ${cls}" role="img" aria-label="${label}"><i></i></span>`;
      }).join('')}</div></div>`).join('')}
      <span class="rack-score">${score()} / ${MAX_SCORE} in één keer</span></nav>`;
  }
  function refreshRack() {
    const el = document.getElementById('rack');
    if (el) el.innerHTML = rack();
  }

  /* ---------- startscherm ---------- */
  function renderStart() {
    window.scrollTo(0, 0);
    const need = Math.ceil(MAX_SCORE * PASS_RATIO);
    app.innerHTML = `
      ${header()}
      <main class="panel intro">
        <p class="eyebrow">Skill 3 van 8 · Toepassen</p>
        <h2>Welkom in het lab!</h2>
        <p class="lead">In <b>Build the DOM</b> bouwde je de structuur van een pagina. Nu geef je die elementen met CSS hun stijl: kleur, grootte, randen en ruimte. Elke opdracht is een <b>experiment</b>: maak <b>jouw monster</b> precies gelijk aan het <b>referentiemonster</b>.</p>

        <div class="intro-grid">
          <section class="card-lab">
            <h3>Een CSS-recept</h3>
            <pre class="code">${codeHtml('h1 {\n  color: red;\n}')}</pre>
            <ul class="anatomy">
              <li><span class="sw sw-sel"></span><b>selector</b>: wélk element (hier alle <code>&lt;h1&gt;</code>)</li>
              <li><span class="sw sw-prop"></span><b>property</b>: wát je verandert (de tekstkleur)</li>
              <li><span class="sw sw-val"></span><b>waarde</b>: hoe het wordt (rood)</li>
            </ul>
          </section>
          <section class="card-lab">
            <h3>Zo werkt het lab</h3>
            <ol class="steps">
              <li>Lees het experiment en bekijk het <b>referentiemonster</b>.</li>
              <li>Maak je <b>recept</b>: met flesjes, en later helemaal zelf.</li>
              <li>Je monster verandert meteen mee.</li>
              <li>Klik op <b>Analyseer</b>. Het labrapport laat zien welke eisen kloppen.</li>
            </ol>
          </section>
        </div>

        <div class="series">
          ${LEVELS.map((l) => `<div class="series-card"><span class="series-tag">${l.series}</span><b>${l.name}</b><span>${l.goal}</span></div>`).join('')}
        </div>

        <p class="rule">🧪 <b>${MAX_SCORE} experimenten.</b> Alleen je <b>eerste analyse</b> per experiment telt. Slagen er minimaal <b>${need}</b> (80%) in één keer, dan heb je de game behaald.</p>
        <button class="btn" id="startBtn">Zet je veiligheidsbril op →</button>
      </main>`;
    document.getElementById('startBtn').addEventListener('click', () => {
      newRound();
      startLevel(0);
    });
  }

  // Simpele kleuring van CSS-code.
  function codeHtml(css) {
    return esc(css)
      .replace(/^([^{\n]+)(\{)/gm, '<span class="c-sel">$1</span>$2')
      .replace(/([a-z-]+)(\s*:\s*)([^;\n]*)(;?)/g, '<span class="c-prop">$1</span>$2<span class="c-val">$3</span>$4');
  }

  function startLevel(i) {
    state.level = i;
    state.idx = 0;
    startExperiment();
  }

  function startExperiment() {
    const x = experiment();
    state.decls = [];
    state.selector = x.selectors ? null : x.selector;
    state.text = x.start || '';
    state.solved = false;
    state.last = null;
    renderExperiment();
  }

  /* =========================================================
     EXPERIMENT
     ========================================================= */
  // Het recept van de speler als CSS.
  function recipe() {
    if (mode() === 'write') return state.text;
    const decls = state.decls.filter((d) => valOf(d));
    if (!state.selector || !decls.length) return '';
    return `${state.selector} { ${decls.map((d) => d + ';').join(' ')} }`;
  }
  const hasRecipe = () => recipe().replace(/\/\*[\s\S]*?\*\//g, '').match(/[a-z-]+\s*:\s*[^;{}\s]/i);

  function renderExperiment() {
    const x = experiment();
    const lvl = LEVELS[state.level];
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <div id="rack">${rack()}</div>
      <div class="bench">
        <section class="panel brief">
          <p class="eyebrow">${lvl.series} · ${lvl.name} · Experiment ${state.level + 1}.${state.idx + 1}</p>
          <h2>${esc(x.title)}</h2>
          <p class="task">${fmt(x.task)}</p>
        </section>
        <section class="panel workbench" aria-label="Recept">
          <div class="panel-head"><span>Recept</span><span class="muted">CSS</span></div>
          <div id="recipe"></div>
          <div id="material"></div>
          <details class="html-peek"><summary>Bekijk de HTML van het monster</summary><pre class="code">${esc(x.html)}</pre></details>
        </section>
        <section class="dishes" aria-label="Monsters">
          <figure class="dish-wrap ref"><figcaption><span class="tag">Referentie</span>zo moet het worden</figcaption><div class="petri"><div id="targetDish"></div></div></figure>
          <figure class="dish-wrap mine"><figcaption><span class="tag">Jouw monster</span>verandert meteen mee</figcaption><div class="petri"><div id="mineDish"></div></div></figure>
        </section>
        <section class="panel report" aria-label="Labrapport">
          <div class="panel-head"><span>Labrapport</span><span class="muted" id="reportState">nog niet geanalyseerd</span></div>
          <ul class="checks" id="checks"></ul>
          <div class="report-note" id="note" aria-live="polite"></div>
          <div class="report-actions" id="actions"><button class="btn" id="analyseBtn" type="button">🔬 Analyseer</button></div>
        </section>
      </div>`;
    mountDish(document.getElementById('targetDish'), x, x.target);
    mountDish(document.getElementById('mineDish'), x, recipe());
    renderRecipe();
    renderMaterial();
    renderChecks();
    document.getElementById('analyseBtn').addEventListener('click', runAnalysis);
    syncAnalyse();
  }

  function renderChecks() {
    const res = state.last;
    document.getElementById('checks').innerHTML = experiment().checks.map((c, i) => {
      const st = res ? (res.checks[i].ok ? 'ok' : 'bad') : '';
      return `<li class="${st}"><span class="dot" aria-hidden="true">${st === 'ok' ? '✓' : st === 'bad' ? '✗' : ''}</span>${fmt(c.label)}${st ? `<span class="sr-only">${st === 'ok' ? ' — klopt' : ' — klopt nog niet'}</span>` : ''}</li>`;
    }).join('');
    document.getElementById('reportState').textContent = !res ? 'nog niet geanalyseerd' : res.ok ? 'geslaagd' : 'nog niet geslaagd';
  }

  function updateMine() {
    document.getElementById('mineDish').shadowRoot.querySelector('style[data-recipe]').textContent = recipe();
    if (state.last && !state.solved) { state.last = null; renderChecks(); }   // oud rapport geldt niet meer
    syncAnalyse();
  }
  function syncAnalyse() {
    const b = document.getElementById('analyseBtn');
    if (b) b.disabled = state.solved || !hasRecipe();
  }
  function bubble() {
    const p = document.querySelector('.dish-wrap.mine .petri');
    p.classList.remove('fizz');
    void p.offsetWidth;
    p.classList.add('fizz');
  }

  /* ---------- het recept tonen ---------- */
  function renderRecipe() {
    const x = experiment();
    const el = document.getElementById('recipe');
    const m = mode();
    if (m === 'write') {
      el.innerHTML = `
        <label class="sr-only" for="editor">Jouw CSS</label>
        <textarea id="editor" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="/* schrijf hier je CSS */"${state.solved ? ' readonly' : ''}>${esc(state.text)}</textarea>
        <div class="assistant" id="assistant" aria-live="polite"></div>`;
      const ta = document.getElementById('editor');
      ta.addEventListener('input', () => { state.text = ta.value; updateMine(); renderLint(); });
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !e.shiftKey) {   // Tab = twee spaties, zoals in een echte editor
          e.preventDefault();
          const s = ta.selectionStart;
          ta.setRangeText('  ', s, ta.selectionEnd, 'end');
          ta.dispatchEvent(new Event('input'));
        }
      });
      renderLint();
      return;
    }
    const lines = state.decls.map((d, i) => {
      const p = propOf(d);
      const v = valOf(d);
      const rm = m === 'mix' && !state.solved ? `<button type="button" class="rm" data-rm="${i}" aria-label="Haal ${esc(p)} weg">×</button>` : '';
      return `<div class="line${state.fresh === p ? ' drip' : ''}">  <span class="c-prop">${esc(p)}</span>: ${v ? `<span class="c-val">${esc(v)}</span>` : '<span class="blank">kies een waarde</span>'};${rm}</div>`;
    }).join('');
    state.fresh = null;
    const sel = x.selectors
      ? `<span class="sel-pick" role="radiogroup" aria-label="Kies de selector">${x.selectors.map((s) => `<button type="button" role="radio" class="sel-btn${state.selector === s ? ' on' : ''}" data-sel="${esc(s)}" aria-checked="${state.selector === s}"${state.solved ? ' disabled' : ''}>${esc(s)}</button>`).join('')}</span>`
      : `<span class="c-sel">${esc(state.selector)}</span>`;
    el.innerHTML = `<div class="code recipe-code">${sel} {\n${lines || `<div class="line empty">  <span class="blank">${m === 'pick' ? 'giet hier één flesje in' : 'kies flesjes uit het rek'}</span></div>`}}</div>`;
  }

  function renderLint() {
    const box = document.getElementById('assistant');
    if (!box) return;
    const notes = lint(state.text);
    box.className = 'assistant' + (notes.length ? ' warn' : state.text.trim() ? ' fine' : '');
    box.innerHTML = notes.length
      ? `<span class="who">Laborant:</span> ${notes.map(fmt).join(' ')}`
      : state.text.trim() ? '<span class="who">Laborant:</span> je CSS ziet er geldig uit.' : '<span class="who">Laborant:</span> ik lees mee terwijl je typt.';
  }

  /* ---------- het materiaal: flesjes, waarden of de labkaart ---------- */
  const SWATCH = (v) => `<i class="swatch" style="background:${esc(v)}"></i>`;

  function renderMaterial() {
    const x = experiment();
    const el = document.getElementById('material');
    const m = mode();
    if (m === 'pick') {
      el.innerHTML = `
        <div class="panel-head sub"><span>Flesjesrek</span><span class="muted">kies er één</span></div>
        <div class="shelf">${x.bottles.map((d) => {
          const on = state.decls[0] === d;
          const liquid = COLOR_PROPS.includes(propOf(d)) || propOf(d) === 'border' ? d.split(' ').pop() : null;
          return `<button type="button" class="bottle${on ? ' on' : ''}" data-bottle="${esc(d)}" aria-pressed="${on}"${state.solved ? ' disabled' : ''}>
            <span class="flask"${liquid ? ` style="--liquid:${esc(liquid)}"` : ''}></span><code>${esc(d)};</code></button>`;
        }).join('')}</div>`;
      return;
    }
    if (m === 'mix') {
      const props = Object.keys(x.palette);
      const used = state.decls.map(propOf);
      const valueRows = state.decls.map((d) => {
        const p = propOf(d);
        const cur = valOf(d);
        return `<div class="dose"><span class="dose-prop">${esc(p)}</span><div class="dose-vals" role="radiogroup" aria-label="Waarde voor ${esc(p)}">${x.palette[p].map((v) =>
          `<button type="button" role="radio" class="val${cur === v ? ' on' : ''}" data-prop="${esc(p)}" data-val="${esc(v)}" aria-checked="${cur === v}"${state.solved ? ' disabled' : ''}>${COLOR_PROPS.includes(p) ? SWATCH(v) : ''}${esc(v)}</button>`).join('')}</div></div>`;
      }).join('');
      el.innerHTML = `
        <div class="panel-head sub"><span>Reagentia</span><span class="muted">tik een property aan</span></div>
        <div class="shelf props">${props.map((p) => `<button type="button" class="bottle prop${used.includes(p) ? ' on' : ''}" data-prop-add="${esc(p)}" aria-pressed="${used.includes(p)}"${state.solved ? ' disabled' : ''}><span class="flask"></span><code>${esc(p)}</code></button>`).join('')}</div>
        ${valueRows ? `<div class="panel-head sub"><span>Pipet</span><span class="muted">kies de waarden</span></div><div class="doses">${valueRows}</div>` : ''}`;
      return;
    }
    el.innerHTML = `
      <details class="labcard">
        <summary>Labkaart: welke property doet wat?</summary>
        <dl>
          <dt><code>color</code></dt><dd>de kleur van de tekst</dd>
          <dt><code>background</code></dt><dd>de kleur van het vlak erachter</dd>
          <dt><code>font-size</code></dt><dd>hoe groot de letters zijn</dd>
          <dt><code>font-weight</code></dt><dd>hoe dik de letters zijn</dd>
          <dt><code>border</code></dt><dd>een rand: dikte, stijl en kleur</dd>
          <dt><code>border-radius</code></dt><dd>hoe rond de hoeken zijn</dd>
          <dt><code>padding</code></dt><dd>ruimte bínnen de rand</dd>
          <dt><code>margin</code></dt><dd>ruimte búiten de rand</dd>
        </dl>
      </details>`;
  }

  app.addEventListener('click', (e) => {
    if (!state || !document.getElementById('recipe') || state.solved) return;
    const bottle = e.target.closest('[data-bottle]');
    if (bottle) {
      const d = bottle.dataset.bottle;
      state.decls = state.decls[0] === d ? [] : [d];
      state.fresh = propOf(d);
      bottle.classList.add('pour');
      renderRecipe(); renderMaterial(); updateMine(); if (state.decls.length) bubble();
      return;
    }
    const add = e.target.closest('[data-prop-add]');
    if (add) {
      const p = add.dataset.propAdd;
      if (state.decls.some((d) => propOf(d) === p)) state.decls = state.decls.filter((d) => propOf(d) !== p);
      else state.decls.push(p + ':');
      renderRecipe(); renderMaterial(); updateMine();
      return;
    }
    const val = e.target.closest('[data-val]');
    if (val) {
      const p = val.dataset.prop;
      state.decls = state.decls.map((d) => (propOf(d) === p ? `${p}: ${val.dataset.val}` : d));
      state.fresh = p;
      renderRecipe(); renderMaterial(); updateMine(); bubble();
      return;
    }
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      state.decls.splice(Number(rm.dataset.rm), 1);
      renderRecipe(); renderMaterial(); updateMine();
      return;
    }
    const sel = e.target.closest('[data-sel]');
    if (sel) {
      state.selector = sel.dataset.sel;
      renderRecipe(); updateMine(); if (hasRecipe()) bubble();
    }
  });

  /* ---------- analyse ---------- */
  function runAnalysis() {
    const x = experiment();
    if (state.solved || !hasRecipe()) return;
    const res = analyse(x, document.getElementById('targetDish').shadowRoot, document.getElementById('mineDish').shadowRoot);
    state.last = res;
    attempt(taskKey(state.level, state.idx), res.ok);
    refreshRack();
    renderChecks();
    const note = document.getElementById('note');
    if (!res.ok) {
      note.className = 'report-note bad';
      note.innerHTML = `<span class="note-head">Nog niet geslaagd</span>${fmt(hintFor(x, res, recipe()))}`;
      document.querySelector('.report').classList.remove('shake');
      void note.offsetWidth;
      document.querySelector('.report').classList.add('shake');
      scrollIntoViewIfNeeded(note);
      return;
    }
    state.solved = true;
    renderRecipe();
    renderMaterial();
    document.querySelector('.dish-wrap.mine').classList.add('match');
    const lvl = LEVELS[state.level];
    const last = state.idx === lvl.experiments.length - 1;
    document.getElementById('actions').innerHTML = `<button class="btn" id="nextBtn" type="button">${last ? `${lvl.series} afronden →` : 'Volgend experiment →'}</button>`;
    document.getElementById('nextBtn').addEventListener('click', () => {
      if (last) renderLevelDone();
      else { state.idx += 1; startExperiment(); }
    }, { once: true });
    note.className = 'report-note good';
    note.innerHTML = `<span class="note-head">Experiment geslaagd!</span>${fmt(x.good)}`;
    scrollIntoViewIfNeeded(note);
  }

  /* ---------- tussenscherm: reeks afgerond ---------- */
  function renderLevelDone() {
    const i = state.level;
    const lvl = LEVELS[i];
    const next = LEVELS[i + 1];
    window.scrollTo(0, 0);
    app.innerHTML = `
      ${header()}
      <div id="rack">${rack()}</div>
      <main class="panel done">
        <p class="eyebrow">${lvl.series} afgerond</p>
        <h2>${lvl.name}</h2>
        <p class="muted">${levelScore(i)} van ${LEVEL_TASKS[i]} experimenten in één keer geslaagd</p>
        <div class="done-grid">
          <pre class="code big">${codeHtml(lvl.summary)}</pre>
          <p class="takeaway">${fmt(lvl.takeaway)}</p>
        </div>
        <button class="btn" id="goNext">${next ? `Naar ${next.series}: ${next.name} →` : 'Bekijk het eindrapport →'}</button>
      </main>`;
    document.getElementById('goNext').addEventListener('click', () => (next ? startLevel(i + 1) : finishGame()));
  }

  /* =========================================================
     EINDE — eindrapport
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
      <main class="panel end">
        <div class="end-top">
          <div class="big-flask ${state.passed ? 'pass' : 'fail'}" style="--fill:${pct}%" role="img" aria-label="${pct}% in één keer geslaagd">
            <span class="liquid"></span><span class="pct">${pct}%</span>
          </div>
          <div>
            <p class="eyebrow">Eindrapport</p>
            <h2>${state.passed ? 'Experiment geslaagd!' : 'Nog niet geslaagd'}</h2>
            <div class="big-score">${s}<span> / ${MAX_SCORE}</span></div>
            <p class="muted">experimenten in één keer geslaagd</p>
          </div>
        </div>
        <p class="end-text">${state.passed
          ? 'Je kunt elementen stylen met CSS: kleuren, letters, randen, hoeken en ruimte, met de juiste selector. Samen met Layout Builder opent dit Bug Hunter!'
          : `Je hebt minimaal ${need} van ${MAX_SCORE} (80%) nodig bij de eerste analyse. Lees de labrapporten nog eens na en probeer het opnieuw — je kunt het!`}</p>
        <ul class="end-series">
          ${LEVELS.map((l, i) => `<li><span class="series-tag">${l.series}</span><b>${l.name}</b><span class="res">${levelScore(i)} / ${LEVEL_TASKS[i]}</span></li>`).join('')}
        </ul>
        <div class="end-actions">
          <button class="btn ghost" id="exit">← Terug naar de skilltree</button>
          <button class="btn" id="again">↺ Opnieuw beginnen</button>
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
  window.styleLab = Object.freeze({
    info: gameInfo,
    maxScore: MAX_SCORE,
    levels: LEVELS.map((l) => ({ mode: l.mode, experiments: l.experiments.map((x) => ({ title: x.title, target: x.target, selector: x.selector, selectors: x.selectors, bottles: x.bottles, palette: x.palette })) })),
    // Zou dit recept slagen, en wat zegt het labrapport anders?
    judge: (level, idx, css) => {
      const x = LEVELS[level].experiments[idx];
      const mk = (c) => { const h = document.createElement('div'); h.className = 'offstage'; document.body.appendChild(h); return [h, mountDish(h, x, c)]; };
      const [ht, rt] = mk(x.target);
      const [hm, rm] = mk(css);
      const res = analyse(x, rt, rm);
      ht.remove(); hm.remove();
      return { ok: res.ok, checks: res.checks.map((c) => c.ok), hint: res.ok ? null : hintFor(x, res, css) };
    },
    lint,
    snapshot: () => state && JSON.parse(JSON.stringify({
      round: state.round, level: state.level, idx: state.idx, score: score(), solved: state.solved,
      finished: state.finished, passed: !!state.passed, reported: state.reported, recipe: recipe()
    }))
  });

  renderStart();
})();
