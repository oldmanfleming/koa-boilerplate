import { EntityRepository, Repository } from 'typeorm';

import { Favorite } from '../entities/Favorite';

@EntityRepository(Favorite)
export default class FavoriteRepository extends Repository<Favorite> {
	// These are custom functions on top of the base Repository functions
}
