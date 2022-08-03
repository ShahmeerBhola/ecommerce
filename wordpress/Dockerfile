FROM wordpress:5.5.1-php7.3

RUN sed -i 's/80/8000/' /etc/apache2/ports.conf /etc/apache2/sites-enabled/000-default.conf

# install_wordpress.sh & miscellaneous dependencies
RUN apt-get update; \
    apt-get install -yq curl mariadb-client netcat sudo less git unzip

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install wp-cli
RUN curl -sL https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o wp; \
    chmod +x wp; \
    mv wp /usr/local/bin/; \
    mkdir /var/www/.wp-cli; \
    chown www-data:www-data /var/www/.wp-cli

# ensure wordpress has write permission on linux host https://github.com/postlight/headless-wp-starter/issues/202
RUN chown -R www-data:www-data /var/www/html

# copy starting wp-uploads
COPY ../docker/wp_uploads /var/www/html/wp-content/uploads

# copy startup script
COPY ../docker/install_wordpress.sh /usr/local/bin/install_wordpress

EXPOSE 8000
