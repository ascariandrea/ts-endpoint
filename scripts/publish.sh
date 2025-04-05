#!/usr/bin/env bash

# set -e -x

GITHUB_TOKEN=$(cat ./gh-token.txt)

echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc

pnpm publish -r \
  --no-git-checks \
  --dry-run