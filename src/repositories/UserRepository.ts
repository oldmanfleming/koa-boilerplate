import { EntityRepository, Repository } from 'typeorm';

import { User } from '../entities/User';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
	// This is a custom function on top of the base Repository functions
	findByEmail(email: string): Promise<User | undefined> {
		return this.createQueryBuilder('users').where('email = :email', { email }).getOne();
	}
}
