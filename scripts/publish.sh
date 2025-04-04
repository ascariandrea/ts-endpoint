#!/usr/bin/env bash

# set -e -x

pnpm publish -r \
  --no-git-checks \
  --tag alpha \
  --dry-run