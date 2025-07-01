# Changelog

## 0.1.0 (2025-07-01)


### Miscellaneous Chores

* added examples to workspace ([#29](https://github.com/ascariandrea/ts-endpoint/issues/29)) ([80ff6f7](https://github.com/ascariandrea/ts-endpoint/commit/80ff6f739ec5d4fa0e3d75cb959aaa16e05c2769))
* defined code quality workflow ([6ad992b](https://github.com/ascariandrea/ts-endpoint/commit/6ad992b7a35238dc369b5cacd84b65e45d5cac46))
* eslint setup ([#27](https://github.com/ascariandrea/ts-endpoint/issues/27)) ([40c9bc8](https://github.com/ascariandrea/ts-endpoint/commit/40c9bc8c5b3064a934da2b2ef8997fe3a14679b6))
* migrate to docusaurus 3 ([#28](https://github.com/ascariandrea/ts-endpoint/issues/28)) ([d21e086](https://github.com/ascariandrea/ts-endpoint/commit/d21e0868b1881d6b351878324fdabdd688591da1))
* run only test changed since last commit on pre-push ([15ab85b](https://github.com/ascariandrea/ts-endpoint/commit/15ab85b6df2bb84e96ce59e7baac2cbadde831b6))
* set release-please bootstrap commit sha ([ce61e1e](https://github.com/ascariandrea/ts-endpoint/commit/ce61e1e141a6bdfce96be9a08a89a8ccacb614eb))
* support both express 4 and 5 ([656a244](https://github.com/ascariandrea/ts-endpoint/commit/656a244e890c354ebd377e1a15cb8f19b17d13a6))
* update all references to old packages ([f57d3df](https://github.com/ascariandrea/ts-endpoint/commit/f57d3dfd94ace1b7748145c281f015f93eb462dd))
* update commitlint and husky to latest versions ([4411140](https://github.com/ascariandrea/ts-endpoint/commit/4411140ca0198286467cca4c642a214af9ca8647))


### Bug Fixes

* parametric decode function for endpoint implementations ([9324e71](https://github.com/ascariandrea/ts-endpoint/commit/9324e719ebc0c4b5379f6e1afeda00a08dcd104b))
* **tanstack-query:** remove react-admin dependency for use query params ([65341d5](https://github.com/ascariandrea/ts-endpoint/commit/65341d5e7e0d02dfc391478bdc9713952a1aaac8))

## [2.0.1](https://github.com/ascariandrea/ts-endpoint/compare/root@2.0.0...root@2.0.1) (2025-04-05)


### Miscellaneous Chores

* added husky pre-push hook ([2cc2ffa](https://github.com/ascariandrea/ts-endpoint/commit/2cc2ffa7c51855bbb7a5e6c9962a1eab8e926d46))
* bump node to 18 ([#170](https://github.com/ascariandrea/ts-endpoint/issues/170)) ([128cdc5](https://github.com/ascariandrea/ts-endpoint/commit/128cdc5017ba5b7ac348c625ee2c04637945e31d))
* bump node to 20 ([#175](https://github.com/ascariandrea/ts-endpoint/issues/175)) ([56137f4](https://github.com/ascariandrea/ts-endpoint/commit/56137f419ea70caaee13dc20b572d279465733fa))
* bump typescript to 5.8.2 ([#171](https://github.com/ascariandrea/ts-endpoint/issues/171)) ([52fd3ea](https://github.com/ascariandrea/ts-endpoint/commit/52fd3ea54a8c3c963e985ddafe47b6dbebd612fb))
* checkout repo before release action ([bbe2003](https://github.com/ascariandrea/ts-endpoint/commit/bbe2003db23c8526130d4ba76c5adfd3a432b47f))
* **deps:** bump express in /examples/react-express-example ([#129](https://github.com/ascariandrea/ts-endpoint/issues/129)) ([886989e](https://github.com/ascariandrea/ts-endpoint/commit/886989ed2b3ba3f8b5860b5e7aa7da67150b700b))
* **deps:** bump node-fetch from 2.6.1 to 2.6.9 ([#144](https://github.com/ascariandrea/ts-endpoint/issues/144)) ([7c3d43b](https://github.com/ascariandrea/ts-endpoint/commit/7c3d43ba15a38b8208672542bbeacb9261404c01))
* **deps:** bump word-wrap from 1.2.3 to 1.2.4 ([#152](https://github.com/ascariandrea/ts-endpoint/issues/152)) ([172139f](https://github.com/ascariandrea/ts-endpoint/commit/172139f6eff7e08908bb29ca9d301e92a923f906))
* docs home page layout ([#149](https://github.com/ascariandrea/ts-endpoint/issues/149)) ([57e0252](https://github.com/ascariandrea/ts-endpoint/commit/57e0252a639cad584000be71a34602c44d9e4ff5))
* don't pass manifest file to release-please CI action ([0733cfe](https://github.com/ascariandrea/ts-endpoint/commit/0733cfec15962cad0f7aa83cc61215432a3534fe))
* don't run tests in watch mode as default ([5172e89](https://github.com/ascariandrea/ts-endpoint/commit/5172e89531e7e544608b0f344238661006965b24))
* ignore coverage folder ([fc39633](https://github.com/ascariandrea/ts-endpoint/commit/fc39633c3f0f7de575e25a400b6dc22d52c56b36))
* keep only js and d.ts for npm published files ([be9618c](https://github.com/ascariandrea/ts-endpoint/commit/be9618c2b6f042a605ad22741c6a617bf1edd8ca))
* packages correct main file export ([#176](https://github.com/ascariandrea/ts-endpoint/issues/176)) ([e5521c7](https://github.com/ascariandrea/ts-endpoint/commit/e5521c7470d76da5df0991d591d5ecdb09713feb))
* pass correct params to release-please CI action ([6151773](https://github.com/ascariandrea/ts-endpoint/commit/6151773e6f08cd3c99fa86708e7337835ff750e5))
* pnpm auth token ([cef008b](https://github.com/ascariandrea/ts-endpoint/commit/cef008b810096a0c41dd09df1efa7decc7e8622c))
* removed registry from .npmrc ([84ab13f](https://github.com/ascariandrea/ts-endpoint/commit/84ab13f519a0a41d1819fcf2e254d6882f3ea065))
* replaced jest with vitest ([#173](https://github.com/ascariandrea/ts-endpoint/issues/173)) ([8a6a7ca](https://github.com/ascariandrea/ts-endpoint/commit/8a6a7ca08427035b2f02e4bce38d0892cf3e0f1d))
* replaced yarn with pnpm ([#168](https://github.com/ascariandrea/ts-endpoint/issues/168)) ([4d66064](https://github.com/ascariandrea/ts-endpoint/commit/4d66064a3bea8cf040fbdeeb62efd064e6e1cdf1))
* set publish config registry to  Github NPM ([6833459](https://github.com/ascariandrea/ts-endpoint/commit/683345903c8ee0aa7a0d86711212f5847b915e11))
* setup github npm registry for publishing ([aa059d7](https://github.com/ascariandrea/ts-endpoint/commit/aa059d757d275f409cfe84559507be167e23a6fd))
* setup release-please ([f36e9b9](https://github.com/ascariandrea/ts-endpoint/commit/f36e9b94233465ee48365f0fab8c5b90d19dfeea))
* setup release-please ([#1](https://github.com/ascariandrea/ts-endpoint/issues/1)) ([5856a1d](https://github.com/ascariandrea/ts-endpoint/commit/5856a1d0be174245cb946eab99b321353f2b8c0e))
* update github actions to v4 ([#169](https://github.com/ascariandrea/ts-endpoint/issues/169)) ([3a32c81](https://github.com/ascariandrea/ts-endpoint/commit/3a32c812d2154b85958b59dd575771e7c86e4bc9))
* upgrade docusaurus@^2 ([#146](https://github.com/ascariandrea/ts-endpoint/issues/146)) ([2d8a126](https://github.com/ascariandrea/ts-endpoint/commit/2d8a126749daab59234ea2fc3fd54f91c1e3a48e))
* use correct registry and auth token in CI ([623207d](https://github.com/ascariandrea/ts-endpoint/commit/623207d7bca40efbca449b44668a67d3c88ddbe7))
