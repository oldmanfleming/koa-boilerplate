import { route, GET } from 'awilix-koa';
import { OK } from 'http-status-codes';
import { Context } from 'koa';
import { PoolClient } from 'pg';

export default class HealthCheckController {
	private _client: PoolClient;

	constructor({ client }: { client: PoolClient }) {
		this._client = client;
	}

	@route('/')
	@route('/health')
	@GET()
	async health(ctx: Context) {
		await this._client.query(`
      SELECT NOW() as now
    `);
		ctx.status = OK;
	}
}
