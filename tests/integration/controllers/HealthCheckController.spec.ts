import request from 'supertest';
import { OK } from 'http-status-codes';
import { BasePath } from '../Constants';

describe('HealthCheck Controller', () => {
	test.each([['/'], ['/health']])('returns 200 on both health paths', async (route: string) => {
		await request(BasePath).get(route).expect(OK);
	});
});
