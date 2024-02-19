import { FastifyPluginOptions } from "fastify";
import { authenticate } from "../../lib/hooks/authenticate";
import type { FastifyZodInstance } from "../../lib/server";
import { permissionRoutes } from "../permission/permission.routes";
import {
	createApplicationController,
	getApplicationController,
	getApplicationsController,
	updateApplicationController,
} from "./application.controllers";
import {
	createApplicationBodySchema,
	getApplicationParamsSchema,
	updateApplicationBodySchema,
	updateApplicationParamsSchema,
} from "./application.schemas";

export function applicationRoutes(
	server: FastifyZodInstance,
	_opts: FastifyPluginOptions,
	done: () => void,
) {
	server.addHook("onRequest", authenticate);

	server.route({
		method: "POST",
		url: "/",
		schema: {
			body: createApplicationBodySchema,
		},
		handler: createApplicationController,
	});

	server.route({
		method: "PATCH",
		url: "/:id",
		schema: {
			params: updateApplicationParamsSchema,
			body: updateApplicationBodySchema,
		},
		handler: updateApplicationController,
	});

	server.route({
		method: "GET",
		url: "/",
		handler: getApplicationsController,
	});

	server.route({
		method: "GET",
		url: "/:id",
		schema: {
			params: getApplicationParamsSchema,
		},
		handler: getApplicationController,
	});

	server.register(permissionRoutes, { prefix: "/:applicationId/permissions" });

	done();
}
