import { Context, Next } from 'koa';
import { BAD_REQUEST } from 'http-status-codes';
import { Logger } from 'winston';

export default function ({ logger }: { logger: Logger }) {
	return async function (ctx: Context, next: Next) {
		try {
			await next();
		} catch (ex) {
			logger.error('caught exception ', ex);
			ctx.status = BAD_REQUEST;
			ctx.body = { message: 'Invalid request' };
		} finally {
			logger.info(`${ctx.request.method} ${ctx.request.path} ${ctx.status}`);
		}
	};
}
