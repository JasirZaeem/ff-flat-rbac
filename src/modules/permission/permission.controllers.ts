import type { FastifyReply } from "fastify";
import type { DatabaseError } from "pg";
import type { FastifyZodRequest } from "../../lib/server";
import { ErrorCode } from "../../lib/utils/constants";
import type {
	CreatePermissionBody,
	CreatePermissionParams,
	GetPermissionParams,
	GetPermissionsParams,
	UpdatePermissionBody,
	UpdatePermissionParams,
} from "./permission.schemas";
import {
	createPermission,
	getPermission,
	getPermissions,
	updatePermission,
} from "./permission.services";

export async function createPermissionController(
	request: FastifyZodRequest<CreatePermissionBody, CreatePermissionParams>,
	reply: FastifyReply,
) {
	const createdPermissionResult = await createPermission(
		request.user.id,
		request.params.applicationId,
		request.body,
	);

	if (!createdPermissionResult.ok) {
		if ((createdPermissionResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "Permission with that name already exists",
			});
		}

		request.log.error(createdPermissionResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(201).send({
		id: createdPermissionResult.value.id,
	});
}

export async function updatePermissionController(
	request: FastifyZodRequest<UpdatePermissionBody, UpdatePermissionParams>,
	reply: FastifyReply,
) {
	const updatedPermissionResult = await updatePermission(
		request.user.id,
		request.params.applicationId,
		request.params.id,
		request.body,
	);

	if (!updatedPermissionResult.ok) {
		if (updatedPermissionResult.error === ErrorCode.PermissionNotFound) {
			return reply.status(404).send({
				error: "Permission not found",
			});
		}

		if ((updatedPermissionResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "Permission with that name already exists",
			});
		}

		request.log.error(updatedPermissionResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(200).send({
		updatedAt: updatedPermissionResult.value.updatedAt,
	});
}

export async function getPermissionsController(
	request: FastifyZodRequest<unknown, GetPermissionsParams>,
	reply: FastifyReply,
) {
	const permissionsResult = await getPermissions(
		request.user.id,
		request.params.applicationId,
	);

	if (!permissionsResult.ok) {
		request.log.error(permissionsResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(permissionsResult.value);
}

export async function getPermissionController(
	request: FastifyZodRequest<unknown, GetPermissionParams>,
	reply: FastifyReply,
) {
	const permissionResult = await getPermission(
		request.user.id,
		request.params.applicationId,
		request.params.id,
	);

	if (!permissionResult.ok) {
		if (permissionResult.error === ErrorCode.PermissionNotFound) {
			return reply.status(404).send({
				error: "Permission not found",
			});
		}

		request.log.error(permissionResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(permissionResult.value);
}
