import express, { Router } from "express";
import { injectable } from "tsyringe";
import { UserController } from "../controllers/userController";
import { verifyToken } from "../middlewares/verifyAuth";
import { verifyAdmin } from "../middlewares/verifyRoles";
import { usersValidationRules } from "../validations/userValidations";
import { validateRequest } from "../validations/generalValidations";

@injectable()
export class UserRoutes {
  router: Router;

  constructor() {
    this.router = express.Router();
  }

  routes = () => {
    this.router.post(
      "/users",
      verifyToken,
      verifyAdmin,
      usersValidationRules(),
      validateRequest,
      UserController.createUser,
    );
    this.router.delete(
      "/users/:uuid",
      verifyToken,
      verifyAdmin,
      UserController.deleteUser,
    );

    return this.router;
  };
}
