import { route, GET, POST, before, inject } from 'awilix-koa';
import { OK, CREATED } from 'http-status-codes';
import { Context } from 'koa';

import Photo from '../entities/Photo';
import PhotoRepository from '../repositories/PhotoRepository';
import AuthenticationMiddleware from '../middleware/AuthenticationMiddleware';
import { Connection, EntityManager } from 'typeorm';

@route('/photos')
@before([inject(AuthenticationMiddleware)])
export default class PhotoController {
	private _connection: Connection;
	private _photoRepository: PhotoRepository;

	// Any Dependencies registered to the container can be injected here
	constructor({ connection }: { connection: Connection }) {
		this._connection = connection;
		this._photoRepository = connection.getCustomRepository(PhotoRepository);
	}

	@route('/')
	@POST()
	async post(ctx: Context) {
		const photo: Photo = new Photo();
		photo.name = 'Me and Bears';
		photo.description = 'I am near polar bears';
		photo.filename = 'photo-with-bears.jpg';
		photo.views = 1;
		photo.isPublished = true;

		// await this._photoRepository.save(photo);
		await this._connection.transaction(async (tx: EntityManager) => {
			await tx.save(photo);
		});

		ctx.status = CREATED;
	}

	@route('/')
	@GET()
	async getAll(ctx: Context) {
		ctx.body = await this._photoRepository.find();
		ctx.status = OK;
	}
}

// const queryRunner: QueryRunner = this._connection.createQueryRunner();
// await queryRunner.connect();

// try {
// 	await queryRunner.startTransaction();

// 	await queryRunner.manager.save(photo);

// 	this.throwSomething();

// 	await queryRunner.manager.save(photo);

// 	await queryRunner.commitTransaction();
// } catch (err) {
// 	console.error(err);
// 	await queryRunner.rollbackTransaction();
// } finally {
// 	await queryRunner.release();
// }
