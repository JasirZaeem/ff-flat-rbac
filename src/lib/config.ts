import "dotenv/config";
import z from "zod";

const configSchema = z.object({
	HOST: z.string().default("0.0.0.0"),
	PORT: z.coerce.number().min(1).max(65535).default(3000),
	NODE_ENV: z.string().default("production"),
	DATABASE_URL: z.string().url(),
});

export const REDACTED_CONFIG_KEYS = ["DATABASE_URL"] as const;

export type Config = z.infer<typeof configSchema>;

export const config = Object.freeze(configSchema.parse(process.env) as Config);
