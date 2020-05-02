import { createLogger, format, transports } from 'winston';

export default createLogger({
	transports: [
		new transports.Console({
			format: format.simple(),
		}),
	],
});
