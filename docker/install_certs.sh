#!/bin/bash

brew install mkcert
mkcert -install
rm ./caddy/certs/*.pem
mkcert "*.standoutspecialties.local"
mkcert "standoutspecialties.local"
mv *.pem ./caddy/certs
