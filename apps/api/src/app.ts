import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
	res.status(200).json({ message: "Slippin API is healthy" });
});

export { app };
