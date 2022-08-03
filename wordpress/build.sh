#!/bin/bash

# Keep in mind that this is being run on ubuntu-latest server on github actions..

WORDPRESS_VERSION="$(cat .wordpress-version)"
WORDPRESS_LOCALE="$(cat .wordpress-locale)"

# Install wp-cli
curl -sL https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o wp
sudo chmod +x wp
sudo mv wp /usr/local/bin/

wp core download \
    --version="$WORDPRESS_VERSION" \
    --locale="$WORDPRESS_LOCALE" \
    --skip-content

# https://github.com/GoogleCloudPlatform/php-tools/blob/master/src/Utils/WordPress/files/wp-config.php
wp config create \
    --dbname="$DB_NAME" \
    --dbuser="$DB_USER" \
    --dbpass="$DB_PASS" \
    --dbhost="$DB_HOST" \
    --dbprefix="$DB_PREFIX" \
    --dbcharset="$DB_CHARSET" \
    --dbcollate="$DB_COLLATE" \
    --locale="$WORDPRESS_LOCALE" \
    --skip-salts \
    --skip-check

wp config set WP_DEBUG true --raw
wp config set WP_DEBUG_LOG true --raw

wp config set AUTH_KEY "$AUTH_KEY"
wp config set SECURE_AUTH_KEY "$SECURE_AUTH_KEY"
wp config set LOGGED_IN_KEY "$LOGGED_IN_KEY"
wp config set NONCE_KEY "$NONCE_KEY"

wp config set AUTH_SALT "$AUTH_SALT"
wp config set SECURE_AUTH_SALT "$SECURE_AUTH_SALT"
wp config set LOGGED_IN_SALT "$LOGGED_IN_SALT"
wp config set NONCE_SALT "$NONCE_SALT"
wp config set WP_MEMORY_LIMIT "256M"

# https://wordpress.org/plugins/sendgrid-email-delivery-simplified/#installation
wp config set SENDGRID_API_KEY "$SENDGRID_API_KEY"
wp config set SENDGRID_SEND_METHOD "$SENDGRID_SEND_METHOD"
wp config set SENDGRID_FROM_NAME "$SENDGRID_FROM_NAME"
wp config set SENDGRID_FROM_EMAIL "$SENDGRID_FROM_EMAIL"
wp config set SENDGRID_CONTENT_TYPE "$SENDGRID_CONTENT_TYPE"
wp config set FORM_SUBMISSION_TO_EMAIL "$FORM_SUBMISSION_TO_EMAIL"
wp config set SENDGRID_MC_OPT_USE_TRANSACTIONAL true --raw
wp config set STRIPE_API_SECRET_KEY "$STRIPE_API_SECRET_KEY";
wp config set HEADLESS_FRONTEND_ORIGIN "$HEADLESS_FRONTEND_ORIGIN";

# https://www.ionos.com/community/hosting/php/install-and-use-php-composer-on-ubuntu-1604/
sudo apt-get update
sudo apt-get install curl
sudo curl -s https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer install
