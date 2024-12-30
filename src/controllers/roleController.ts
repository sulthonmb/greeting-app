import { HttpStatusCode } from "axios";
import { HttpError } from "http-errors";
import { Request, Response } from "express";
import { container, injectable } from "tsyringe";
import { RoleService } from "../services/rolesService";
import { JSONResponse } from "../utils/responseUtil";
import { internalServerErrror, success } from "../constants/response";
import loggerUtil from "../utils/logger";

@injectable()
export class RoleController {
  static getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const roles = await container.resolve(RoleService).getAllRoles();
      JSONResponse.printResponse(roles, success, HttpStatusCode.Ok, res, null);
    } catch (error) {
      loggerUtil.error(`Get all roles failed: ${JSON.stringify(error)}`);
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
