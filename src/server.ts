import Koa from 'koa';
import dotenv from 'dotenv';
import { createApp } from './app';

import 'reflect-metadata';

(async () => {
	try {
		console.info('info: bootstrapping...');
		if (!process.env.NODE_ENV) {
			dotenv.config();
		}
		console.info(`info: environment set to ${process.env.NODE_ENV}`);
		const app: Koa = await createApp();
		const port: string = process.env.PORT || '3000';
		app.listen(port);
		console.info(`info: listening on localhost:${port}`);
	} catch (ex) {
		console.error('error: exception bootstrapping server: ', ex);
	}
})();
