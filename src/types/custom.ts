import { Request } from "express";

export type User = {
  uuid: string;
  email: string;
  role?: string;
};

export interface CustomRequest extends Request {
  user: User;
}
