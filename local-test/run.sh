#!/bin/sh
# Lokale skilltree-testomgeving. Gebruik: local-test/run.sh up | down | reset | sql
set -e
cd "$(dirname "$0")"
COMPOSE="docker compose -f compose.local.yml"

case "${1:-up}" in
  up)
    if [ ! -f certs/localhost.crt ]; then
      mkdir -p certs
      openssl req -x509 -newkey rsa:2048 -nodes -days 365 -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
        -keyout certs/localhost.key -out certs/localhost.crt 2>/dev/null
    fi
    $COMPOSE up -d --build
    echo "Wachten op de API…"
    for _ in $(seq 1 40); do
      if curl -ksf "https://localhost:8443/api.php?action=health" >/dev/null; then
        echo "Klaar: https://localhost:8443/games/skilltree/  (testscherm: https://localhost:8443/testscherm.html)"
        exit 0
      fi
      sleep 2
    done
    echo "API niet bereikbaar; bekijk: $COMPOSE logs" >&2; exit 1 ;;
  down)  $COMPOSE down ;;
  reset) $COMPOSE down -v ;;   # wist ook de testdatabase
  sql)   $COMPOSE exec db mariadb -uroot -plocal-root-only skilltree -e "SELECT id, pseudonym, game_id, score, max_score, completed_at FROM game_results ORDER BY id" ;;
  *) echo "Gebruik: $0 up | down | reset | sql" >&2; exit 1 ;;
esac
