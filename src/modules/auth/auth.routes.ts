import { FastifyPluginOptions } from "fastify";
import type { FastifyZodInstance } from "../../lib/server";
import { errorMessageResponseSchema } from "../../lib/utils/schemas";
import {
	loginController,
	meController,
	registerController,
} from "./auth.controllers";
import {
	loginBodySchema,
	registerBodySchema,
	registerCreatedUserSchema,
} from "./auth.schemas";

export function authRoutes(
	server: FastifyZodInstance,
	_opts: FastifyPluginOptions,
	done: () => void,
) {
	server.route({
		method: "POST",
		url: "/register",
		schema: {
			body: registerBodySchema,
			response: {
				201: registerCreatedUserSchema,
				409: errorMessageResponseSchema,
				500: errorMessageResponseSchema,
			},
		},
		handler: registerController,
	});

	server.route({
		method: "POST",
		url: "/login",
		schema: {
			body: loginBodySchema,
		},
		handler: loginController,
	});

	server.route({
		method: "GET",
		url: "/me",
		handler: meController,
	});

	done();
}
