import type { FastifyZodInstance } from "../../lib/server";
import {
	createPermissionController,
	getPermissionController,
	getPermissionsController,
	updatePermissionController,
} from "./permission.controllers";
import {
	createPermissionBodySchema,
	createPermissionParamsSchema,
	getPermissionsParamsSchema,
	updatePermissionBodySchema,
	updatePermissionParamsSchema,
} from "./permission.schemas";

export function permissionRoutes(
	server: FastifyZodInstance,
	_opts: unknown,
	done: () => void,
) {
	server.route({
		method: "POST",
		url: "/",
		schema: {
			body: createPermissionBodySchema,
			params: createPermissionParamsSchema,
		},
		handler: createPermissionController,
	});

	server.route({
		method: "PATCH",
		url: "/:id",
		schema: {
			params: updatePermissionParamsSchema,
			body: updatePermissionBodySchema,
		},
		handler: updatePermissionController,
	});

	server.route({
		method: "GET",
		url: "/",
		schema: {
			params: getPermissionsParamsSchema,
		},
		handler: getPermissionsController,
	});

	server.route({
		method: "GET",
		url: "/:id",
		schema: {
			params: updatePermissionParamsSchema,
		},
		handler: getPermissionController,
	});

	done();
}
