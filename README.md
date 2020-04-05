[![Build Status](https://travis-ci.com/eflem00/koa-boilerplate.svg?branch=master)](https://travis-ci.com/eflem00/koa-boilerplate) [![Coverage Status](https://coveralls.io/repos/github/eflem00/koa-boilerplate/badge.svg?branch=master)](https://coveralls.io/github/eflem00/koa-boilerplate?branch=master) [![dependencies Status](https://david-dm.org/eflem00/koa-boilerplate/status.svg)](https://david-dm.org/eflem00/koa-boilerplate) [![devDependencies Status](https://david-dm.org/eflem00/koa-boilerplate/dev-status.svg)](https://david-dm.org/eflem00/koa-boilerplate?type=dev)

# Koa Boilerplate

### A Fully optimized REST API Built using a Koa + Typescript + Postgres stack

### **Features**

- Dependency Injection through Awilix
- Connection Pooling
- ORM Configuration through TypeORM
- Logging through Winston
- Containerized through Docker
- Full unit, integration and test coverage through Jest
- CI Pipeline configuration through Travis

### **Prerequisites**

- Node v12+
- Npm v6+
- Postgres v12+
- Docker

### **Local Setup**

1.  **Fork, Clone and Install**

    Fork your own copy of this repo

    ```
    git clone <your fork>

    cd koa-boilerplate

    npm install
    ```

2.  **Environment and DB setup**

    Add a .env file in the root of the directory with the following environment variables (replace <...> with your specific information)

    ```
    ENV=dev
    DB_USER=<your Postgres user>
    DB_PASS=<your Postgres user's password>
    DB_TARGET=<the location of your postgres db e.g http://localhost:5432>
    ```

    Run this SQL query on your local db to create the example tables

    ```
    TODO
    ```

3.  **Test your local setup works**

    This should finish successfully to know you have a working instance locally

    ```
    npm run commit
    ```

### **Deployment Setup**

TODO

### Inspired By [React Boilerplate](https://github.com/react-boilerplate/react-boilerplate)
