import { createApp, connectWithRetry } from '../src/app';
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
		process.env.NODE_ENV = 'production';
		await createApp();
		expect(mockConfig.callCount).toBe(0);
		expect(mockConnection.callCount).toBe(1);
	});

	test('Connect with rety catches exceptions and retries', async () => {
		const clock: any = sinon.useFakeTimers();
		mockConnection.onCall(0).throws('Could not connect');
		mockConnection.onCall(1).returns();
		const mockLogger: any = { error: sandbox.spy() };
		const fakeConnectionOptions: any = { something: 'fake' };
		connectWithRetry(mockLogger, fakeConnectionOptions);
		await clock.tickAsync(5000);
		expect(mockConnection.callCount).toBe(2);
		expect(mockConnection.args[0][0]).toEqual(fakeConnectionOptions);
		expect(mockConnection.args[1][0]).toEqual(fakeConnectionOptions);
		expect(mockLogger.error.callCount).toBe(1);
	});
});
