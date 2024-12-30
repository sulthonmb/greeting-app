import { HttpStatusCode } from "axios";
import express from "express";

export class JSONResponse {
  static printResponse(
    data: any = {},
    statusMessage: string,
    statusCode: number = 200,
    res: express.Response,
    errorMessage?: string | null | object,
  ): void {
    const responseObj: any = {
      data: data,
      status: statusMessage,
    };

    if (errorMessage) {
      responseObj.error = errorMessage;
    }

    res.status(statusCode).json(responseObj);

    return;
  }
}

/**
 * Response object for general response purpose. Can used for success and error in anywhere code structure.
 */
export interface response<T> {
  status: string;
  code: number;
  data?: T;
  error?: string | null;
}

export default {
  /**
   * Generates a success response object with the provided data, code, and status.
   *
   * @param {any} data - The data to be included in the response. Default is empty object ({}).
   * @param {number} code - The success code. Default is 200 (HttpStatusCode.Ok).
   * @param {string} status - The status of the response. Default is 'Success'.
   * @return {response} The generated success response object.
   */
  success: <T>(
    data: T,
    code: number = HttpStatusCode.Ok,
    status: string = "Success",
  ): response<T> => {
    return {
      status: status,
      code: code,
      data: data,
      error: null,
    };
  },

  /**
   * Generates an error response object with the provided code, error message, and status.
   *
   * @param {number} code - The error code.
   * @param {string} error - The error message.
   * @param {string} status - The status of the response. Default is 'Failed'.
   * @return {response} The generated error response object.
   */
  error: (
    code: number,
    error: string,
    status: string = "Failed",
  ): response<undefined> => {
    return {
      status: status,
      code: code,
      data: undefined,
      error: error,
    };
  },
};
