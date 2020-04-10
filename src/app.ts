import Koa from 'koa';
import { createContainer, AwilixContainer, asValue } from 'awilix';
import { scopePerRequest, loadControllers, inject } from 'awilix-koa';
import { createLogger, Logger, format, transports } from 'winston';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import { createConnection, Connection, getCustomRepository } from 'typeorm';

import RequestMiddleware from './middleware/RequestMiddleware';
import { PhotoRepository } from './repositories/PhotoRepository';

async function createApp(): Promise<Koa> {
	const app: Koa = new Koa();

	if (process.env.NODE_ENV !== 'prod') {
		dotenv.config();
	}

	const connection: Connection = await createConnection({
		type: 'postgres',
		host: process.env.DB_HOST,
		port: 5432,
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: 'postgres',
		entities: [__dirname + '/models/*.{ts,js}'],
		synchronize: true, //TODO: Remove
	});

	const photoRepository: PhotoRepository = getCustomRepository(PhotoRepository);

	const logger: Logger = createLogger({
		transports: [
			new transports.Console({
				format: format.simple(),
			}),
		],
	});

	const container: AwilixContainer = createContainer().register({
		logger: asValue(logger),
		connection: asValue(connection),
		photoRepository: asValue(photoRepository),
	});

	app
		.use(bodyParser())
		.use(scopePerRequest(container))
		.use(inject(RequestMiddleware))
		.use(loadControllers('controllers/*.{ts,js}', { cwd: __dirname }));

	return app;
}

export { createApp };
