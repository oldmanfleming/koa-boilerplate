import Config from '../../../src/lib/Config';

describe('App', () => {
	afterEach(() => {
		delete process.env.SECRET;
	});

	test('Reads secret frm env', async () => {
		const testSecret: string = 'test-secret';
		process.env.SECRET = testSecret;
		const config: Config = new Config();
		expect(config.secret).toBe(testSecret);
	});

	test('throws when no secret defined', async () => {
		expect(() => new Config()).toThrow();
	});
});
