import { db } from "../../lib/db";
import type { ApplicationId } from "../../lib/db/types/public/Application";
import type { PermissionId } from "../../lib/db/types/public/Permission";
import type { RoleId } from "../../lib/db/types/public/Role";
import type { ServiceUserId } from "../../lib/db/types/public/ServiceUser";
import { ErrorCode } from "../../lib/utils/constants";
import { Err, Ok, OkVoid } from "../../lib/utils/result";
import { uuidv7 } from "../../lib/utils/uuidv7";
import type {
	AddPermissionsToRoleBody,
	CreateRoleBody,
	UpdateRoleBody,
} from "./role.schemas";

export async function createRole(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	data: CreateRoleBody,
) {
	try {
		const createdRole = await db
			.insertInto("role")
			.values({
				id: uuidv7() as RoleId,
				owner_service_user_id: userId,
				owner_application_id: applicationId,
				name: data.name,
				description: data.description,
			})
			.returning(["id", "created_at as createdAt"])
			.executeTakeFirstOrThrow();

		return Ok(createdRole);
	} catch (e) {
		return Err(e);
	}
}

export async function updateRole(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	roleId: RoleId,
	data: UpdateRoleBody,
) {
	try {
		const updatedRole = await db
			.updateTable("role")
			.set({
				name: data.name,
				description: data.description,
			})
			.where("id", "=", roleId)
			.where("owner_service_user_id", "=", userId)
			.where("owner_application_id", "=", applicationId)
			.where("deleted_at", "is", null)
			.returning(["updated_at as updatedAt"])
			.executeTakeFirst();

		if (!updatedRole) {
			return Err(ErrorCode.RoleNotFound);
		}

		return Ok(updatedRole);
	} catch (e) {
		return Err(e);
	}
}

export async function getRoles(
	userId: ServiceUserId,
	applicationId: ApplicationId,
) {
	try {
		const roles = await db
			.selectFrom("role")
			.select([
				"id",
				"name",
				"description",
				"created_at as createdAt",
				"updated_at as updatedAt",
			])
			.where("owner_service_user_id", "=", userId)
			.where("owner_application_id", "=", applicationId)
			.where("deleted_at", "is", null)
			.execute();

		return Ok(roles);
	} catch (e) {
		return Err(e);
	}
}

export async function getRole(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	roleId: RoleId,
) {
	try {
		const role = await db
			.selectFrom("role")
			.select([
				"id",
				"name",
				"description",
				"created_at as createdAt",
				"updated_at as updatedAt",
			])
			.where("owner_service_user_id", "=", userId)
			.where("owner_application_id", "=", applicationId)
			.where("id", "=", roleId)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		if (!role) {
			return Err(ErrorCode.RoleNotFound);
		}

		return Ok(role);
	} catch (e) {
		return Err(e);
	}
}

export async function addPermissionsToRole(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	roleId: RoleId,
	data: AddPermissionsToRoleBody,
) {
	try {
		const result = await db
			.insertInto("role_permission")
			.values(
				data.permissionIds.map((permissionId) => ({
					owner_service_user_id: userId,
					owner_application_id: applicationId,
					role_id: roleId,
					permission_id: permissionId,
				})),
			)
			.returning(["permission_id as permissionId", "created_at as createdAt"])
			.execute();

		return Ok(result);
	} catch (e) {
		return Err(e);
	}
}

export async function removePermissionFromRole(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	roleId: RoleId,
	permissionId: PermissionId,
) {
	try {
		const deleteResult = await db
			.deleteFrom("role_permission")
			.where("owner_service_user_id", "=", userId)
			.where("owner_application_id", "=", applicationId)
			.where("role_id", "=", roleId)
			.where("permission_id", "=", permissionId)
			.executeTakeFirst();

		if (deleteResult.numDeletedRows === 0n) {
			return Err(ErrorCode.PermissionNotFound);
		}

		return OkVoid();
	} catch (e) {
		return Err(e);
	}
}

export async function getRolePermissions(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	roleId: RoleId,
) {
	try {
		const permissions = await db
			.selectFrom("role_permission")
			.select(["permission_id as permissionId", "created_at as createdAt"])
			.where("owner_service_user_id", "=", userId)
			.where("owner_application_id", "=", applicationId)
			.where("role_id", "=", roleId)
			.execute();

		return Ok(permissions);
	} catch (e) {
		return Err(e);
	}
}
