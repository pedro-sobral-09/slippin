import { and, db } from "db";
import type { registerInput } from "../auth/auth.schema.js";
import type { User } from "./users.types.js";

type Database = typeof db;
type DbUser = NonNullable<
	Awaited<ReturnType<Database["orm"]["public"]["User"]["create"]>>
>;

export interface UserRepositoryInterface {
	registerUser(input: registerInput): Promise<User | undefined>;
	getByEmail(email: string): Promise<User | undefined>;
}

export class PrismaUserRepository implements UserRepositoryInterface {
	constructor(private db: Database) {}

	private toUser(user: DbUser): User {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			sellerStatus: user.sellerStatus,
			createdAt: new Date(user.createdAt.epochMilliseconds),
			updatedAt: new Date(user.updatedAt.epochMilliseconds),
			deletedAt: user.deletedAt
				? new Date(user.deletedAt.epochMilliseconds)
				: null,
		};
	}

	registerUser = async (input: registerInput): Promise<User | undefined> => {
		const user = await this.db.orm.public.User.create({
			email: input.email,
			name: input.name,
			password: input.password,
		});

		if (!user) {
			return undefined;
		}

		return this.toUser(user);
	};

	getByEmail = async (email: string): Promise<User | undefined> => {
		const user = await this.db.orm.public.User.where((u) =>
			and(u.email.eq(email), u.deletedAt.isNull()),
		).first();

		if (!user) {
			return undefined;
		}

		return this.toUser(user);
	};
}
