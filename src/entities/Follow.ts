import { Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { User } from './User';

@Entity('follows')
@Index(['follower', 'following'], { unique: true })
export class Follow {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, (user: User) => user.followers)
	follower!: User;

	@ManyToOne(() => User, (user: User) => user.following)
	following!: User;
}
