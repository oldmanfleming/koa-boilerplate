import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeUpdate } from 'typeorm';
import { Article } from './Article';
import { User } from './User';

@Entity('comments')
export class Comment {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	body!: string;

	@ManyToOne(() => Article, (article: Article) => article.comments)
	article!: Article;

	@ManyToOne(() => User, (user: User) => user.comments, { eager: true })
	author!: User;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt!: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt!: Date;

	@BeforeUpdate()
	updateTimestamp() {
		this.updatedAt = new Date();
	}

	toJSON(following: boolean) {
		return {
			id: this.id,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			body: this.body,
			author: this.author && this.author.toProfileJSON(following),
		};
	}
}
