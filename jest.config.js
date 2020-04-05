module.exports = {
	moduleFileExtensions: ['js', 'ts'],
	collectCoverageFrom: ['./src/**/*.ts'],
	transform: {
		'\\.ts$': 'ts-jest',
	},
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.ts$',
};
