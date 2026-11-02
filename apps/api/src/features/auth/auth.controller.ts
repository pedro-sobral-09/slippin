import type { Request, Response } from "express";
import type { AuthServiceInterface } from "./auth.service.js";
import type { registerInput } from "./auth.schema.js";
import type { AuthResponse } from "./auth.types.js";
import logger from "../../shared/lib/logger.js";

export interface AuthControllerInterface {
	registerUser(req: Request, res: Response): Promise<Response>;
}

export class AuthController implements AuthControllerInterface {
	constructor(private authService: AuthServiceInterface) {}

	registerUser = async (req: Request, res: Response): Promise<Response> => {
		const input: registerInput = res.locals.input;
		const authResponse: AuthResponse =
			await this.authService.registerUser(input);

		return res.status(201).json(authResponse);
	};
}
