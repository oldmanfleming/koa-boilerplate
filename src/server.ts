import Koa from 'koa';
import { createApp } from './app';

import 'reflect-metadata';

(async () => {
	try {
		const port: string | number = process.env.PORT || 3000;
		const app: Koa = await createApp();
		app.listen(port);
		console.info(`listening on localhost:${port}`);
	} catch (ex) {
		console.error('exception initiating server: ', ex);
	}
})();
