import { EntityRepository, Repository } from 'typeorm';

import { Comment } from '../entities/Comment';

@EntityRepository(Comment)
export default class CommentRepository extends Repository<Comment> {
	// These are custom functions on top of the base Repository functions
}
