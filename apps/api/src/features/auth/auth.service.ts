import { hashPassword } from "../../shared/lib/password.js";
import type { UserRepositoryInterface } from "../users/users.repository.js";
import type { registerInput } from "./auth.schema.js";
import type { AuthResponse, UserResponse } from "./auth.types.js";
import { AppError } from "../../shared/errors/app-error.js";
import { generateAccessToken, type Payload } from "../../shared/lib/jwt.js";
import type { User } from "../users/users.types.js";

function isUniqueConstraintError(err: unknown): boolean {
	if (!err || typeof err !== "object") {
		return false;
	}

	const error = err as { code?: unknown; cause?: unknown };

	// PostgreSQL unique_violation
	if (error.code === "23505") {
		return true;
	}

	// Prisma classic unique constraint
	if (error.code === "P2002") {
		return true;
	}

	if ("cause" in error) {
		return isUniqueConstraintError(error.cause);
	}

	return false;
}

export interface AuthServiceInterface {
	registerUser(input: registerInput): Promise<AuthResponse>;
}

export class AuthService implements AuthServiceInterface {
	constructor(private userRepository: UserRepositoryInterface) {}

	registerUser = async (input: registerInput): Promise<AuthResponse> => {
		const existingUser = await this.userRepository.getByEmail(input.email);

		if (existingUser) {
			throw new AppError("A user with this email already exists", 409);
		}

		const passwordHash = await hashPassword(input.password);
		const newInput = { ...input, password: passwordHash };

		let user: User | undefined;

		try {
			user = await this.userRepository.registerUser(newInput);
		} catch (err) {
			if (err instanceof AppError) {
				throw err;
			}

			if (isUniqueConstraintError(err)) {
				throw new AppError("A user with this email already exists", 409);
			}

			throw err;
		}

		if (!user) {
			throw new AppError("Failed to create user", 500);
		}

		const userResponse: UserResponse = {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			sellerStatus: user.sellerStatus,
		};

		const payload: Payload = {
			sub: userResponse.id,
			role: userResponse.role,
		};

		const token = generateAccessToken(payload);

		return {
			data: {
				accessToken: token,
				user: userResponse,
			},
		};
	};
}
