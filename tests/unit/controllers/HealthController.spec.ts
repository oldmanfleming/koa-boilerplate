import HealthController from '../../../src/controllers/HealthController';
import { OK } from 'http-status-codes';

const mockConnection: any = { query: jest.fn() };
const controller: HealthController = new HealthController({ connection: mockConnection });

describe('Health Controller', () => {
	test('health calls query and returns OK', async () => {
		const mockContext: any = {};
		await controller.health(mockContext);
		expect(mockConnection.query.mock.calls.length).toBe(1);
		expect(mockContext.status).toEqual(OK);
	});
});
