#!/usr/bin/env bash

set -e

pnpm publish -r \
  --no-git-checks \
  --dry-run