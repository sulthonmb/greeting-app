import { inject, injectable } from "tsyringe";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import createHttpError, { HttpError } from "http-errors";
import * as DIToken from "../constants/dependencyToken";
import { UsersRepository } from "../repositories/userRepository";
import env from "../config/env";
import loggerUtil from "../utils/logger";
import {
  internalServerErrror,
  invalidEmailOrPassword,
} from "../constants/response";

@injectable()
export class AuthService {
  private usersRepository: UsersRepository;
  private saltRounds: number;
  private salt: string;

  constructor(
    @inject(DIToken.UsersRepository) usersRepository: UsersRepository,
  ) {
    this.usersRepository = usersRepository;
    this.saltRounds = env.ROUND_SALT;
    this.salt = bcrypt.genSaltSync(this.saltRounds);
  }

  hashPassword(password: string): string {
    return bcrypt.hashSync(password, this.salt);
  }

  comparePassword(hashedPassword: string, password: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  generateUserToken(email: string, uuid: string, role?: string): string {
    return jwt.sign({ uuid, email, role }, env.SECRET, { expiresIn: "3d" });
  }

  verifyToken(
    token: string,
  ): { uuid: string; email: string; role?: string } | null {
    try {
      const decoded = jwt.verify(token, env.SECRET) as {
        uuid: string;
        email: string;
        role?: string;
      };
      return {
        uuid: decoded.uuid,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      loggerUtil.error(`[AuthService.login] - ${JSON.stringify(error)}`);
      throw createHttpError[500](internalServerErrror);
    }
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<string> {
    try {
      const user = await this.usersRepository.findByEmail(email);
      if (!user) {
        loggerUtil.warn(
          `[AuthService.login] - Invalid email or password for ${JSON.stringify(
            email,
          )}`,
        );
        throw createHttpError[HttpStatusCode.Unauthorized](
          invalidEmailOrPassword,
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        loggerUtil.warn(
          `[AuthService.login] - Invalid email or password for ${JSON.stringify(
            email,
          )}`,
        );
        throw createHttpError[HttpStatusCode.Unauthorized](
          invalidEmailOrPassword,
        );
      }

      // Generate JWT token
      const token = this.generateUserToken(user.uuid, email, user.Role?.slug);

      return token;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      loggerUtil.error(`[AuthService.login] - ${JSON.stringify(error)}`);
      throw createHttpError[500](internalServerErrror);
    }
  }
}
