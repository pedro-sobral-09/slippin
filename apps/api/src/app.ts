import cors from "cors";
import dotenv from "dotenv";
import express, { type Express } from "express";
import helmet from "helmet";
import { errorHandler } from "./shared/middlewares/error-handler.js";
import { router } from "./routes.js";
import { requestLogger } from "./shared/middlewares/request-logger.js";

dotenv.config();

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api", router);

app.use(errorHandler);

export { app };
