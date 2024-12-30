import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { container, autoInjectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { HttpError } from "http-errors";
import { AuthService } from "../services/authService";
import { JSONResponse } from "../utils/responseUtil";
import loggerUtil from "../utils/logger";
import { internalServerErrror, success } from "../constants/response";

@autoInjectable()
export class AuthController {
  static login = async (req: Request, res: Response): Promise<void> => {
    const traceId = uuidv4();
    const { email, password } = req.body;

    try {
      const auth = await container
        .resolve(AuthService)
        .login({ email, password });
      JSONResponse.printResponse(auth, success, HttpStatusCode.Ok, res, null);
    } catch (error) {
      loggerUtil.error(`${traceId} Login failed: ${JSON.stringify(error)}`);
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
