import { route, GET, POST } from 'awilix-koa';
import { OK, CREATED } from 'http-status-codes';
import { Context } from 'koa';

import { Photo } from '../models/Photo';
import { PhotoRepository } from '../repositories/PhotoRepository';

@route('/photos')
export default class PhotoController {
	private _photoRepository: PhotoRepository;

	// Any Dependencies registered to the container can be injected here
	constructor({ photoRepository }: { photoRepository: PhotoRepository }) {
		this._photoRepository = photoRepository;
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

		await this._photoRepository.save(photo);

		ctx.status = CREATED;
	}

	@route('/')
	@GET()
	async getAll(ctx: Context) {
		ctx.body = await this._photoRepository.find();
		ctx.status = OK;
	}
}
