import { Entity, PrimaryColumn } from 'typeorm';

@Entity('tags')
export class Tag {
	@PrimaryColumn()
	label!: string;

	toJSON() {
		return this.label;
	}
}
