import { type FastifyReply } from "fastify";
import { config } from "../../lib/config";
import type { SessionId } from "../../lib/db/types/public/Session";
import type { FastifyZodRequest } from "../../lib/server";
import { ErrorCode } from "../../lib/utils/constants";
import {
	CookieOptionSameSite,
	getCookieValue,
	serializeCookie,
} from "../../lib/utils/cookie";
import type { LoginBody, RegisterBody } from "./auth.schemas";
import {
	createServiceUser,
	createServiceUserSession,
	getLoggedInUser,
} from "./auth.services";

export async function registerController(
	request: FastifyZodRequest<RegisterBody>,
	reply: FastifyReply,
) {
	const registeredUserResult = await createServiceUser(request.body);

	if (!registeredUserResult.ok) {
		if (registeredUserResult.error === ErrorCode.EmailAlreadyInUse) {
			return reply.status(409).send({ error: "Email already in use" });
		}
		request.log.error(registeredUserResult.error);
		return reply.status(500).send({ error: "Internal server error" });
	}

	return reply.status(201).send({
		id: registeredUserResult.value.id,
	});
}

export async function loginController(
	request: FastifyZodRequest<LoginBody>,
	reply: FastifyReply,
) {
	const sessionResult = await createServiceUserSession(request.body);

	if (!sessionResult.ok) {
		if (sessionResult.error === ErrorCode.InvalidCredentials) {
			return reply.status(401).send({ error: "Invalid email or password" });
		}
		request.log.error(sessionResult.error);
		return reply.status(500).send({ error: "Internal server error" });
	}

	return reply
		.header(
			"set-cookie",
			serializeCookie("sessionId", sessionResult.value.session.id, {
				httpOnly: true,
				secure: config.NODE_ENV === "production",
				sameSite: CookieOptionSameSite.Strict,
				expires: sessionResult.value.session.expires_at,
				path: "/",
			}),
		)
		.send();
}

export async function meController(
	request: FastifyZodRequest,
	reply: FastifyReply,
) {
	request.log.info({ cookies: request.headers });
	const sessionId = getCookieValue(request.headers.cookie ?? "", "sessionId");
	if (!sessionId) {
		return reply.status(401).send({ error: "Not logged in" });
	}

	const user = await getLoggedInUser(sessionId as SessionId);

	if (!user.ok) {
		if (user.error === ErrorCode.NotLoggedIn) {
			return reply.status(401).send({ error: "Not logged in" });
		}
		request.log.error(user.error);
		return reply.status(500).send({ error: "Internal server error" });
	}

	return reply.send({ ...user.value });
}
