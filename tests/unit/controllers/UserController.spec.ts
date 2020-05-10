import UserController from '../../../src/controllers/UserController';
import SecurityService from '../../../src/services/SecurityService';
import { CREATED, OK } from 'http-status-codes';
import sinon from 'sinon';
import { User } from '../../../src/entities/User';

describe('User Controller', () => {
	const sandbox: any = sinon.createSandbox();
	const username: string = 'testusername';
	const email: string = 'test-email@gmail.com';
	const password: string = 'test-password';
	const bio: string = 'test-bio';
	const image: string = 'test-image';
	const token: string = 'some-token';

	const mockUserRepository: any = { save: sandbox.spy(), findOne: sandbox.stub(), update: sandbox.spy() };
	const mockConnection: any = {
		getCustomRepository: sandbox.stub().returns(mockUserRepository),
	};
	const mockHashPassword: any = sandbox.stub(SecurityService, 'hashPassword');
	const mockVerifyHash: any = sandbox.stub(SecurityService, 'verifyHash');
	const mockSecurityService: any = {
		generateToken: sandbox.stub(),
	};

	const controller: UserController = new UserController({
		connection: mockConnection,
		securityService: mockSecurityService,
	});

	afterEach(() => {
		sandbox.reset();
	});

	test('Register hashes password, calls save, generates token and returns user', async () => {
		const mockContext: any = {
			request: {
				body: {
					user: {
						username,
						email,
						password,
						bio,
						image,
					},
				},
			},
		};
		mockSecurityService.generateToken.returns(token);

		await controller.register(mockContext);

		expect(mockHashPassword.callCount).toBe(1);
		expect(mockUserRepository.save.callCount).toBe(1);
		const user: any = mockUserRepository.save.getCall(0).args[0];
		expect(user.username).toEqual(username);
		expect(user.email).toEqual(email);
		expect(user.bio).toEqual(bio);
		expect(user.image).toEqual(image);

		expect(mockContext.status).toEqual(CREATED);
		expect(mockContext.body).toEqual({
			user: {
				username,
				email,
				bio,
				image,
				token,
			},
		});
	});

	test.each([
		[{ username: '1234' }],
		[{ username: '1234567891234567891234567891234' }],
		[{ email: 'bademail.com' }],
		[{ password: '1234' }],
		[{ password: '1234567891234567891234567891234' }],
	])('Register validates user data', async (userData: any) => {
		const mockContext: any = {
			request: {
				body: {
					user: {
						username,
						email,
						password,
						bio,
						image,
					},
				},
			},
		};

		Object.assign(mockContext.request.body.user, userData);
		expect(controller.register(mockContext)).rejects.toThrow();
	});

	test('login finds user by email and validates user/password', async () => {
		const mockContext: any = {
			request: {
				body: {
					user: {
						email,
						password,
					},
				},
			},
		};
		const user: User = new User();
		user.password = password;

		mockUserRepository.findOne.resolves(user);
		mockVerifyHash.returns(true);
		mockSecurityService.generateToken.returns(token);

		await controller.login(mockContext);

		expect(mockUserRepository.findOne.getCall(0).args[0]).toEqual({ email });
		expect(mockVerifyHash.getCall(0).args[0]).toEqual(password);
		expect(mockVerifyHash.getCall(0).args[1]).toEqual(password);
		expect(mockSecurityService.generateToken.getCall(0).args[0]).toEqual(user);
		expect(mockContext.status).toEqual(OK);
		expect(mockContext.body).toEqual({ user: user.toUserJSON(token) });
	});

	test('login throws when user is not found', async () => {
		const mockContext: any = {
			request: {
				body: {
					user: {
						email,
						password,
					},
				},
			},
			throw: sandbox.stub().throws(),
		};

		mockUserRepository.findOne.resolves(undefined);
		mockVerifyHash.returns(true);

		expect(controller.login(mockContext)).rejects.toThrow();

		expect(mockUserRepository.findOne.getCall(0).args[0]).toEqual({ email });
		expect(mockVerifyHash.callCount).toEqual(0);
		expect(mockSecurityService.generateToken.callCount).toEqual(0);
	});

	test('login throws when password validation fails', async () => {
		const mockContext: any = {
			request: {
				body: {
					user: {
						email,
						password,
					},
				},
			},
			throw: sandbox.stub().throws(),
		};

		mockUserRepository.findOne.resolves({ password });
		mockVerifyHash.returns(false);

		expect(controller.login(mockContext)).rejects.toThrow();

		expect(mockUserRepository.findOne.getCall(0).args[0]).toEqual({ email });
		expect(mockVerifyHash.callCount).toEqual(0);
		expect(mockSecurityService.generateToken.callCount).toEqual(0);
	});

	test('Get current user returns user in state', async () => {
		const user: User = new User();

		const mockContext: any = {
			state: {
				user,
				token,
			},
		};

		await controller.getCurrentUser(mockContext);

		expect(mockContext.status).toEqual(OK);
		expect(mockContext.body).toEqual({ user: user.toUserJSON(token) });
	});

	test('Update User takes user from state, assigns new props and calls update in user repo', async () => {
		const id: number = 123;
		const newUsername: string = 'newusername';
		const newEmail: string = 'new-email@gmail.com';
		const newBio: string = 'newBio';
		const newImage: string = 'new-image';

		const oldUser: User = new User();
		oldUser.id = id;
		oldUser.email = email;
		oldUser.username = username;
		oldUser.bio = bio;
		oldUser.image = image;

		const mockContext: any = {
			state: {
				user: oldUser,
				token,
			},
			request: {
				body: {
					user: {
						username: newUsername,
						email: newEmail,
						bio: newBio,
						image: newImage,
					},
				},
			},
		};

		await controller.updateUser(mockContext);

		expect(mockUserRepository.update.getCall(0).args[0]).toEqual(id);
		const user: any = mockUserRepository.update.getCall(0).args[1];
		expect(user.username).toEqual(newUsername);
		expect(user.email).toEqual(newEmail);
		expect(user.bio).toEqual(newBio);
		expect(user.image).toEqual(newImage);
		expect(mockContext.status).toEqual(OK);
	});
});
