import express, { Router } from "express";
import { injectable } from "tsyringe";
import { verifyToken } from "../middlewares/verifyAuth";
import { verifyAdmin } from "../middlewares/verifyRoles";
import { GreetingController } from "../controllers/greetingController";

@injectable()
export class GreetingRoutes {
  router: Router;

  constructor() {
    this.router = express.Router();
  }

  routes = () => {
    this.router.post(
      "/send-greeting",
      verifyToken,
      verifyAdmin,
      GreetingController.send,
    );

    return this.router;
  };
}
