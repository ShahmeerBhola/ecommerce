#!/usr/bin/env sh

set -e

# Install php dependencies
composer install

mariadb_ready='nc -z sos-db 3306'

if ! $mariadb_ready; then
  printf 'Waiting for MariaDB.'
  while ! $mariadb_ready; do
    printf '.'
    sleep 1
  done
  echo
fi

if wp core is-installed; then
  echo "WordPress is already installed, exiting."
  exit
fi

wp core download \
  --version="$WORDPRESS_VERSION" \
  --locale="$WORDPRESS_LOCALE" \
  --skip-content \
  --force

if [ ! -f wp-config.php ]; then
  wp config create \
    --dbhost="$WORDPRESS_DB_HOST" \
    --dbname="$WORDPRESS_DB_NAME" \
    --dbuser="$WORDPRESS_DB_USER" \
    --dbpass="$WORDPRESS_DB_PASSWORD" \
    --dbprefix="$WORDPRESS_DB_PREFIX" \
    --dbcharset="$WORDPRESS_DB_CHARSET" \
    --dbcollate="$WORDPRESS_DB_COLLATION" \
    --locale="$WORDPRESS_LOCALE" \
    --extra-php <<PHP
\$_SERVER['HTTPS'] = 'on';  # https://wordpress.stackexchange.com/a/179420;
PHP

  # https://wordpress.org/plugins/sendgrid-email-delivery-simplified/#installation
  wp config set SENDGRID_API_KEY "$WORDPRESS_SENDGRID_API_KEY"
  wp config set SENDGRID_SEND_METHOD "$WORDPRESS_SENDGRID_SEND_METHOD"
  wp config set SENDGRID_FROM_NAME "$WORDPRESS_SENDGRID_FROM_NAME"
  wp config set SENDGRID_FROM_EMAIL "$WORDPRESS_SENDGRID_FROM_EMAIL"
  wp config set SENDGRID_CONTENT_TYPE "$WORDPRESS_SENDGRID_CONTENT_TYPE"
  wp config set FORM_SUBMISSION_TO_EMAIL "$WORDPRESS_FORM_SUBMISSION_TO_EMAIL"
  wp config set SENDGRID_MC_OPT_USE_TRANSACTIONAL true --raw
  wp config set STRIPE_API_SECRET_KEY "$WORDPRESS_STRIPE_API_SECRET_KEY"
  wp config set HEADLESS_FRONTEND_ORIGIN "$WORDPRESS_HEADLESS_FRONTEND_ORIGIN"
fi
