import TagController from '../../../src/controllers/TagController';
import { OK } from 'http-status-codes';
import sinon from 'sinon';
import { Tag } from '../../../src/entities/Tag';

describe('TagController', () => {
	const sandbox: any = sinon.createSandbox();

	const mockTagRepository: any = { find: sandbox.stub() };
	const mockGetCustomRepository: any = sandbox.stub().returns(mockTagRepository);
	const mockConnection: any = {
		getCustomRepository: mockGetCustomRepository,
	};

	const controller: TagController = new TagController({
		connection: mockConnection,
	});

	let mockContext: any;

	beforeEach(() => {
		sandbox.restore();
		mockContext = {};
	});

	test('getProfile returns 200 and following user with result of isFollowing', async () => {
		const tag1: Tag = new Tag();
		tag1.label = 'React';
		const tag2: Tag = new Tag();
		tag2.label = 'node.js';
		const tagList: Tag[] = [tag1, tag2];
		mockTagRepository.find.resolves(tagList);

		await controller.getTags(mockContext);

		expect(mockContext.status).toEqual(OK);
		expect(mockContext.body).toEqual({ tags: [tag1.toJSON(), tag2.toJSON()] });
	});
});
