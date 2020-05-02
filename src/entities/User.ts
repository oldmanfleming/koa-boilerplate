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

	// @ManyToMany(type => ArticleEntity)
	// @JoinTable()
	// favorites: ArticleEntity[];

	// @OneToMany(type => ArticleEntity, article => article.author)
	// articles: ArticleEntity[];

	toJSON(token: string) {
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
}
