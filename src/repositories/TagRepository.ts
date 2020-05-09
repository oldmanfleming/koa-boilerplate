import { EntityRepository, Repository, In } from 'typeorm';

import { Tag } from '../entities/Tag';

@EntityRepository(Tag)
export default class TagRepository extends Repository<Tag> {
	// Custom Repository Functions go here.

	async findOrCreateTags(tagList: string[]): Promise<Tag[]> {
		const existingTags: Tag[] = await this.find({ where: { label: In(tagList) } });
		const newTags: Tag[] = [];
		tagList.forEach((tagLabel: string) => {
			if (!existingTags.filter((tag: Tag) => tag.label === tagLabel).length) {
				const newTag: Tag = new Tag();
				newTag.label = tagLabel;
				newTags.push(newTag);
			}
		});
		return [...existingTags, ...newTags];
	}
}
