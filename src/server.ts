import Koa from 'Koa';
import createApp from './app';

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
