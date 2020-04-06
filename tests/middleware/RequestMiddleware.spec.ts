import RequestMiddleware from '../../src//middleware/RequestMiddleware';
import { OK, BAD_REQUEST } from 'http-status-codes';

describe('Request Middleware', () => {
	const mockPool: any = { connect: jest.fn() };
	const mockLogger: any = { info: jest.fn(), error: jest.fn() };
	const mockContext: any = {
		status: OK,
		request: { path: '/' },
		state: {
			container: {
				register: jest.fn(),
			},
		},
	};
	const mockClient: any = { release: jest.fn() };
	const mockNext: any = jest.fn();
	const middleware: Function = RequestMiddleware({ pool: mockPool, logger: mockLogger });

	beforeEach(() => {
		mockContext.state.container.register.mockReset();
		mockPool.connect.mockReset();
		mockClient.release.mockReset();
		mockLogger.info.mockReset();
		mockLogger.error.mockReset();
		mockNext.mockReset();

		mockPool.connect.mockResolvedValue(mockClient);
	});

	test('connects, registers client calls next and releases in base case', async () => {
		await middleware(mockContext, mockNext);
		expect(mockPool.connect.mock.calls.length).toBe(1);
		expect(mockContext.state.container.register.mock.calls.length).toBe(1);
		expect(mockNext.mock.calls.length).toBe(1);
		expect(mockClient.release.mock.calls.length).toBe(1);
		expect(mockContext.status).toBe(OK);
	});

	test('doesnt call release if client not defined releases in base case', async () => {
		mockPool.connect.mockReset();
		await middleware(mockContext, mockNext);
		expect(mockPool.connect.mock.calls.length).toBe(1);
		expect(mockContext.state.container.register.mock.calls.length).toBe(1);
		expect(mockNext.mock.calls.length).toBe(1);
		expect(mockClient.release.mock.calls.length).toBe(0);
		expect(mockContext.status).toBe(OK);
	});

	test('Errors caught and status and body are obfuscated with 404', async () => {
		mockNext.mockImplementation(() => {
			throw new Error('fatal');
		});
		await middleware(mockContext, mockNext);
		expect(mockPool.connect.mock.calls.length).toBe(1);
		expect(mockContext.state.container.register.mock.calls.length).toBe(1);
		expect(mockNext.mock.calls.length).toBe(1);
		expect(mockClient.release.mock.calls.length).toBe(1);
		expect(mockContext.status).toBe(BAD_REQUEST);
		expect(mockContext.body).toEqual({ message: 'invalid request' });
	});
});
