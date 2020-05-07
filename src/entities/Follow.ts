import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity('follows')
export class Follow {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, (user: User) => user.followers)
	follower!: User;

	@ManyToOne(() => User, (user: User) => user.following)
	following!: User;
}
