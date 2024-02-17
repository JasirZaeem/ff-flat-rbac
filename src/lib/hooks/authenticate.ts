import type { FastifyReply } from "fastify";
import { db } from "../db";
import type { SessionId } from "../db/types/public/Session";
import type { FastifyZodRequest } from "../server";
import { getCookieValue } from "../utils/cookie";

export async function authenticate(
	request: FastifyZodRequest,
	reply: FastifyReply,
) {
	const sessionId = getCookieValue(request.headers.cookie || "", "sessionId");

	if (!sessionId) {
		return reply.status(401).send({
			error: "Unauthorized",
		});
	}

	try {
		const user = await db
			.selectFrom("session")
			.innerJoin("service_user", "service_user.id", "session.service_user_id")
			.select("service_user.id")
			.where("session.id", "=", sessionId as SessionId)
			.where("session.expires_at", ">", new Date())
			.where("session.deleted_at", "is", null)
			.executeTakeFirst();

		if (!user) {
			return reply.status(401).send({
				error: "Unauthorized",
			});
		}

		request.user = {
			id: user.id,
		};
	} catch (e) {
		request.log.error(e);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}
}
