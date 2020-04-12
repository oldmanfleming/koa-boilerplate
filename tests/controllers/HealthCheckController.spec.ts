import HealthCheckController from '../../src//controllers/HealthCheckController';
import { OK } from 'http-status-codes';

const mockConnection: any = { query: jest.fn() };
const controller: HealthCheckController = new HealthCheckController({ connection: mockConnection });

describe('HealthCheck Controller', () => {
	test('health calls query and returns OK', async () => {
		const mockContext: any = {};
		await controller.health(mockContext);
		expect(mockConnection.query.mock.calls.length).toBe(1);
		expect(mockContext.status).toEqual(OK);
	});
});
