import { EntityRepository, Repository } from 'typeorm';

import { Favorite } from '../entities/Favorite';
import { Article } from '../entities/Article';
import { User } from '../entities/User';

@EntityRepository(Favorite)
export default class FavoriteRepository extends Repository<Favorite> {
	// These are custom functions on top of the base Repository functions

	async favorited(article: Article, user: User): Promise<boolean> {
		const favorited: number = await this.count({ article, user });
		return !!favorited;
	}
}
