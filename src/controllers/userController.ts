import { Request, Response } from "express";
import { autoInjectable, container } from "tsyringe";
import { HttpError } from "http-errors";
import { JSONResponse } from "../utils/responseUtil";
import loggerUtil from "../utils/logger";
import { HttpStatusCode } from "axios";
import { v4 as uuidv4 } from "uuid";
import isLocalhost from "is-localhost-ip";
import { internalServerErrror, success } from "../constants/response";
import { UserService } from "../services/userService";

@autoInjectable()
export class UserController {
  static createUser = async (req: Request, res: Response): Promise<void> => {
    const traceId = uuidv4();
    const {
      firstName,
      lastName,
      email,
      gender,
      password,
      birthDate,
      phoneNumber,
      uuidRole,
    } = req.body;

    try {
      const createUserResp = await container.resolve(UserService).createUser(
        {
          firstName,
          lastName,
          email,
          gender,
          password,
          birthDate,
          phoneNumber,
          uuidRole,
        },
        req.ip,
      );
      JSONResponse.printResponse(
        createUserResp,
        success,
        HttpStatusCode.Ok,
        res,
        null,
      );
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

  static deleteUser = async (req: Request, res: Response): Promise<void> => {
    const traceId = uuidv4();

    try {
      const { uuid } = req.params;
      const deleteUser = await container.resolve(UserService).deleteUser(uuid);
      JSONResponse.printResponse(
        deleteUser,
        success,
        HttpStatusCode.Ok,
        res,
        null,
      );
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
