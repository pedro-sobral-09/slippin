import { db } from "db";
import { PrismaUserRepository } from "../users/users.repository.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";

const userRepository = new PrismaUserRepository(db);
const authService = new AuthService(userRepository);
export const authController = new AuthController(authService);
