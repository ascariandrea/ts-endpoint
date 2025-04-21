#!/usr/bin/env bash

set -e -x

destination=${1:-dist}
relative_destination="../../$destination"

cd ./packages

cd ./core && pnpm pack --pack-destination "$relative_destination" && cd ..
cd ./http-client && pnpm pack --pack-destination "$relative_destination" && cd ..
cd ./resource-client && pnpm pack --pack-destination "$relative_destination" && cd ..
cd ./express && pnpm pack --pack-destination "$relative_destination" && cd ..
cd ./react-admin && pnpm pack --pack-destination "$relative_destination" && cd ..
cd ./tanstack-query && pnpm pack --pack-destination "$relative_destination" && cd ..