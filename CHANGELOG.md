# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 0.3.0 - 2021-05-09
### Added
 - CLI: Added `lint` command for validating structure and some other aspects of `local-api-gateway.yml`.

## 0.2.0 - 2021-02-08
### Added
 - CLI: Handles networks in docker-compose.yml. Aliases are fixed, alias is added for original service name,
   and containers are isolated to no longer be visible in cases where they wouldn't have been visible in the original
   docker-compose.yml.
 - CLI: Added argument to `up` and `build` commands, `--no-build-config` to skip rebuilding the contents of the
   `.local-api-gateway folder.

### Changed
 - CLI: Gateway container is now restarted when it dies.
