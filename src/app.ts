import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import logger from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import cluster from "node:cluster";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./config/swagger";
import loggerUtil from "./utils/logger";

import "./config/containers";
import { Database } from "./config/database";
import { container } from "tsyringe";
import { Routes } from "./routes";
import { RabbitMQConnection } from "./config/queue";
import { GreetingService } from "./services/greetingService";
import { SchedulerService } from "./services/schedulerService";

export class Application {
  express: express.Express;

  constructor() {
    this.express = express();
  }

  public run = async (): Promise<express.Express> => {
    this._appSetup();
    await this._dbSetup();
    await this._connectToRabbitMQ();
    await this._startRabbitMQConsumer();
    await this._schedulerSetup();
    this._routes(this.express);
    return this.express;
  };

  private _appSetup = (): void => {
    const specs = swaggerJsdoc(swaggerOptions);

    this.express.use(helmet());
    this.express.use(cookieParser());
    this.express.use(logger("dev"));
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(express.json({ limit: "150mb" }));
    this.express.use(
      cors({
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
        origin: "*",
      }),
    );

    if (process.env.NODE_ENV != "production") {
      this.express.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(specs, {
          explorer: true,
        }),
      );
    }
  };

  public _dbSetup = async (): Promise<void> => {
    try {
      // const db = new Database();
      const db = container.resolve(Database);
      // Establish connection and get models
      await db.connection.authenticate();
      // Sync database
      await db.connection.sync({ alter: true });

      loggerUtil.info("Database connected");

      if (db.connection) {
        loggerUtil.info("Connection to DB established");
      }
    } catch (error) {
      loggerUtil.error(`DB Setup Failed: ${JSON.stringify(error)}`);
      throw new Error("DB Setup Failed");
    }
  };

  private _connectToRabbitMQ = async (): Promise<void> => {
    const rabbitMq = container.resolve(RabbitMQConnection);

    try {
      const startTime = performance.now();
      await rabbitMq.connect();
      container.registerInstance(RabbitMQConnection, rabbitMq);
      loggerUtil.info(
        `RabbitMQ Connection Established in ${(
          performance.now() - startTime
        ).toFixed(2)}ms`,
      );
    } catch (error) {
      loggerUtil.error(`RabbitMQ Connection Failed: ${JSON.stringify(error)}`);
      await rabbitMq.close();
      process.exit(1);
    }
  };

  private _startRabbitMQConsumer = async (): Promise<void> => {
    try {
      const greetingService = container.resolve(GreetingService);

      await greetingService.consumer();
    } catch (error) {
      loggerUtil.error(
        `[_startRabbitMQConsumer] Failed listen consumer: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  };

  private _schedulerSetup = async (): Promise<void> => {
    try {
      const schedulerService = container.resolve(SchedulerService);
      await schedulerService.init();
      loggerUtil.info(`[_schedulerSetup] Scheduler initialize.`);
    } catch (error) {
      if (error instanceof Error) {
        loggerUtil.error(
          `[_schedulerSetup] Failed to set up scheduler: ${error.message}`,
          { stack: error.stack },
        );
      } else {
        loggerUtil.error(
          `[_schedulerSetup] Failed to set up scheduler: Unknown error type`,
          { error },
        );
      }
    }
  };

  private _routes = (app: express.Express): void => {
    new Routes(app);
  };
}

loggerUtil.info("Running server ... ");
if (cluster.isPrimary && process.env.ENABLE_CLUSTERING === "true") {
  for (let i = 0; i < (Number(process.env.OS_MAXIMUM_CORE_ALLOWED) || 0); i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    loggerUtil.info(
      `Cluster ${worker.process.pid} died with code: ${code}, and signal: ${signal}`,
    );
    loggerUtil.info("Starting a new cluster");
    cluster.fork();
  });

  cluster.on("online", (worker) => {
    loggerUtil.info(`Cluster ${worker.process.pid} is online`);
  });
} else {
  const app = new Application();
  app
    .run()
    .then((express: express.Application) => {
      const port = process.env.PORT;

      express.listen(port, () => {
        loggerUtil.info(`Server is running on port: ${port}`);
      });
    })
    .catch((error) => {
      loggerUtil.error(
        "Failed to run server with error: " + JSON.stringify(error),
      );
      process.exit(1);
    });
}

export default new Application().express;
