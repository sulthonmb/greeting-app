import express, { Router } from "express";
import { injectable } from "tsyringe";
import { AuthController } from "../controllers/authController";
import { loginValidationRules } from "../validations/authValidations";
import { validateRequest } from "../validations/generalValidations";

@injectable()
export class AuthRoutes {
  router: Router;

  constructor() {
    this.router = express.Router();
  }

  routes = () => {
    this.router.post(
      "/login",
      loginValidationRules(),
      validateRequest,
      AuthController.login,
    );

    return this.router;
  };
}
