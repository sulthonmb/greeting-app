import { RoleRepository } from "../repositories/roleRepository";
import { inject, injectable } from "tsyringe";
import * as DIToken from "../constants/dependencyToken";
import { RolesModel } from "../database/models/roles";

@injectable()
export class RoleService {
  private rolesRepository: RoleRepository;

  constructor(@inject(DIToken.RoleRepository) rolesRepository: RoleRepository) {
    this.rolesRepository = rolesRepository;
  }

  async getAllRoles(): Promise<RolesModel[]> {
    return await this.rolesRepository.findAllWithoutAdmin();
  }
}
