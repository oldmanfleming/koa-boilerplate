import SecurityService, { Claims } from '../../../src/services/SecurityService';
import { User } from '../../../src/entities/User';

describe('App', () => {
	process.env.SECRET = 'test-secret';
	const securityService: SecurityService = new SecurityService();
	delete process.env.SECRET;

	test('missing secret causes SecurityService instantiation to throw', async () => {
		let threw: boolean = false;
		try {
			new SecurityService();
		} catch {
			threw = true;
		}
		expect(threw).toBe(true);
	});

	test('jwt workflow adds user to claims and creates valid jwt', async () => {
		const user: User = new User();
		user.id = 123;
		user.username = 'test-username';
		user.email = 'test@gmail.com';
		const token: string = securityService.generateToken(user);
		const claims: Claims = securityService.verifyToken(token);
		expect(claims.id).toEqual(user.id);
		expect(claims.username).toEqual(user.username);
		expect(claims.email).toEqual(user.email);
		expect(claims.iat).toBeGreaterThan(0);
		expect(claims.exp).toBeGreaterThan(0);
	});

	test('password hashing workflow hashes user password', async () => {
		const password: string = 'password';
		const user: User = new User();
		user.password = password;
		SecurityService.hashPassword(user);
		expect(user.password).not.toEqual(password);
		expect(SecurityService.verifyHash(password, user.password)).toBe(true);
	});
});
