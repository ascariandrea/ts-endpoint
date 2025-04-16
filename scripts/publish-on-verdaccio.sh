#!/usr/bin/env bash

# mkdir -p ./temp/verdaccio/storage/@ts-endpoint

npm-cli-login -r http://npm.local.dev:4873 \
  -u ts-endpoint \
  -p @ts-endpoint \
  -e dev.ascariandrea@gmail.com

if [ "$1" == "--bump" ]; then
  npm version patch \
    --force \
    --no-git-tag-version \
    --workspaces
fi;


pnpm publish -r \
  --no-git-checks --force
