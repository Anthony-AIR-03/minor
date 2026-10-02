-- Lokale testdatabase: dezelfde tabel die api.php gebruikt, plus de beperkte gebruiker 'spel'
-- (alleen SELECT + INSERT, net als op de echte server). Draait één keer bij een lege database.
CREATE TABLE IF NOT EXISTS game_results (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pseudonym VARCHAR(40) NOT NULL,
  game_id VARCHAR(80) NOT NULL,
  score INT UNSIGNED NOT NULL,
  max_score INT UNSIGNED NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pseudonym (pseudonym)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE USER IF NOT EXISTS 'spel'@'%' IDENTIFIED BY 'local-test-only';
GRANT SELECT, INSERT ON skilltree.game_results TO 'spel'@'%';
FLUSH PRIVILEGES;
