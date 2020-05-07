import { route, GET } from 'awilix-koa';
import { OK } from 'http-status-codes';
import { Context } from 'koa';
import { Connection } from 'typeorm';

import { Tag } from '../entities/Tag';
import TagRepository from '../repositories/TagRepository';

@route('/api/tags')
export default class ProfileController {
	private _tagRepository: TagRepository;

	// Any Dependencies registered to the container can be injected here
	constructor({ connection }: { connection: Connection }) {
		this._tagRepository = connection.getCustomRepository(TagRepository);
	}

	@route('/')
	@GET()
	async getTags(ctx: Context) {
		const tags: Tag[] = await this._tagRepository.find();
		ctx.body = { tags: tags.map((tag: Tag) => tag.toJSON()) };
		ctx.status = OK;
	}
}
