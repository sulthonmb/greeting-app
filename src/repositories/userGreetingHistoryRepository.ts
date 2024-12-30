import { injectable, inject, registry } from "tsyringe";
import {
  UserGreetingHistoryModel,
  UserGreetingHistoryCreationAttributes,
} from "../database/models/userGreetingHistories";
import * as DIToken from "../constants/dependencyToken";

@injectable()
@registry([
  {
    token: DIToken.UserGreetingHistoryRepository,
    useClass: UserGreetingHistoryRepository,
  },
])
export class UserGreetingHistoryRepository {
  private userGreetingHistoryModel: typeof UserGreetingHistoryModel;

  constructor(
    @inject(DIToken.UserGreetingHistoryModel)
    userGreetingHistoryModel: typeof UserGreetingHistoryModel,
  ) {
    this.userGreetingHistoryModel = userGreetingHistoryModel;
  }

  async createBulk(
    userGreetingHistoryData: UserGreetingHistoryCreationAttributes[],
  ): Promise<UserGreetingHistoryModel[]> {
    try {
      const data = await this.userGreetingHistoryModel.bulkCreate(
        userGreetingHistoryData,
      );
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error creating user greeting history: ${error.message}`,
        );
      } else {
        throw new Error(
          "An unknown error occurred while creating user greeting history",
        );
      }
    }
  }

  async updateStatus(
    uuid: string,
    status: string,
  ): Promise<UserGreetingHistoryModel | null> {
    try {
      const data = await this.userGreetingHistoryModel.findOne({
        where: {
          uuid,
        },
      });
      if (!data) {
        throw new Error("User greeting history not found");
      }
      await data.update({
        status,
      });
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error updating user greeting history: ${error.message}`,
        );
      } else {
        throw new Error(
          "An unknown error occurred while updating user greeting history",
        );
      }
    }
  }
}
