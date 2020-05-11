import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	BeforeUpdate,
	Index,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { User } from './User';
import { Comment } from './Comment';
import { Tag } from './Tag';
import { Favorite } from './Favorite';

@Entity('articles')
export class Article {
	@PrimaryGeneratedColumn()
	id!: number;

	@Index({ unique: true })
	@Column()
	slug!: string;

	@Column()
	title!: string;

	@Column({ default: '' })
	description!: string;

	@Column({ default: '' })
	body!: string;

	@ManyToMany(() => Tag, (tag: Tag) => tag.articles, { cascade: true })
	@JoinTable()
	tagList!: Tag[];

	@ManyToOne(() => User, (user: User) => user.articles)
	author!: User;

	@OneToMany(() => Comment, (comment: Comment) => comment.article)
	comments!: Comment[];

	@OneToMany(() => Favorite, (favorite: Favorite) => favorite.article)
	favorites!: Favorite[];

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt!: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt!: Date;

	@BeforeUpdate()
	updateTimestamp() {
		this.updatedAt = new Date();
	}

	toJSON(following: boolean, favorited: boolean) {
		return {
			slug: this.slug,
			title: this.title,
			description: this.description,
			body: this.body,
			tagList: this.tagList && this.tagList.map((tag: Tag) => tag.toJSON()),
			author: this.author && this.author.toProfileJSON(following),
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			favorited,
			favoritesCount: this.favorites && this.favorites.length,
		};
	}
}
