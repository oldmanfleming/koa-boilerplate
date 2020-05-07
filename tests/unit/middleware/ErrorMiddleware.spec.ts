import middleware from '../../../src/middleware/ErrorMiddleware';
import { OK, BAD_REQUEST, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import logger from '../../../src/Logger';
import sinon, { SinonSandbox } from 'sinon';
import { assert, string } from '@hapi/joi';

describe('Error Middleware', () => {
	const sandbox: SinonSandbox = sinon.createSandbox();
	const mockContext: any = {
		status: OK,
		request: { path: '/' },
	};
	const mockNext: any = sandbox.stub();
	sandbox.stub(logger, 'info');
	sandbox.stub(logger, 'error');

	beforeEach(() => {
		sandbox.reset();
	});

	test('Validation errors parsed and return 422', async () => {
		const next: any = () => assert({}, string());
		await middleware(mockContext, next);
		expect(mockContext.status).toBe(UNPROCESSABLE_ENTITY);
		expect(mockContext.body).toEqual({
			errors: {
				body: '"value" must be a string',
			},
		});
	});

	test('Errors caught and status and body are obfuscated with 404 when ex status undefined', async () => {
		mockNext.rejects();
		await middleware(mockContext, mockNext);
		expect(mockNext.callCount).toBe(1);
		expect(mockContext.status).toBe(BAD_REQUEST);
		expect(mockContext.body).toEqual({ message: 'Invalid request' });
	});

	test('Errors caught and status and body are obfuscated with 404 when ex status 500', async () => {
		const error: any = new Error('fatal');
		error.status = 500;
		mockNext.rejects(error);
		await middleware(mockContext, mockNext);
		expect(mockNext.callCount).toBe(1);
		expect(mockContext.status).toBe(BAD_REQUEST);
		expect(mockContext.body).toEqual({ message: 'Invalid request' });
	});

	test('Exceptions exposed when not 500', async () => {
		const error: any = new Error('Unauthorized');
		error.status = 401;
		mockNext.rejects(error);
		await middleware(mockContext, mockNext);
		expect(mockNext.callCount).toBe(1);
		expect(mockContext.status).toBe(UNAUTHORIZED);
		expect(mockContext.body).toEqual({ message: 'Unauthorized' });
	});
});
