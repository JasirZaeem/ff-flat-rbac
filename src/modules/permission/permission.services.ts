import { db } from "../../lib/db";
import type { ApplicationId } from "../../lib/db/types/public/Application";
import type { PermissionId } from "../../lib/db/types/public/Permission";
import type { ServiceUserId } from "../../lib/db/types/public/ServiceUser";
import { ErrorCode } from "../../lib/utils/constants";
import { Err, Ok } from "../../lib/utils/result";
import { uuidv7 } from "../../lib/utils/uuidv7";
import type {
	CreatePermissionBody,
	UpdatePermissionBody,
} from "./permission.schemas";

export async function createPermission(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	data: CreatePermissionBody,
) {
	try {
		const createdPermission = await db
			.insertInto("permission")
			.values({
				id: uuidv7() as PermissionId,
				owner_service_user_id: userId,
				owner_application_id: applicationId,
				name: data.name,
				description: data.description,
			})
			.returning(["id", "created_at as createdAt"])
			.executeTakeFirstOrThrow();

		return Ok(createdPermission);
	} catch (e) {
		return Err(e);
	}
}

export async function updatePermission(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	permissionId: PermissionId,
	data: UpdatePermissionBody,
) {
	try {
		const updatedPermission = await db
			.updateTable("permission")
			.set({
				name: data.name,
				description: data.description,
			})
			.where("id", "=", permissionId)
			.where("owner_service_user_id", "=", userId)
			.where("owner_application_id", "=", applicationId)
			.where("deleted_at", "is", null)
			.returning(["updated_at as updatedAt"])
			.executeTakeFirst();

		if (!updatedPermission) {
			return Err(ErrorCode.PermissionNotFound);
		}

		return Ok(updatedPermission);
	} catch (e) {
		return Err(e);
	}
}

export async function getPermissions(
	userId: ServiceUserId,
	applicationId: ApplicationId,
) {
	try {
		const permissions = await db
			.selectFrom("permission")
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

		return Ok(permissions);
	} catch (e) {
		return Err(e);
	}
}

export async function getPermission(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	permissionId: PermissionId,
) {
	try {
		const permission = await db
			.selectFrom("permission")
			.select([
				"id",
				"name",
				"description",
				"created_at as createdAt",
				"updated_at as updatedAt",
			])
			.where("owner_service_user_id", "=", userId)
			.where("owner_application_id", "=", applicationId)
			.where("id", "=", permissionId)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		if (!permission) {
			return Err(ErrorCode.PermissionNotFound);
		}

		return Ok(permission);
	} catch (e) {
		return Err(e);
	}
}
