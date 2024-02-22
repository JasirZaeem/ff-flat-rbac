import type { FastifyReply } from "fastify";
import type { DatabaseError } from "pg";
import type { FastifyZodRequest } from "../../lib/server";
import { ErrorCode } from "../../lib/utils/constants";
import type {
	AddRoleToUserParams,
	AddRolesToUserBody,
	CreateUserBody,
	CreateUserParams,
	GetUserParams,
	GetUserPermissionsParams,
	GetUserRolesParams,
	GetUsersParams,
	RemoveRoleFromUserParams,
	UpdateUserBody,
	UpdateUserParams,
} from "./user.schemas";
import {
	addRolesToUser,
	createUser,
	getUser,
	getUserPermissions,
	getUserRoles,
	getUsers,
	removeRoleFromUser,
	updateUser,
} from "./user.services";

export async function createUserController(
	request: FastifyZodRequest<CreateUserBody, CreateUserParams>,
	reply: FastifyReply,
) {
	const createdUserResult = await createUser(
		request.user.id,
		request.params.applicationId,
		request.body,
	);

	if (!createdUserResult.ok) {
		if ((createdUserResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "User with that name already exists",
			});
		}

		request.log.error(createdUserResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(201).send({
		id: createdUserResult.value.id,
	});
}

export async function updateUserController(
	request: FastifyZodRequest<UpdateUserBody, UpdateUserParams>,
	reply: FastifyReply,
) {
	const updatedUserResult = await updateUser(
		request.user.id,
		request.params.applicationId,
		request.params.id,
		request.body,
	);

	if (!updatedUserResult.ok) {
		if (updatedUserResult.error === ErrorCode.UserNotFound) {
			return reply.status(404).send({
				error: "User not found",
			});
		}

		if ((updatedUserResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "User with that name already exists",
			});
		}

		request.log.error(updatedUserResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(200).send({
		updatedAt: updatedUserResult.value.updatedAt,
	});
}

export async function getUsersController(
	request: FastifyZodRequest<unknown, GetUsersParams>,
	reply: FastifyReply,
) {
	const usersResult = await getUsers(
		request.user.id,
		request.params.applicationId,
	);

	if (!usersResult.ok) {
		request.log.error(usersResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(usersResult.value);
}

export async function getUserController(
	request: FastifyZodRequest<unknown, GetUserParams>,
	reply: FastifyReply,
) {
	const userResult = await getUser(
		request.user.id,
		request.params.applicationId,
		request.params.id,
	);

	if (!userResult.ok) {
		if (userResult.error === ErrorCode.UserNotFound) {
			return reply.status(404).send({
				error: "User not found",
			});
		}

		request.log.error(userResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(userResult.value);
}

export async function addRolesToUserController(
	request: FastifyZodRequest<AddRolesToUserBody, AddRoleToUserParams>,
	reply: FastifyReply,
) {
	const addedRoleResult = await addRolesToUser(
		request.user.id,
		request.params.applicationId,
		request.params.userId,
		request.body,
	);

	if (!addedRoleResult.ok) {
		if ((addedRoleResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "User already has that role",
			});
		}

		request.log.error(addedRoleResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(200).send(addedRoleResult.value);
}

export async function removeRoleFromUserController(
	request: FastifyZodRequest<unknown, RemoveRoleFromUserParams>,
	reply: FastifyReply,
) {
	const removedRoleResult = await removeRoleFromUser(
		request.user.id,
		request.params.applicationId,
		request.params.userId,
		request.params.roleId,
	);

	if (!removedRoleResult.ok) {
		if (removedRoleResult.error === ErrorCode.RoleNotFound) {
			return reply.status(404).send({
				error: "User role not found",
			});
		}

		request.log.error(removedRoleResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(200).send({
		updatedAt: removedRoleResult.value,
	});
}

export async function getUserRolesController(
	request: FastifyZodRequest<unknown, GetUserRolesParams>,
	reply: FastifyReply,
) {
	const userRolesResult = await getUserRoles(
		request.user.id,
		request.params.applicationId,
		request.params.userId,
	);

	if (!userRolesResult.ok) {
		request.log.error(userRolesResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(userRolesResult.value);
}

export async function getUserPermissionsController(
	request: FastifyZodRequest<unknown, GetUserPermissionsParams>,
	reply: FastifyReply,
) {
	const userPermissionsResult = await getUserPermissions(
		request.user.id,
		request.params.applicationId,
		request.params.userId,
	);

	if (!userPermissionsResult.ok) {
		request.log.error(userPermissionsResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(userPermissionsResult.value);
}
