import { Dialect } from "sequelize";
import loggerUtil from "../../utils/logger";
import dotenv from "dotenv";

dotenv.config();

interface dotEnvValue {
  NODE_ENV?: string;
  APP_NAME?: string;
  APP_VERSION?: string;
  DB_DIALECT?: Dialect;
  DB_HOST?: string;
  DB_USER?: string;
  DB_PASS?: string;
  DB_PORT?: number;
  DB_NAME?: string;
  DB_POOL_MAX?: number;
  ROUND_SALT?: number;
  SECRET?: string;
  LOKI_HOST?: string;
  API_KEY_IPGEOLOCATION?: string;
  BASE_URL_IPGEOLOCATION?: string;
  BASE_URL_IPFY?: string;
  BASE_URL_EMAIL_SERVICE?: string;
  // REDIS_HOST?: string;
  // REDIS_USERNAME?: string;
  // REDIS_PASSWORD?: string;
  // REDIS_PORT?: string;
  // REDIS_TTL?: string;
  RABBITMQ_HOST?: string;
  RABBITMQ_PORT?: string;
  RABBITMQ_USER?: string;
  RABBITMQ_PASS?: string;
  RABBITMQ_PREFETCH?: number;
}

interface EnvValue extends Readonly<Required<dotEnvValue>> {}

interface iEnvConfiguration {
  sanitizedValue(dotEnv: dotEnvValue): EnvValue;
}

abstract class EnvConfiguration {
  abstract getEnvValue(): dotEnvValue;
}

class EnvFile extends EnvConfiguration implements iEnvConfiguration {
  constructor() {
    super();
  }

  getEnvValue = (): dotEnvValue => {
    const variables: dotEnvValue = {
      NODE_ENV: process.env.NODE_ENV,
      APP_NAME: process.env.APP_NAME,
      APP_VERSION: process.env.APP_VERSION,
      DB_DIALECT: String(process.env.DB_DIALECT) as Dialect,
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASS: process.env.DB_PASS,
      DB_PORT: Number(process.env.DB_PORT),
      DB_NAME: process.env.DB_NAME,
      DB_POOL_MAX: Number(process.env.DB_POOL_MAX),
      ROUND_SALT: Number(process.env.ROUND_SALT),
      SECRET: process.env.SECRET,
      LOKI_HOST: process.env.LOKI_HOST || "http://127.0.0.1:3100",
      API_KEY_IPGEOLOCATION: process.env.API_KEY_IPGEOLOCATION,
      BASE_URL_IPGEOLOCATION: process.env.BASE_URL_IPGEOLOCATION,
      BASE_URL_IPFY: process.env.BASE_URL_IPFY,
      BASE_URL_EMAIL_SERVICE: process.env.BASE_URL_EMAIL_SERVICE,
      // REDIS_HOST: process.env.REDIS_HOST,
      // REDIS_USERNAME: process.env.REDIS_USERNAME,
      // REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      // REDIS_PORT: process.env.REDIS_PORT,
      // REDIS_TTL: process.env.REDIS_TTL,
      RABBITMQ_HOST: process.env.RABBITMQ_HOST,
      RABBITMQ_PORT: process.env.RABBITMQ_PORT,
      RABBITMQ_USER: process.env.RABBITMQ_USER,
      RABBITMQ_PASS: process.env.RABBITMQ_PASS,
      RABBITMQ_PREFETCH: Number(process.env.RABBITMQ_PREFETCH),
    };

    return variables;
  };

  sanitizedValue = (dotEnv: dotEnvValue): EnvValue => {
    const missingKey: string[] = [];
    for (const [key, value] of Object.entries(dotEnv)) {
      if (value === undefined) {
        missingKey.push(key);
      }
    }

    if (missingKey.length > 0) {
      loggerUtil.error(`Missing key ${missingKey.join(", ")} in env.ts`);
      throw new Error(`Missing key ${missingKey.join(", ")} in env.ts`);
    }

    return dotEnv as EnvValue;
  };
}

const valueNonSanitized: dotEnvValue = new EnvFile().getEnvValue();
const env: EnvValue = new EnvFile().sanitizedValue(valueNonSanitized);
export default env;
