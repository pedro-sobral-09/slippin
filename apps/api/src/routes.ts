import { Router, type Request, type Response } from "express";
import { authRouter } from "./features/auth/auth.routes.js";
import swaggerUI from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import logger from "./shared/lib/logger.js";

const router = Router();

router.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

router.get("/health", (req: Request, res: Response) => {
	logger.info("Slippin API is healthy");
	res.status(200).json({ message: "Slippin API is healthy" });
});

router.use("/auth", authRouter);

export { router };
