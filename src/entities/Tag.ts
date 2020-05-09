import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Article } from './Article';

@Entity('tags')
export class Tag {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	label!: string;

	@ManyToMany(() => Article, (article: Article) => article.tagList)
	articles!: Article[];

	toJSON() {
		return this.label;
	}
}
