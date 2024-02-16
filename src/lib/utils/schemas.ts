import { z } from "zod";

export const errorMessageResponseSchema = z.object({
	error: z.string(),
});
export type ErrorMessageResponse = z.infer<typeof errorMessageResponseSchema>;
