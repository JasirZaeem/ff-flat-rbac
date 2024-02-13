import { config } from "./lib/config";
import { buildServer, startServer } from "./lib/server";
import { match } from "./lib/utils/result";

const server = buildServer();
server.log.info(config, "Starting server with config");

startServer(server, config.HOST, config.PORT).then((result) =>
	match(result, {
		ok: (server) => server.log.info("Server started"),
		error: (error) => server.log.error(error, "Server failed to start"),
	}),
);
