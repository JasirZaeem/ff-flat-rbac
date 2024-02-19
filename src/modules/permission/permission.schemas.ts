import { z } from "zod";
import type { PermissionId } from "../../lib/db/types/public/Permission";
import { applicationIdSchema } from "../application/application.schemas";

export const permissionIdSchema = z
	.string()
	.uuid()
	.transform((value) => value as PermissionId);

export const createPermissionParamsSchema = z.object({
	applicationId: applicationIdSchema,
});

export type CreatePermissionParams = z.infer<
	typeof createPermissionParamsSchema
>;

export const createPermissionBodySchema = z
	.object({
		name: z.string().max(255),
		description: z.string().max(1000).optional(),
	})
	.strict();

export type CreatePermissionBody = z.infer<typeof createPermissionBodySchema>;

export const updatePermissionBodySchema = z
	.object({
		name: z.string().max(255).optional(),
		description: z.string().max(1000).optional(),
	})
	.strict()
	.refine((value) => {
		if (Object.keys(value).length === 0) {
			throw new Error("At least one field must be provided");
		}
		return true;
	});

export type UpdatePermissionBody = z.infer<typeof updatePermissionBodySchema>;

export const updatePermissionParamsSchema = z.object({
	applicationId: applicationIdSchema,
	id: permissionIdSchema,
});

export type UpdatePermissionParams = z.infer<
	typeof updatePermissionParamsSchema
>;

export const getPermissionsParamsSchema = z.object({
	applicationId: applicationIdSchema,
});

export type GetPermissionsParams = z.infer<typeof getPermissionsParamsSchema>;

export const getPermissionParamsSchema = z.object({
	applicationId: applicationIdSchema,
	id: permissionIdSchema,
});

export type GetPermissionParams = z.infer<typeof getPermissionParamsSchema>;
