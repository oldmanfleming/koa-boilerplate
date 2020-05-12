import { EntityRepository, Repository } from 'typeorm';

import { Comment } from '../entities/Comment';

@EntityRepository(Comment)
export default class CommentRepository extends Repository<Comment> {
	// Custom Repository Functions go here.
}
