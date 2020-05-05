import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	JoinColumn,
	BeforeUpdate,
	Index,
	ManyToMany,
} from 'typeorm';
import { User } from './User';
import { Comment } from './Comment';
import { Tag } from './Tag';

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

	@OneToMany(() => Tag, (tag: Tag) => tag.label, { eager: true })
	tagList!: string[];

	@ManyToOne(() => User, (user: User) => user.articles, { eager: true })
	author!: User;

	@OneToMany(() => Comment, (comment: Comment) => comment.article)
	@JoinColumn()
	comments!: Comment[];

	@ManyToMany(() => User)
	favorites!: User[];

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt!: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt!: Date;

	@BeforeUpdate()
	updateTimestamp() {
		this.updatedAt = new Date();
	}
}
