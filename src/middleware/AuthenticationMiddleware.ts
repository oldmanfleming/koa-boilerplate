import { Context, Next } from 'koa';
import { Connection } from 'typeorm';

import Security, { Claims } from '../lib/Security';
import UserRepository from '../repositories/UserRepository';
import { User } from '../entities/User';

export default function ({ connection, security }: { connection: Connection; security: Security }) {
	return async function (ctx: Context, next: Next) {
		const { authorization }: { authorization: string } = ctx.header;

		if (!authorization) {
			ctx.throw(401, 'Unauthorized');
		}

		const [tokenType, token]: string[] = authorization.split(' ');

		if (tokenType.toLowerCase() !== 'bearer' && tokenType.toLowerCase() !== 'token') {
			ctx.throw(401, 'Unauthorized');
		}

		try {
			const claims: Claims = security.verifyToken(token);
			const userRepository: UserRepository = connection.getCustomRepository(UserRepository);
			const user: User | undefined = await userRepository.findOne(claims.id);
			if (!user) {
				ctx.throw(401, 'Unauthorized');
			}
			ctx.state.user = user;
			ctx.state.user.token = token;
			return next();
		} catch {
			ctx.throw(401, 'Unauthorized');
		}
	};
}
