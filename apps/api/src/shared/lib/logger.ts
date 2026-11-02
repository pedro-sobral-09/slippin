import winston from "winston";

const logger = winston.createLogger({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",

	format: winston.format.combine(
		winston.format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		winston.format.errors({ stack: true }),
		winston.format.colorize(),
		winston.format.splat(),
		winston.format.printf(
			({ timestamp, level, message, stack, ...metadata }) => {
				const details =
					Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : "";

				return `${timestamp} [${level}]: ${stack ?? message} ${details}`;
			},
		),
	),

	transports: [new winston.transports.Console()],
});

export default logger;
