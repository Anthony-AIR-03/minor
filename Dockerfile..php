FROM php:8.3-fpm-alpine
RUN docker-php-ext-install pdo_mysql
# api.php staat op hetzelfde pad als in nginx; ../private wordt via compose gemount
COPY api.php /usr/share/nginx/html/api.php
RUN chmod 644 /usr/share/nginx/html/api.php