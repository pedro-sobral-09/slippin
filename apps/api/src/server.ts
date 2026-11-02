import { app } from "./app.js";
import logger from "./shared/lib/logger.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	logger.info(`Slippin API running`);
});
