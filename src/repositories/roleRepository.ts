import { injectable, inject, registry } from "tsyringe";
import { ROLES } from "../constants/roles";
import { RolesModel } from "../database/models/roles";
import * as DIToken from "../constants/dependencyToken";
import { Op } from "sequelize";

@injectable()
@registry([{ token: DIToken.RoleRepository, useClass: RoleRepository }])
export class RoleRepository {
  private roleModel: typeof RolesModel;

  constructor(@inject(DIToken.RoleModel) roleModel: typeof RolesModel) {
    this.roleModel = roleModel;
  }

  async findByUuid(uuid: string): Promise<RolesModel | null> {
    try {
      const user = await this.roleModel.findOne({ where: { uuid } });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching role by UUID: ${error.message}`);
      } else {
        throw new Error(
          "An unknown error occurred while fetching role by UUID",
        );
      }
    }
  }

  async findAllWithoutAdmin(): Promise<RolesModel[]> {
    try {
      return await this.roleModel.findAll({
        where: {
          slug: {
            [Op.notIn]: [ROLES.SUPER_ADMIN.SLUG],
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error fetching all roles without super admin: ${error.message}`,
        );
      } else {
        throw new Error(
          "An unknown error occurred while fetching all roles without super admin",
        );
      }
    }
  }
}
