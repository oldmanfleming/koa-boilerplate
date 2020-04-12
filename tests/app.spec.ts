import { createApp } from '../src/app';
import * as typeorm from 'typeorm';
import dotenv from 'dotenv';
import sinon from 'sinon';

describe('App', () => {
	const sandbox: any = sinon.createSandbox();
	let mockConnection: any;
	let mockConfig: any;

	beforeEach(() => {
		sandbox.stub(typeorm, 'getCustomRepository');
		mockConnection = sandbox.stub(typeorm, 'createConnection');
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
		expect(mockConnection.callCount).toBe(1);
	});

	test('Doesnt load env variables in prod', async () => {
		process.env.NODE_ENV = 'prod';
		await createApp();
		expect(mockConfig.callCount).toBe(0);
		expect(mockConnection.callCount).toBe(1);
	});
});
