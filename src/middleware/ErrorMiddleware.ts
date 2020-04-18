import { Context, Next } from 'koa';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import logger from '../lib/Logger';

export default async function (ctx: Context, next: Next) {
	const startTime: number = Date.now();
	try {
		await next();
	} catch (ex) {
		if (ex.status && ex.status !== INTERNAL_SERVER_ERROR) {
			ctx.status = ex.status;
			ctx.body = { message: ex.message };
		} else {
			logger.error('Caught Exception: ', ex);
			ctx.status = BAD_REQUEST;
			ctx.body = { message: 'Invalid request' };
		}
	} finally {
		logger.info(`${ctx.request.method} ${ctx.request.path} ${ctx.status} ${Date.now() - startTime}ms`);
	}
}
