import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { config } from "../config";
import type Database from "./types/Database";

const dialect = new PostgresDialect({
	pool: new Pool({
		connectionString: config.DATABASE_URL,
		max: config.MAXIMUM_DATABASE_CONNECTION_POOL_SIZE,
	}),
});

export const db = new Kysely<Database>({ dialect });
