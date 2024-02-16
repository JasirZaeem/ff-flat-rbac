require("dotenv").config();
const { makeKyselyHook } = require("kanel-kysely");
const outputPath = "./src/lib/db/types";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL not set");
}

/** @type {import("kanel").Config} */
module.exports = {
	connection: process.env.DATABASE_URL,
	schemas: ["public"],
	outputPath,
	resolveViews: true,
	preDeleteOutputFolder: true,
	enumStyle: "type",
	preRenderHooks: [makeKyselyHook()],
};
