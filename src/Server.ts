import Koa from 'koa';
import dotenv from 'dotenv';

import { createApp } from './App';
import Logger from './Logger';

import 'reflect-metadata';

export async function startServer() {
	try {
		Logger.info('starting...');
		if (!process.env.NODE_ENV) {
			dotenv.config();
		}
		Logger.info(`environment set to ${process.env.NODE_ENV}`);
		const app: Koa = await createApp();
		app.listen(process.env.PORT);
		Logger.info(`listening on localhost:${process.env.PORT}`);
	} catch (ex) {
		Logger.error('exception starting server: ', ex);
	}
}

startServer();
