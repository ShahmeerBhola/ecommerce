#!/bin/bash

WEB_APP="127.0.0.1 standoutspecialties.local"
WORDPRESS="127.0.0.1 wordpress.standoutspecialties.local"
PHP_MY_ADMIN="127.0.0.1 phpmyadmin.standoutspecialties.local"

idempotently_modify_etc_hosts() {
  if ! grep "$1" /etc/hosts > /dev/null; then
    echo "$1" >> /etc/hosts
    printf "Added $1 to /etc/hosts\n"
  else
    printf "$1 already exists in /etc/hosts\n"
  fi
}

for RESOLTUION in "$WEB_APP" "$WORDPRESS" "$PHP_MY_ADMIN"; do
  idempotently_modify_etc_hosts "$RESOLTUION"
done
