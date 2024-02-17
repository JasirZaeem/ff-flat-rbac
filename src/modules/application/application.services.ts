import { db } from "../../lib/db";
import type { ApplicationId } from "../../lib/db/types/public/Application";
import type { ServiceUserId } from "../../lib/db/types/public/ServiceUser";
import { ErrorCode } from "../../lib/utils/constants";
import { Err, Ok } from "../../lib/utils/result";
import { uuidv7 } from "../../lib/utils/uuidv7";
import type {
	CreateApplicationBody,
	UpdateApplicationBody,
} from "./application.schemas";

export async function createApplication(
	userId: ServiceUserId,
	data: CreateApplicationBody,
) {
	try {
		const createdApplication = await db
			.insertInto("application")
			.values({
				id: uuidv7() as ApplicationId,
				owner_service_user_id: userId,
				name: data.name,
				description: data.description,
			})
			.returning(["id"])
			.executeTakeFirstOrThrow();

		return Ok(createdApplication);
	} catch (e) {
		return Err(e);
	}
}

export async function updateApplication(
	userId: ServiceUserId,
	applicationId: ApplicationId,
	data: UpdateApplicationBody,
) {
	try {
		const updatedApplication = await db
			.updateTable("application")
			.set({
				name: data.name,
				description: data.description,
			})
			.where("id", "=", applicationId)
			.where("owner_service_user_id", "=", userId)
			.where("deleted_at", "is", null)
			.returning(["updated_at as updatedAt"])
			.executeTakeFirst();

		if (!updatedApplication) {
			return Err(ErrorCode.ApplicationNotFound);
		}

		return Ok(updatedApplication);
	} catch (e) {
		return Err(e);
	}
}

export async function getApplications(userId: ServiceUserId) {
	try {
		const applications = await db
			.selectFrom("application")
			.select([
				"id",
				"name",
				"description",
				"created_at as createdAt",
				"updated_at as updatedAt",
			])
			.where("owner_service_user_id", "=", userId)
			.where("deleted_at", "is", null)
			.execute();

		return Ok(applications);
	} catch (e) {
		return Err(e);
	}
}

export async function getApplication(
	userId: ServiceUserId,
	applicationId: ApplicationId,
) {
	try {
		const application = await db
			.selectFrom("application")
			.select([
				"id",
				"name",
				"description",
				"created_at as createdAt",
				"updated_at as updatedAt",
			])
			.where("owner_service_user_id", "=", userId)
			.where("id", "=", applicationId)
			.where("deleted_at", "is", null)
			.executeTakeFirst();

		if (!application) {
			return Err(ErrorCode.ApplicationNotFound);
		}

		return Ok(application);
	} catch (e) {
		return Err(e);
	}
}
