import { container, inject, injectable } from "tsyringe";
import { HttpStatusCode } from "axios";
import createHttpError, { HttpError } from "http-errors";
import { UsersRepository } from "../repositories/userRepository";
import * as DIToken from "../constants/dependencyToken";
import loggerUtil from "../utils/logger";
import {
  emailAlreadyRegister,
  internalServerErrror,
  roleIsNotFound,
  userIsNotFound,
} from "../constants/response";
import { GeolocationService } from "./geolocationService";
import { AuthService } from "./authService";
import { v4 as uuidv4 } from "uuid";
import { RoleRepository } from "../repositories/roleRepository";

interface IRequestCreateUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  phoneNumber: string;
  gender: string;
  uuidRole: string;
}

interface IResponseCreateUser {
  uuid: string;
  firstName: string;
  lastName?: string;
  email: string;
  timezone: string;
  birthDate: string;
  phoneNumber?: string;
  gender?: string;
  role?: string;
  createdAt: Date;
}

@injectable()
export class UserService {
  private usersRepository: UsersRepository;
  private roleRepository: RoleRepository;

  constructor(
    @inject(DIToken.UsersRepository) usersRepository: UsersRepository,
    @inject(DIToken.RoleRepository) roleRepository: RoleRepository,
  ) {
    this.usersRepository = usersRepository;
    this.roleRepository = roleRepository;
  }

  async createUser(
    req: IRequestCreateUser,
    ipReq?: string,
  ): Promise<IResponseCreateUser> {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        birthDate,
        phoneNumber,
        gender,
        uuidRole,
      } = req;

      const checkEmail = await this.usersRepository.findByEmail(email);
      if (checkEmail) {
        loggerUtil.warn(
          `[UserService.createUser] - Email ${email} already registerd`,
        );
        throw createHttpError[HttpStatusCode.Conflict](emailAlreadyRegister);
      }

      const checkRole = await this.roleRepository.findByUuid(uuidRole);
      if (!checkRole) {
        loggerUtil.warn(
          `[UserService.createUser] - Role ${uuidRole} is not found`,
        );
        throw createHttpError[HttpStatusCode.NotFound](roleIsNotFound);
      }

      const geolocation = await container
        .resolve(GeolocationService)
        .getGeolocationFromIP(ipReq);

      const user = await this.usersRepository.create({
        uuid: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        email,
        city: geolocation.city || "",
        country: geolocation.country || "",
        birth_date: birthDate,
        timezone: geolocation.timezone || "",
        phone_number: phoneNumber,
        gender,
        password: container.resolve(AuthService).hashPassword(password),
        uuid_role: uuidRole,
        created_at: new Date(),
      });

      const response: IResponseCreateUser = {
        uuid: user.uuid,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        birthDate: user.birth_date,
        timezone: user.timezone,
        phoneNumber: user.phone_number,
        gender: user.gender,
        role: user.Role?.name,
        createdAt: user.created_at,
      };

      return response;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      console.log("error", error);
      loggerUtil.error(`[UserService.createUser] - ${JSON.stringify(error)}`);
      throw createHttpError[500](internalServerErrror);
    }
  }

  async deleteUser(uuid: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.findByUuid(uuid);
      if (!user) {
        loggerUtil.warn(`[UserService.deleteUser] - User ${uuid} is not found`);
        throw createHttpError[HttpStatusCode.NotFound](userIsNotFound);
      }

      await this.usersRepository.deleteByUuid(uuid);
      return true;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      loggerUtil.error(`[UserService.deleteUser] - ${JSON.stringify(error)}`);
      throw createHttpError[500](internalServerErrror);
    }
  }
}
