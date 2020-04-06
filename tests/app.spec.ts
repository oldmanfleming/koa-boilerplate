import { createApp } from '../src/app';
import pg from 'pg';
import dotenv from 'dotenv';
import sinon from 'sinon';

describe('App', () => {
	const sandbox: any = sinon.createSandbox();

	let mockPool: any;
	let mockConfig: any;

	beforeEach(() => {
		mockPool = sandbox.spy(pg, 'Pool');
		mockConfig = sandbox.spy(dotenv, 'config');
		process.env.NODE_ENV = 'dev';
	});

	afterEach(() => {
		sandbox.restore();
		delete process.env.NODE_ENV;
	});

	test('Does not throw in base case', async () => {
		await createApp();
		expect(mockConfig.callCount).toBe(1);
		expect(mockPool.callCount).toBe(1);
	});

	test('Doesnt load env variables in prod', async () => {
		process.env.NODE_ENV = 'prod';
		await createApp();
		expect(mockConfig.callCount).toBe(0);
		expect(mockPool.callCount).toBe(1);
	});
});
