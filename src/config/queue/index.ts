import amqp, { Connection, Channel } from "amqplib";
import env from "../env";
import loggerUtil from "../../utils/logger";
import { injectable } from "tsyringe";
import { randomUUID } from "node:crypto";

export interface ConsumerResponse {
  ack?: boolean;
}
type HandlerCallback = (
  traceId: string,
  msg: string,
  properties?: {
    topic: string;
    [key: string]: any;
  },
) => Promise<ConsumerResponse>;

@injectable()
export class RabbitMQConnection {
  private static _url: string;
  protected RabbitMQ_: Connection | null = null;
  protected publisherChannel!: Channel;
  protected consumerChannel!: Channel;
  static connection: Connection;

  constructor() {
    RabbitMQConnection._url = this._urlValue;
  }

  static set urlValue(url: string) {
    RabbitMQConnection._url = url;
  }

  private get _urlValue(): string {
    return `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASS}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`;
  }

  async getChannelPublisher(): Promise<Channel> {
    if (!this.publisherChannel) {
      throw new Error("RabbitMQ publisher channel is not initialized");
    }
    return this.publisherChannel;
  }

  async getChannelConsumer(): Promise<Channel> {
    if (!this.consumerChannel) {
      throw new Error("RabbitMQ consumer channel is not initialized");
    }
    return this.consumerChannel;
  }

  async connect() {
    try {
      this.RabbitMQ_ = await amqp.connect(RabbitMQConnection._url);

      this.publisherChannel = await this.RabbitMQ_.createChannel();
      this.consumerChannel = await this.RabbitMQ_.createChannel();

      RabbitMQConnection.connection = this.RabbitMQ_;

      this.publisherChannel.on("error", (error) => {
        loggerUtil.error("RabbitMQ Publisher Channel Error:", error);
      });
      this.consumerChannel.on("error", (error) => {
        loggerUtil.error("RabbitMQ Consumer Channel Error:", error);
      });

      this.consumerChannel.on("close", () => {
        loggerUtil.warn("RabbitMQ Consumer Channel Closed");
      });

      this.publisherChannel.on("close", () => {
        loggerUtil.warn("RabbitMQ Consumer Channel Closed");
      });

      loggerUtil.info("Connected to RabbitMQ");

      // Listen for the close event
      this.RabbitMQ_.on("close", () => {
        loggerUtil.info("RabbitMQ connection closed : reconnecting ...");
        amqp.connect(RabbitMQConnection._url).then((conn) => {
          this.RabbitMQ_ = conn;
          this.RabbitMQ_.on("close", () => {
            loggerUtil.info("Failed to reconnect to RabbitMQ exiting ...");
            process.exit(1);
          });
        });
      });
    } catch (error: any) {
      loggerUtil.error(`Failed to connect to RabbitMQ: ${error.message}`);
      throw error;
    }
  }

  async sendToQueue(
    queueName: string,
    message: Buffer,
    headers?: { [key: string]: any },
  ) {
    try {
      if (!this.publisherChannel) {
        throw new Error("RabbitMQ publisher channel is not initialized");
      }

      await this.publisherChannel.assertQueue(queueName, {
        durable: true,
        arguments: {
          "x-queue-type": "quorum",
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": `${queueName}.dlq`,
        },
      });

      this.publisherChannel.sendToQueue(queueName, message, {
        headers: headers,
        persistent: true,
      });
    } catch (error: any) {
      loggerUtil.error(
        `Failed to send message to queue "${queueName}": ${error.message}`,
      );
      throw error;
    }
  }

  async close() {
    if (!this.RabbitMQ_) {
      loggerUtil.warn("No connection detected.");
      return;
    }

    await this.RabbitMQ_.close();
  }

  async consume(
    queue: string,
    handleIncomingMessage: HandlerCallback,
    options?: { prefetch?: number; maxRetries?: number },
  ) {
    if (!this.consumerChannel) {
      throw new Error("RabbitMQ consumer channel is not initialized");
    }

    const dlqQueue = `${queue}.dlq`;
    if (options?.maxRetries) {
      await this.consumerChannel.assertQueue(dlqQueue, {
        durable: true,
        arguments: {
          "x-queue-type": "quorum",
        },
      });
    }

    await this.consumerChannel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-queue-type": "quorum",
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": dlqQueue,
      },
    });

    loggerUtil.info(`[RabbitMQ] [consume] Consuming queue: ${queue}...`);
    this.consumerChannel.prefetch(options?.prefetch || 1);
    this.consumerChannel.consume(
      queue,
      async (msg) => {
        {
          if (!msg) {
            return loggerUtil.error(
              `[RabbitMQ] [consume] Queue: ${queue}. Invalid incoming message`,
            );
          }

          const properties = {
            topic: msg.fields.routingKey,
            isRedelivered: msg.fields.redelivered,
            deliveryAttempt: msg.fields.deliveryTag,
            headers: msg.properties.headers,
          };
          const res = await handleIncomingMessage(
            randomUUID(),
            msg?.content?.toString(),
            properties,
          );
          if (!res.ack) {
            if (options?.maxRetries) {
              const maxRetries = options?.maxRetries || 3;
              const retryCount =
                (msg.properties.headers?.["x-retry-count"] ?? 0) + 1;

              if (retryCount > maxRetries) {
                loggerUtil.error(
                  `[RabbitMQ] [consume] Queue: ${queue}. Message moved to DLQ after ${retryCount} retries.`,
                );
                this.consumerChannel?.nack(msg, false, false); // Move to DLQ
              } else {
                this.consumerChannel?.nack(msg, false, false); // Requeue for retry
                this.consumerChannel?.sendToQueue(queue, msg.content, {
                  headers: {
                    ...msg.properties.headers,
                    "x-retry-count": retryCount,
                  },
                });
              }
            } else {
              this.consumerChannel?.nack(msg);
            }
            return;
          }

          this.consumerChannel?.ack(msg);
        }
      },
      {
        noAck: false,
      },
    );
  }
}
