import Fastify, {
	type FastifyBaseLogger,
	type FastifyInstance,
	type FastifyRequest,
	type RawReplyDefaultExpression,
	type RawRequestDefaultExpression,
	type RawServerDefault,
} from "fastify";
import {
	type ZodTypeProvider,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { authRoutes } from "../modules/auth/auth.routes";
import { healthRoutes } from "../modules/health/health.routes";
import { REDACTED_CONFIG_KEYS } from "./config";
import { Err, Ok, type PromisedResult } from "./utils/result";

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
	server.register(authRoutes, {
		prefix: "/api/v1/auth",
	});

	return server;
}

export type FastifyZodInstance = FastifyInstance<
	RawServerDefault,
	RawRequestDefaultExpression,
	RawReplyDefaultExpression,
	FastifyBaseLogger,
	ZodTypeProvider
>;

export type FastifyZodRequest<
	BodyType = never,
	QueryType = never,
> = FastifyRequest<{
	Body: BodyType;
	Querystring: QueryType;
}>;

export async function stopServer(server: FastifyInstance) {
	server.log.info("Shutting down server");
	await server.close();
	server.log.info("Server shut down");
}

export async function startServer(
	server: FastifyInstance,
	host: string,
	port: number,
): PromisedResult<FastifyInstance, Error> {
	try {
		await server.listen({
			host,
			port,
		});
	} catch (error) {
		return Err(error as Error);
	}

	const signals = ["SIGINT", "SIGTERM"] as const;

	for (const signal of signals) {
		process.once(signal, () => stopServer(server));
	}

	return Ok(server);
}
