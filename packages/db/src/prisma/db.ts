import "temporal-polyfill/full/global";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { and } from "@prisma/orm-postgres/orm-client";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.js";
import contractJson from "./contract.json" with { type: "json" };

const currentDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({
	path: resolve(currentDir, "../../.env"),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is not defined");
}

export const db = postgres<Contract>({
	contractJson,
});

export const runtime = await db.connect({
	url: databaseUrl,
});

export { and };
