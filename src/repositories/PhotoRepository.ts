import { EntityRepository, Repository } from 'typeorm';
import Photo from '../entities/Photo';

@EntityRepository(Photo)
export default class PhotoRepository extends Repository<Photo> {
	// This is a custom function on top of the base Repository functions
	findByName(name: string): Promise<Photo[]> {
		return this.createQueryBuilder('photo').where('photo.name = :name', { name }).getMany();
	}
}

// return this.manager.transaction(async (transactionalManager: EntityManager) => {
// 	await transactionalManager.save(user);
// 	await transactionalManager.save(photos);
// });

// @Transaction()
// async transactionSave(@TransactionManager() manager: EntityManager, photo: Photo) {
// 	return manager.save(photo);
// }

// transactionSave2(photo: Photo) {
// return this.manager.transaction(async (transactionalManager: EntityManager) => {
// 	await transactionalManager.save(photo);
// });
// }
