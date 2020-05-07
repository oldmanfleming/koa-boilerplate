import { EntityRepository, Repository } from 'typeorm';

import { Tag } from '../entities/Tag';

@EntityRepository(Tag)
export default class TagRepository extends Repository<Tag> {
	// Custom Repository Functions go here.
}
