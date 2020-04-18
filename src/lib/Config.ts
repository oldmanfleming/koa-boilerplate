export default class Config {
	private _secret: string;
	public get secret(): string {
		return this._secret;
	}
	constructor() {
		if (!process.env.SECRET) throw Error('could not find secret');
		this._secret = process.env.SECRET;
	}
}
