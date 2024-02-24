import { createPermission } from "../../modules/permission/permission.services";
import {
	addPermissionsToRole,
	createRole,
} from "../../modules/role/role.services";
import { hashPassword } from "../auth/password";
import {
	APPLICATION_API_KEY_ROLE,
	APPLICATION_PERMISSION,
	hasPermission,
} from "../auth/permissions";
import { config } from "../config";
import { db } from "../db";
import { Err, OkVoid, mapResult } from "./result";

// TODO: Add more checks for required data

/**
 * Check database has required data
 */
export async function initDb() {
	// Check that service user for the application exists
	try {
		const serviceUser = await db
			.selectFrom("service_user")
			.where("id", "=", config.APPLICATION_SERVICE_USER_ID)
			.executeTakeFirst();

		if (!serviceUser) {
			const seedResult = await seedDb();
			if (!seedResult.ok) {
				return seedResult;
			}
		}

		return OkVoid();
	} catch (e) {
		return Err(e);
	}
}

async function seedDb() {
	try {
		await db
			.insertInto("service_user")
			.values({
				id: config.APPLICATION_SERVICE_USER_ID,
				email: config.APPLICATION_SERVICE_USER_EMAIL,
				password_hash: await hashPassword(
					config.APPLICATION_SERVICE_USER_PASSWORD,
				),
			})
			.executeTakeFirstOrThrow();

		await db
			.insertInto("application")
			.values({
				id: config.APPLICATION_RBAC_APPLICATION_ID,
				owner_service_user_id: config.APPLICATION_SERVICE_USER_ID,
				name: "client-api",
				description: "Access control for the client API",
			})
			.executeTakeFirstOrThrow();

		// Create permissions for the application
		const createPermissionPromises = Object.values(APPLICATION_PERMISSION).map(
			async (permission) =>
				mapResult(
					await createPermission(
						config.APPLICATION_SERVICE_USER_ID,
						config.APPLICATION_RBAC_APPLICATION_ID,
						{
							name: permission,
						},
					),
					(createdPermission) => ({
						...createdPermission,
						name: permission,
					}),
				),
		);

		// Create roles for the application
		const createRolePromises = Object.values(APPLICATION_API_KEY_ROLE).map(
			async (role) =>
				mapResult(
					await createRole(
						config.APPLICATION_SERVICE_USER_ID,
						config.APPLICATION_RBAC_APPLICATION_ID,
						{
							name: role,
						},
					),
					(createdRole) => ({
						...createdRole,
						name: role,
					}),
				),
		);

		const [permissionsResult, rolesResult] = await Promise.all([
			Promise.all(createPermissionPromises),
			Promise.all(createRolePromises),
		]);

		const permissions = permissionsResult.map((result) => {
			if (!result.ok) {
				throw result.error;
			}
			return result.value;
		});

		const roles = rolesResult.map((result) => {
			if (!result.ok) {
				throw result.error;
			}
			return result.value;
		});

		// Associate roles to permissions
		const associateRolePermissionPromises = roles.map(async (role) => {
			await addPermissionsToRole(
				config.APPLICATION_SERVICE_USER_ID,
				config.APPLICATION_RBAC_APPLICATION_ID,
				role.id,
				{
					permissionIds: permissions
						.filter((permission) => hasPermission(role.name, permission.name))
						.map((permission) => permission.id),
				},
			);
		});

		await Promise.all(associateRolePermissionPromises);

		return OkVoid();
	} catch (e) {
		return Err(e);
	}
}
