import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import logger from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	if (err instanceof AppError) {
		logger.error(err.message);
		return res.status(err.statusCode).json({
			error: {
				message: err.message,
			},
		});
	}

	logger.error(err);

	return res.status(500).json({
		error: {
			message: "Internal server error",
		},
	});
};
