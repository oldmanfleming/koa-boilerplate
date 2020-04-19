import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	username!: string;

	@Column()
	email!: string;

	@Column({ default: '' })
	bio!: string;

	@Column({ default: '' })
	image!: string;

	@Column()
	password!: string;

	token!: string; // TODO REMOVE

	// @ManyToMany(type => ArticleEntity)
	// @JoinTable()
	// favorites: ArticleEntity[];

	// @OneToMany(type => ArticleEntity, article => article.author)
	// articles: ArticleEntity[];

	toJSON() {
		return {
			user: {
				email: this.email,
				username: this.username,
				bio: this.bio,
				image: this.image,
				token: this.token,
			},
		};
	}
}
