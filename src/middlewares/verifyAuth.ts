import { Request, Response, NextFunction } from "express";
import { JSONResponse } from "../utils/responseUtil";
import { HttpStatusCode } from "axios";
import { HttpError } from "http-errors";
import { internalServerErrror, unauthorized } from "../constants/response";
import { container } from "tsyringe";
import { AuthService } from "../services/authService";
import { CustomRequest } from "../types/custom";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!authHeader || !token) {
    return JSONResponse.printResponse(
      null,
      unauthorized,
      HttpStatusCode.Unauthorized,
      res,
    );
  }

  try {
    const verify = container.resolve(AuthService).verifyToken(token as string);
    if (!verify) {
      return JSONResponse.printResponse(
        null,
        unauthorized,
        HttpStatusCode.Unauthorized,
        res,
      );
    }

    (req as CustomRequest).user = verify;
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
