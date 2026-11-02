import jwt from "jsonwebtoken";
import { z } from "zod";
import { AppError } from "../errors/app-error.js";

const payloadSchema = z.object({
	sub: z.string(),
	role: z.string(),
});

export type Payload = z.infer<typeof payloadSchema>;

function getJwtSecret(): string {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw new AppError("JWT_SECRET is not defined", 500);
	}

	return secret;
}

export function generateAccessToken(payload: Payload): string {
	return jwt.sign(payload, getJwtSecret(), { expiresIn: "1h" });
}

export function validateToken(token: string): Payload {
	const decoded = jwt.verify(token, getJwtSecret());
	const result = payloadSchema.safeParse(decoded);

	if (!result.success) {
		throw new AppError("Invalid token payload", 401);
	}

	return result.data;
}
