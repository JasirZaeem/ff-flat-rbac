import { z } from "zod";
import type { UserId } from "../../lib/db/types/public/User";
import { applicationIdSchema } from "../application/application.schemas";
import { roleIdSchema } from "../role/role.schemas";

export const userIdSchema = z
	.string()
	.uuid()
	.transform((value) => value as UserId);

export const createUserParamsSchema = z.object({
	applicationId: applicationIdSchema,
});

export type CreateUserParams = z.infer<typeof createUserParamsSchema>;

export const createUserBodySchema = z
	.object({
		name: z.string().max(255),
	})
	.strict();

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const updateUserBodySchema = z
	.object({
		name: z.string().max(255),
	})
	.strict();

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const updateUserParamsSchema = z.object({
	applicationId: applicationIdSchema,
	id: userIdSchema,
});

export type UpdateUserParams = z.infer<typeof updateUserParamsSchema>;

export const getUsersParamsSchema = z.object({
	applicationId: applicationIdSchema,
});

export type GetUsersParams = z.infer<typeof getUsersParamsSchema>;

export const getUserParamsSchema = z.object({
	applicationId: applicationIdSchema,
	id: userIdSchema,
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;

export const addRolesToUserParamsSchema = z.object({
	applicationId: applicationIdSchema,
	userId: userIdSchema,
});

export type AddRoleToUserParams = z.infer<typeof addRolesToUserParamsSchema>;

export const addRolesToUserBodySchema = z.object({
	roleIds: z.array(roleIdSchema),
});

export type AddRolesToUserBody = z.infer<typeof addRolesToUserBodySchema>;

// Remove a role from a user
export const removeRoleFromUserParamsSchema = z.object({
	applicationId: applicationIdSchema,
	userId: userIdSchema,
	roleId: roleIdSchema,
});

export type RemoveRoleFromUserParams = z.infer<
	typeof removeRoleFromUserParamsSchema
>;

// Get all roles for a user
export const getUserRolesParamsSchema = z.object({
	applicationId: applicationIdSchema,
	userId: userIdSchema,
});

export type GetUserRolesParams = z.infer<typeof getUserRolesParamsSchema>;

// Get all permissions for a user
export const getUserPermissionsParamsSchema = z.object({
	applicationId: applicationIdSchema,
	userId: userIdSchema,
});

export type GetUserPermissionsParams = z.infer<
	typeof getUserPermissionsParamsSchema
>;
