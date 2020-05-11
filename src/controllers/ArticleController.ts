import { route, POST, before, inject, DELETE, PUT, GET } from 'awilix-koa';
import { CREATED, NOT_FOUND, OK } from 'http-status-codes';
import { Context } from 'koa';
import { Connection, SelectQueryBuilder, In } from 'typeorm';
import { assert, object, string, array } from '@hapi/joi';
import slugify from 'slugify';

import AuthenticationMiddleware, { OptionalAuthenticationMiddleware } from '../middleware/AuthenticationMiddleware';
import ArticleRepository from '../repositories/ArticleRepository';
import FavoriteRepository from '../repositories/FavoriteRepository';
import FollowRepository from '../repositories/FollowRepository';
import { Article } from '../entities/Article';
import { Tag } from '../entities/Tag';
import { Favorite } from '../entities/Favorite';
import { Comment } from '../entities/Comment';
import CommentRepository from '../repositories/CommentRepository';
import { User } from '../entities/User';
import UserRepository from '../repositories/UserRepository';
import { Follow } from '../entities/Follow';

@route('/api/articles')
export default class ArticleController {
	private _articleRepository: ArticleRepository;
	private _favoriteRepository: FavoriteRepository;
	private _followRepository: FollowRepository;
	private _commentRepository: CommentRepository;
	private _userRepository: UserRepository;

	// Any Dependencies registered to the container can be injected here
	constructor({ connection }: { connection: Connection }) {
		this._articleRepository = connection.getCustomRepository(ArticleRepository);
		this._favoriteRepository = connection.getCustomRepository(FavoriteRepository);
		this._followRepository = connection.getCustomRepository(FollowRepository);
		this._commentRepository = connection.getCustomRepository(CommentRepository);
		this._userRepository = connection.getCustomRepository(UserRepository);
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
			relations: ['tagList', 'author', 'favorites'],
			where: { slug: article.slug },
		});

		ctx.body = { article: savedArticle.toJSON(false, false) };
		ctx.status = CREATED;
	}

	@route('/feed')
	@GET()
	@before([inject(AuthenticationMiddleware)])
	async getArticleFeed(ctx: Context) {
		const following: Follow[] = await this._followRepository.find({
			relations: ['following'],
			where: { follower: ctx.state.user },
		});

		if (!following.length) {
			ctx.body = { articles: [], articlesCount: 0 };
			ctx.status = OK;
			return;
		}

		const filterQuery: SelectQueryBuilder<Article> = this._articleRepository
			.createQueryBuilder('article')
			.select(['article.id'])
			.leftJoin('article.author', 'author')
			.where('article."authorId" IN (:...authors)', {
				authors: following.map((follow: Follow) => follow.following.id),
			});

		await this.getArticlesByFilteredIds(ctx, filterQuery);
	}

	@route('/')
	@GET()
	@before([inject(OptionalAuthenticationMiddleware)])
	async getArticles(ctx: Context) {
		const filterQuery: SelectQueryBuilder<Article> = this._articleRepository
			.createQueryBuilder('article')
			.select(['article.id'])
			.leftJoin('article.author', 'author')
			.leftJoin('article.tagList', 'tagList')
			.leftJoin('article.favorites', 'favorites');

		filterQuery.where('1 = 1');

		if (ctx.query.tag) {
			filterQuery.andWhere('tagList.label LIKE :tag', { tag: `%${ctx.query.tag}%` });
		}

		if (ctx.query.favorited) {
			const user: User | undefined = await this._userRepository.findOne({ username: ctx.query.favorited });
			if (user) {
				filterQuery.andWhere('favorites."userId" = :userId', { userId: user.id });
			}
		}

		if (ctx.query.author) {
			filterQuery.andWhere('author.username = :username', { username: ctx.query.author });
		}

		await this.getArticlesByFilteredIds(ctx, filterQuery);
	}

	async getArticlesByFilteredIds(ctx: Context, filterQuery: SelectQueryBuilder<Article>) {
		const articlesCount: number = await filterQuery.getCount();

		if (!articlesCount) {
			ctx.body = { articles: [], articlesCount: 0 };
			ctx.status = OK;
			return;
		}

		const filteredIds: any[] = await filterQuery.getRawMany();

		const query: SelectQueryBuilder<Article> = this._articleRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'author')
			.leftJoinAndSelect('article.tagList', 'tagList')
			.leftJoinAndSelect('article.favorites', 'favorites');

		query.where({ id: In(filteredIds.map((article: any) => article.article_id)) });

		query.orderBy('article.createdAt', 'DESC');

		if (ctx.query.limit) {
			query.take(ctx.query.limit);
		}

		if (ctx.query.offset) {
			query.skip(ctx.query.offset);
		}

		const filteredArticles: Article[] = await query.getMany();

		const articles: object[] = [];
		await Promise.all(
			filteredArticles.map(async (article: Article) => {
				const favorited: boolean = await this._favoriteRepository.favorited(article, ctx.state.user);
				const following: boolean = await this._followRepository.following(ctx.state.user, article.author);
				articles.push(article.toJSON(following, favorited));
			}),
		);

		ctx.body = { articles, articlesCount };
		ctx.status = OK;
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

		const updatedArticle: Article = await this._articleRepository.findOneOrFail({
			relations: ['tagList', 'author', 'favorites'],
			where: { slug: article.slug },
		});

		const favorited: boolean = await this._favoriteRepository.favorited(updatedArticle, ctx.state.user);
		const following: boolean = await this._followRepository.following(ctx.state.user, updatedArticle.author);

		ctx.body = { article: updatedArticle.toJSON(following, favorited) };
		ctx.status = CREATED;
	}

	@route('/:slug')
	@GET()
	@before([inject(AuthenticationMiddleware)])
	async getArticle(ctx: Context) {
		const article: Article | undefined = await this._articleRepository.findOne({
			relations: ['tagList', 'author', 'favorites'],
			where: { slug: ctx.params.slug },
		});

		if (!article) {
			ctx.status = NOT_FOUND;
			return;
		}

		const favorited: boolean = await this._favoriteRepository.favorited(article, ctx.state.user);
		const following: boolean = await this._followRepository.following(ctx.state.user, article.author);

		ctx.body = { article: article.toJSON(following, favorited) };
		ctx.status = OK;
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

	@route('/:slug/comments')
	@POST()
	@before([inject(AuthenticationMiddleware)])
	async addComment(ctx: Context) {
		assert(
			ctx.request.body,
			object({
				comment: object({
					body: string().max(5000).required(),
				}),
			}),
		);

		const article: Article | undefined = await this._articleRepository.findOne({ slug: ctx.params.slug });

		if (!article) {
			ctx.status = NOT_FOUND;
			return;
		}

		const comment: Comment = new Comment();
		comment.body = ctx.request.body.comment.body;
		comment.article = article;
		comment.author = ctx.state.user;

		await this._commentRepository.save(comment);

		const following: boolean = await this._followRepository.following(ctx.state.user, article.author);

		ctx.body = { comment: comment.toJSON(following) };
		ctx.status = CREATED;
	}

	@route('/:slug/comments')
	@GET()
	@before([inject(AuthenticationMiddleware)])
	async getComments(ctx: Context) {
		const article: Article | undefined = await this._articleRepository.findOne({ slug: ctx.params.slug });

		if (!article) {
			ctx.status = NOT_FOUND;
			return;
		}

		const comments: Comment[] = await this._commentRepository.find({ article });

		const following: boolean = await this._followRepository.following(ctx.state.user, article.author);

		ctx.body = { comments: comments.map((comment: Comment) => comment.toJSON(following)) };
		ctx.status = OK;
	}

	@route('/:slug/comments/:id')
	@DELETE()
	@before([inject(AuthenticationMiddleware)])
	async deleteComment(ctx: Context) {
		const article: Article | undefined = await this._articleRepository.findOne({ slug: ctx.params.slug });

		if (!article) {
			ctx.status = NOT_FOUND;
			return;
		}

		await this._commentRepository.delete(ctx.params.id);

		ctx.status = OK;
	}

	@route('/:slug/favorite')
	@POST()
	@before([inject(AuthenticationMiddleware)])
	async favoriteArticle(ctx: Context) {
		const article: Article | undefined = await this._articleRepository.findOne({
			relations: ['tagList', 'author', 'favorites'],
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
			article.favorites.push(favorite);
		}

		const following: boolean = await this._followRepository.following(ctx.state.user, article.author);

		ctx.status = CREATED;
		ctx.body = { article: article.toJSON(following, true) };
	}

	@route('/:slug/favorite')
	@DELETE()
	@before([inject(AuthenticationMiddleware)])
	async unfavoriteArticle(ctx: Context) {
		const article: Article | undefined = await this._articleRepository.findOne({
			relations: ['tagList', 'author', 'favorites'],
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

		article.favorites.pop();
		const following: boolean = await this._followRepository.following(ctx.state.user, article.author);

		ctx.status = OK;
		ctx.body = { article: article.toJSON(following, false) };
	}
}
