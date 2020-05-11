import ArticleController from '../../../src/controllers/ArticleController';
import { CREATED, NOT_FOUND, OK } from 'http-status-codes';
import sinon from 'sinon';

import { User } from '../../../src/entities/User';
import { Article } from '../../../src/entities/Article';
import { Tag } from '../../../src/entities/Tag';
import { Comment } from '../../../src/entities/Comment';
import { Follow } from '../../../src/entities/Follow';

describe('ArticleController', () => {
	const sandbox: any = sinon.createSandbox();

	const mockArticleRepository: any = {
		save: sandbox.stub(),
		findOneOrFail: sandbox.stub(),
		createQueryBuilder: sandbox.stub(),
		findOne: sandbox.stub(),
		update: sandbox.stub(),
		delete: sandbox.stub(),
	};
	const mockFavoriteRepository: any = {
		favorited: sandbox.stub(),
		count: sandbox.stub(),
		save: sandbox.stub(),
		delete: sandbox.stub(),
	};
	const mockFollowRepository: any = { following: sandbox.stub(), find: sandbox.stub() };
	const mockCommentRepository: any = { find: sandbox.stub(), save: sandbox.stub(), delete: sandbox.stub() };
	const mockUserRepository: any = { findOne: sandbox.stub() };
	const mockGetCustomRepository: any = sandbox.stub();

	mockGetCustomRepository.onCall(0).returns(mockArticleRepository);
	mockGetCustomRepository.onCall(1).returns(mockFavoriteRepository);
	mockGetCustomRepository.onCall(2).returns(mockFollowRepository);
	mockGetCustomRepository.onCall(3).returns(mockCommentRepository);
	mockGetCustomRepository.onCall(4).returns(mockUserRepository);
	mockGetCustomRepository.returns(mockArticleRepository);

	const mockConnection: any = {
		getCustomRepository: mockGetCustomRepository,
	};

	const controller: ArticleController = new ArticleController({
		connection: mockConnection,
	});

	const requestUser: User = new User();

	let mockContext: any;

	beforeEach(() => {
		sandbox.reset();

		mockContext = {
			params: {},
			state: {
				user: requestUser,
			},
			request: {},
		};
	});

	test('createArticle returns 201 saved and retrieved', async () => {
		const title: string = 'Some Important Title';
		const slug: string = 'some-important-title';
		const description: string = 'description goes here';
		const body: string = 'This is the body right?';
		const tagList: string[] = ['TYPEORM', 'node.js', 'TypeScript'];

		mockContext.request.body = {
			article: {
				title,
				description,
				body,
				tagList,
			},
		};

		const expectedArticle: Article = new Article();
		expectedArticle.title = title;
		expectedArticle.slug = slug;
		expectedArticle.description = description;
		expectedArticle.body = body;
		expectedArticle.author = requestUser;
		expectedArticle.tagList = tagList.map((tagLabel: string) => {
			const tag: Tag = new Tag();
			tag.label = tagLabel;
			return tag;
		});

		mockArticleRepository.findOneOrFail.resolves(expectedArticle);

		await controller.createArticle(mockContext);

		expect(mockArticleRepository.save.callCount).toEqual(1);
		expect(mockArticleRepository.save.args[0][0]).toEqual(expectedArticle);

		expect(mockContext.status).toEqual(CREATED);
		expect(mockContext.body).toEqual({ article: expectedArticle.toJSON(false, false) });
	});

	test('getArticleFeed filters on requert follower and calls getArticlesByFilterIds', async () => {
		const expectedFollowing: Follow = new Follow();
		expectedFollowing.following = new User();
		expectedFollowing.following.id = 123;

		mockFollowRepository.find
			.withArgs({
				relations: ['following'],
				where: { follower: requestUser },
			})
			.resolves([expectedFollowing]);

		mockGetCustomRepository.onCall(0).returns(mockArticleRepository);
		mockGetCustomRepository.onCall(1).returns(mockFavoriteRepository);
		mockGetCustomRepository.onCall(2).returns(mockFollowRepository);
		mockGetCustomRepository.onCall(3).returns(mockCommentRepository);
		mockGetCustomRepository.onCall(4).returns(mockUserRepository);

		const mockedController: ArticleController = new ArticleController({
			connection: mockConnection,
		});

		const mockGetArticlesByFilteredIds: any = sandbox.stub();
		mockedController.getArticlesByFilteredIds = mockGetArticlesByFilteredIds;

		mockArticleRepository.createQueryBuilder.returns({
			select: sandbox.stub().returns({
				leftJoin: sandbox.stub().returns({
					where: sandbox.stub(),
				}),
			}),
		});

		await mockedController.getArticleFeed(mockContext);

		expect(mockFollowRepository.find.callCount).toEqual(1);
		expect(mockGetArticlesByFilteredIds.callCount).toEqual(1);
	});

	test('getArticleFeed returns empty list when no followers found', async () => {
		mockFollowRepository.find
			.withArgs({
				relations: ['following'],
				where: { follower: requestUser },
			})
			.resolves([]);

		await controller.getArticleFeed(mockContext);

		expect(mockContext.body).toEqual({ articles: [], articlesCount: 0 });
		expect(mockContext.status).toEqual(OK);
	});

	test.each([
		[
			{
				tag: 'some-tag',
				favorited: 'user6',
				author: 'user6',
			},
			undefined,
		],
		[
			{
				tag: 'some-tag',
				favorited: 'user6',
				author: 'user6',
			},
			{},
		],
		[{}, {}],
	])('getArticles reads query and filters', async (query: any, favoritedUser: any) => {
		mockGetCustomRepository.onCall(0).returns(mockArticleRepository);
		mockGetCustomRepository.onCall(1).returns(mockFavoriteRepository);
		mockGetCustomRepository.onCall(2).returns(mockFollowRepository);
		mockGetCustomRepository.onCall(3).returns(mockCommentRepository);
		mockGetCustomRepository.onCall(4).returns(mockUserRepository);

		const mockedController: ArticleController = new ArticleController({
			connection: mockConnection,
		});

		const mockGetArticlesByFilteredIds: any = sandbox.stub();
		mockedController.getArticlesByFilteredIds = mockGetArticlesByFilteredIds;

		mockArticleRepository.createQueryBuilder.returns({
			select: sandbox.stub().returns({
				leftJoin: sandbox.stub().returns({
					leftJoin: sandbox.stub().returns({
						leftJoin: sandbox.stub().returns({
							where: sandbox.stub(),
							andWhere: sandbox.stub(),
						}),
					}),
				}),
			}),
		});

		mockContext.query = query;

		mockUserRepository.findOne.resolves(favoritedUser);

		await mockedController.getArticles(mockContext);

		expect(mockGetArticlesByFilteredIds.callCount).toEqual(1);
	});

	test('getArticlesByFilterId counts returns empty when articlesCount is 0', async () => {
		const mockGetCount: any = sandbox.stub().resolves(0);
		const mockFilterQuery: any = {
			getCount: mockGetCount,
		};

		await controller.getArticlesByFilteredIds(mockContext, mockFilterQuery);

		expect(mockGetCount.callCount).toEqual(1);
		expect(mockContext.status).toEqual(OK);
		expect(mockContext.body).toEqual({ articles: [], articlesCount: 0 });
	});

	test.each([
		[7, 5],
		[undefined, undefined],
	])(
		'getArticlesByFilterId counts filterQuery and users result to fiilter on articles',
		async (limit: any, offset: any) => {
			const expectedArticle: Article = new Article();
			expectedArticle.author = new User();
			expectedArticle.title = 'Some Title';

			const mockGetCount: any = sandbox.stub().resolves(1);
			// eslint-disable-next-line @typescript-eslint/camelcase
			const mockGetRawMany: any = sandbox.stub().resolves([{ article_id: 1 }]);
			const mockTake: any = sandbox.stub();
			const mockSkip: any = sandbox.stub();
			const mockOrderBy: any = sandbox.stub();
			const mockGetMany: any = sandbox.stub().resolves([expectedArticle]);

			mockArticleRepository.createQueryBuilder.returns({
				leftJoinAndSelect: sandbox.stub().returns({
					leftJoinAndSelect: sandbox.stub().returns({
						leftJoinAndSelect: sandbox.stub().returns({
							where: sandbox.stub(),
							orderBy: mockOrderBy,
							take: mockTake,
							skip: mockSkip,
							getMany: mockGetMany,
						}),
					}),
				}),
			});

			const mockFilterQuery: any = {
				getCount: mockGetCount,
				getRawMany: mockGetRawMany,
			};

			mockContext.query = {
				limit,
				offset,
			};

			mockFavoriteRepository.favorited.resolves(true);
			mockFollowRepository.following.resolves(false);

			await controller.getArticlesByFilteredIds(mockContext, mockFilterQuery);

			if (limit) {
				expect(mockTake.args[0][0]).toEqual(limit);
			} else {
				expect(mockTake.callCount).toEqual(0);
			}

			if (offset) {
				expect(mockSkip.args[0][0]).toEqual(offset);
			} else {
				expect(mockSkip.callCount).toEqual(0);
			}

			expect(mockFavoriteRepository.favorited.callCount).toEqual(1);
			expect(mockFollowRepository.following.callCount).toEqual(1);

			expect(mockContext.status).toEqual(OK);
			expect(mockContext.body).toEqual({ articles: [expectedArticle.toJSON(false, true)], articlesCount: 1 });
		},
	);

	test('addComment returns 404 when article not found', async () => {
		const expectedSlug: string = 'some-old-slug';
		mockContext.params.slug = expectedSlug;
		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(undefined);

		const body: string = 'This is the body right?';

		mockContext.request.body = {
			comment: {
				body,
			},
		};

		await controller.addComment(mockContext);

		expect(mockArticleRepository.findOne.callCount).toEqual(1);
		expect(mockCommentRepository.save.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
	});

	test.each([
		[true, true],
		[true, false],
		[false, true],
		[false, false],
	])('updateArticle returns 201 updated and retrieved', async (following: boolean, favorited: boolean) => {
		const existingArticle: Article = new Article();
		const existingSlug: string = 'some-old-slug';
		const existingId: number = 123;
		existingArticle.slug = existingSlug;
		existingArticle.id = existingId;
		mockContext.params.slug = existingSlug;
		mockArticleRepository.findOne.withArgs({ slug: existingSlug }).resolves(existingArticle);

		const title: string = 'Some Important Title';
		const slug: string = 'some-important-title';
		const description: string = 'description goes here';
		const body: string = 'This is the body right?';

		mockContext.request.body = {
			article: {
				title,
				description,
				body,
			},
		};

		const expectedArticle: Article = new Article();
		expectedArticle.id = existingId;
		expectedArticle.title = title;
		expectedArticle.slug = slug;
		expectedArticle.description = description;
		expectedArticle.body = body;

		mockArticleRepository.findOneOrFail.resolves(expectedArticle);
		mockFavoriteRepository.favorited.resolves(favorited);
		mockFollowRepository.following.resolves(following);

		await controller.updateArticle(mockContext);

		expect(mockArticleRepository.update.callCount).toEqual(1);
		expect(mockArticleRepository.update.args[0][0]).toEqual(existingId);
		expect(mockArticleRepository.update.args[0][1]).toEqual(expectedArticle);
		expect(mockFavoriteRepository.favorited.callCount).toEqual(1);
		expect(mockFollowRepository.following.callCount).toEqual(1);

		expect(mockContext.status).toEqual(CREATED);
		expect(mockContext.body).toEqual({ article: expectedArticle.toJSON(following, favorited) });
	});

	test('updateArticle doesnt update slug when title not changed', async () => {
		const existingArticle: Article = new Article();
		const existingSlug: string = 'some-old-slug';
		const existingId: number = 123;
		existingArticle.slug = existingSlug;
		existingArticle.id = existingId;
		mockContext.params.slug = existingSlug;
		mockArticleRepository.findOne.withArgs({ slug: existingSlug }).resolves(existingArticle);

		mockContext.request.body = {
			article: {},
		};

		mockArticleRepository.findOneOrFail.resolves(existingArticle);
		mockFavoriteRepository.favorited.resolves(true);
		mockFollowRepository.following.resolves(false);

		await controller.updateArticle(mockContext);

		expect(mockArticleRepository.update.callCount).toEqual(1);
		expect(mockArticleRepository.update.args[0][0]).toEqual(existingId);
		expect(mockArticleRepository.update.args[0][1]).toEqual(existingArticle);
		expect(mockFavoriteRepository.favorited.callCount).toEqual(1);
		expect(mockFollowRepository.following.callCount).toEqual(1);

		expect(mockContext.status).toEqual(CREATED);
		expect(mockContext.body).toEqual({ article: existingArticle.toJSON(false, true) });
	});

	test('updateArticle returns 404 when article not found', async () => {
		const existingSlug: string = 'some-old-slug';
		mockArticleRepository.findOne.withArgs({ slug: existingSlug }).resolves(undefined);

		const title: string = 'Some Important Title';
		const description: string = 'description goes here';
		const body: string = 'This is the body right?';

		mockContext.request.body = {
			article: {
				title,
				description,
				body,
			},
		};

		await controller.updateArticle(mockContext);

		expect(mockArticleRepository.update.callCount).toEqual(0);
		expect(mockFavoriteRepository.favorited.callCount).toEqual(0);
		expect(mockFollowRepository.following.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
		expect(mockContext.body).toEqual(undefined);
	});

	test.each([
		[true, true],
		[true, false],
		[false, true],
		[false, false],
	])('getArticle returns article by slug', async (following: boolean, favorited: boolean) => {
		const expectedArticle: Article = new Article();
		expectedArticle.title = 'Some Important Title';

		const expectedSlug: string = 'some-important-slug';
		mockContext.params.slug = expectedSlug;

		mockArticleRepository.findOne
			.withArgs({ relations: ['tagList', 'author', 'favorites'], where: { slug: expectedSlug } })
			.resolves(expectedArticle);

		mockFavoriteRepository.favorited.resolves(favorited);
		mockFollowRepository.following.resolves(following);

		await controller.getArticle(mockContext);

		expect(mockArticleRepository.findOne.callCount).toEqual(1);
		expect(mockFavoriteRepository.favorited.callCount).toEqual(1);
		expect(mockFollowRepository.following.callCount).toEqual(1);

		expect(mockContext.status).toEqual(OK);
		expect(mockContext.body).toEqual({ article: expectedArticle.toJSON(following, favorited) });
	});

	test('getArticle returns 404 when article not found', async () => {
		const expectedSlug: string = 'some-old-slug';
		mockContext.params.slug = expectedSlug;
		mockArticleRepository.findOne
			.withArgs({ relations: ['tagList', 'author', 'favorites'], where: { slug: expectedSlug } })
			.resolves(undefined);

		await controller.getArticle(mockContext);

		expect(mockArticleRepository.update.callCount).toEqual(0);
		expect(mockFavoriteRepository.favorited.callCount).toEqual(0);
		expect(mockFollowRepository.following.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
		expect(mockContext.body).toEqual(undefined);
	});

	test('deleteArticle calls delete and returns OK', async () => {
		const expectedArticle: Article = new Article();
		expectedArticle.title = 'Some Important Title';
		expectedArticle.id = 123;

		const expectedSlug: string = 'some-important-slug';
		mockContext.params.slug = expectedSlug;

		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(expectedArticle);

		await controller.deleteArticle(mockContext);

		expect(mockArticleRepository.findOne.callCount).toEqual(1);
		expect(mockArticleRepository.delete.callCount).toEqual(1);
		expect(mockArticleRepository.delete.args[0][0]).toEqual(123);

		expect(mockContext.status).toEqual(OK);
	});

	test('deleteArticle returns 404 when article not found', async () => {
		const expectedSlug: string = 'some-old-slug';
		mockContext.params.slug = expectedSlug;
		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(undefined);

		await controller.deleteArticle(mockContext);

		expect(mockArticleRepository.findOne.callCount).toEqual(1);
		expect(mockArticleRepository.delete.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
	});

	test.each([[true], [false]])('addComment returns 201 saved and retrieved', async (following: boolean) => {
		const slug: string = 'some-important-title';
		mockContext.params.slug = slug;

		const body: string = 'This is the body right?';

		mockContext.request.body = {
			comment: {
				body,
			},
		};

		const expectedArticle: Article = new Article();
		expectedArticle.title = 'Some Important Title';
		mockArticleRepository.findOne.withArgs({ slug }).resolves(expectedArticle);

		const expectedComment: Comment = new Comment();
		expectedComment.body = body;
		expectedComment.article = expectedArticle;
		expectedComment.author = requestUser;

		mockFollowRepository.following.resolves(following);

		await controller.addComment(mockContext);

		expect(mockCommentRepository.save.callCount).toEqual(1);
		expect(mockCommentRepository.save.args[0][0]).toEqual(expectedComment);
		expect(mockFollowRepository.following.callCount).toEqual(1);

		expect(mockContext.status).toEqual(CREATED);
		expect(mockContext.body).toEqual({ comment: expectedComment.toJSON(following) });
	});

	test('addComment returns 404 when article not found', async () => {
		const expectedSlug: string = 'some-old-slug';
		mockContext.params.slug = expectedSlug;
		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(undefined);

		const body: string = 'This is the body right?';

		mockContext.request.body = {
			comment: {
				body,
			},
		};

		await controller.addComment(mockContext);

		expect(mockArticleRepository.findOne.callCount).toEqual(1);
		expect(mockCommentRepository.save.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
	});

	test.each([[true], [false]])('getComments returns 200 and retrieved', async (following: boolean) => {
		const slug: string = 'some-important-title';
		mockContext.params.slug = slug;

		const expectedArticle: Article = new Article();
		expectedArticle.title = 'Some Important Title';
		mockArticleRepository.findOne.withArgs({ slug }).resolves(expectedArticle);

		const expectedComment1: Comment = new Comment();
		expectedComment1.body = 'body 1';

		const expectedComment2: Comment = new Comment();
		expectedComment1.body = 'body 2';

		mockCommentRepository.find.withArgs({ article: expectedArticle }).resolves([expectedComment1, expectedComment2]);

		mockFollowRepository.following.resolves(following);

		await controller.getComments(mockContext);

		expect(mockCommentRepository.find.callCount).toEqual(1);
		expect(mockFollowRepository.following.callCount).toEqual(1);

		expect(mockContext.status).toEqual(OK);
		expect(mockContext.body).toEqual({
			comments: [expectedComment1.toJSON(following), expectedComment2.toJSON(following)],
		});
	});

	test('getComments returns 404 when article not found', async () => {
		const expectedSlug: string = 'some-old-slug';
		mockContext.params.slug = expectedSlug;
		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(undefined);

		await controller.getComments(mockContext);

		expect(mockArticleRepository.findOne.callCount).toEqual(1);
		expect(mockCommentRepository.find.callCount).toEqual(0);
		expect(mockFollowRepository.following.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
	});

	test('deleteComment calls delete and returns OK', async () => {
		const expectedArticle: Article = new Article();

		const expectedSlug: string = 'some-important-slug';
		const expectedCommentId: number = 456;
		mockContext.params.slug = expectedSlug;
		mockContext.params.id = expectedCommentId;

		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(expectedArticle);

		await controller.deleteComment(mockContext);

		expect(mockArticleRepository.findOne.callCount).toEqual(1);
		expect(mockCommentRepository.delete.callCount).toEqual(1);
		expect(mockCommentRepository.delete.args[0][0]).toEqual(expectedCommentId);

		expect(mockContext.status).toEqual(OK);
	});

	test('deleteComment returns 404 when article not found', async () => {
		const expectedSlug: string = 'some-old-slug';
		mockContext.params.slug = expectedSlug;
		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(undefined);

		await controller.deleteComment(mockContext);

		expect(mockArticleRepository.findOne.callCount).toEqual(1);
		expect(mockCommentRepository.delete.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
	});

	test.each([[0], [1]])('favoriteArticle returns article with following', async (expectedFavoriteCount: number) => {
		const slug: string = 'some-important-title';
		mockContext.params.slug = slug;

		const expectedArticle: Article = new Article();
		expectedArticle.title = 'Some Important Title';
		expectedArticle.favorites = [];

		mockArticleRepository.findOne
			.withArgs({
				relations: ['tagList', 'author', 'favorites'],
				where: { slug },
			})
			.resolves(expectedArticle);

		mockFavoriteRepository.count
			.withArgs({ article: expectedArticle, user: requestUser })
			.resolves(expectedFavoriteCount);

		mockFollowRepository.following.resolves(true);

		await controller.favoriteArticle(mockContext);

		if (!expectedFavoriteCount) {
			expect(mockFavoriteRepository.save.callCount).toEqual(1);
		} else {
			expect(mockFavoriteRepository.save.callCount).toEqual(0);
		}

		expect(mockFavoriteRepository.count.callCount).toEqual(1);
		expect(mockFollowRepository.following.callCount).toEqual(1);

		expect(mockContext.status).toEqual(CREATED);
		expect(mockContext.body).toEqual({ article: expectedArticle.toJSON(true, true) });
	});

	test('favoriteArticle returns 404 when article not found', async () => {
		const expectedSlug: string = 'some-old-slug';
		mockContext.params.slug = expectedSlug;
		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(undefined);

		await controller.favoriteArticle(mockContext);

		expect(mockFavoriteRepository.count.callCount).toEqual(0);
		expect(mockFavoriteRepository.save.callCount).toEqual(0);
		expect(mockFollowRepository.following.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
	});

	test('favoriteArticle returns article with following', async () => {
		const slug: string = 'some-important-title';
		mockContext.params.slug = slug;

		const expectedArticle: Article = new Article();
		expectedArticle.title = 'Some Important Title';
		expectedArticle.favorites = [];

		mockArticleRepository.findOne
			.withArgs({
				relations: ['tagList', 'author', 'favorites'],
				where: { slug },
			})
			.resolves(expectedArticle);

		mockFollowRepository.following.resolves(true);

		await controller.unfavoriteArticle(mockContext);

		expect(mockFavoriteRepository.delete.callCount).toEqual(1);
		expect(mockFollowRepository.following.callCount).toEqual(1);

		expect(mockContext.status).toEqual(OK);
		expect(mockContext.body).toEqual({ article: expectedArticle.toJSON(true, false) });
	});

	test('favoriteArticle returns 404 when article not found', async () => {
		const expectedSlug: string = 'some-old-slug';
		mockContext.params.slug = expectedSlug;
		mockArticleRepository.findOne.withArgs({ slug: expectedSlug }).resolves(undefined);

		await controller.unfavoriteArticle(mockContext);

		expect(mockFavoriteRepository.delete.callCount).toEqual(0);
		expect(mockFollowRepository.following.callCount).toEqual(0);

		expect(mockContext.status).toEqual(NOT_FOUND);
	});
});
