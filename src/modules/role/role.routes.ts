import type { FastifyZodInstance } from "../../lib/server";
import {
	addPermissionsToRoleController,
	createRoleController,
	getRoleController,
	getRolePermissionsController,
	getRolesController,
	removePermissionFromRoleController,
	updateRoleController,
} from "./role.controllers";
import {
	addPermissionsToRoleBodySchema,
	addPermissionsToRoleParamsSchema,
	createRoleBodySchema,
	createRoleParamsSchema,
	getRolePermissionsParamsSchema,
	getRolesParamsSchema,
	removePermissionFromRoleParamsSchema,
	updateRoleBodySchema,
	updateRoleParamsSchema,
} from "./role.schemas";

export function roleRoutes(
	server: FastifyZodInstance,
	_opts: unknown,
	done: () => void,
) {
	server.route({
		method: "POST",
		url: "/",
		schema: {
			body: createRoleBodySchema,
			params: createRoleParamsSchema,
		},
		handler: createRoleController,
	});

	server.route({
		method: "PATCH",
		url: "/:id",
		schema: {
			params: updateRoleParamsSchema,
			body: updateRoleBodySchema,
		},
		handler: updateRoleController,
	});

	server.route({
		method: "GET",
		url: "/",
		schema: {
			params: getRolesParamsSchema,
		},
		handler: getRolesController,
	});

	server.route({
		method: "GET",
		url: "/:id",
		schema: {
			params: updateRoleParamsSchema,
		},
		handler: getRoleController,
	});

	// TODO: Add route to add permissions to a role
	// TODO: Add route to remove permissions from a role

	server.register(rolePermissionRoutes, { prefix: "/:roleId/permissions" });

	done();
}

function rolePermissionRoutes(
	server: FastifyZodInstance,
	_opts: unknown,
	done: () => void,
) {
	server.route({
		method: "POST",
		url: "/",
		schema: {
			body: addPermissionsToRoleBodySchema,
			params: addPermissionsToRoleParamsSchema,
		},
		handler: addPermissionsToRoleController,
	});

	server.route({
		method: "DELETE",
		url: "/:permissionId",
		schema: {
			params: removePermissionFromRoleParamsSchema,
		},
		handler: removePermissionFromRoleController,
	});

	server.route({
		method: "GET",
		url: "/",
		schema: {
			params: getRolePermissionsParamsSchema,
		},
		handler: getRolePermissionsController,
	});

	done();
}
