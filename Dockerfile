FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY index.html manifest.json script.js style.css testscherm.html favicon.ico favicon.svg apple-touch-icon.png /usr/share/nginx/html/
COPY games/ /usr/share/nginx/html/games/
RUN find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;