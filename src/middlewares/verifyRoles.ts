import { Request, Response, NextFunction } from "express";
import { ROLES } from "../constants/roles";
import { JSONResponse } from "../utils/responseUtil";
import { internalServerErrror, unauthorized } from "../constants/response";
import { HttpStatusCode } from "axios";
import { HttpError } from "http-errors";
import { CustomRequest } from "../types/custom";

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!(req as CustomRequest).user) {
      return JSONResponse.printResponse(
        null,
        unauthorized,
        HttpStatusCode.Unauthorized,
        res,
      );
    }

    const { role } = (req as CustomRequest).user;

    if (!role || role != ROLES.SUPER_ADMIN.SLUG) {
      return JSONResponse.printResponse(
        null,
        unauthorized,
        HttpStatusCode.Unauthorized,
        res,
      );
    }

    next();
  } catch (error) {
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
