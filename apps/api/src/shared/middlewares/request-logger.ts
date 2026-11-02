import type { Request, Response, NextFunction } from "express";
import logger from "../lib/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
	const start = Date.now();

	res.on("finish", () => {
		logger.info("HTTP Request", {
			method: req.method,
			url: req.originalUrl,
			status: res.statusCode,
			duration: `${Date.now() - start}ms`,
			ip: req.ip,
		});
	});

	next();
}
