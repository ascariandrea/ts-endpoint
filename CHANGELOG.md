# Changelog

## [1.0.0](https://github.com/ascariandrea/ts-endpoint/compare/root@1.0.0) (2026-07-17)

### Features

* **express:** streamable endpoint ([46344a97](https://github.com/ascariandrea/ts-endpoint/commit/46344a97))
* **core:** add `BodyInput<E>` type helper for filter-constrained Body schemas ([#36](https://github.com/ascariandrea/ts-endpoint/issues/36)) ([0535933d](https://github.com/ascariandrea/ts-endpoint/commit/0535933d))
* **tanstack-query:** derive TanStack Query definitions from Endpoints ([c6411532](https://github.com/ascariandrea/ts-endpoint/commit/c6411532))
* **express:** define @ts-endpoint/express adapter ([e2a33a9f](https://github.com/ascariandrea/ts-endpoint/commit/e2a33a9f))
* **react-admin:** define @ts-endpoint/react-admin integration ([37842fbb](https://github.com/ascariandrea/ts-endpoint/commit/37842fbb))
* **resource-client:** define @ts-endpoint/resource-client ([f28f1310](https://github.com/ascariandrea/ts-endpoint/commit/f28f1310))
* **http-client:** define @ts-endpoint/http-client ([dfda4b69](https://github.com/ascariandrea/ts-endpoint/commit/dfda4b69))
* **core:** define @ts-endpoint/core package ([aab4c1f7](https://github.com/ascariandrea/ts-endpoint/commit/aab4c1f7))
* support both io-ts and effect/Schema ([#16](https://github.com/ascariandrea/ts-endpoint/issues/16)) ([42e06f78](https://github.com/ascariandrea/ts-endpoint/commit/42e06f78))

### Bug Fixes

* **express:** enforce return type for stream response ([f4b9b1d1](https://github.com/ascariandrea/ts-endpoint/commit/f4b9b1d1))
* **express:** use proper type for stream output ([d25470a9](https://github.com/ascariandrea/ts-endpoint/commit/d25470a9))
* **core:** set Codec context parameter equal to 'any' ([791be24a](https://github.com/ascariandrea/ts-endpoint/commit/791be24a))
* **tanstack-query:** remove react-admin dependency for use query params ([65341d5e](https://github.com/ascariandrea/ts-endpoint/commit/65341d5e))
* parametric decode function for endpoint implementations ([9324e719](https://github.com/ascariandrea/ts-endpoint/commit/9324e719))
* extend io-ts codec with 'name' property ([fd24991c](https://github.com/ascariandrea/ts-endpoint/commit/fd24991c))

### Miscellaneous Chores

* add planning docs and ignore VS Code workspace file ([f2b431f9](https://github.com/ascariandrea/ts-endpoint/commit/f2b431f9))
* params fixes ([722fdfc6](https://github.com/ascariandrea/ts-endpoint/commit/722fdfc6))
* exclude test folder from ts build config ([9adb16fe](https://github.com/ascariandrea/ts-endpoint/commit/9adb16fe))
* lint issues ([f94b59f2](https://github.com/ascariandrea/ts-endpoint/commit/f94b59f2))
* lint issues ([c006cf74](https://github.com/ascariandrea/ts-endpoint/commit/c006cf74))
* added missing spec and type tests ([#35](https://github.com/ascariandrea/ts-endpoint/issues/35)) ([6ec05863](https://github.com/ascariandrea/ts-endpoint/commit/6ec05863))
* bump vitest from 3.1.1 to 4.0.18 ([#34](https://github.com/ascariandrea/ts-endpoint/issues/34)) ([b17d3e53](https://github.com/ascariandrea/ts-endpoint/commit/b17d3e53))
* setup dependabot for both npm and actions ecosystems ([#33](https://github.com/ascariandrea/ts-endpoint/issues/33)) ([a8679b82](https://github.com/ascariandrea/ts-endpoint/commit/a8679b82))
* setup publish on NPM on release ([#32](https://github.com/ascariandrea/ts-endpoint/issues/32)) ([7c9ab1fa](https://github.com/ascariandrea/ts-endpoint/commit/7c9ab1fa))
* add CLAUDE.md for Claude Code guidance ([13f47125](https://github.com/ascariandrea/ts-endpoint/commit/13f47125))
* bump node to v22 ([ce1567da](https://github.com/ascariandrea/ts-endpoint/commit/ce1567da))
* add AGENTS.md ([15d2f840](https://github.com/ascariandrea/ts-endpoint/commit/15d2f840))
* support both express 4 and 5 ([656a244e](https://github.com/ascariandrea/ts-endpoint/commit/656a244e))
* add examples to workspace ([#29](https://github.com/ascariandrea/ts-endpoint/issues/29)) ([80ff6f73](https://github.com/ascariandrea/ts-endpoint/commit/80ff6f73))
* set release-please bootstrap commit sha ([ce61e1e1](https://github.com/ascariandrea/ts-endpoint/commit/ce61e1e1))
* migrate to docusaurus 3 ([#28](https://github.com/ascariandrea/ts-endpoint/issues/28)) ([d21e0868](https://github.com/ascariandrea/ts-endpoint/commit/d21e0868))
* defined code quality workflow ([6ad992b7](https://github.com/ascariandrea/ts-endpoint/commit/6ad992b7))
* eslint setup ([#27](https://github.com/ascariandrea/ts-endpoint/issues/27)) ([40c9bc8c](https://github.com/ascariandrea/ts-endpoint/commit/40c9bc8c))
* update commitlint and husky to latest versions ([4411140c](https://github.com/ascariandrea/ts-endpoint/commit/4411140c))
* update examples with new packages ([#26](https://github.com/ascariandrea/ts-endpoint/issues/26)) ([31276df5](https://github.com/ascariandrea/ts-endpoint/commit/31276df5))
* correct @ts-endpoint/express release-please component path ([2a0d464c](https://github.com/ascariandrea/ts-endpoint/commit/2a0d464c))
* setup verdaccio with docker compose ([1b5b5860](https://github.com/ascariandrea/ts-endpoint/commit/1b5b5860))
* remove old ts-endpoint and ts-io-error packages ([282dc996](https://github.com/ascariandrea/ts-endpoint/commit/282dc996))
* define new packages for release-please ([b308f74d](https://github.com/ascariandrea/ts-endpoint/commit/b308f74d))
* remove release-please manifest ([b7c39f56](https://github.com/ascariandrea/ts-endpoint/commit/b7c39f56))
* set release-please prerelease-type to alpha ([75723eec](https://github.com/ascariandrea/ts-endpoint/commit/75723eec))
* set release-please versioning to prerelease ([13aa1dbc](https://github.com/ascariandrea/ts-endpoint/commit/13aa1dbc))
* setup release-please ([029c5efe](https://github.com/ascariandrea/ts-endpoint/commit/029c5efe))
