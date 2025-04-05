#!/usr/bin/env bash

# set -e -x

GITHUB_TOKEN=$(cat ./gh-token.txt)

export GITHUB_TOKEN

pnpm publish -r \
  --no-git-checks \
  --dry-run