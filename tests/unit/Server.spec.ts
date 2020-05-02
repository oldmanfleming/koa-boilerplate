import Logger from '../../src/Logger';
import * as app from '../../src/App';
import dotenv from 'dotenv';
import sinon, { SinonSandbox, SinonStub } from 'sinon';

describe('App', () => {
	const sandbox: SinonSandbox = sinon.createSandbox();
	const mockCreateApp: SinonStub = sandbox.stub(app, 'createApp');
	const mockConfig: SinonStub = sandbox.stub(dotenv, 'config');
	mockCreateApp.resolves({ listen: sandbox.spy() });
	sandbox.stub(Logger, 'info');
	sandbox.stub(Logger, 'error');

	// The server will immediately bootstrap itself. We have to wait until we have sufficiently mocked things before we can import the server
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const server: any = require('../../src/Server');

	beforeEach(() => {
		sandbox.reset();
		mockCreateApp.resolves({ listen: sandbox.spy() });
		process.env.NODE_ENV = 'dev';
		process.env.PORT = '3000';
	});

	afterEach(() => {
		delete process.env.NODE_ENV;
		delete process.env.PORT;
	});

	test('Loads env variables when env has not been set', async () => {
		delete process.env.NODE_ENV;
		server.startServer();
		expect(mockConfig.callCount).toBe(1);
		expect(mockCreateApp.callCount).toBe(1);
	});

	test('Doesnt load env variables when env has been set', async () => {
		process.env.NODE_ENV = 'production';
		process.env.port = '80';
		server.startServer();
		expect(mockConfig.callCount).toBe(0);
		expect(mockCreateApp.callCount).toBe(1);
	});

	test('Catches exceptions and logs', async () => {
		mockCreateApp.rejects();
		server.startServer();
		expect(mockConfig.callCount).toBe(0);
		expect(mockCreateApp.callCount).toBe(1);
	});
});
