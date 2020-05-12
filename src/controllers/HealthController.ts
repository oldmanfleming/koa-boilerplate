import { route, GET } from 'awilix-koa';
import { OK } from 'http-status-codes';
import { Context } from 'koa';
import { Connection } from 'typeorm';

export default class HealthCheckController {
	private _connection: Connection;

	constructor({ connection }: { connection: Connection }) {
		this._connection = connection;
	}

	@route('/')
	@route('/health')
	@GET()
	async health(ctx: Context) {
		await this._connection.query(`
      SELECT NOW()
    `);
		ctx.status = OK;
	}
}
