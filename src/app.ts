import Koa from 'koa';
import { Pool } from 'pg';
import { createContainer, AwilixContainer, asValue } from 'awilix';
import { scopePerRequest, loadControllers, inject } from 'awilix-koa';
import { createLogger, Logger, format, transports } from 'winston';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import RequestMiddleware from './middleware/RequestMiddleware';

async function createApp(): Promise<Koa> {
	const app: Koa = new Koa();

	if (process.env.NODE_ENV !== 'prod') {
		dotenv.config();
	}

	const pool: Pool = new Pool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	});

	const logger: Logger = createLogger({
		transports: [
			new transports.Console({
				format: format.simple(),
			}),
		],
	});

	const container: AwilixContainer = createContainer().register({
		pool: asValue(pool),
		logger: asValue(logger),
	});

	// container.loadModules(['services/*.ts'], {
	// 	formatName: 'camelCase',
	// 	resolverOptions: {
	// 		lifetime: Lifetime.SCOPED,
	// 	},
	// });

	app
		.use(bodyParser())
		.use(scopePerRequest(container))
		.use(inject(RequestMiddleware))
		.use(loadControllers('controllers/*.ts', { cwd: __dirname }));

	return app;
}

export { createApp };
