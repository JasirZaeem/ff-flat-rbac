import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { healthResponseSchema } from "./health.schemas";

export function healthRoutes(
	server: FastifyInstance,
	_opts: FastifyPluginOptions,
	done: () => void,
) {
	server.route({
		method: "GET",
		url: "/health",
		schema: {
			response: {
				200: healthResponseSchema,
			},
		},
		handler: () => {
			return { status: "ok" };
		},
	});

	done();
}
