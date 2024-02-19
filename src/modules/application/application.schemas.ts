import { z } from "zod";
import type { ApplicationId } from "../../lib/db/types/public/Application";

export const applicationIdSchema = z
	.string()
	.uuid()
	.transform((value) => value as ApplicationId);

export const createApplicationBodySchema = z
	.object({
		name: z.string().max(255),
		description: z.string().max(1000).optional(),
	})
	.strict();

export type CreateApplicationBody = z.infer<typeof createApplicationBodySchema>;

export const updateApplicationBodySchema = z
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

export type UpdateApplicationBody = z.infer<typeof updateApplicationBodySchema>;

export const updateApplicationParamsSchema = z.object({
	id: applicationIdSchema,
});

export type UpdateApplicationParams = z.infer<
	typeof updateApplicationParamsSchema
>;

export const getApplicationParamsSchema = z.object({
	id: applicationIdSchema,
});

export type GetApplicationParams = z.infer<typeof getApplicationParamsSchema>;
