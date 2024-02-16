import type { DatabaseError } from "pg";
import { hashPassword, verifyPassword } from "../../lib/auth/password";
import { db } from "../../lib/db";
import type { ServiceUserId } from "../../lib/db/types/public/ServiceUser";
import type { SessionId } from "../../lib/db/types/public/Session";
import { ErrorCode } from "../../lib/utils/constants";
import { Err, Ok, type PromisedResult } from "../../lib/utils/result";
import { uuidv7 } from "../../lib/utils/uuidv7";
import type {
	LoginBody,
	RegisterBody,
	RegisterCreatedUser,
} from "./auth.schemas";

export async function createServiceUser(
	data: RegisterBody,
): PromisedResult<RegisterCreatedUser, ErrorCode.EmailAlreadyInUse | unknown> {
	try {
		const result = await db
			.insertInto("service_user")
			.values({
				id: uuidv7() as ServiceUserId,
				email: data.email,
				password_hash: await hashPassword(data.password),
			})
			.returning("id")
			.executeTakeFirstOrThrow();

		return Ok(result);
	} catch (error) {
		if ((error as DatabaseError)?.code === "23505") {
			return Err(ErrorCode.EmailAlreadyInUse);
		}
		return Err(error);
	}
}
type CreateServiceUserSessionResult = PromisedResult<
	{
		session: {
			id: SessionId;
			expires_at: Date;
		};
	},
	ErrorCode.InvalidCredentials | unknown
>;
export async function createServiceUserSession(
	data: LoginBody,
): CreateServiceUserSessionResult {
	try {
		const session = await db.transaction().execute(async (trx) => {
			const user = await trx
				.selectFrom("service_user")
				.select(["id", "password_hash"])
				.where("email", "=", data.email)
				.executeTakeFirst();

			const validPassword = await verifyPassword(
				data.password,
				user?.password_hash,
			);

			// First check is only for proper type narrowing
			if (!(user && validPassword)) {
				return;
			}

			const sessionId = uuidv7() as SessionId;
			return await trx
				.insertInto("session")
				.values({
					id: sessionId,
					service_user_id: user.id,
				})
				.returning(["id", "expires_at"])
				.executeTakeFirstOrThrow();
		});

		if (!session) {
			return Err(ErrorCode.InvalidCredentials);
		}

		return Ok({
			session,
		});
	} catch (error) {
		return Err(error);
	}
}

export async function getLoggedInUser(sessionId: SessionId): PromisedResult<
	{
		id: ServiceUserId;
		email: string;
	},
	ErrorCode.NotLoggedIn | unknown
> {
	try {
		const user = await db
			.selectFrom("session")
			.innerJoin("service_user", "service_user.id", "session.service_user_id")
			.select(["service_user.id", "service_user.email"])
			.where("session.id", "=", sessionId)
			.where("session.expires_at", ">", new Date())
			.where("session.deleted_at", "is", null)
			.executeTakeFirst();

		if (!user) {
			return Err(ErrorCode.NotLoggedIn);
		}

		return Ok(user);
	} catch (e) {
		return Err(e);
	}
}
