import Koa from 'koa';
import { createContainer, AwilixContainer, asValue } from 'awilix';
import { scopePerRequest, loadControllers, inject } from 'awilix-koa';
import { createLogger, Logger, format, transports } from 'winston';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import { createConnection, getCustomRepository, Connection } from 'typeorm';

import RequestMiddleware from './middleware/RequestMiddleware';
import { PhotoRepository } from './repositories/PhotoRepository';

export async function connectWithRetry(logger: Logger): Promise<Connection> {
	try {
		return await createConnection({
			type: 'postgres',
			url: process.env.DB_URI,
			entities: [__dirname + '/models/*.{ts,js}'],
			synchronize: true, //TODO: Remove
		});
	} catch (err) {
		logger.error('failed to connect to db on startup - retrying in 5 seconds', err);
		await new Promise((resolve: any) => setTimeout(resolve, 5000));
		return connectWithRetry(logger);
	}
}

export async function createApp(): Promise<Koa> {
	const app: Koa = new Koa();

	if (process.env.NODE_ENV !== 'production') {
		dotenv.config();
	}

	const logger: Logger = createLogger({
		transports: [
			new transports.Console({
				format: format.simple(),
			}),
		],
	});

	const connection: Connection = await connectWithRetry(logger);

	logger.info('successfully established db connection');

	const photoRepository: PhotoRepository = getCustomRepository(PhotoRepository);

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
