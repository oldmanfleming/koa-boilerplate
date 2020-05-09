import { route, POST, before, inject } from 'awilix-koa';
import { CREATED } from 'http-status-codes';
import { Context } from 'koa';
import { Connection } from 'typeorm';
import { assert, object, string, array } from '@hapi/joi';
import slugify from 'slugify';

import ArticleRepository from '../repositories/ArticleRepository';
import AuthenticationMiddleware from '../middleware/AuthenticationMiddleware';
import { Article } from '../entities/Article';
// import FollowRepository from '../repositories/FollowRepository';
// import TagRepository from '../repositories/TagRepository';
import { Tag } from '../entities/Tag';

@route('/api/articles')
export default class ArticleController {
	private _articleRepository: ArticleRepository;
	// private _followRepository: FollowRepository;
	// private _tagRepository: TagRepository;

	// Any Dependencies registered to the container can be injected here
	constructor({ connection }: { connection: Connection }) {
		this._articleRepository = connection.getCustomRepository(ArticleRepository);
		// this._followRepository = connection.getCustomRepository(FollowRepository);
		// this._tagRepository = connection.getCustomRepository(TagRepository);
	}

	@route('/')
	@POST()
	@before([inject(AuthenticationMiddleware)])
	async createArticle(ctx: Context) {
		assert(
			ctx.request.body,
			object({
				article: object({
					title: string().min(5).max(50).required(),
					description: string().max(100).required(),
					body: string().max(5000).required(),
					tagList: array().items(string().max(10)).required(),
				}),
			}),
		);

		const article: Article = new Article();
		article.title = ctx.request.body.article.title;
		article.description = ctx.request.body.article.description;
		article.body = ctx.request.body.article.body;
		article.slug = slugify(article.title, { lower: true });
		article.author = ctx.state.user;
		article.tagList = ctx.request.body.article.tagList.map((tagLabel: string) => {
			const tag: Tag = new Tag();
			tag.label = tagLabel;
			return tag;
		});

		await this._articleRepository.save(article);

		const savedArticle: Article = await this._articleRepository.findOneOrFail({ slug: article.slug });

		ctx.body = savedArticle.toJSON(false, false, 0);
		ctx.status = CREATED;
	}
}

// await this._connection.transaction(async (tx: EntityManager) => {
// 	await tx.save(user);
// });
