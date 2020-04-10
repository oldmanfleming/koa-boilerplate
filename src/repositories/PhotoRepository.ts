import { EntityRepository, Repository } from 'typeorm';
import { Photo } from '../models/Photo';

@EntityRepository(Photo)
export class PhotoRepository extends Repository<Photo> {
	// This is a custom function on top of the base Repository functions
	findByName(name: string): Promise<Photo[]> {
		return this.createQueryBuilder('photo').where('photo.name = :name', { name }).getMany();
	}
}
