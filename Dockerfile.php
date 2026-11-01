FROM php:8.3-fpm-alpine
RUN docker-php-ext-install pdo_mysql
# api.php staat op hetzelfde pad als in nginx; ../private wordt via compose gemount
COPY api.php /usr/share/nginx/html/api.php
# Docentdashboard: leest games.json en ../../private/db-config.php, net als in het lespakket
COPY docent-dashboard/*.php /usr/share/nginx/html/docent-dashboard/
COPY games/games.json /usr/share/nginx/html/games/games.json
RUN chmod 644 /usr/share/nginx/html/api.php /usr/share/nginx/html/docent-dashboard/*.php /usr/share/nginx/html/games/games.json