<?php
// Rendering is separate so dashboard.css can be replaced without changing data access.
if (!isset($user, $error, $games, $filters)) { http_response_code(404); exit; }
$leaderboard = defined('DASHBOARD_LEADERBOARD');
$self = $leaderboard ? 'top3.php' : 'index.php';
?>
<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= $leaderboard ? 'Top 3 · Docentdashboard' : 'Voortgang · Docentdashboard' ?></title>
<?php if ($leaderboard): ?>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&amp;display=swap">
  <link rel="stylesheet" href="leaderboard.css">
<?php else: ?>
  <link rel="stylesheet" href="dashboard.css">
<?php endif; ?>
</head>
<body>
<a class="skip-link" href="#overzicht">Naar het overzicht</a>
<div class="page">
  <header class="page-header">
    <p class="eyebrow">DOCENTDASHBOARD</p>
    <h1>Voortgang van spelers</h1>
    <p class="intro">Bekijk opgeslagen spelafrondingen en kies welke resultaten je wilt zien.</p>
    <?php if ($user !== ''): ?><p class="login-state">Ingelogd als <?= dashboardEscape($user) ?> · sluit dit privévenster na gebruik.</p>
    <p class="view-switch"><?= $leaderboard ? '<a href="index.php">Standaardoverzicht</a>' : '<a href="top3.php">Top 3-weergave</a>' ?></p><?php endif; ?>
  </header>
  <?php if ($error !== ''): ?>
    <div class="notice error" role="alert"><h2>Controleer deze stap</h2><p><?= dashboardEscape($error) ?></p></div>
  <?php endif; ?>
  <?php if ($leaders !== null): ?>
  <section class="podium" aria-labelledby="podium-heading">
    <div class="podium-heading">
      <p class="eyebrow">ALL-TIME</p>
      <h2 id="podium-heading">Top 3 spelers</h2>
      <p class="hint">Over alle registraties, los van je filters. Eerst het aantal gehaalde spellen (beste resultaat minstens 80%), dan het gemiddelde van de beste scores; bij gelijke stand telt wie er het eerst was.</p>
    </div>
    <?php if (!$leaders): ?>
      <p class="empty">Nog geen opgeslagen afrondingen, dus nog geen top 3.</p>
    <?php else: ?>
    <ol class="podium-list">
      <?php foreach ($leaders as $index => $leader): $place = $index + 1; ?>
      <li class="place place-<?= $place ?>">
        <p class="place-badge"><span class="medal" aria-hidden="true"><?= $place ?></span><span><?= $place ?>e plaats</span></p>
        <p class="place-code"><?= dashboardEscape($leader['code']) ?></p>
        <p class="place-figure"><strong><?= $leader['passed'] ?></strong><span>van <?= count($games) ?> spellen gehaald</span></p>
        <ol class="route" aria-label="Spellen in de route">
          <?php foreach ($leader['states'] as $id => $state): ?>
          <li class="step <?= $state ?>" title="<?= dashboardEscape($games[$id]) ?>"><span class="visually-hidden"><?= dashboardEscape($games[$id]) ?>: <?= ['passed' => 'gehaald', 'played' => 'gespeeld, nog niet gehaald', 'open' => 'nog niet gespeeld'][$state] ?></span></li>
          <?php endforeach; ?>
        </ol>
        <dl class="place-stats">
          <div><dt>Gemiddelde beste score</dt><dd><?= dashboardEscape(number_format($leader['average'], 1, ',', '')) ?>%</dd></div>
          <div><dt>Laatste registratie</dt><dd><?= dashboardEscape(dashboardTime($leader['latest'])) ?></dd></div>
        </dl>
      </li>
      <?php endforeach; ?>
    </ol>
    <p class="route-legend" aria-hidden="true"><span class="step passed"></span>gehaald <span class="step played"></span>gespeeld <span class="step open"></span>nog open</p>
    <?php endif; ?>
  </section>
  <?php endif; ?>
  <?php if ($user !== '' && $games): ?>
  <section class="filters" aria-labelledby="filter-heading">
    <h2 id="filter-heading">Kies je selectie</h2>
    <form method="get" action="<?= $self ?>">
      <div class="field"><label for="game">Spel</label><select id="game" name="game">
        <option value="">Alle spellen uit mijn skilltree</option>
        <?php foreach ($games as $id => $title): ?><option value="<?= dashboardEscape($id) ?>"<?= $filters['game'] === (string) $id ? ' selected' : '' ?>><?= dashboardEscape($title) ?></option><?php endforeach; ?>
      </select></div>
      <div class="field"><label for="from">Van</label><input id="from" name="from" type="date" min="1970-01-01" max="9998-12-31" value="<?= dashboardEscape($filters['from']) ?>"></div>
      <div class="field"><label for="until">Tot en met</label><input id="until" name="until" type="date" min="1970-01-01" max="9998-12-31" value="<?= dashboardEscape($filters['until']) ?>"></div>
      <div class="actions"><button type="submit">Toepassen / verversen</button><a class="clear" href="<?= $self ?>">Filters wissen</a></div>
    </form>
    <p class="hint">Laat de datums leeg voor alle registraties. Het overzicht volgt de spellen in je huidige games.json.</p>
  </section>
  <?php endif; ?>
  <main id="overzicht" tabindex="-1">
  <?php if ($overview !== null): ?>
    <div class="overview-heading"><h2>Resultaten binnen je selectie</h2>
      <p><?= dashboardEscape($filters['game'] !== '' ? $games[$filters['game']] : 'Alle spellen') ?> · <?= dashboardEscape($filters['from'] !== '' ? 'vanaf ' . dashboardTime($filters['from'] . ' 00:00:00') : 'geen begindatum') ?> · <?= dashboardEscape($filters['until'] !== '' ? 'tot en met ' . substr(dashboardTime($filters['until'] . ' 00:00:00'), 0, 10) : 'geen einddatum') ?></p>
    </div>
    <div class="stats" aria-label="Samenvatting van de selectie">
      <p><strong><?= $overview['players'] ?></strong><span>spelers</span></p>
      <p><strong><?= $overview['games'] ?></strong><span>spellen met resultaten</span></p>
      <p><strong><?= $overview['registrations'] ?></strong><span>opgeslagen afrondingen</span></p>
    </div>
    <?php if ($overview['invalid'] > 0): ?><p class="notice error" role="status"><?= $overview['invalid'] ?> ongeldige registratie(s) overgeslagen. Vraag de docent om de bestaande opslag te controleren.</p><?php endif; ?>
    <?php if (!$overview['rows']): ?>
      <p class="empty">Geen opgeslagen afrondingen gevonden voor deze filters.</p>
    <?php else: ?>
    <div class="table-scroll" tabindex="0" role="region" aria-label="Spelresultaten; op een smal scherm kun je horizontaal scrollen">
      <table>
        <caption>Beste spelprestatie en aantal geregistreerde afrondingen per speler en spel, binnen de selectie.</caption>
        <thead><tr><th scope="col">Spelerscode</th><th scope="col">Spel</th><th scope="col">Beste score in selectie</th><th scope="col">Opgeslagen afrondingen</th><th scope="col">Laatste registratie</th></tr></thead>
        <tbody>
        <?php foreach ($overview['rows'] as $row): ?>
          <tr><th scope="row" class="player-code"><?= dashboardEscape($row['code']) ?></th>
            <td><?= dashboardEscape($row['title']) ?><small class="game-id"><?= dashboardEscape($row['gameId']) ?></small></td>
            <td class="score"><?= $row['score'] ?>/<?= $row['maxScore'] ?><small><?= dashboardEscape(number_format(100 * $row['score'] / $row['maxScore'], 1, ',', '')) ?>%</small></td>
            <td class="count"><?= $row['count'] ?></td><td class="time"><?= dashboardEscape(dashboardTime($row['latest'])) ?></td></tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <?php endif; ?>
    <p class="hint">Datums en tijden volgen de database-tijdzone: <?= dashboardEscape($timezone) ?>. De datumfilters gebruiken dezelfde tijdzone.</p>
    <section class="meaning" aria-labelledby="meaning-heading"><h2 id="meaning-heading">Wat vertelt dit overzicht?</h2>
      <p>Je ziet opgeslagen spelafrondingen. Niet-afgeronde oefenpogingen worden niet bijgehouden; een ontbrekend resultaat betekent niet vanzelf dat iemand niet heeft gespeeld.</p>
      <p>Een spelresultaat is een aanwijzing voor de prestatie in het spel. Gebruik de voor- en natoets uit bijeenkomst 6 om te onderzoeken wat een speler ook buiten het spel kan toepassen.</p>
    </section>
  <?php elseif ($error === ''): ?><p>Er zijn nog geen resultaten geladen.</p><?php endif; ?>
  </main>
  <footer>Lespakket bijeenkomst 6 · versie 1.0 · Alleen lezen · Gebruik verzonnen spelerscodes.</footer>
</div>
</body>
</html>
