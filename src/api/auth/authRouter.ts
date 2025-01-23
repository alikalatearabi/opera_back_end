import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

import { createApiResponse, createApiResponses } from "@/api-docs/openAPIResponseBuilders";
import { validateBody, validateRequest } from "@/common/utils/httpHandlers";
import { z } from "zod";
import { authController } from "./authController";
import { LoginSchema, RegisterSchema, TokenSchema } from "./authModel";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("LoginSchema", LoginSchema);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: createApiResponse(TokenSchema, "Success"),
});

authRouter.post("/login", validateBody(LoginSchema), authController.login);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterSchema,
        },
      },
    },
  },
  responses: createApiResponses([
    { statusCode: 200, schema: z.object({}), description: "Success" },
    { statusCode: 409, schema: z.object({}), description: "Duplicate email" },
  ]),
});

authRouter.post("/register", validateBody(RegisterSchema), authController.register);
