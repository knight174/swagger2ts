# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.3](https://github.com/knight174/swagger2ts/compare/v0.3.1...v0.3.3) (2025-11-10)


### Features

* add Chinese documentation and Swagger 2.0 mock data ([8b0670d](https://github.com/knight174/swagger2ts/commit/8b0670deb275367ab19c08e46e0aede0776b81d7))
* add example configuration for multiple API sources with different client types ([7cd933d](https://github.com/knight174/swagger2ts/commit/7cd933db50b3fa3de840c7ed7b965d1ea34af327))

### [0.3.2](https://github.com/knight174/swagger2ts/compare/v0.3.1...v0.3.2) (2025-11-10)

### [0.3.1](https://github.com/knight174/swagger2ts/compare/v0.3.0...v0.3.1) (2025-11-07)

## [0.3.0](https://github.com/knight174/swagger2ts/compare/v0.2.1...v0.3.0) (2025-11-06)


### ⚠ BREAKING CHANGES

* **config:** GefeConfig interface renamed to Swagger2TsConfig

### Features

* **config:** add multi-source configuration support with config file loader ([cff792e](https://github.com/knight174/swagger2ts/commit/cff792ea24c8dd96554bb296bd6dcc18cf746371))

### [0.2.1](https://github.com/knight174/swagger2ts/compare/v0.2.0...v0.2.1) (2025-11-06)

## 0.2.0 (2025-11-05)


### ⚠ BREAKING CHANGES

* Removed --source flag and predefined API sources (demo, gitee). Users must now specify input/output explicitly via CLI args, environment variables, or config file.

- Removed PREDEFINED_SOURCES from CLI and documentation
- Added 7 comprehensive usage examples covering basic usage, authentication, multiple APIs, custom patches, config files, environment variables, and Axios client
- Added axios-client.config.ts template for Axios-based API clients
- Updated documentation to reflect removal of predefined sources
- Fixed CLI version detection for both development and compiled modes
- Enhanced error messages with proper Chinese punctuation
- Added examples README with detailed usage instructions

Migration: Replace `npx gefe-api-gen --source demo` with `npx gefe-api-gen -i ./swagger.json -o ./src/api

### Features

* add complete npx-executable API generator with incremental caching ([0d8283b](https://github.com/knight174/swagger2ts/commit/0d8283bc72547d0869f7b9a8ccfcb1438792cf8b))
* remove predefined sources and add comprehensive examples ([d08934d](https://github.com/knight174/swagger2ts/commit/d08934dc1792fd97784faabda279d92b06d02e74))
* rename and restructure project to Swagger2TS, removing Gefe references and updating documentation ([edbc380](https://github.com/knight174/swagger2ts/commit/edbc380a8e267b6c78d819d3d3049e117c437c0b))
