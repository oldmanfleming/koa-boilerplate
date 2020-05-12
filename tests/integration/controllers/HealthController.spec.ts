import request from 'supertest';
import { OK } from 'http-status-codes';
import Helper from '../Helper';

describe('Health Controller', () => {
	const helper: Helper = new Helper();

	test.each([['/'], ['/health']])('returns 200 on both health paths', async (route: string) => {
		await request(helper.basePath).get(route).expect(OK);
	});
});
