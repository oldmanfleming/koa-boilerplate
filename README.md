# ![RealWorld Example App](logo.png)

# Koa Boilerplate 🚀

[![Build Status](https://travis-ci.com/eflem00/koa-boilerplate.svg?branch=master)](https://travis-ci.com/eflem00/koa-boilerplate) [![Coverage Status](https://coveralls.io/repos/github/eflem00/koa-boilerplate/badge.svg?branch=master)](https://coveralls.io/github/eflem00/koa-boilerplate?branch=master) [![dependencies Status](https://david-dm.org/eflem00/koa-boilerplate/status.svg)](https://david-dm.org/eflem00/koa-boilerplate) [![devDependencies Status](https://david-dm.org/eflem00/koa-boilerplate/dev-status.svg)](https://david-dm.org/eflem00/koa-boilerplate?type=dev) [![License](https://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

### Koa + Typescript + TypeORM codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

## **Features**

- ✔️ Strict Typescript Configuration
- 🧬 TypeORM For ORM And Migration Configuration
- 💉 Awilix-Koa For Dependancy Injection And Declarative Routing
- 🐋 Dockerized For Easy Deployments
- 💯 100% Unit Test Coverage with Jest And Sinon
- 🧪 Integration Test Configuration using Docker-Compose, Jest and SuperTest
- 🚚 CI/CD Pipelines With Travis
- 🔒 JWT Auth and Password Hashing
- 📜 Environment Specific With Dotenv
- ⛔ Joi For Request Validation
- 🎀 Cleaner Code With ESLint And Prettier
- 🧭 Realworld Example Implementation
- 💣 Ejection script to remove example code

## **Coming Soon**

- 🛵 Generator scripts to add controllers, middleware and services with tests
- 🧪 More integration test coverage

## **Table of Contents**

- [Prerequisites](#prerequisites)
- [Local Setup](#local)
- [Ejection](#ejection)
- [Commands](#commands)
- [External Docs](#docs)
- [Project Structure](#structure)
- [License](#license)

## **Prerequisites**

- Node v12+
- Postgres v10+
- Docker

## **Local**

1.  **Clone and Install**


    ```
    git clone <url>

    cd koa-boilerplate

    npm install

    npm run build
    ```

2.  **Environment and DB setup**

    Add a .env file in the root of the directory with the following environment variables. Change connection URL as needed for your local postgres install

    ```
    NODE_ENV=development
    PORT=3000
    SECRET=foobar
    TYPEORM_CONNECTION=postgres
    TYPEORM_URL=postgres://postgres:Password1@localhost:5432/postgres
    TYPEORM_ENTITIES=build/src/entities/*.js
    TYPEORM_MIGRATIONS=build/migrations/*.js
    TYPEORM_MIGRATIONS_TABLE_NAME=migrations
    TYPEORM_MIGRATIONS_DIR=migrations
    ```

    Run migrations using typeorm

    ```
    npx typeorm migration:run
    ```

3.  **Run locally**

    Start app locally to verify connection

    ```
    npm run start:dev
    ```

4.  **Test your local setup works**

    This should finish successfully to know you have a working local setup and any changes you have made are not breaking

    ```
    npm run commit
    ```

    Runs:

    - Build
    - Linting
    - Unit Tests
    - Docker Build
    - Integration Tests

## **Ejection**

```
npm run eject
```

Removes the Realworld Example Code, Updates the Initial Migration while maintaining full code coverage

## **Commands**

1.  **npm scripts**

    ```
    npm run <command>
    ```

    - `start:dev` Run typescript files directly using nodemon and tsnode. Detects changes and automatically restarts server
    - `build` Runs tsc to compile the app. Files are emitted to /build.
    - `eject` Removes example code
    - `lint` Checks for linting errors using ESLint configuration
    - `unittest` Run jest unittests with code coverage
    - `unittest:watch` Detects changes and automatically re-runs tests
    - `docker:up` Standup the dockerize app, a postgres docker image and a migration image that migrates the db
    - `docker:down` Teardown the docker containers
    - `inttest` Run integration tests against the docker images
    - `inttest:watch` Run integration tests and watch for changes
    - `commit` Runs the previouse commands to verify changes before commit. This command also runs in the pipeline

2.  **typeorm scripts**

    All TypeORM commands run on the configuration information specified in the .env folder.
    See [TypeORM CLI Docs](https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md)

    ```
    npx typeorm <command>
    ```

    - `migration:run` Apply any reminaing migrations to the db specified in
    - `migration:revert` Revert the most recent migration applied
    - `migration:show` Show all migrations with status
    - `migration:generate -n migrationNameHere` Compare entities to current db schema and generate migration with changes
    - `migration:create -n migrationNameHere` Create a new migration

## **Docs**

- [Koa](https://devdocs.io/koa/)
- [Typescript](https://www.typescriptlang.org/docs/home)
- [TypeORM](https://github.com/typeorm/typeorm/tree/master/docs)
- [Awilix-Koa](https://github.com/jeffijoe/awilix-koa)
- [Docker](https://docs.docker.com)
- [Hapi/Joi](https://github.com/hapijs/joi/blob/master/API.md)
- [EsLint](https://eslint.org/docs/user-guide/configuring)
- [Sinon](https://sinonjs.org/releases/latest/)
- [Supertest](https://www.npmjs.com/package/supertest)

## **Structure**

- Coming Soon...

## **License**

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2020 © Evan Gordon Fleming.
