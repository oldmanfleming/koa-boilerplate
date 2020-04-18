import { Context, Next } from 'koa';
// import jwt from 'jsonwebtoken';

import Logger from '../lib/Logger';
import Config from '../lib/Config';

export default function ({ config }: { config: Config }) {
	return async function (ctx: Context, next: Next) {
		Logger.info(config.secret);
		const { authorization }: { authorization: string } = ctx.header;
		Logger.info(authorization);
		return next();
	};
}
