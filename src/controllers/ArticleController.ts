import { route, POST, before, inject, DELETE, PUT } from 'awilix-koa';
import { CREATED, NOT_FOUND, OK } from 'http-status-codes';
import { Context } from 'koa';
import { Connection } from 'typeorm';
import { assert, object, string, array } from '@hapi/joi';
import slugify from 'slugify';

import AuthenticationMiddleware from '../middleware/AuthenticationMiddleware';
import ArticleRepository from '../repositories/ArticleRepository';
import FavoriteRepository from '../repositories/FavoriteRepository';
import FollowRepository from '../repositories/FollowRepository';
import { Article } from '../entities/Article';
import { Tag } from '../entities/Tag';
import { Favorite } from '../entities/Favorite';

@route('/api/articles')
export default class ArticleController {
	private _articleRepository: ArticleRepository;
	private _favoriteRepository: FavoriteRepository;
	private _followRepository: FollowRepository;

	// Any Dependencies registered to the container can be injected here
	constructor({ connection }: { connection: Connection }) {
		this._articleRepository = connection.getCustomRepository(ArticleRepository);
		this._favoriteRepository = connection.getCustomRepository(FavoriteRepository);
		this._followRepository = connection.getCustomRepository(FollowRepository);
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

		const savedArticle: Article = await this._articleRepository.findOneOrFail({
			relations: ['tagList', 'author'],
			where: { slug: article.slug },
		});

		ctx.body = savedArticle.toJSON(false, false, 0);
		ctx.status = CREATED;
	}

	@route('/:slug')
	@PUT()
	@before([inject(AuthenticationMiddleware)])
	async updateArticle(ctx: Context) {
		assert(
			ctx.request.body,
			object({
				article: object({
					title: string().min(5).max(50),
					description: string().max(100),
					body: string().max(5000),
				}),
			}),
		);

		const article: Article | undefined = await this._articleRepository.findOne({ slug: ctx.params.slug });

		if (!article) {
			ctx.status = NOT_FOUND;
			return;
		}

		Object.assign(article, ctx.request.body.article);

		if (ctx.request.body.article.title) {
			article.slug = slugify(article.title, { lower: true });
		}

		await this._articleRepository.update(article.id, article);

		const favoriteCount: number = await this._favoriteRepository.count({ article });
		const favorited: number = await this._favoriteRepository.count({ article, user: ctx.state.user });
		const isFollowing: boolean = await this._followRepository.isFollowing(ctx.state.user, article.author);
		const updatedArticle: Article = await this._articleRepository.findOneOrFail({
			relations: ['tagList', 'author'],
			where: { slug: article.slug },
		});

		ctx.body = updatedArticle.toJSON(isFollowing, !!favorited, favoriteCount);
		ctx.status = CREATED;
	}

	@route('/:slug')
	@DELETE()
	@before([inject(AuthenticationMiddleware)])
	async deleteArticle(ctx: Context) {
		const article: Article | undefined = await this._articleRepository.findOne({ slug: ctx.params.slug });

		if (!article) {
			ctx.status = NOT_FOUND;
			return;
		}

		await this._articleRepository.delete(article.id);

		ctx.status = OK;
	}

	@route('/:slug/favorite')
	@POST()
	@before([inject(AuthenticationMiddleware)])
	async favoriteArticle(ctx: Context) {
		const article: Article | undefined = await this._articleRepository.findOneOrFail({
			relations: ['tagList', 'author'],
			where: { slug: ctx.params.slug },
		});

		if (!article) {
			ctx.status = NOT_FOUND;
			return;
		}

		const existingFavorite: number = await this._favoriteRepository.count({
			article,
			user: ctx.state.user,
		});

		if (!existingFavorite) {
			const favorite: Favorite = new Favorite();
			favorite.article = article;
			favorite.user = ctx.state.user;
			await this._favoriteRepository.save(favorite);
		}

		const favoriteCount: number = await this._favoriteRepository.count({ article });

		const isFollowing: boolean = await this._followRepository.isFollowing(ctx.state.user, article.author);

		ctx.status = CREATED;
		ctx.body = article.toJSON(isFollowing, true, favoriteCount);
	}

	@route('/:slug/favorite')
	@DELETE()
	@before([inject(AuthenticationMiddleware)])
	async unfavoriteArticle(ctx: Context) {
		const article: Article | undefined = await this._articleRepository.findOneOrFail({
			relations: ['tagList', 'author'],
			where: { slug: ctx.params.slug },
		});

		if (!article) {
			ctx.status = NOT_FOUND;
			return;
		}

		await this._favoriteRepository.delete({
			article,
			user: ctx.state.user,
		});

		const favoriteCount: number = await this._favoriteRepository.count({ article });

		const isFollowing: boolean = await this._followRepository.isFollowing(ctx.state.user, article.author);

		ctx.status = OK;
		ctx.body = article.toJSON(isFollowing, false, favoriteCount);
	}
}
