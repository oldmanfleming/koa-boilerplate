import Koa from 'koa';
import { createContainer, AwilixContainer, asValue } from 'awilix';
import { scopePerRequest, loadControllers, inject } from 'awilix-koa';
import { createLogger, Logger, format, transports } from 'winston';
import bodyParser from 'koa-bodyparser';
import { createConnection, getCustomRepository, Connection, getConnectionOptions, ConnectionOptions } from 'typeorm';

import RequestMiddleware from './middleware/RequestMiddleware';
import { PhotoRepository } from './repositories/PhotoRepository';

export async function connectWithRetry(logger: Logger, connectionOptions: ConnectionOptions): Promise<Connection> {
	try {
		return await createConnection(connectionOptions);
	} catch (err) {
		logger.error('failed to connect to db on startup - retrying in 5 seconds', err);
		await new Promise((resolve: any) => setTimeout(resolve, 5000));
		return connectWithRetry(logger, connectionOptions);
	}
}

export async function createApp(): Promise<Koa> {
	const app: Koa = new Koa();

	const logger: Logger = createLogger({
		transports: [
			new transports.Console({
				format: format.simple(),
			}),
		],
	});

	const connectionOptions: ConnectionOptions = await getConnectionOptions(); // typeorm reads env vars to populate connection options
	Object.assign(connectionOptions, { type: 'postgres', entities: [__dirname + '/models/*.{ts,js}'] }); // manually add entities directory, as it will be different when running in ts-node dev vs compiled
	const connection: Connection = await connectWithRetry(logger, connectionOptions);

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
