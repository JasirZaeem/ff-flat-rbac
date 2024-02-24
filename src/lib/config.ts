import "dotenv/config";
import { z } from "zod";
import { applicationIdSchema } from "../modules/application/application.schemas";
import type { ApplicationId } from "./db/types/public/Application";
import type { ServiceUserId } from "./db/types/public/ServiceUser";

const configSchema = z.object({
	HOST: z.string().default("0.0.0.0"),
	PORT: z.coerce.number().min(1).max(65535).default(3000),
	NODE_ENV: z.string().default("production"),
	DATABASE_URL: z.string().url(),
	MAXIMUM_DATABASE_CONNECTION_POOL_SIZE: z.coerce.number().min(1).default(10),
	APPLICATION_SERVICE_USER_ID: z
		.string()
		.uuid()
		.transform((value) => value as ServiceUserId),
	APPLICATION_SERVICE_USER_EMAIL: z.string().email().toLowerCase(),
	APPLICATION_SERVICE_USER_PASSWORD: z.string().min(8).max(255),
	APPLICATION_RBAC_APPLICATION_ID: applicationIdSchema,
});

export const REDACTED_CONFIG_KEYS = ["DATABASE_URL"] as const;

export type Config = z.infer<typeof configSchema>;

export const config = Object.freeze(configSchema.parse(process.env) as Config);
