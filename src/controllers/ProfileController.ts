import { route, GET, before, inject, POST, DELETE } from 'awilix-koa';
import { OK, NOT_FOUND } from 'http-status-codes';
import { Context } from 'koa';
import { Connection } from 'typeorm';

import { User } from '../entities/User';
import { Follow } from '../entities/Follow';
import UserRepository from '../repositories/UserRepository';
import AuthenticationMiddleware from '../middleware/AuthenticationMiddleware';
import FollowRepository from '../repositories/FollowRepository';

@route('/api/profiles')
export default class ProfileController {
	private _userRepository: UserRepository;
	private _followRepository: FollowRepository;

	// Any Dependencies registered to the container can be injected here
	constructor({ connection }: { connection: Connection }) {
		this._userRepository = connection.getCustomRepository(UserRepository);
		this._followRepository = connection.getCustomRepository(FollowRepository);
	}

	@route('/:username')
	@GET()
	@before([inject(AuthenticationMiddleware)])
	async getProfile(ctx: Context) {
		const user: User | undefined = await this._userRepository.findOne({ username: ctx.params.username });

		if (!user) {
			ctx.status = NOT_FOUND;
			return;
		}

		const following: boolean = await this._followRepository.following(ctx.state.user, user);

		ctx.body = { profile: user.toProfileJSON(following) };
		ctx.status = OK;
	}

	@route('/:username/follow')
	@POST()
	@before([inject(AuthenticationMiddleware)])
	async followUser(ctx: Context) {
		const user: User | undefined = await this._userRepository.findOne({ username: ctx.params.username });

		if (!user) {
			ctx.status = NOT_FOUND;
			return;
		}

		const following: boolean = await this._followRepository.following(ctx.state.user, user);

		if (!following) {
			const follow: Follow = new Follow();
			follow.follower = ctx.state.user;
			follow.following = user;
			await this._followRepository.save(follow);
		}

		ctx.body = { profile: user.toProfileJSON(true) };
		ctx.status = OK;
	}

	@route('/:username/follow')
	@DELETE()
	@before([inject(AuthenticationMiddleware)])
	async unfollowUser(ctx: Context) {
		const user: User | undefined = await this._userRepository.findOne({ username: ctx.params.username });

		if (!user) {
			ctx.status = NOT_FOUND;
			return;
		}

		await this._followRepository.delete({ following: user, follower: ctx.state.user });

		ctx.body = { profile: user.toProfileJSON(false) };
		ctx.status = OK;
	}
}
