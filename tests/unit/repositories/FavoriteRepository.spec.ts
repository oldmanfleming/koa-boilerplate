import FavoriteRepository from '../../../src/repositories/FavoriteRepository';
import sinon from 'sinon';
import { User } from '../../../src/entities/User';
import { Article } from '../../../src/entities/Article';

describe('Favorite Repository', () => {
	const sandbox: any = sinon.createSandbox();
	const repository: FavoriteRepository = new FavoriteRepository();
	const mockCount: any = sandbox.stub(repository, 'count');

	afterEach(() => {
		sandbox.reset();
	});

	test.each([
		[0, false],
		[1, true],
		[5, true],
	])('favorited returns count converted to boolean', async (count: number, expectedResult: boolean) => {
		const article: Article = new Article();
		const user: User = new User();
		mockCount.resolves(count);

		const result: boolean = await repository.favorited(article, user);

		expect(result).toEqual(expectedResult);
		expect(mockCount.getCall(0).args[0]).toEqual({ article, user });
	});
});
