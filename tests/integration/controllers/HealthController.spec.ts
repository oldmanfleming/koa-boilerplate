import request, { SuperTest, Test } from 'supertest';
import { OK } from 'http-status-codes';

describe('Health Controller', () => {
	const api: SuperTest<Test> = request('localhost:3000');

	test.each([['/'], ['/health']])('returns 200 on both health paths', async (route: string) => {
		await api.get(route).expect(OK);
	});
});
