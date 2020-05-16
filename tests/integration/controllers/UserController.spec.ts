import request, { SuperTest, Test, Response } from 'supertest';
import { CREATED, OK } from 'http-status-codes';
import randomInt from 'random-int';

describe('User Controller', () => {
	const api: SuperTest<Test> = request('localhost:3000/api');

	test('User Registration, Login and Update workflow', async () => {
		const num: number = randomInt(1, 100000);
		const username: string = `test${num}`;
		const email: string = `test${num}@gmail.com`;
		const password: string = num.toString();
		const bio: string = 'test-bio';
		const image: string = 'test-image.png';

		// register
		let response: Response = await api
			.post('/users')
			.send({
				user: {
					username,
					email,
					password,
					bio,
					image,
				},
			})
			.expect(CREATED);

		expect(response.body.user.username).toEqual(username);
		expect(response.body.user.email).toEqual(email);
		expect(response.body.user.password).toBeUndefined();
		expect(response.body.user.bio).toEqual(bio);
		expect(response.body.user.image).toEqual(image);
		expect(response.body.user.token).toBeDefined();

		// login
		response = await api
			.post('/users/login')
			.send({
				user: {
					email,
					password,
				},
			})
			.expect(OK);

		expect(response.body.user.username).toEqual(username);
		expect(response.body.user.email).toEqual(email);
		expect(response.body.user.password).toBeUndefined();
		expect(response.body.user.bio).toEqual(bio);
		expect(response.body.user.image).toEqual(image);
		expect(response.body.user.token).toBeDefined();

		const token: string = response.body.user.token;

		// get user
		response = await api.get('/user').set('Authorization', `Bearer ${token}`).expect(OK);

		expect(response.body.user.username).toEqual(username);
		expect(response.body.user.email).toEqual(email);
		expect(response.body.user.password).toBeUndefined();
		expect(response.body.user.bio).toEqual(bio);
		expect(response.body.user.image).toEqual(image);
		expect(response.body.user.token).toBeDefined();

		// update user
		const newNum: number = randomInt(1, 100000);
		const newUsername: string = `test${newNum}`;
		const newEmail: string = `test${newNum}@gmail.com`;
		const newBio: string = 'new-test-bio';
		const newImage: string = 'new-test-image.png';

		response = await api
			.put('/user')
			.set('Authorization', `Bearer ${token}`)
			.send({
				user: {
					username: newUsername,
					email: newEmail,
					bio: newBio,
					image: newImage,
				},
			})
			.expect(OK);

		expect(response.body.user.username).toEqual(newUsername);
		expect(response.body.user.email).toEqual(newEmail);
		expect(response.body.user.password).toBeUndefined();
		expect(response.body.user.bio).toEqual(newBio);
		expect(response.body.user.image).toEqual(newImage);
		expect(response.body.user.token).toBeDefined();
	});
});
