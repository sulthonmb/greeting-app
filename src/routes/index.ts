import "reflect-metadata";
import express from "express";
import { container } from "tsyringe";
import { AuthRoutes } from "./authRoutes";
import { RoleRoutes } from "./roleRoutes";
import { UserRoutes } from "./userRoutes";
import { GreetingRoutes } from "./greetingRoutes";

export class Routes {
  constructor(app: express.Application) {
    app.get("/health", (_, res) => {
      res.json({ isAlive: true });
    });
    this._routes(app);
  }

  private _routes = (app: express.Application): void => {
    app.use("/v1", container.resolve(AuthRoutes).routes());
    app.use("/v1", container.resolve(RoleRoutes).routes());
    app.use("/v1", container.resolve(UserRoutes).routes());
    app.use("/v1", container.resolve(GreetingRoutes).routes());
  };
}
