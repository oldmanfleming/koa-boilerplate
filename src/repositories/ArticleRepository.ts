import { EntityRepository, Repository } from 'typeorm';

import { Article } from '../entities/Article';

@EntityRepository(Article)
export default class ArticleRepository extends Repository<Article> {
	// Custom Repository Functions go here.
}
