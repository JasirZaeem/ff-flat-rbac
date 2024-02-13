import Fastify, { FastifyInstance } from "fastify";
import {
	ZodTypeProvider,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { Err, Ok, PromisedResult } from "./utils/result";
import { REDACTED_CONFIG_KEYS } from "./config";
import { healthRoutes } from "../modules/health/health.routes";

export function buildServer() {
	const server = Fastify({
		logger: {
			level: "info",
			redact: [...REDACTED_CONFIG_KEYS],
		},
	});

	server.setValidatorCompiler(validatorCompiler);
	server.setSerializerCompiler(serializerCompiler);

	server.withTypeProvider<ZodTypeProvider>();

	// Register routes
	server.register(healthRoutes);

	return server;
}

export async function stopServer(server: FastifyInstance) {
	server.log.info("Shutting down server");
	await server.close();
	server.log.info("Server shut down");
}

export async function startServer(
	server: FastifyInstance,
	host: string,
	port: number,
): PromisedResult<FastifyInstance, unknown> {
	try {
		await server.listen({
			host,
			port,
		});
	} catch (error) {
		return Err(error);
	}

	const signals = ["SIGINT", "SIGTERM"] as const;

	for (const signal of signals) {
		process.once(signal, () => stopServer(server));
	}

	return Ok(server);
}
