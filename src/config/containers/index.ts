import "reflect-metadata";
import { container } from "tsyringe";
import { Database } from "../database";
import { RolesModel } from "../../database/models/roles";
import * as DIToken from "../../constants/dependencyToken";
import { UsersModel } from "../../database/models/users";
import { ConfigsModel } from "../../database/models/configs";
import { UserGreetingHistoryModel } from "../../database/models/userGreetingHistories";

// Initialize Database
const database = new Database();
container.register(DIToken.MainDatabase, { useValue: database });

// Register Sequelize connection
container.register(DIToken.MainConnection, {
  useFactory: () => database.connection,
});

// Register Models
container.register(DIToken.RoleModel, { useValue: RolesModel });
container.register(DIToken.UsersModel, { useValue: UsersModel });
container.register(DIToken.ConfigsModel, { useValue: ConfigsModel });
container.register(DIToken.UserGreetingHistoryModel, {
  useValue: UserGreetingHistoryModel,
});
