import swaggerJsdoc from "swagger-jsdoc";
import { format } from "winston";
import { minLength } from "zod";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.3",

		info: {
			title: "Slippin API",
			version: "1.0.0",
			description: "API documentation for Slippin.",
		},

		servers: [
			{
				url: "http://localhost:3000/api",
				description: "Development server",
			},
		],

		components: {
			schemas: {
				registerInput: {
					type: "object",
					properties: {
						name: {
							type: "string",
							example: "test",
						},
						email: {
							type: "string",
							format: "email",
						},
						password: {
							type: "string",
							format: "password",
							minLength: 8,
							example: "test1234",
						},
					},
				},

				Error: {
					type: "object",
					properties: {
						message: {
							type: "string",
						},
					},
				},
			},
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "Access Token",
				},
			},
		},
	},

	apis: ["src/features/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
