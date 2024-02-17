import type { FastifyReply } from "fastify";
import type { DatabaseError } from "pg";
import type { FastifyZodRequest } from "../../lib/server";
import { ErrorCode } from "../../lib/utils/constants";
import type {
	CreateApplicationBody,
	GetApplicationParams,
	UpdateApplicationBody,
	UpdateApplicationParams,
} from "./application.schemas";
import {
	createApplication,
	getApplication,
	getApplications,
	updateApplication,
} from "./application.services";

export async function createApplicationController(
	request: FastifyZodRequest<CreateApplicationBody>,
	reply: FastifyReply,
) {
	const createdApplicationResult = await createApplication(
		request.user.id,
		request.body,
	);

	if (!createdApplicationResult.ok) {
		if ((createdApplicationResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "Application with that name already exists",
			});
		}

		request.log.error(createdApplicationResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.status(201).send({
		id: createdApplicationResult.value.id,
	});
}

export async function updateApplicationController(
	request: FastifyZodRequest<UpdateApplicationBody, UpdateApplicationParams>,
	reply: FastifyReply,
) {
	const updatedApplicationResult = await updateApplication(
		request.user.id,
		request.params.id,
		request.body,
	);

	if (!updatedApplicationResult.ok) {
		if (updatedApplicationResult.error === ErrorCode.ApplicationNotFound) {
			return reply.status(404).send({
				error: "Application not found",
			});
		}

		if ((updatedApplicationResult.error as DatabaseError)?.code === "23505") {
			return reply.status(409).send({
				error: "Application with that name already exists",
			});
		}

		request.log.error(updatedApplicationResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(updatedApplicationResult.value);
}

export async function getApplicationsController(
	request: FastifyZodRequest,
	reply: FastifyReply,
) {
	const applicationsResult = await getApplications(request.user.id);

	if (!applicationsResult.ok) {
		request.log.error(applicationsResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(applicationsResult.value);
}

export async function getApplicationController(
	request: FastifyZodRequest<unknown, GetApplicationParams>,
	reply: FastifyReply,
) {
	const applicationsResult = await getApplication(
		request.user.id,
		request.params.id,
	);

	if (!applicationsResult.ok) {
		if (applicationsResult.error === ErrorCode.ApplicationNotFound) {
			return reply.status(404).send({
				error: "Application not found",
			});
		}

		request.log.error(applicationsResult.error);
		return reply.status(500).send({
			error: "Internal server error",
		});
	}

	return reply.send(applicationsResult.value);
}
