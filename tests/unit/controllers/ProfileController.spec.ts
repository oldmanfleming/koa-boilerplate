import ProfileController from '../../../src/controllers/ProfileController';
import { OK, NOT_FOUND } from 'http-status-codes';
import sinon from 'sinon';
import { User } from '../../../src/entities/User';

describe('ProfileController', () => {
	const sandbox: any = sinon.createSandbox();

	const mockUserRepository: any = { findOne: sandbox.stub() };
	const mockFollowRepository: any = { following: sandbox.stub(), save: sandbox.stub(), delete: sandbox.stub() };
	const mockGetCustomRepository: any = sandbox.stub();
	const mockConnection: any = {
		getCustomRepository: mockGetCustomRepository,
	};
	mockGetCustomRepository.onCall(0).returns(mockUserRepository);
	mockGetCustomRepository.onCall(1).returns(mockFollowRepository);

	const controller: ProfileController = new ProfileController({
		connection: mockConnection,
	});

	const follower: User = new User();
	follower.username = 'follower-username';
	const following: User = new User();
	const followingUsername: string = 'following-username';
	following.username = followingUsername;

	let mockContext: any;

	beforeEach(() => {
		sandbox.restore();
		mockContext = {
			params: {
				username: followingUsername,
			},
			state: {
				user: follower,
			},
		};
	});

	test.each([[true], [false]])(
		'getProfile returns 200 and following user with result of isFollowing',
		async (isFollowing: boolean) => {
			mockUserRepository.findOne.withArgs({ username: followingUsername }).resolves(following);
			mockFollowRepository.following.withArgs(follower, following).resolves(isFollowing);

			await controller.getProfile(mockContext);

			expect(mockContext.status).toEqual(OK);
			expect(mockContext.body).toEqual({ profile: following.toProfileJSON(isFollowing) });
		},
	);

	test('getProfile returns 404 when user is not found', async () => {
		mockUserRepository.findOne.withArgs({ username: followingUsername }).resolves(undefined);

		await controller.getProfile(mockContext);

		expect(mockContext.status).toEqual(NOT_FOUND);
		expect(mockContext.body).toBeUndefined();
	});

	test.each([[true], [false]])(
		'followUser returns following user with result of isFollowing and only saves if wasnt following before',
		async (isFollowing: boolean) => {
			mockUserRepository.findOne.withArgs({ username: followingUsername }).resolves(following);
			mockFollowRepository.following.withArgs(follower, following).resolves(isFollowing);

			await controller.followUser(mockContext);

			expect(mockContext.status).toEqual(OK);
			expect(mockContext.body).toEqual({ profile: following.toProfileJSON(true) });

			if (isFollowing) {
				expect(mockFollowRepository.save.callCount).toEqual(0);
			} else {
				expect(mockFollowRepository.save.callCount).toEqual(1);
			}
		},
	);

	test('followUser returns 404 when user is not found', async () => {
		mockUserRepository.findOne.withArgs({ username: followingUsername }).resolves(undefined);

		await controller.followUser(mockContext);

		expect(mockContext.status).toEqual(NOT_FOUND);
		expect(mockContext.body).toBeUndefined();
	});

	test('unfollowUser calls delete and returns 200 with following', async () => {
		mockUserRepository.findOne.withArgs({ username: followingUsername }).resolves(following);

		await controller.unfollowUser(mockContext);

		expect(mockContext.status).toEqual(OK);
		expect(mockContext.body).toEqual({ profile: following.toProfileJSON(false) });
		expect(mockFollowRepository.delete.callCount).toEqual(1);
		expect(mockFollowRepository.delete.getCall(0).args[0]).toEqual({ following, follower });
	});

	test('unfollowUser returns 404 when user is not found', async () => {
		mockUserRepository.findOne.withArgs({ username: followingUsername }).resolves(undefined);

		await controller.unfollowUser(mockContext);

		expect(mockContext.status).toEqual(NOT_FOUND);
		expect(mockContext.body).toBeUndefined();
	});
});
