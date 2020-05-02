import UserRepository from '../../../src/repositories/UserRepository';
import sinon from 'sinon';
import { User } from '../../../src/entities/User';

describe('User Repository', () => {
	const sandbox: any = sinon.createSandbox();
	const repository: UserRepository = new UserRepository();
	const mockCreateQueryBuilder: any = sandbox.stub(repository, 'createQueryBuilder');

	afterEach(() => {
		sandbox.restore();
	});

	test('findByEmail returns results of query using email', async () => {
		const user: User = new User();
		const email: string = 'some-email@gmail.com';
		const mockWhere: any = sandbox.stub();
		const mockGetOne: any = sandbox.stub();
		mockCreateQueryBuilder.returns({ where: mockWhere });
		mockWhere.returns({ getOne: mockGetOne });
		mockGetOne.returns(user);

		const result: User | undefined = await repository.findByEmail(email);

		expect(result).toEqual(user);
		expect(mockWhere.getCall(0).args[1]).toEqual({ email });
	});
});
