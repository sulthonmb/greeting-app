import { HttpStatusCode } from "axios";
import { HttpError } from "http-errors";
import { Request, Response } from "express";
import { container, injectable } from "tsyringe";
import { JSONResponse } from "../utils/responseUtil";
import { internalServerErrror, success } from "../constants/response";
import loggerUtil from "../utils/logger";
import { GreetingService } from "../services/greetingService";
import moment from "moment-timezone";

@injectable()
export class GreetingController {
  static send = async (req: Request, res: Response): Promise<void> => {
    try {
      let { event, timezone, isAllTimeZone } = req.body;

      if (!event) {
        event = "birthday";
      }

      if (!timezone) {
        timezone = "Asia/Jakarta";
      }

      if (isAllTimeZone) {
        const listTimeZone = moment.tz.names();
        listTimeZone.forEach(async (tz) => {
          await container.resolve(GreetingService).init(event, tz);
        });
      } else {
        await container.resolve(GreetingService).init(event, timezone);
      }

      JSONResponse.printResponse({}, success, HttpStatusCode.Ok, res, null);
    } catch (error) {
      loggerUtil.error(`Send greeting failed: ${JSON.stringify(error)}`);
      if (error instanceof HttpError) {
        JSONResponse.printResponse(
          null,
          error.name,
          error.statusCode,
          res,
          error.message,
        );
      } else {
        JSONResponse.printResponse(
          null,
          internalServerErrror,
          HttpStatusCode.InternalServerError,
          res,
          "An unknown error occurred",
        );
      }
    }
  };
}
