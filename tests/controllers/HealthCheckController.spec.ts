import HealthCheckController from '../../src//controllers/HealthCheckController';
import { OK } from 'http-status-codes';

const mockClient: any = { query: jest.fn() };
const controller: HealthCheckController = new HealthCheckController({ client: mockClient });

describe('HealthCheck Controller', () => {
	test('health calls query and returns OK', async () => {
		const mockContext: any = {};
		await controller.health(mockContext);
		expect(mockClient.query.mock.calls.length).toBe(1);
		expect(mockContext.status).toEqual(OK);
	});
});
