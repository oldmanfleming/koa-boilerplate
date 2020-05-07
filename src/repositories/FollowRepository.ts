import { EntityRepository, Repository } from 'typeorm';

import { Follow } from '../entities/Follow';
import { User } from '../entities/User';

@EntityRepository(Follow)
export default class FollowRepository extends Repository<Follow> {
	// These are custom functions on top of the base Repository functions

	async isFollowing(follower: User, following: User): Promise<boolean> {
		const follow: Follow | undefined = await this.findOne({ follower, following });
		return !!follow;
	}
}
