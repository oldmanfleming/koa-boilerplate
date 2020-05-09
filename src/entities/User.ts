import { Entity, PrimaryGeneratedColumn, Index, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Article } from './Article';
import { Comment } from './Comment';
import { Follow } from './Follow';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Index({ unique: true })
	@Column()
	username!: string;

	@Index({ unique: true })
	@Column()
	email!: string;

	@Column({ default: '' })
	bio!: string;

	@Column({ default: '' })
	image!: string;

	@Column()
	password!: string;

	@OneToMany(() => Article, (article: Article) => article.author)
	articles!: Article[];

	@OneToMany(() => Comment, (comment: Comment) => comment.author)
	comments!: Comment[];

	@ManyToMany(() => Article)
	@JoinTable()
	favorites!: Article[];

	@OneToMany(() => Follow, (follow: Follow) => follow.follower)
	followers!: Follow[];

	@OneToMany(() => Follow, (follow: Follow) => follow.following)
	following!: Follow[];

	toUserJSON(token: string) {
		return {
			user: {
				email: this.email,
				username: this.username,
				bio: this.bio,
				image: this.image,
				token,
			},
		};
	}

	toProfileJSON(following: boolean) {
		return {
			profile: {
				username: this.username,
				bio: this.bio,
				image: this.image,
				following,
			},
		};
	}
}
