<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; style-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
require_once __DIR__ . '/functions.php';

$user = dashboardAuthenticatedUser($_SERVER);
$error = '';
$games = [];
$filters = ['game' => '', 'from' => '', 'until' => '', 'upper' => ''];
$overview = null;
$timezone = '';
if ($user === '') {
    http_response_code(403);
    $error = 'Het docentdashboard is nog niet bereikbaar met een bevestigde docentlogin. Beveilig deze map via cPanel → Directory Privacy en maak daar een docentgebruiker aan. Open daarna het dashboard opnieuw. Zie LEESMIJ.md in het lespakket als je al hebt ingelogd.';
} elseif (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    $error = 'Dit dashboard leest alleen resultaten. Gebruik het filterformulier.';
} else {
    try {
        $games = dashboardGames(__DIR__ . '/../games/games.json');
        $filters = dashboardFilters($_GET, $games);
        $configPath = __DIR__ . '/../../private/db-config.php';
        if (!is_file($configPath)) throw new RuntimeException('De bestaande databaseconfiguratie is niet gevonden. Controleer de map private naast public_html, zoals in bijeenkomst 3.');
        $config = require $configPath;
        if (!is_array($config) || !isset($config['dsn'], $config['user'], $config['password'])
            || !is_string($config['dsn']) || strpos($config['dsn'], 'mysql:') !== 0
            || !is_string($config['user']) || !is_string($config['password'])) {
            throw new RuntimeException('De bestaande databaseconfiguratie kan niet worden gebruikt. Controleer eerst de opslag van je skilltree met het testscherm uit bijeenkomst 3.');
        }
        $pdo = new PDO($config['dsn'], $config['user'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $zone = $pdo->query('SELECT @@session.time_zone AS session_zone, @@system_time_zone AS system_zone')->fetch();
        $timezone = (string) $zone['session_zone'];
        if ($timezone === 'SYSTEM') $timezone .= ' / ' . (string) $zone['system_zone'];
        $overview = dashboardRead($pdo, $games, $filters);
    } catch (InvalidArgumentException $exception) {
        http_response_code(422);
        $error = $exception->getMessage();
        foreach (['game', 'from', 'until'] as $key) {
            $filters[$key] = isset($_GET[$key]) && is_string($_GET[$key]) ? substr($_GET[$key], 0, 80) : '';
        }
    } catch (PDOException $exception) {
        http_response_code(503);
        $error = 'De database of tabel is niet bereikbaar. Controleer eerst je bestaande skilltree-opslag en de databasekoppeling in cPanel. Er zijn geen gegevens gewijzigd.';
        error_log('Docentdashboard databasefout: ' . $exception->getCode());
    } catch (RuntimeException $exception) {
        http_response_code(503);
        $error = $exception->getMessage();
    } catch (Throwable $exception) {
        http_response_code(503);
        $error = 'Het dashboard kon niet worden geladen. Vraag hulp met de installatie; deel geen ingevulde privéconfiguratie.';
        error_log('Docentdashboard fout: ' . get_class($exception));
    }
}
require __DIR__ . '/view.php';
