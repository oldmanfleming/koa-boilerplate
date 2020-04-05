import app from '../src/app';

const mockListen: any = jest.fn();
app.listen = mockListen;

beforeEach(() => {
	mockListen.mockReset();
});

test('Server works', async () => {
	require('../src/server');
	expect(mockListen.mock.calls.length).toBe(1);
	expect(mockListen.mock.calls[0][0]).toBe(process.env.PORT || 3000);
});
