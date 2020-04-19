import { pbkdf2Sync, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';

export interface Claims {
	id: number;
	username: string;
	email: string;
}

export default class Security {
	private _iterations: number = 2048;
	private _keyLen: number = 32;
	private _saltLen: number = 16;
	private _digest: string = 'sha512';
	private _tokenExp: string = '1d';
	private _secret: string;

	constructor() {
		if (!process.env.SECRET) throw Error('could not find secret');
		this._secret = process.env.SECRET;
		delete process.env.SECRET;
	}

	public hashPassword(user: User): void {
		const salt: string = randomBytes(this._saltLen).toString('hex');
		const hash: string = pbkdf2Sync(user.password, salt, this._iterations, this._keyLen, this._digest).toString('hex');
		user.password = [salt, hash].join('$');
	}

	public verifyHash(password: string, key: string): boolean {
		const originalHash: string = key.split('$')[1];
		const salt: string = key.split('$')[0];
		const hash: string = pbkdf2Sync(password, salt, this._iterations, this._keyLen, this._digest).toString('hex');
		return hash === originalHash;
	}

	public addToken(user: User): void {
		const token: string = jwt.sign(
			{
				id: user.id,
				username: user.username,
				email: user.email,
			},
			this._secret,
			{ expiresIn: this._tokenExp },
		);
		user.token = token;
	}

	public verifyToken(token: string): Claims {
		return jwt.verify(token, this._secret) as Claims;
	}
}
