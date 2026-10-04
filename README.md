<div align="center">

# Minor: AI, Games & Digitale geletterdheid

**Work from my minor, collected on one small site: educational browser games, reports and other pieces.**

[🌐 Live site](https://minor.anthony-air.nl) · [🎮 HTML Hunter](https://minor.anthony-air.nl/games/html-hunter/) · [💼 Portfolio](https://anthony-air.nl)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![nginx](https://img.shields.io/badge/nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

<a href="https://minor.anthony-air.nl/games/html-hunter/"><img src="docs/html-hunter.jpg" alt="HTML Hunter: a game for recognising the building blocks of HTML" width="720" /></a>

</div>

## About

A plain HTML/CSS/JavaScript site, no framework or build step, for the work I make during the minor
*AI, Games & Digitale geletterdheid*. Every game is registered in `games/games.json`; the home page
and the skill tree at `/games/` both read it.

### Games

- **HTML Hunter** (Dutch): learn to recognise the building blocks of the web before you start
  building. Four stages (matching, recognising, the reverse direction and a result screen) move from
  remembering which HTML element is which to understanding what each one does.
- **Build the DOM** (Dutch): learn how HTML elements fit together into one page. Three levels
  (building the main structure, placing visible content and spotting structure errors) move from
  placing elements in a DOM tree to explaining why a structure is wrong.
- **Layout Builder** (Dutch): learn to position elements with CSS and flexbox, on an architect's
  blueprint. The target layout lies as dashed lines over the player's page; they pick an element and set
  its CSS until every block fits the lines, then have it inspected. Three phases
  (side by side or stacked, spacing and alignment, and a card layout across several elements) apply
  `display`, `flex-direction`, `justify-content`, `align-items`, `gap`, `width`, `padding` and `margin`.

## Adding a game

1. Put the game in `games/<name>/` with an `index.html`. When the player passes, the game sends one
   message to the page around it:
   `window.parent.postMessage({ type: "GAME_COMPLETED", gameId, score, maxScore }, location.origin)`.
2. Add it to `games/games.json` (`schemaVersion` 1, same format as the course's basisskilltree):

   ```json
   {
     "id": "build-the-dom",
     "title": "Build the DOM",
     "learningGoal": "Ontdek hoe HTML-elementen samen de structuur van een webpagina vormen.",
     "path": "/games/build-the-dom/",
     "requires": [{ "gameId": "html-hunter", "type": "completed" }]
   }
   ```

   - `id` is exactly the `gameId` the game sends; never rename it.
   - `requires`: `[]` opens it at once; `{"gameId": "…", "type": "completed"}` needs that game passed;
     `{"gameId": "…", "type": "minPercent", "value": 80}` needs at least that percentage. All conditions must hold.
   - Unknown fields, unknown ids, a game that requires itself or a circle are reported on `/games/`
     and that entry is left out.
3. Give it a place on the route in the `GAMES` list in `games/index.html` (Bloom level, key question, position),
   and an emblem in `games/emblems/<id>.svg`.

Players save progress under a made-up player code on `/games/`: the page opens the game in a dialog,
receives `GAME_COMPLETED` and stores `{pseudonym, gameId, score, maxScore}` through `api.php`, then reads
the progress back. Free play opens every game and saves nothing.

## Running it

Open `index.html` through any static file server, for example:

```bash
npx serve .
```

In production the site runs as an `nginx:alpine` container (see `Dockerfile` and `compose.yml`)
behind a reverse proxy.

---

<div align="center">

Made by **Anthony Inocencio Ramos** · [anthony-air.nl](https://anthony-air.nl) · [LinkedIn](https://www.linkedin.com/in/anthony-inoc%C3%AAncio-ramos-b89003277/)

</div>
