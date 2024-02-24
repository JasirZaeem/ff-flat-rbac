import { z } from "zod";
import type { RoleId } from "../../lib/db/types/public/Role";
import { applicationIdSchema } from "../application/application.schemas";
import { permissionIdSchema } from "../permission/permission.schemas";

export const roleIdSchema = z
	.string()
	.uuid()
	.transform((value) => value as RoleId);

export const roleNameSchema = z.string().min(3).max(255);

export const createRoleParamsSchema = z.object({
	applicationId: applicationIdSchema,
});

export type CreateRoleParams = z.infer<typeof createRoleParamsSchema>;

export const createRoleBodySchema = z
	.object({
		name: roleNameSchema,
		description: z.string().max(1000).optional(),
	})
	.strict();

export type CreateRoleBody = z.infer<typeof createRoleBodySchema>;

export const updateRoleBodySchema = createRoleBodySchema.refine((value) => {
	if (Object.keys(value).length === 0) {
		throw new Error("At least one field must be provided");
	}
	return true;
});

export type UpdateRoleBody = z.infer<typeof updateRoleBodySchema>;

export const updateRoleParamsSchema = z.object({
	applicationId: applicationIdSchema,
	id: roleIdSchema,
});

export type UpdateRoleParams = z.infer<typeof updateRoleParamsSchema>;

export const getRolesParamsSchema = z.object({
	applicationId: applicationIdSchema,
});

export type GetRolesParams = z.infer<typeof getRolesParamsSchema>;

export const getRoleParamsSchema = z.object({
	applicationId: applicationIdSchema,
	id: roleIdSchema,
});

export type GetRoleParams = z.infer<typeof getRoleParamsSchema>;

export const addPermissionsToRoleParamsSchema = z.object({
	applicationId: applicationIdSchema,
	roleId: roleIdSchema,
});

export type AddPermissionToRoleParams = z.infer<
	typeof addPermissionsToRoleParamsSchema
>;

export const addPermissionsToRoleBodySchema = z.object({
	permissionIds: z.array(permissionIdSchema),
});

export type AddPermissionsToRoleBody = z.infer<
	typeof addPermissionsToRoleBodySchema
>;

// Remove a permission from a role
export const removePermissionFromRoleParamsSchema = z.object({
	applicationId: applicationIdSchema,
	roleId: roleIdSchema,
	permissionId: permissionIdSchema,
});

export type RemovePermissionFromRoleParams = z.infer<
	typeof removePermissionFromRoleParamsSchema
>;

// Get all permissions for a role
export const getRolePermissionsParamsSchema = z.object({
	applicationId: applicationIdSchema,
	roleId: roleIdSchema,
});

export type GetRolePermissionsParams = z.infer<
	typeof getRolePermissionsParamsSchema
>;
