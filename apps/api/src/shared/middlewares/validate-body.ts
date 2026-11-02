import type { NextFunction, Request, Response } from "express";
import type z from "zod";
import logger from "../lib/logger.js";

export function validateBody(schema: z.ZodType) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			logger.error("Validation error");

			return res.status(400).json({
				error: "Validation error",
				details: result.error.issues,
			});
		}

		res.locals.input = result.data;
		next();
	};
}
