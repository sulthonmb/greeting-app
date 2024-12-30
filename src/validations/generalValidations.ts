import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "axios";
import { validationResult } from "express-validator";
import { JSONResponse } from "../utils/responseUtil";
import { badRequest } from "../constants/response";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: { [key: string]: string }[] = [];
  errors.array().map((err) => {
    if (err.type == "field") {
      extractedErrors.push({ [err.path]: err.msg });
    }
  });

  JSONResponse.printResponse(
    null,
    badRequest,
    HttpStatusCode.BadRequest,
    res,
    extractedErrors,
  );
};
