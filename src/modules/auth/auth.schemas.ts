import { z } from "zod";

export const registerBodySchema = z
	.object({
		email: z.string().email().toLowerCase(),
		password: z.string().min(8).max(255),
	})
	.strict();

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const registerCreatedUserSchema = z
	.object({
		id: z.string().uuid(),
	})
	.strict();

export type RegisterCreatedUser = z.infer<typeof registerCreatedUserSchema>;

export const loginBodySchema = z
	.object({
		email: z.string().email().toLowerCase(),
		password: z.string().min(8).max(255),
	})
	.strict();

export type LoginBody = z.infer<typeof loginBodySchema>;
