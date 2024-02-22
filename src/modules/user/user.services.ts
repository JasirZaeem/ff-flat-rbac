import { db } from "../../lib/db";
import type { ApplicationId } from "../../lib/db/types/public/Application";
import type { RoleId } from "../../lib/db/types/public/Role";
import type { ServiceUserId } from "../../lib/db/types/public/ServiceUser";
import type { UserId } from "../../lib/db/types/public/User";
import { ErrorCode } from "../../lib/utils/constants";
import { Err, Ok, OkVoid } from "../../lib/utils/result";
import { uuidv7 } from "../../lib/utils/uuidv7";
import type {
	AddRolesToUserBody,
	CreateUserBody,
	UpdateUserBody,
} from "./user.schemas";

export async function createUser(
	serviceUserId: ServiceUserId,
	applicationId: ApplicationId,
	data: CreateUserBody,
) {
	try {
		const createdUser = await db
			.insertInto("user")
			.values({
				id: uuidv7() as UserId,
				owner_service_user_id: serviceUserId,
				owner_application_id: applicationId,
				name: data.name,
			})
			.returning(["id", "created_at as createdAt"])
			.executeTakeFirstOrThrow();

		return Ok(createdUser);
	} catch (e) {
		return Err(e);
	}
}

export async function updateUser(
	serviceUserId: ServiceUserId,
	applicationId: ApplicationId,
	userId: UserId,
	data: UpdateUserBody,
) {
	try {
		const updatedUser = await db
			.updateTable("user")
			.set({
				name: data.name,
			})
			.where("id", "=", userId)
			.where("owner_service_user_id", "=", serviceUserId)
			.where("owner_application_id", "=", applicationId)
			.where("deleted_at", "is", null)
			.returning(["updated_at as updatedAt"])
			.executeTakeFirst();

		if (!updatedUser) {
			return Err(ErrorCode.UserNotFound);
		}

		return Ok(updatedUser);
	} catch (e) {
		return Err(e);
	}
}

export async function getUsers(
	serviceUserId: ServiceUserId,
	applicationId: ApplicationId,
) {
	try {
		const users = await db
			.selectFrom("user")
			.select([
				"id",
				"name",
				"created_at as createdAt",
				"updated_at as updatedAt",
			])
			.where("owner_service_user_id", "=", serviceUserId)
			.where("owner_application_id", "=", applicationId)
			.where("deleted_at", "is", null)
			.execute();

		return Ok(users);
	} catch (e) {
		return Err(e);
	}
}

export async function getUser(
	serviceUserId: ServiceUserId,
	applicationId: ApplicationId,
	userId: UserId,
) {
	try {
		const user = await db
			.selectFrom("user")
			.select([
				"id",
				"name",
				"created_at as createdAt",
				"updated_at as updatedAt",
			])
			.where("owner_service_user_id", "=", serviceUserId)
			.where("owner_application_id", "=", applicationId)
			.where("id", "=", userId)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		if (!user) {
			return Err(ErrorCode.UserNotFound);
		}

		return Ok(user);
	} catch (e) {
		return Err(e);
	}
}

export async function addRolesToUser(
	serviceUserId: ServiceUserId,
	applicationId: ApplicationId,
	userId: UserId,
	data: AddRolesToUserBody,
) {
	try {
		const result = await db
			.insertInto("user_role")
			.values(
				data.roleIds.map((roleId) => ({
					owner_service_user_id: serviceUserId,
					owner_application_id: applicationId,
					user_id: userId,
					role_id: roleId,
				})),
			)
			.returning(["role_id as roleId", "created_at as createdAt"])
			.execute();

		return Ok(result);
	} catch (e) {
		return Err(e);
	}
}

export async function removeRoleFromUser(
	serviceUserId: ServiceUserId,
	applicationId: ApplicationId,
	userId: UserId,
	roleId: RoleId,
) {
	try {
		const deleteResult = await db
			.deleteFrom("user_role")
			.where("owner_service_user_id", "=", serviceUserId)
			.where("owner_application_id", "=", applicationId)
			.where("user_id", "=", userId)
			.where("role_id", "=", roleId)
			.executeTakeFirst();

		if (deleteResult.numDeletedRows === 0n) {
			return Err(ErrorCode.RoleNotFound);
		}

		return OkVoid();
	} catch (e) {
		return Err(e);
	}
}

export async function getUserRoles(
	serviceUserId: ServiceUserId,
	applicationId: ApplicationId,
	userId: UserId,
) {
	try {
		const roles = await db
			.selectFrom("user_role")
			.innerJoin("role", "user_role.role_id", "role.id")
			.select([
				"role.id as id",
				"role.name as name",
				"user_role.created_at as createdAt",
			])
			.where("user_role.owner_service_user_id", "=", serviceUserId)
			.where("user_role.owner_application_id", "=", applicationId)
			.where("user_role.user_id", "=", userId)
			.execute();

		return Ok(roles);
	} catch (e) {
		return Err(e);
	}
}

export async function getUserPermissions(
	serviceUserId: ServiceUserId,
	applicationId: ApplicationId,
	userId: UserId,
) {
	try {
		const permissions = await db
			.selectFrom("user_role")
			.innerJoin(
				"role_permission",
				"user_role.role_id",
				"role_permission.role_id",
			)
			.innerJoin("permission", "role_permission.permission_id", "permission.id")
			.select([
				"permission.id as id",
				"permission.name as name",
				"user_role.created_at as createdAt",
			])
			.where("user_role.owner_service_user_id", "=", serviceUserId)
			.where("user_role.owner_application_id", "=", applicationId)
			.where("user_role.user_id", "=", userId)
			.execute();

		// Deduplicate permissions, since a user can have the same permission through multiple roles
		// Keep the permission with the earliest permissionGrantedAt
		const permissionsMap = new Map<string, (typeof permissions)[number]>();

		for (const permission of permissions) {
			const existingPermission = permissionsMap.get(permission.id);
			if (
				!existingPermission ||
				permission.createdAt < existingPermission.createdAt
			) {
				permissionsMap.set(permission.id, permission);
			}
		}

		return Ok(Array.from(permissionsMap.values()));
	} catch (e) {
		return Err(e);
	}
}
