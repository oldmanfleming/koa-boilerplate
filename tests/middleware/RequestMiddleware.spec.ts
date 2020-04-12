import RequestMiddleware from '../../src//middleware/RequestMiddleware';
import { OK, BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';

describe('Request Middleware', () => {
	const mockLogger: any = { info: jest.fn(), error: jest.fn() };
	const mockContext: any = {
		status: OK,
		request: { path: '/' },
	};
	const mockNext: any = jest.fn();
	const middleware: Function = RequestMiddleware({ logger: mockLogger });

	beforeEach(() => {
		mockLogger.info.mockReset();
		mockLogger.error.mockReset();
		mockNext.mockReset();
	});

	test('Errors caught and status and body are obfuscated with 404 when ex status undefined', async () => {
		mockNext.mockImplementation(() => {
			throw new Error('fatal');
		});
		await middleware(mockContext, mockNext);
		expect(mockNext.mock.calls.length).toBe(1);
		expect(mockLogger.error.mock.calls.length).toBe(1);
		expect(mockLogger.error.mock.calls[0][1]).toEqual(new Error('fatal'));
		expect(mockContext.status).toBe(BAD_REQUEST);
		expect(mockContext.body).toEqual({ message: 'Invalid request' });
	});

	test('Errors caught and status and body are obfuscated with 404 when ex status 500', async () => {
		const error: any = new Error('fatal');
		error.status = 500;
		mockNext.mockImplementation(() => {
			throw error;
		});
		await middleware(mockContext, mockNext);
		expect(mockNext.mock.calls.length).toBe(1);
		expect(mockLogger.error.mock.calls.length).toBe(1);
		expect(mockLogger.error.mock.calls[0][1]).toEqual(error);
		expect(mockContext.status).toBe(BAD_REQUEST);
		expect(mockContext.body).toEqual({ message: 'Invalid request' });
	});

	test('Exceptions exposed when not 500', async () => {
		const error: any = new Error('Unauthorized');
		error.status = 401;
		mockNext.mockImplementation(() => {
			throw error;
		});
		await middleware(mockContext, mockNext);
		expect(mockNext.mock.calls.length).toBe(1);
		expect(mockLogger.error.mock.calls.length).toBe(0);
		expect(mockContext.status).toBe(UNAUTHORIZED);
		expect(mockContext.body).toEqual({ message: 'Unauthorized' });
	});
});
