<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
function validCode($value, int $length): bool {
    return is_string($value) && strlen($value) >= 1 && strlen($value) <= $length
        && preg_match('/^[a-z0-9][a-z0-9-]*$/D', $value) === 1;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    reply(405, ['ok' => false, 'message' => 'Gebruik GET of POST.']);
}
$input = null;
if ($method === 'POST') {
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        reply(415, ['ok' => false, 'message' => 'Stuur application/json.']);
    }
    $raw = file_get_contents('php://input', false, null, 0, 4097);
    if ($raw === false || strlen($raw) > 4096) reply(413, ['ok' => false, 'message' => 'Aanvraag te groot.']);
    try { $object = json_decode($raw, false, 16, JSON_THROW_ON_ERROR); }
    catch (JsonException $e) { reply(400, ['ok' => false, 'message' => 'Ongeldige JSON.']); }
    if (!is_object($object)) reply(400, ['ok' => false, 'message' => 'Verwacht een JSON-object.']);
    $input = (array) $object;
    $fields = array_keys($input); sort($fields);
    if ($fields !== ['gameId', 'maxScore', 'pseudonym', 'score']
        || !validCode($input['pseudonym'] ?? null, 40)
        || !validCode($input['gameId'] ?? null, 80)
        || !is_int($input['score'] ?? null) || !is_int($input['maxScore'] ?? null)
        || $input['maxScore'] < 1 || $input['maxScore'] > 1000000
        || $input['score'] < 0 || $input['score'] > $input['maxScore']) {
        reply(400, ['ok' => false, 'message' => 'Controleer testcode, game-id en scores. Gebruik kleine letters, cijfers en koppeltekens voor codes.']);
    }
} elseif (isset($_GET['action'])) {
    if ($_GET !== ['action' => 'health']) reply(400, ['ok' => false, 'message' => 'Onbekende actie.']);
} elseif (count($_GET) !== 1 || !validCode($_GET['pseudonym'] ?? null, 40)) {
    reply(400, ['ok' => false, 'message' => 'Geef een geldige pseudonym-testcode mee.']);
}

try {
    $configPath = __DIR__ . '/../private/db-config.php';
    if (!is_file($configPath)) throw new RuntimeException('Config ontbreekt.');
    $config = require $configPath;
    if (!is_array($config) || !isset($config['dsn'], $config['user'], $config['password'], $config['origin'])) {
        throw new RuntimeException('Config onvolledig.');
    }
    if (!is_string($config['origin']) || !preg_match('#^https://[a-z0-9.-]+(?::[0-9]+)?$#D', $config['origin'])) {
        throw new RuntimeException('Origin onjuist.');
    }
    // Geen browsersecret of open CORS. Dit is demo-opslag, geen gebruikerslogin.
    if (isset($_SERVER['HTTP_SEC_FETCH_SITE']) && $_SERVER['HTTP_SEC_FETCH_SITE'] === 'cross-site') {
        reply(403, ['ok' => false, 'message' => 'Gebruik het testscherm op hetzelfde domein.']);
    }
    if ($method === 'POST' && ($_SERVER['HTTP_ORIGIN'] ?? '') !== $config['origin']) {
        reply(403, ['ok' => false, 'message' => 'Gebruik het testscherm op de ingestelde website.']);
    }
    $pdo = new PDO($config['dsn'], $config['user'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    if ($method === 'GET' && isset($_GET['action'])) {
        $pdo->query('SELECT id, pseudonym, game_id, score, max_score, completed_at FROM game_results LIMIT 0');
        reply(200, ['ok' => true, 'message' => 'API, database en tabel bereikbaar.']);
    }
    if ($method === 'POST') {
        $stmt = $pdo->prepare('INSERT INTO game_results (pseudonym, game_id, score, max_score) VALUES (?, ?, ?, ?)');
        $stmt->execute([$input['pseudonym'], $input['gameId'], $input['score'], $input['maxScore']]);
        reply(201, ['ok' => true, 'message' => 'Resultaat opgeslagen.']);
    }
    // Eén samenvatting per voltooide game; beste score en maximum horen bij dezelfde poging.
    $stmt = $pdo->prepare('SELECT game_id, score, max_score, completed_at FROM game_results WHERE pseudonym = ? ORDER BY game_id, (score / NULLIF(max_score, 0)) DESC, id DESC');
    $stmt->execute([$_GET['pseudonym']]);
    $results = [];
    while ($row = $stmt->fetch()) {
        $id = $row['game_id'];
        if (!isset($results[$id])) {
            $results[$id] = ['gameId' => $id, 'bestScore' => (int)$row['score'], 'maxScore' => (int)$row['max_score'], 'completedAt' => $row['completed_at'], 'attempts' => 0];
        }
        $results[$id]['attempts']++;
    }
    reply(200, ['ok' => true, 'results' => array_values($results)]);
} catch (Throwable $e) {
    // Technische details blijven in het afgeschermde serverlog; nooit config of wachtwoorden loggen.
    error_log('Les-API: ' . get_class($e) . ' code=' . $e->getCode());
    reply(500, ['ok' => false, 'message' => 'Databaseverbinding of tabel niet beschikbaar. Controleer config, gebruikerskoppeling en tabelstructuur in cPanel.']);
}
