import { Entity, PrimaryColumn, ManyToMany } from 'typeorm';
import { Article } from './Article';

@Entity('tags')
export class Tag {
	@PrimaryColumn()
	label!: string;

	@ManyToMany(() => Article, (article: Article) => article.tagList)
	articles!: Article[];

	toJSON() {
		return this.label;
	}
}
