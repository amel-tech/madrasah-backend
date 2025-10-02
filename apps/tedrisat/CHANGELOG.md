# Changelog

## [0.1.2](https://github.com/amel-tech/madrasah-backend/compare/tedrisat-v0.1.1...tedrisat-v0.1.2) (2025-10-02)


### Features

* **auth-guard:** add Keycloak public key provider ([be36b26](https://github.com/amel-tech/madrasah-backend/commit/be36b2632b8085c76c45092709030833cc5abd8b))
* **auth-guard:** use config service to inject keycloak jwks url ([6838bec](https://github.com/amel-tech/madrasah-backend/commit/6838bec3ca76f07c7b77c56cd80d5c7112b2395d))
* auto migrate at runtime ([0c4a3be](https://github.com/amel-tech/madrasah-backend/commit/0c4a3beb32e11a671ec8e8ef8214924abe9c795d))
* auto migrate at runtime ([27d44c2](https://github.com/amel-tech/madrasah-backend/commit/27d44c2979f6559e649a1b91e202ac6afa73b880))
* basic base response model implementation ([9911a11](https://github.com/amel-tech/madrasah-backend/commit/9911a11d54f1cc05ddfa115957d4c4549d045516))
* basic base response model implementation ([4efdec5](https://github.com/amel-tech/madrasah-backend/commit/4efdec5983432f99a8c5bf74f3cc409913f5aa2e))
* cors config ([33865ee](https://github.com/amel-tech/madrasah-backend/commit/33865eebcabfe125e49f0dbe0f3cde8446413a69))
* cors config ([84b8452](https://github.com/amel-tech/madrasah-backend/commit/84b845226a268df53e1ea7893a10ff3986d00cc4))
* migrations is controlled by config ([607b8f7](https://github.com/amel-tech/madrasah-backend/commit/607b8f7138de321685944d1c0b266f6f62ee8e4e))
* rename response model to MedarisResponse ([105ce9c](https://github.com/amel-tech/madrasah-backend/commit/105ce9cf7f0aa6ba123897c106d220cd93284568))
* test coverage with complete test suits ([ec59727](https://github.com/amel-tech/madrasah-backend/commit/ec597277dd444bc718a18976aed5aa4d0a40d759))
* testcontainers integrated ([353b3b2](https://github.com/amel-tech/madrasah-backend/commit/353b3b2b4c2d44ef6b5a274fd63cf187cc4478af))
* **tests:** set KEYCLOAK_JWKS_URL for testing environment ([206a7e8](https://github.com/amel-tech/madrasah-backend/commit/206a7e80c039e928849557c6ea0910daa941594b))


### Bug Fixes

* remove unused imports and add eslint unused imports ([e8c093d](https://github.com/amel-tech/madrasah-backend/commit/e8c093d6162e8feccdd793cc7ece3d0adb641d41))

## [0.1.1](https://github.com/amel-tech/madrasah-backend/compare/tedrisat-v0.1.0...tedrisat-v0.1.1) (2025-08-21)


### Features

* add security audit tools and workflows ([fdae3db](https://github.com/amel-tech/madrasah-backend/commit/fdae3db2bd25a54f3b8c002b71f2dab1363735d6))
* add security audit tools and workflows ([4d58fd0](https://github.com/amel-tech/madrasah-backend/commit/4d58fd04e28d85855dafc1d3a56489d552f137aa))
* base error renamed as MedarisError and removed overcomplicated error types ([7375235](https://github.com/amel-tech/madrasah-backend/commit/73752354eff1383a997eb415f9c7020c3a8cfb6b))
* common logger and global middleware implementation ([fa2c30b](https://github.com/amel-tech/madrasah-backend/commit/fa2c30bbf9989b6c655732b2fc69a5ccfcda48b9))
* common logger and global middleware implementation ([f8fcc7e](https://github.com/amel-tech/madrasah-backend/commit/f8fcc7e0affa55fd3267d94930b84d57768a00cd))
* env examples added ([fe13162](https://github.com/amel-tech/madrasah-backend/commit/fe13162e80177bb31ffaa555df66ab5191415c4d))
* implement drizzle orm with postgresql and example crud operations ([2bb8d4f](https://github.com/amel-tech/madrasah-backend/commit/2bb8d4fdd85a4a6eca86c845009032d84c935d60))
* implement drizzle orm with postgresql and example crud operations ([4bcebf2](https://github.com/amel-tech/madrasah-backend/commit/4bcebf27a892afb635e05f83ca6d6d8208226730))
* implement global exception handling mechanism ([863eb1f](https://github.com/amel-tech/madrasah-backend/commit/863eb1f3044a4fdf35ecfdbc6096349f38f3d39c))
* implement JWT authentication with AuthGuard and secure endpoint ([d7976ab](https://github.com/amel-tech/madrasah-backend/commit/d7976ab786c2e702cabffcff8b2e2f4f89031d83))
* improve error definitions by refactoring for better readibility and usage ([a8fc6ac](https://github.com/amel-tech/madrasah-backend/commit/a8fc6ac7b8711f1ecc6e83cba1fa873ea26ddec9))
* improve usage of MedarisError ([26716a5](https://github.com/amel-tech/madrasah-backend/commit/26716a5dd9067d7c28ca80390bba3891e68c896e))
* npm dependencies and depcheck config updated ([8a66d56](https://github.com/amel-tech/madrasah-backend/commit/8a66d56a84b46998ea6861fcb1d71140717978f5))
* npm dependencies and depcheck config updated ([c80bdc7](https://github.com/amel-tech/madrasah-backend/commit/c80bdc793baba536f1e42f573d1b29b8b1a76d78))
* sync package.json versions with release-please-manifest ([f56ecd2](https://github.com/amel-tech/madrasah-backend/commit/f56ecd20b016020e3b45000eb64f9534e1c85454))


### Bug Fixes

* correct service ports and update service names in documentation ([71e0e5e](https://github.com/amel-tech/madrasah-backend/commit/71e0e5ec49aef6ead588cca6d2357ca3be66fe59))
* depcheck and dependency updates ([be40dc2](https://github.com/amel-tech/madrasah-backend/commit/be40dc2c356ea9e816da74581d9d6da471df8328))
* lint fixes ([4ed8ea6](https://github.com/amel-tech/madrasah-backend/commit/4ed8ea661e37bf5561c9daa354df144f6b2138a7))
* otel logs fix and some small updates ([909c808](https://github.com/amel-tech/madrasah-backend/commit/909c80872a2dc7b3d105976970795805260d03a9))
* otel logs fix and some small updates ([6467bcb](https://github.com/amel-tech/madrasah-backend/commit/6467bcb30f71058972c12f7ab2ce8a5834b76706))
* refine deployment workflows for Tedrisat and Teskilat, enhancing… ([abec291](https://github.com/amel-tech/madrasah-backend/commit/abec29120f989022fc7ba3447617aa8da8578068))
* update Dockerfiles for tedrisat and teskilat applications ([468d5c6](https://github.com/amel-tech/madrasah-backend/commit/468d5c62d44a115beb1f035d8ef751792f3e7f1c))
* update Dockerfiles for tedrisat and teskilat applications ([1ccbd58](https://github.com/amel-tech/madrasah-backend/commit/1ccbd580205da2a371d952729b3e7f1a21182834))
* update package.json scripts to leverage turborepo with hotreload dev scripts ([380521c](https://github.com/amel-tech/madrasah-backend/commit/380521c71d4512aca5102381a482961088709806))
* use version number instead of workspace:* for workspace referencing ([5931315](https://github.com/amel-tech/madrasah-backend/commit/59313155d1a598dfa7f61b275ffb028198425373))
