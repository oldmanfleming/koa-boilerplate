import { Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { User } from './User';
import { Article } from './Article';

@Entity('favorites')
@Index(['article', 'user'], { unique: true })
export class Favorite {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => Article, (article: Article) => article.favorites)
	article!: Article;

	@ManyToOne(() => User, (user: User) => user.favorites)
	user!: User;
}
