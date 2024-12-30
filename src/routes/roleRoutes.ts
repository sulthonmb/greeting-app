import express, { Router } from "express";
import { injectable } from "tsyringe";
import { RoleController } from "../controllers/roleController";
import { verifyToken } from "../middlewares/verifyAuth";

@injectable()
export class RoleRoutes {
  router: Router;

  constructor() {
    this.router = express.Router();
  }

  routes = () => {
    this.router.get("/roles", verifyToken, RoleController.getAll);

    return this.router;
  };
}
