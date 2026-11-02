import { Router } from "express";
import { validateBody } from "../../shared/middlewares/validate-body.js";
import { authController } from "./auth.factory.js";
import { registerSchema } from "./auth.schema.js";
import { authLimiter } from "../../shared/middlewares/rate-limit.js";

const authRouter = Router();
authRouter.use(authLimiter);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registerInput'
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       400:
 *         description: Invalid request data.
 *       409:
 *         description: Email already registered.
 *       500:
 *         description: Internal error server
 */
authRouter.post(
	"/register",
	validateBody(registerSchema),
	authController.registerUser,
);

export { authRouter };
