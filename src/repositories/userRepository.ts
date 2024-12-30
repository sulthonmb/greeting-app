import { injectable, inject, registry } from "tsyringe";
import {
  UsersModel,
  UserAttributes,
  UserCreationAttributes,
} from "../database/models/users";
import * as DIToken from "../constants/dependencyToken";
import { RolesModel } from "../database/models/roles";

@injectable()
@registry([{ token: DIToken.UsersRepository, useClass: UsersRepository }])
export class UsersRepository {
  private usersModel: typeof UsersModel;
  private rolesModel: typeof RolesModel;

  constructor(
    @inject(DIToken.UsersModel) usersModel: typeof UsersModel,
    @inject(DIToken.RoleModel) rolesModel: typeof RolesModel,
  ) {
    this.usersModel = usersModel;
    this.rolesModel = rolesModel;
  }

  // Create a new user
  async create(userData: UserCreationAttributes): Promise<UsersModel> {
    try {
      const user = await this.usersModel.create(userData);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error creating user: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while creating user");
      }
    }
  }

  // Find a user by ID
  async findById(id: number): Promise<UsersModel | null> {
    try {
      const user = await this.usersModel.findByPk(id);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching user by ID: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching user by ID");
      }
    }
  }

  // Find a user by UUID
  async findByUuid(uuid: string): Promise<UsersModel | null> {
    try {
      const user = await this.usersModel.findOne({ where: { uuid } });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching user by UUID: ${error.message}`);
      } else {
        throw new Error(
          "An unknown error occurred while fetching user by UUID",
        );
      }
    }
  }

  // Find a user by Email
  async findByEmail(email: string): Promise<UsersModel | null> {
    try {
      const user = await this.usersModel.findOne({
        where: {
          email: email,
        },
        include: [
          {
            model: this.rolesModel,
            as: "Role",
          },
        ],
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching user by Email: ${error.message}`);
      } else {
        throw new Error(
          "An unknown error occurred while fetching user by Email",
        );
      }
    }
  }

  // Find users with a specific role
  async findByRole(uuid_role: string): Promise<UsersModel[]> {
    try {
      const users = await this.usersModel.findAll({ where: { uuid_role } });
      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching users by role: ${error.message}`);
      } else {
        throw new Error(
          "An unknown error occurred while fetching users by role",
        );
      }
    }
  }

  // Update user data
  async update(
    id: number,
    updatedData: Partial<UserAttributes>,
  ): Promise<UsersModel | null> {
    try {
      const user = await this.usersModel.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }
      await user.update(updatedData);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error updating user: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while updating user");
      }
    }
  }

  // Delete a user
  async deleteByUuid(uuid: string): Promise<boolean> {
    try {
      const user = await this.usersModel.findOne({
        where: {
          uuid,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      await user.destroy();
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error deleting user: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while deleting user");
      }
    }
  }

  // Find all users
  async findAll(): Promise<UsersModel[]> {
    try {
      const users = await this.usersModel.findAll();
      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching users: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching users");
      }
    }
  }
}
