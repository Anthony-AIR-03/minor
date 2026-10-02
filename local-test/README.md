# Lokale skilltree-test (bijeenkomst 4) — nooit naar `main` mergen

Deze branch (`local-skilltree-test`) bestaat alleen om de basisskilltree uit **Stappenplan 4.1a/4.2a** lokaal te
testen. Hij blijft in de repo staan, maar wordt **nooit** naar `main` gemerged: `main` deployt automatisch naar
minor.anthony-air.nl, en de basisskilltree hoort niet op de live site.

Alles staat in `local-test/`. De echte bestanden van de site (`games/`, `api.php`, `Dockerfile`, `compose.yml`) zijn
op deze branch niet aangepast.

## Wat er draait

`compose.local.yml` bouwt dezelfde stack als productie, maar lokaal:

| Onderdeel | Lokaal |
|---|---|
| nginx | `nginx-local.conf`, HTTPS op `https://localhost:8443` met een zelfgemaakt certificaat (`certs/`, niet in git) |
| PHP + `api.php` | dezelfde `Dockerfile.php` en `api.php` als productie, met `db-config.local.php` |
| MariaDB | testdatabase in een Docker-volume; `init.sql` maakt de tabel `game_results` en gebruiker `spel` (alleen SELECT + INSERT) |
| skilltree | `local-test/skilltree/` wordt in de container op `/games/skilltree/` gezet |

HTTPS is nodig omdat `api.php` alleen opslaat vanaf de `https://`-origin uit de config.

## Gebruik

```sh
local-test/run.sh up      # start; daarna https://localhost:8443/games/skilltree/
local-test/run.sh sql     # toon de opgeslagen rijen (zoals phpMyAdmin)
local-test/run.sh down    # stoppen
local-test/run.sh reset   # stoppen én testdatabase wissen
```

Je browser waarschuwt de eerste keer voor het zelfgemaakte certificaat; dat is lokaal verwacht.

- `https://localhost:8443/games/` — onze eigen skilltree-pagina met speler-ID / vrij spelen
- `https://localhost:8443/testscherm.html` — testscherm uit bijeenkomst 3
- `https://localhost:8443/test-harness/` — automatische test van opslaan, teruglezen en ontgrendelen

## Het basisskilltree-pakket

Het pakket **Basisskilltree-bijeenkomst-4.zip** staat op Canvas, maar was bij het opzetten vergrendeld. Zodra je het
hebt: zet de bestanden uit de map `skilltree/` van het pakket (`index.html`, `core.js`, `app.js`, `view.js`,
`style.css`) in `local-test/skilltree/`, **naast** onze `games.json` (die niet overschrijven, of eerst de demo-versie
gebruiken voor 4.1a). De demogames gaan in `local-test/demo-games/` en moeten dan in `compose.local.yml` per map
op `/games/skilltree-demo-…/` worden gekoppeld.

Bewijs en inventaris: [`BEWIJS.md`](BEWIJS.md).
