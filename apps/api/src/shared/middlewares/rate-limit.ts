import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 5,
	message: {
		message: "Too many login attempts. Try again later.",
	},
});

export { authLimiter };
