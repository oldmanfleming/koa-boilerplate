import { route, GET, POST, before, inject, PUT } from 'awilix-koa';
import { OK, CREATED } from 'http-status-codes';
import { Context } from 'koa';
import { Connection } from 'typeorm';
import { assert, object, string } from '@hapi/joi';

import { User } from '../entities/User';
import UserRepository from '../repositories/UserRepository';
import Security from '../lib/Security';
import AuthenticationMiddleware from '../middleware/AuthenticationMiddleware';

@route('/api')
export default class UserController {
	private _userRepository: UserRepository;
	private _security: Security;

	// Any Dependencies registered to the container can be injected here
	constructor({ connection, security }: { connection: Connection; security: Security }) {
		this._userRepository = connection.getCustomRepository(UserRepository);
		this._security = security;
	}

	@route('/users')
	@POST()
	async register(ctx: Context) {
		assert(
			ctx.request.body,
			object({
				user: object({
					username: string().alphanum().min(5).max(30).required(),
					email: string().email().required(),
					password: string().min(5).max(100).required(),
					bio: string().max(1000),
					image: string().max(1000),
				}),
			}),
		);

		const user: User = new User();
		Object.assign(user, ctx.request.body.user);
		this._security.hashPassword(user);

		await this._userRepository.save(user);

		this._security.addToken(user);

		ctx.body = user.toJSON();
		ctx.status = CREATED;
	}

	@route('/users/login')
	@POST()
	async login(ctx: Context) {
		assert(
			ctx.request.body,
			object({
				user: object({
					email: string().email().required(),
					password: string().required(),
				}),
			}),
		);

		const { email, password }: { email: string; password: string } = ctx.request.body.user;
		const user: User | undefined = await this._userRepository.findByEmail(email);

		if (!user) {
			ctx.throw(401, 'Unauthorized');
		}

		if (!this._security.verifyHash(password, user.password)) {
			ctx.throw(401, 'Unauthorized');
		}

		this._security.addToken(user);

		ctx.body = user.toJSON();
		ctx.status = OK;
	}

	@route('/user')
	@GET()
	@before([inject(AuthenticationMiddleware)])
	async getCurrentUser(ctx: Context) {
		ctx.body = ctx.state.user.toJSON();
		ctx.status = OK;
	}

	@route('/user')
	@PUT()
	@before([inject(AuthenticationMiddleware)])
	async updateUser(ctx: Context) {
		object({
			user: object({
				username: string().alphanum().min(5).max(30).required(),
				email: string().email().required(),
				bio: string().max(1000),
				image: string().max(1000),
			}),
		});
		const user: User = ctx.state.user;
		Object.assign(user, ctx.request.body.user);
		const token: string = user.token;
		delete user.token; // TODO Remove
		await this._userRepository.update(user.id, user);
		user.token = token;
		ctx.body = user.toJSON();
		ctx.status = OK;
	}
}

// await this._connection.transaction(async (tx: EntityManager) => {
// 	await tx.save(user);
// });
