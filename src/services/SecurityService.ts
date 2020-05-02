import { pbkdf2Sync, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';

export interface Claims {
	id: number;
	username: string;
	email: string;
	iat: number;
	exp: number;
}

export default class Security {
	private static _iterations: number = 2048;
	private static _keyLen: number = 32;
	private static _saltLen: number = 16;
	private static _digest: string = 'sha512';
	private _tokenExp: string = '1d';
	private _secret: string;

	constructor() {
		if (!process.env.SECRET) throw Error('could not find secret');
		this._secret = process.env.SECRET;
		delete process.env.SECRET;
	}

	public static hashPassword(user: User): void {
		const salt: string = randomBytes(this._saltLen).toString('hex');
		const hash: string = pbkdf2Sync(user.password, salt, this._iterations, this._keyLen, this._digest).toString('hex');
		user.password = [salt, hash].join('$');
	}

	public static verifyHash(password: string, key: string): boolean {
		const originalHash: string = key.split('$')[1];
		const salt: string = key.split('$')[0];
		const hash: string = pbkdf2Sync(password, salt, this._iterations, this._keyLen, this._digest).toString('hex');
		return hash === originalHash;
	}

	public generateToken(user: User): string {
		return jwt.sign(
			{
				id: user.id,
				username: user.username,
				email: user.email,
			},
			this._secret,
			{ expiresIn: this._tokenExp },
		);
	}

	public verifyToken(token: string): Claims {
		return jwt.verify(token, this._secret) as Claims;
	}
}
