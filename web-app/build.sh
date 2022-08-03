#!/bin/bash

if [ "$NODE_ENV" = "production" ]; then
  echo 'Generating sitemap'
  node ./scripts/generateSitemap.js
fi

echo 'Starting build'
./node_modules/.bin/next build
echo 'Finished build'
