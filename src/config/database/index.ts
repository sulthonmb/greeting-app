import { injectable } from "tsyringe";
import env from "../env";
import { Model, ModelStatic, Sequelize } from "sequelize";

export interface ConnectedDb<T> {
  readonly connection: T;
}

@injectable()
export class Database implements ConnectedDb<Sequelize> {
  private static sequelize: Sequelize;

  constructor() {
    if (!Database.sequelize) {
      Database.sequelize = new Sequelize({
        dialect: "postgres",
        host: env.DB_HOST || "localhost",
        port: env.DB_PORT || 5432,
        username: env.DB_USER || "postgres",
        password: env.DB_PASS || "postgres",
        database: env.DB_NAME || "myapp",
        logging: env.NODE_ENV == "development" ? true : false,
        dialectOptions: {
          application_name: env.APP_NAME,
        },
      });
    }
  }

  public get connection(): Sequelize {
    return Database.sequelize;
  }

  public static getExistingConnection(): Sequelize {
    if (!Database.sequelize) {
      throw new Error("Database connection is not established yet.");
    }
    return Database.sequelize;
  }

  public getModel<T extends Model>(modelName: string): ModelStatic<T> {
    const model = Database.sequelize.models[modelName];
    if (!model) {
      throw new Error(`Model '${modelName}' not found.`);
    }

    return model as ModelStatic<T>;
  }
}
