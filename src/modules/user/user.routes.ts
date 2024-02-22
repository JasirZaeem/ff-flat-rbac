import type { FastifyZodInstance } from "../../lib/server";
import {
	addRolesToUserController,
	createUserController,
	getUserController,
	getUserPermissionsController,
	getUserRolesController,
	getUsersController,
	removeRoleFromUserController,
	updateUserController,
} from "./user.controllers";
import {
	addRolesToUserBodySchema,
	addRolesToUserParamsSchema,
	createUserBodySchema,
	createUserParamsSchema,
	getUserParamsSchema,
	getUserPermissionsParamsSchema,
	getUserRolesParamsSchema,
	getUsersParamsSchema,
	removeRoleFromUserParamsSchema,
	updateUserBodySchema,
	updateUserParamsSchema,
} from "./user.schemas";

export function userRoutes(
	server: FastifyZodInstance,
	_opts: unknown,
	done: () => void,
) {
	server.route({
		method: "POST",
		url: "/",
		schema: {
			body: createUserBodySchema,
			params: createUserParamsSchema,
		},
		handler: createUserController,
	});

	server.route({
		method: "PATCH",
		url: "/:id",
		schema: {
			params: updateUserParamsSchema,
			body: updateUserBodySchema,
		},
		handler: updateUserController,
	});

	server.route({
		method: "GET",
		url: "/",
		schema: {
			params: getUsersParamsSchema,
		},
		handler: getUsersController,
	});

	server.route({
		method: "GET",
		url: "/:id",
		schema: {
			params: getUserParamsSchema,
		},
		handler: getUserController,
	});

	server.register(userRoleRoutes, { prefix: "/:userId/roles" });

	server.route({
		method: "GET",
		url: "/:userId/permissions",
		schema: {
			params: getUserPermissionsParamsSchema,
		},
		handler: getUserPermissionsController,
	});

	done();
}

function userRoleRoutes(
	server: FastifyZodInstance,
	_opts: unknown,
	done: () => void,
) {
	server.route({
		method: "POST",
		url: "/",
		schema: {
			body: addRolesToUserBodySchema,
			params: addRolesToUserParamsSchema,
		},
		handler: addRolesToUserController,
	});

	server.route({
		method: "DELETE",
		url: "/:roleId",
		schema: {
			params: removeRoleFromUserParamsSchema,
		},
		handler: removeRoleFromUserController,
	});

	server.route({
		method: "GET",
		url: "/",
		schema: {
			params: getUserRolesParamsSchema,
		},
		handler: getUserRolesController,
	});

	done();
}
