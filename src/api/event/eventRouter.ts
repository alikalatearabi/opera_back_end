import express, { type Router } from "express";

import { ExtendedOpenAPIRegistry } from "@/api-docs/openAPIRegistryBuilders";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import expressBasicAuth from "express-basic-auth";
import { z } from "zod";
import { eventController } from "./eventController";

export const eventRegistry = new ExtendedOpenAPIRegistry();
export const eventRouter: Router = express.Router();

const { SESSION_EVENT_USERNAME, SESSION_EVENT_PASSWORD } = process.env;

eventRegistry.registerSecurePath({
  method: "post",
  path: "/api/event/sessionRecevied",
  tags: ["Event"],
  responses: createApiResponse(z.object({}), "Success"),
});

eventRouter.post(
  "/sessionRecevied",
  expressBasicAuth({
    users: SESSION_EVENT_USERNAME && SESSION_EVENT_PASSWORD ? { [SESSION_EVENT_USERNAME]: SESSION_EVENT_PASSWORD } : {},
    challenge: true,
  }),
  eventController.sessionReceived,
);
