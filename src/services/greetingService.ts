import { format } from "date-fns";
import { ConfigRepository } from "../repositories/configRepository";
import { container, inject, injectable } from "tsyringe";
import * as DIToken from "../constants/dependencyToken";
import { CONFIGS } from "../constants/configs";
import { generateQuery, QueryConfig } from "../utils/helpers";
import { Database } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import { STATUS_DELIVERY_MESSAGES } from "../constants/status";
import { UserGreetingHistoryRepository } from "../repositories/userGreetingHistoryRepository";
import axios from "axios";
import loggerUtil from "../utils/logger";
import { ConsumerResponse, RabbitMQConnection } from "../config/queue";
import { TOPIC_NAME } from "../constants/queue";
import env from "../config/env";

interface User {
  firstName: string;
  lastName: string;
  birthDate: Date;
  email: string;
  city: string;
  country: string;
  timezone: string;
}

interface GreetingSystemConfig {
  messageTemplates: {
    birthday: string;
    anniversary: string;
  };
  schedule: {
    birthday?: RuleSchedule;
    anniversary?: RuleSchedule;
  };
  userSchema: {
    fields: {
      uuid: string;
      first_name: string;
      last_name: string;
      birth_date: Date;
      email: string;
      city: string;
      country: string;
      timezone: string;
    };
    requiredFields: string[];
  };
  settings: {
    skipWeekends: boolean;
  };
  delivery: {
    methods: string[];
    retryPolicy: {
      maxAttempts: number;
      intervalSeconds: number;
    };
  };
}

interface RuleSchedule {
  frequency: string;
  time: string;
  users: {
    select: string[];
    from: string;
    where?: {
      field: string;
      operator: string;
      value: string;
    }[];
    limit?: number;
  };
}

interface GreetingMessages {
  uuid: string;
  uuid_user: string;
  event: string;
  message: string;
  sent_via: TDeliveryMethod;
  sent_to: string;
  status: string;
  created_at: Date;
  updated_at: Date | null;
}

interface RetryPolicy {
  maxAttempts: number;
  intervalSeconds: number;
}

export type TEvent = "birthday" | "anniversary";
type TDeliveryMethod = "email" | "sms";

@injectable()
export class GreetingService {
  private configRepository: ConfigRepository;
  private sequelize: Database["connection"];
  private userGreetingHistoryRepository: UserGreetingHistoryRepository;

  constructor(
    @inject(DIToken.ConfigRepository) configRepository: ConfigRepository,
    @inject(DIToken.MainConnection) sequelize: Database["connection"],
    @inject(DIToken.UserGreetingHistoryRepository)
    userGreetingHistoryRepository: UserGreetingHistoryRepository,
  ) {
    this.configRepository = configRepository;
    this.sequelize = sequelize;
    this.userGreetingHistoryRepository = userGreetingHistoryRepository;
  }

  async init(event: TEvent, timezone: string): Promise<void> {
    try {
      const config = await this.getConfig();
      if (!config) {
        loggerUtil.warn(
          `[GreetingService.initSchedule] Configuration is null or undefined. Scheduling cannot proceed.`,
        );
        return;
      }

      loggerUtil.info(
        `[GreetingService.initSchedule] Configuration retrieved successfully. Starting event scheduling.`,
      );
      await this.scheduleEvent(event, config, timezone);
      loggerUtil.info(
        `[GreetingService.initSchedule] Event 'birthday' scheduled successfully.`,
      );
    } catch (error) {
      loggerUtil.error(
        `[GreetingService.initSchedule] Error occurred during initialization. Error: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
    }
  }

  async getConfig(): Promise<GreetingSystemConfig | null> {
    try {
      const config = await this.configRepository.find(
        CONFIGS.GREETING_SYSTEM.NAME,
      );
      if (!config) {
        loggerUtil.warn(
          `[GreetingService.getConfig] Configuration not found for key: ${CONFIGS.GREETING_SYSTEM.NAME}`,
        );
        return null;
      }

      const configuration: GreetingSystemConfig =
        config.configuration[CONFIGS.GREETING_SYSTEM.NAME];
      loggerUtil.info(
        `[GreetingService.getConfig] Successfully retrieved configuration for key: ${CONFIGS.GREETING_SYSTEM.NAME}`,
      );
      return configuration;
    } catch (error) {
      loggerUtil.error(
        `[GreetingService.getConfig] Failed to retrieve configuration. Error: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
      return null;
    }
  }

  private formatMessage(
    type: TEvent,
    user: User,
    messageTemplate: string,
  ): string {
    const { firstName, lastName } = user;
    if (type === "birthday") {
      return messageTemplate.replace(
        "{fullName}",
        lastName ? `${firstName} ${lastName}` : firstName,
      );
    } else if (type === "anniversary") {
      return messageTemplate.replace(
        "{fullName}",
        lastName ? `${firstName} ${lastName}` : firstName,
      );
    }
    return "";
  }

  private async scheduleEvent(
    eventType: TEvent,
    configuration: GreetingSystemConfig,
    timezone: string,
  ): Promise<boolean> {
    loggerUtil.info(
      `[GreetingService.scheduleEvent] Schedule greeting for ${eventType} with configuration ${JSON.stringify(
        configuration,
      )}`,
    );

    try {
      const rabbitMq = container.resolve(RabbitMQConnection);

      const messageTemplate = configuration.messageTemplates[eventType];
      const userSchema = configuration.userSchema.fields;
      const deliveryMethods = configuration.delivery.methods;
      const getUserConfig = configuration.schedule[eventType]?.users;

      if (timezone) {
        getUserConfig?.where?.push({
          field: "users.timezone",
          operator: "=",
          value: `'${timezone}'`,
        });
      }

      const sql = generateQuery(getUserConfig as QueryConfig);
      loggerUtil.info(`[GreetingService.scheduleEvent] Generated SQL: ${sql}`);

      const [users, _] = await this.sequelize.query(sql);
      if (!users || users.length === 0) {
        loggerUtil.warn(
          `[GreetingService.scheduleEvent] No users found for eventType: ${eventType} for timezone ${timezone}`,
        );
        return false;
      }

      const greetingMessages: GreetingMessages[] = [];
      for (const user of users as (typeof userSchema)[]) {
        const message = this.formatMessage(
          eventType,
          {
            firstName: user.first_name,
            lastName: user.last_name,
            birthDate: user.birth_date,
            city: user.city,
            country: user.city,
            email: user.email,
            timezone: user.timezone,
          },
          messageTemplate,
        );

        for (const deliveryMethod of deliveryMethods) {
          const dataMessage = {
            uuid: uuidv4(),
            uuid_user: user.uuid,
            event: eventType,
            message,
            sent_via: deliveryMethod as TDeliveryMethod,
            sent_to: user.email,
            status: STATUS_DELIVERY_MESSAGES.ON_GOING,
            created_at: new Date(),
            updated_at: null,
          };

          try {
            loggerUtil.info(
              `[GreetingService.scheduleEvent] Sending message to queue ${
                TOPIC_NAME.GREETING_MESSAGE
              }: ${JSON.stringify(dataMessage)}`,
            );
            await rabbitMq.sendToQueue(
              TOPIC_NAME.GREETING_MESSAGE,
              Buffer.from(JSON.stringify(dataMessage)),
            );
            greetingMessages.push(dataMessage);
          } catch (queueError) {
            loggerUtil.error(
              `[GreetingService.scheduleEvent] Failed to send message to queue: ${
                queueError instanceof Error
                  ? queueError.message
                  : JSON.stringify(queueError)
              }`,
            );
          }
        }
      }

      try {
        await this.userGreetingHistoryRepository.createBulk(greetingMessages);
        loggerUtil.info(
          `[GreetingService.scheduleEvent] Successfully saved greeting messages to database.`,
        );
        return true;
      } catch (dbError) {
        loggerUtil.error(
          `[GreetingService.scheduleEvent] Failed to save greeting messages to database: ${
            dbError instanceof Error ? dbError.message : JSON.stringify(dbError)
          }`,
        );
        return false;
      }
    } catch (error) {
      loggerUtil.error(
        `[GreetingService.scheduleEvent] Error occurred while scheduling event: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
      return false;
    }
  }

  async consumer(): Promise<void> {
    try {
      const rabbitMq = container.resolve(RabbitMQConnection);
      await rabbitMq.connect();
      loggerUtil.info(
        `[GreetingService.consumer] RabbitMQ connection established successfully.`,
      );

      const greetingService = container.resolve(GreetingService);
      const config = await greetingService.getConfig();
      if (!config) {
        loggerUtil.warn(
          `[GreetingService.consumer] Configuration is null or undefined. Consumer will not start.`,
        );
        return;
      }

      loggerUtil.info(
        `[GreetingService.consumer] Configuration retrieved successfully. Starting message consumption.`,
      );
      rabbitMq.consume(
        TOPIC_NAME.GREETING_MESSAGE,
        GreetingService.handleMessage,
        {
          prefetch: env.RABBITMQ_PREFETCH,
          maxRetries: config.delivery.retryPolicy.maxAttempts || 1,
        },
      );
      loggerUtil.info(
        `[GreetingService.consumer] RabbitMQ consumer started for topic: ${TOPIC_NAME.GREETING_MESSAGE}`,
      );
    } catch (error) {
      loggerUtil.error(
        `[GreetingService.consumer] Error occurred while setting up consumer. Error: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
    }
  }

  private static async handleMessage(
    traceId: string,
    message: string,
  ): Promise<ConsumerResponse> {
    try {
      const msg: GreetingMessages = JSON.parse(message);
      loggerUtil.info(
        `[GreetingService.handleMessage] TraceId: ${traceId} - Parsed message successfully: ${JSON.stringify(
          msg,
        )}`,
      );

      const greetingService = container.resolve(GreetingService);
      if (msg.sent_via == "email") {
        const sentEmail = await greetingService.sendEmail(msg);
        if (sentEmail) {
          await greetingService.userGreetingHistoryRepository.updateStatus(
            msg.uuid,
            STATUS_DELIVERY_MESSAGES.SUCCESS,
          );
          loggerUtil.info(
            `[GreetingService.handleMessage] TraceId: ${traceId} - Email sent successfully to ${msg.sent_to}`,
          );
        } else {
          await greetingService.userGreetingHistoryRepository.updateStatus(
            msg.uuid,
            STATUS_DELIVERY_MESSAGES.FAILED,
          );
          loggerUtil.error(
            `[GreetingService.handleMessage] TraceId: ${traceId} - Failed to send email to ${msg.sent_to}`,
          );
        }

        return { ack: sentEmail };
      }

      loggerUtil.info(
        `[GreetingService.handleMessage] TraceId: ${traceId} - Unsupported delivery method for message to ${msg.sent_to}. Marking as failed.`,
      );
      await greetingService.userGreetingHistoryRepository.updateStatus(
        msg.uuid,
        STATUS_DELIVERY_MESSAGES.FAILED,
      );
      return { ack: false };
    } catch (error) {
      if (error instanceof SyntaxError) {
        loggerUtil.error(
          `[GreetingService.handleMessage] TraceId: ${traceId} - Failed to parse message. Invalid JSON format: ${message}`,
        );
      } else {
        loggerUtil.error(
          `[GreetingService.handleMessage] TraceId: ${traceId} - Failed to handle message. Error: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
        );
      }
      return { ack: false };
    }
  }

  private async sendEmail(data: GreetingMessages): Promise<boolean> {
    loggerUtil.info(
      `[GreetingService.sendEmail] Sending email to ${data.sent_to}: ${data.message}`,
    );
    try {
      const response = await axios.post(
        `${env.BASE_URL_EMAIL_SERVICE}/send-email`,
        {
          email: data.sent_to,
          message: data.message,
        },
      );
      if (response.status >= 200 && response.status < 300) {
        loggerUtil.info(
          `[GreetingService.sendEmail] Successfully sent email to ${data.sent_to}: ${data.message}`,
        );
        return true;
      } else {
        loggerUtil.error(
          `[GreetingService.sendEmail] Unexpected response from email service: Status ${
            response.status
          }, Data: ${JSON.stringify(response.data)}`,
        );
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        loggerUtil.error(
          `[GreetingService.sendEmail] Failed to send email to ${
            data.sent_to
          }: ${data.message}. Axios Error: ${error.message}. Response: ${
            error.response ? JSON.stringify(error.response.data) : "No response"
          }`,
        );
      } else {
        loggerUtil.error(
          `[GreetingService.sendEmail] Failed to send email to ${
            data.sent_to
          }: ${data.message}. Unexpected Error: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
        );
      }

      return false;
    }
  }
}
