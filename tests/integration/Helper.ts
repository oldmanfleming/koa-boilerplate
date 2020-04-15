import dotenv from 'dotenv';

export default class Helper {
	private _basePath: string;
	public get basePath(): string {
		return this._basePath;
	}
	constructor() {
		if (!process.env.PORT) {
			dotenv.config();
		}
		this._basePath = `localhost:${process.env.PORT}`;
	}
}
