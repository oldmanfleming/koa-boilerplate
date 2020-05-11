import AuthenticationMiddleware, {
	OptionalAuthenticationMiddleware,
} from '../../../src/middleware/AuthenticationMiddleware';
import { User } from '../../../src/entities/User';
// import { UNAUTHORIZED } from 'http-status-codes';
import sinon, { SinonSandbox } from 'sinon';
import { UNAUTHORIZED } from 'http-status-codes';

describe('Auth Middleware', () => {
	const sandbox: SinonSandbox = sinon.createSandbox();
	const mockUserRepository: any = { findOne: sandbox.stub() };
	const mockConnection: any = {
		getCustomRepository: sandbox.stub(),
	};
	const mockSecurity: any = {
		verifyToken: sandbox.stub(),
	};
	const mockNext: any = sandbox.stub();

	const middleware: Function = AuthenticationMiddleware({ connection: mockConnection, securityService: mockSecurity });

	let mockContext: any;

	beforeEach(() => {
		sandbox.reset();

		mockContext = {
			header: {
				authorization: 'bearer some-token',
			},
			state: {},
			throw: sandbox.stub().throws(),
		};
	});

	test('optional authentication invokes Auth Middleware with authRequired set to false', async () => {
		const middleware: Function = OptionalAuthenticationMiddleware({
			connection: mockConnection,
			securityService: mockSecurity,
		});
		mockContext.header.authorization = undefined;

		await middleware(mockContext, mockNext);

		expect(mockNext.callCount).toEqual(1);
	});

	test.each([
		['bearer', 'some-token'],
		['token', 'some-other-token'],
	])('Calls next when token is verified and user is found', async (tokenType: string, token: string) => {
		const user: User = new User();
		mockContext.header.authorization = `${tokenType} ${token}`;
		mockSecurity.verifyToken.returns({
			id: 'some-id',
		});
		mockConnection.getCustomRepository.returns(mockUserRepository);
		mockUserRepository.findOne.resolves(user);
		await middleware(mockContext, mockNext);
		expect(mockNext.callCount).toBe(1);
		expect(mockUserRepository.findOne.getCall(0).args[0]).toEqual('some-id');
		expect(mockContext.state.user).toEqual(user);
		expect(mockContext.state.token).toEqual(token);
	});

	test('Throws unauthorized when no auth header provided', async () => {
		mockContext.header.authorization = undefined;
		expect(middleware(mockContext, mockNext)).rejects.toThrow();
		expect(mockNext.callCount).toBe(0);
		expect(mockContext.throw.getCall(0).args[0]).toBe(UNAUTHORIZED);
	});

	test('Does not throw when auth is optional and no auth header', async () => {
		const middlewareWithAuthOptional: Function = AuthenticationMiddleware(
			{ connection: mockConnection, securityService: mockSecurity },
			false,
		);
		mockContext.header.authorization = undefined;
		await middlewareWithAuthOptional(mockContext, mockNext);
		expect(mockNext.callCount).toBe(1);
	});

	test('Throws unauthorized when token type does not match bearer or token', async () => {
		mockContext.header.authorization = 'basic some-token';
		expect(middleware(mockContext, mockNext)).rejects.toThrow();
		expect(mockNext.callCount).toBe(0);
		expect(mockContext.throw.getCall(0).args[0]).toBe(UNAUTHORIZED);
	});

	test('Throws unauthorized when token is not valid', async () => {
		mockSecurity.verifyToken.throws();
		expect(middleware(mockContext, mockNext)).rejects.toThrow();
		expect(mockNext.callCount).toBe(0);
		expect(mockContext.throw.getCall(0).args[0]).toBe(UNAUTHORIZED);
	});

	test('Throws unauthorized if user is not found', async () => {
		mockSecurity.verifyToken.returns({
			id: 'some-id',
		});
		mockConnection.getCustomRepository.returns(mockUserRepository);
		mockUserRepository.findOne.resolves(undefined);
		expect(middleware(mockContext, mockNext)).rejects.toThrow();
		expect(mockNext.callCount).toBe(0);
	});
});
