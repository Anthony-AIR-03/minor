# Bewijs bijeenkomst 4 — skilltree en eigen games

Gevraagd in Stappenplan 4.2a: publieke skilltree-URL, het gebruikte `games.json`, de inventaris van ids en paden,
en één korte test van opslaan, teruglezen en ontgrendelen.

## 1. Skilltree-URL

- **Lokaal getest:** `https://localhost:8443/games/skilltree/` (zie [`README.md`](README.md)).
- **Publiek:** bewust niet op `main` / minor.anthony-air.nl. De publieke gamespagina met dezelfde functie
  (speler-ID, opslaan via `api.php`, ontgrendelen) is https://minor.anthony-air.nl/games/.
- **Open punt:** het pakket *Basisskilltree-bijeenkomst-4.zip* was op Canvas vergrendeld; de pakketbestanden moeten nog
  in `local-test/skilltree/` worden gezet en dan getest (4.1a: demoroute 60% dicht / 80% open).

## 2. Inventaris

| Titel | Leerdoel | Exacte game-id | Werkend webpad | Afrondmoment | Score die wordt verstuurd |
|---|---|---|---|---|---|
| HTML Hunter | Ik kan veelgebruikte HTML-elementen herkennen en hun basisfunctie benoemen. | `html-hunter` | `/games/html-hunter/` | `GAME_COMPLETED` alleen bij mastery ≥ 80% aan het einde van de game | `score` = aantal goed, `maxScore` = aantal vragen |
| Build the DOM | Ik kan uitleggen hoe HTML-elementen samen de structuur van een webpagina vormen. | `build-the-dom` | `/games/build-the-dom/` | `GAME_COMPLETED` één keer per speelronde, alleen bij ≥ 80% eerste-poging-goed na alle 3 de levels | `score` = opdrachten in één keer goed, `maxScore` = 24 |

- Game-ids komen uit de code (`gameId: 'html-hunter'` in `games/html-hunter/index.html`, `gameId: 'build-the-dom'` in
  `games/build-the-dom/game.js`) en zijn niet hernoemd.
- Webpaden zonder `index.html`: de site stuurt `/…/index.html` door naar `/…/`.
- Beide games versturen alleen iets bij slagen, dus een opgeslagen rij betekent "voltooid". Daarom is de voorwaarde
  `completed`; `minPercent: 80` zou hetzelfde betekenen.

## 3. `games.json`

[`skilltree/games.json`](skilltree/games.json):

```json
{
  "schemaVersion": 1,
  "games": [
    {
      "id": "html-hunter",
      "title": "HTML Hunter",
      "learningGoal": "Ik kan veelgebruikte HTML-elementen herkennen en hun basisfunctie benoemen.",
      "path": "/games/html-hunter/",
      "requires": []
    },
    {
      "id": "build-the-dom",
      "title": "Build the DOM",
      "learningGoal": "Ik kan uitleggen hoe HTML-elementen samen de structuur van een webpagina vormen.",
      "path": "/games/build-the-dom/",
      "requires": [
        { "gameId": "html-hunter", "type": "completed" }
      ]
    }
  ]
}
```

## 4. Test: opslaan, teruglezen, ontgrendelen (2 oktober 2026, lokaal)

Tegen de echte `api.php` en een MariaDB-testdatabase, via onze gamespagina (`/games/`), automatisch uitgevoerd met
`/test-harness/` in Chrome. De game draait in het iframe; het `GAME_COMPLETED`-bericht komt uit het iframe van HTML Hunter.

| Stap | Resultaat |
|---|---|
| Nieuwe code `bewijs-mur5odyp` | HTML Hunter open, Build the DOM gesloten ✅ |
| HTML Hunter gehaald (17 / 20) → opslaan | `POST /api.php {"pseudonym":"bewijs-mur5odyp","gameId":"html-hunter","score":17,"maxScore":20}` → **HTTP 201** ✅ |
| Ontgrendelen | Build the DOM wordt open ✅ |
| Herladen met dezelfde code | `GET /api.php?pseudonym=bewijs-mur5odyp` → HTTP 200; HTML Hunter gehaald, Build the DOM open ✅ |
| Andere code `bewijs-mur5odyp-b` | begint opnieuw: HTML Hunter open, Build the DOM gesloten ✅ |

Rij in de database (`local-test/run.sh sql`):

```
id  pseudonym        game_id      score  max_score  completed_at
2   bewijs-mur5odyp  html-hunter  17     20         2026-10-02 16:06:45
```

API-controles met curl (zelfde stack):

| Aanvraag | Verwacht | Kreeg |
|---|---|---|
| POST geldige score 18 / 20 | 201 | 201 ✅ |
| GET teruglezen | 200 + resultaat | 200, `bestScore 18 / 20` ✅ |
| POST score 25 / 24 | 400 | 400 ✅ |
| POST met extra veld `xp` | 400 | 400 ✅ |
| POST vanaf andere origin | 403 | 403 ✅ |

De POST bevat uitsluitend `pseudonym`, `gameId`, `score` en `maxScore`, en de game-id is nooit `null`.
