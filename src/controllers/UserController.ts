import { route, GET, POST, before, inject, PUT } from 'awilix-koa';
import { OK, CREATED, UNAUTHORIZED } from 'http-status-codes';
import { Context } from 'koa';
import { Connection } from 'typeorm';
import { assert, object, string } from '@hapi/joi';

import { User } from '../entities/User';
import UserRepository from '../repositories/UserRepository';
import SecurityService from '../services/SecurityService';
import AuthenticationMiddleware from '../middleware/AuthenticationMiddleware';

@route('/api')
export default class UserController {
	private _userRepository: UserRepository;
	private _securityService: SecurityService;

	// Any Dependencies registered to the container can be injected here
	constructor({ connection, securityService }: { connection: Connection; securityService: SecurityService }) {
		this._userRepository = connection.getCustomRepository(UserRepository);
		this._securityService = securityService;
	}

	@route('/users')
	@POST()
	async register(ctx: Context) {
		assert(
			ctx.request.body,
			object({
				user: object({
					username: string().min(5).max(30).required(),
					email: string().email().required(),
					password: string().min(5).max(30).required(),
					bio: string().max(1000),
					image: string().max(1000),
				}),
			}),
		);

		const user: User = new User();
		Object.assign(user, ctx.request.body.user);
		SecurityService.hashPassword(user);

		await this._userRepository.save(user);

		const token: string = this._securityService.generateToken(user);

		ctx.body = { user: user.toUserJSON(token) };
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
		const user: User | undefined = await this._userRepository.findOne({ email });

		if (!user) {
			ctx.throw(UNAUTHORIZED, 'Unauthorized');
		}

		if (!SecurityService.verifyHash(password, user.password)) {
			ctx.throw(UNAUTHORIZED, 'Unauthorized');
		}

		const token: string = this._securityService.generateToken(user);

		ctx.body = { user: user.toUserJSON(token) };
		ctx.status = OK;
	}

	@route('/user')
	@GET()
	@before([inject(AuthenticationMiddleware)])
	async getCurrentUser(ctx: Context) {
		ctx.body = { user: ctx.state.user.toUserJSON(ctx.state.token) };
		ctx.status = OK;
	}

	@route('/user')
	@PUT()
	@before([inject(AuthenticationMiddleware)])
	async updateUser(ctx: Context) {
		assert(
			ctx.request.body,
			object({
				user: object({
					username: string().min(5).max(30),
					email: string().email(),
					bio: string().max(1000),
					image: string().max(1000),
				}),
			}),
		);
		const user: User = ctx.state.user;
		Object.assign(user, ctx.request.body.user);
		await this._userRepository.update(user.id, user);
		ctx.body = { user: user.toUserJSON(ctx.state.token) };
		ctx.status = OK;
	}
}

// await this._connection.transaction(async (tx: EntityManager) => {
// 	await tx.save(user);
// });
