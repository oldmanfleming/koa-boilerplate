import { Context, Next } from 'koa';
import { PoolClient, Pool } from 'pg';
import { BAD_REQUEST } from 'http-status-codes';
import { asValue } from 'awilix';
import { Logger } from 'winston';

export default function ({ pool, logger }: { pool: Pool; logger: Logger }) {
	return async function (ctx: Context, next: Next) {
		let client: PoolClient | undefined;
		try {
			client = await pool.connect();

			ctx.state.container.register({
				client: asValue(client),
			});

			await next();
		} catch (ex) {
			logger.error('caught exception ', ex);
			ctx.status = BAD_REQUEST;
			ctx.body = { message: 'invalid request' };
		} finally {
			logger.info(`${ctx.request.path} ${ctx.response.status}`);
			if (client) {
				client.release();
			}
		}
	};
}
