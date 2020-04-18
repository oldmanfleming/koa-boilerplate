import Koa from 'koa';
import dotenv from 'dotenv';

import { createApp } from './app';
import Logger from './lib/Logger';

import 'reflect-metadata';

export async function startServer() {
	try {
		Logger.info('starting...');
		if (!process.env.NODE_ENV) {
			dotenv.config();
		}
		Logger.info(`environment set to ${process.env.NODE_ENV}`);
		const app: Koa = await createApp();
		const port: string = process.env.PORT || '3000';
		app.listen(port);
		Logger.info(`listening on localhost:${port}`);
	} catch (ex) {
		Logger.error('exception starting server: ', ex);
	}
}

startServer();
