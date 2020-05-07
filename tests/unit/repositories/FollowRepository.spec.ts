import FollowRepository from '../../../src/repositories/FollowRepository';
import sinon from 'sinon';
import { Follow } from '../../../src/entities/Follow';
import { User } from '../../../src/entities/User';

describe('User Repository', () => {
	const sandbox: any = sinon.createSandbox();
	const repository: FollowRepository = new FollowRepository();
	const mockFindOne: any = sandbox.stub(repository, 'findOne');

	afterEach(() => {
		sandbox.restore();
	});

	test('isFollowing returns true when found', async () => {
		const follower: User = new User();
		const following: User = new User();
		const follow: Follow = new Follow();
		mockFindOne.resolves(follow);

		const result: boolean = await repository.isFollowing(follower, following);

		expect(result).toEqual(true);
		expect(mockFindOne.getCall(0).args[0]).toEqual({ follower, following });
	});

	// test('findByEmail returns results of query using email', async () => {
	// 	const user: User = new User();
	// 	const email: string = 'some-email@gmail.com';
	// 	const mockWhere: any = sandbox.stub();
	// 	const mockGetOne: any = sandbox.stub();
	// 	mockCreateQueryBuilder.returns({ where: mockWhere });
	// 	mockWhere.returns({ getOne: mockGetOne });
	// 	mockGetOne.returns(user);

	// 	const result: User | undefined = await repository.findByEmail(email);

	// 	expect(result).toEqual(user);
	// 	expect(mockWhere.getCall(0).args[1]).toEqual({ email });
	// });
});
