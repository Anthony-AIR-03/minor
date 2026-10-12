<?php
declare(strict_types=1);

function dashboardEscape($value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function dashboardAuthenticatedUser(array $server): string {
    // Only a web-server-verified identity counts. A supplied Basic header is not proof.
    foreach (['REMOTE_USER', 'REDIRECT_REMOTE_USER'] as $key) {
        if (isset($server[$key]) && is_string($server[$key]) && trim($server[$key]) !== '') {
            return trim($server[$key]);
        }
    }
    return '';
}

function dashboardGames(string $path): array {
    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException('games.json is niet gevonden. Controleer of je skilltree in public_html/games/skilltree staat.');
    }
    $text = file_get_contents($path);
    if ($text === false || strlen($text) > 1048576) {
        throw new RuntimeException('games.json kan niet worden gelezen.');
    }
    try { $config = json_decode($text, true, 32, JSON_THROW_ON_ERROR); }
    catch (JsonException $error) { throw new RuntimeException('games.json bevat geen geldige JSON. Herstel eerst je werkende spellenlijst.'); }
    if (!is_array($config) || ($config['schemaVersion'] ?? null) !== 1
        || !isset($config['games']) || !is_array($config['games'])
        || count($config['games']) < 1 || count($config['games']) > 100) {
        throw new RuntimeException('games.json moet de standaardafspraak schemaVersion: 1 en een lijst games gebruiken.');
    }
    $games = [];
    foreach ($config['games'] as $game) {
        if (!is_array($game) || !isset($game['id'], $game['title'])
            || !is_string($game['id']) || strlen($game['id']) > 80
            || preg_match('/^[a-z0-9][a-z0-9-]*$/D', $game['id']) !== 1
            || !is_string($game['title']) || trim($game['title']) === '') {
            throw new RuntimeException('Een spel in games.json heeft geen geldige id of titel. Herstel eerst de spellenlijst.');
        }
        if (array_key_exists($game['id'], $games)) {
            throw new RuntimeException('Een game-id staat dubbel in games.json. Herstel eerst de spellenlijst.');
        }
        if ($game['id'] !== 'verbindingstest') $games[$game['id']] = trim($game['title']);
    }
    if (!$games) throw new RuntimeException('Er staan nog geen echte spellen in games.json.');
    return $games;
}

function dashboardFilters(array $query, array $games): array {
    $filters = ['game' => '', 'from' => '', 'until' => '', 'upper' => ''];
    foreach (['game', 'from', 'until'] as $key) {
        if (isset($query[$key]) && !is_string($query[$key])) {
            throw new InvalidArgumentException('Kies een spel en vul datums in via het filterformulier.');
        }
        $filters[$key] = trim($query[$key] ?? '');
    }
    if ($filters['game'] !== '' && !array_key_exists($filters['game'], $games)) {
        throw new InvalidArgumentException('Dit spel staat niet in je huidige skilltree. Wis de filters en kies opnieuw.');
    }
    foreach (['from', 'until'] as $key) {
        $value = $filters[$key];
        if ($value === '') continue;
        if (preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/D', $value) !== 1 || (int) substr($value, 0, 4) < 1970 || (int) substr($value, 0, 4) > 9998) {
            throw new InvalidArgumentException('Gebruik een geldige datum, bijvoorbeeld 2026-10-12.');
        }
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, new DateTimeZone('UTC'));
        if (!$date || $date->format('Y-m-d') !== $value) {
            throw new InvalidArgumentException('Deze datum bestaat niet. Controleer de begin- en einddatum.');
        }
        if ($key === 'until') $filters['upper'] = $date->modify('+1 day')->format('Y-m-d');
    }
    if ($filters['from'] !== '' && $filters['until'] !== '' && $filters['from'] > $filters['until']) {
        throw new InvalidArgumentException('De begindatum moet op of vóór de einddatum liggen.');
    }
    return $filters;
}

function dashboardRead(PDO $pdo, array $games, array $filters): array {
    $ids = $filters['game'] !== '' ? [$filters['game']] : array_keys($games);
    if (!$ids) throw new RuntimeException('Er staan nog geen spellen in de skilltree.');
    $marks = implode(',', array_fill(0, count($ids), '?'));
    $where = ['game_id IN (' . $marks . ')'];
    $parameters = $ids;
    if ($filters['from'] !== '') { $where[] = 'completed_at >= ?'; $parameters[] = $filters['from'] . ' 00:00:00'; }
    if ($filters['upper'] !== '') { $where[] = 'completed_at < ?'; $parameters[] = $filters['upper'] . ' 00:00:00'; }
    $sql = 'SELECT id, pseudonym, game_id, score, max_score, completed_at FROM game_results WHERE '
        . implode(' AND ', $where) . ' ORDER BY pseudonym, game_id, completed_at DESC, id DESC';
    $statement = $pdo->prepare($sql);
    $statement->execute($parameters);
    $groups = [];
    $players = [];
    $playedGames = [];
    $registrations = 0;
    $invalid = 0;
    while ($record = $statement->fetch(PDO::FETCH_ASSOC)) {
        $code = $record['pseudonym'];
        $id = $record['game_id'];
        $score = filter_var($record['score'], FILTER_VALIDATE_INT);
        $max = filter_var($record['max_score'], FILTER_VALIDATE_INT);
        if (!is_string($code) || strlen($code) > 40 || preg_match('/^[a-z0-9][a-z0-9-]*$/D', $code) !== 1
            || !array_key_exists($id, $games) || $score === false || $max === false
            || $score < 0 || $max < 1 || $max > 1000000 || $score > $max) {
            $invalid++;
            continue;
        }
        $key = $code . "\0" . $id;
        if (!isset($groups[$key])) {
            $groups[$key] = ['code' => $code, 'gameId' => $id, 'title' => $games[$id],
                'score' => $score, 'maxScore' => $max, 'count' => 0, 'latest' => $record['completed_at']];
        }
        // Integer cross multiplication keeps numerator and denominator from one result.
        if ($score * $groups[$key]['maxScore'] > $groups[$key]['score'] * $max) {
            $groups[$key]['score'] = $score;
            $groups[$key]['maxScore'] = $max;
        }
        $groups[$key]['count']++;
        if ($record['completed_at'] > $groups[$key]['latest']) $groups[$key]['latest'] = $record['completed_at'];
        $players[$code] = true;
        $playedGames[$id] = true;
        $registrations++;
    }
    return ['rows' => array_values($groups), 'players' => count($players), 'games' => count($playedGames),
        'registrations' => $registrations, 'invalid' => $invalid];
}

function dashboardTime(string $value): string {
    $date = DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $value, new DateTimeZone('UTC'));
    return $date && $date->format('Y-m-d H:i:s') === $value ? $date->format('d-m-Y H:i') : $value;
}
