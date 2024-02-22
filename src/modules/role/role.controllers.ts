import type { FastifyReply } from "fastify";
import type { DatabaseError } from "pg";
import type { FastifyZodRequest } from "../../lib/server";
import { ErrorCode } from "../../lib/utils/constants";
import type {
	AddPermissionToRoleParams,
	AddPermissionsToRoleBody,
	CreateRoleBody,
	CreateRoleParams,
	GetRoleParams,
	GetRolePermissionsParams,
	GetRolesParams,
	RemovePermissionFromRoleParams,
	UpdateRoleBody,
	UpdateRoleParams,
} from "./role.schemas";
import {
	addPermissionsToRole,
	createRole,
	getRole,
	getRolePermissions,
	getRoles,
	removePermissionFromRole,
	updateRole,
} from "./role.services";

export async function createRoleController(
	request: FastifyZodRequest<CreateRoleBody, CreateRoleParams>,
	reply: FastifyReply,
) {
	const createdRoleResult = await createRole(
		request.user.id,
		request.params.applicationId,
		request.body,
	);

	if (!createdRoleResult.ok) {
		if ((createdRoleResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "Role with that name already exists",
			});
		}

		request.log.error(createdRoleResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(201).send({
		id: createdRoleResult.value.id,
	});
}

export async function updateRoleController(
	request: FastifyZodRequest<UpdateRoleBody, UpdateRoleParams>,
	reply: FastifyReply,
) {
	const updatedRoleResult = await updateRole(
		request.user.id,
		request.params.applicationId,
		request.params.id,
		request.body,
	);

	if (!updatedRoleResult.ok) {
		if (updatedRoleResult.error === ErrorCode.RoleNotFound) {
			return reply.status(404).send({
				error: "Role not found",
			});
		}

		if ((updatedRoleResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "Role with that name already exists",
			});
		}

		request.log.error(updatedRoleResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(200).send({
		updatedAt: updatedRoleResult.value.updatedAt,
	});
}

export async function getRolesController(
	request: FastifyZodRequest<unknown, GetRolesParams>,
	reply: FastifyReply,
) {
	const rolesResult = await getRoles(
		request.user.id,
		request.params.applicationId,
	);

	if (!rolesResult.ok) {
		request.log.error(rolesResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(rolesResult.value);
}

export async function getRoleController(
	request: FastifyZodRequest<unknown, GetRoleParams>,
	reply: FastifyReply,
) {
	const roleResult = await getRole(
		request.user.id,
		request.params.applicationId,
		request.params.id,
	);

	if (!roleResult.ok) {
		if (roleResult.error === ErrorCode.RoleNotFound) {
			return reply.status(404).send({
				error: "Role not found",
			});
		}

		request.log.error(roleResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(roleResult.value);
}

export async function addPermissionsToRoleController(
	request: FastifyZodRequest<
		AddPermissionsToRoleBody,
		AddPermissionToRoleParams
	>,
	reply: FastifyReply,
) {
	const addedPermissionResult = await addPermissionsToRole(
		request.user.id,
		request.params.applicationId,
		request.params.roleId,
		request.body,
	);

	if (!addedPermissionResult.ok) {
		if ((addedPermissionResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "Role already has that permission",
			});
		}

		request.log.error(addedPermissionResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(200).send(addedPermissionResult.value);
}

export async function removePermissionFromRoleController(
	request: FastifyZodRequest<unknown, RemovePermissionFromRoleParams>,
	reply: FastifyReply,
) {
	const removedPermissionResult = await removePermissionFromRole(
		request.user.id,
		request.params.applicationId,
		request.params.roleId,
		request.params.permissionId,
	);

	if (!removedPermissionResult.ok) {
		if (removedPermissionResult.error === ErrorCode.PermissionNotFound) {
			return reply.status(404).send({
				error: "Role permission not found",
			});
		}

		request.log.error(removedPermissionResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(200).send({
		updatedAt: removedPermissionResult.value,
	});
}

export async function getRolePermissionsController(
	request: FastifyZodRequest<unknown, GetRolePermissionsParams>,
	reply: FastifyReply,
) {
	const rolePermissionsResult = await getRolePermissions(
		request.user.id,
		request.params.applicationId,
		request.params.roleId,
	);

	if (!rolePermissionsResult.ok) {
		request.log.error(rolePermissionsResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(rolePermissionsResult.value);
}
