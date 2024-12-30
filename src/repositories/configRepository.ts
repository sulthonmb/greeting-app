import { injectable, inject, registry } from "tsyringe";
import * as DIToken from "../constants/dependencyToken";
import { ConfigsModel } from "../database/models/configs";

@injectable()
@registry([{ token: DIToken.ConfigRepository, useClass: ConfigRepository }])
export class ConfigRepository {
  private configModel: typeof ConfigsModel;

  constructor(@inject(DIToken.ConfigsModel) configModel: typeof ConfigsModel) {
    this.configModel = configModel;
  }

  async find(name: string): Promise<ConfigsModel | null> {
    try {
      const config = await this.configModel.findOne({
        where: {
          name,
        },
      });
      return config;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching config: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching config");
      }
    }
  }
}
