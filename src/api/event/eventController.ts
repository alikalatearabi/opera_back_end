import type { Request, RequestHandler, Response } from "express";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { logger } from "@/server";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();
class EventController {
  public sessionReceived: RequestHandler = async (req: Request, res: Response) => {
    logger.info(req.body, "Session event info");
    return handleServiceResponse(ServiceResponse.success("Received", {}), res);
  };
}

export const eventController = new EventController();
