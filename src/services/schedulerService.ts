import { CronJob } from "cron";
import { DateTime } from "luxon";
import moment from "moment-timezone";
import { container, injectable } from "tsyringe";
import { GreetingService, TEvent } from "./greetingService";
import loggerUtil from "../utils/logger";

@injectable()
export class SchedulerService {
  constructor() {}

  async init() {
    try {
      const greetingService = container.resolve(GreetingService);
      const configuration = await greetingService.getConfig();
      if (!configuration || !configuration.schedule) {
        loggerUtil.error(
          "[SchedulerService.init] Configuration or schedule is missing.",
        );
        return;
      }

      const event: TEvent = "birthday";
      const frequency = configuration?.schedule[event]?.frequency;

      if (frequency == "yearly") {
        const timeDelivery = configuration?.schedule[event]?.time;
        if (timeDelivery) {
          const listTimeZone = moment.tz.names();
          listTimeZone.forEach((timezone) => {
            const cronExpression = this.getCronExpression(timeDelivery);
            new CronJob(
              cronExpression, // cronTime
              async () => {
                try {
                  await greetingService.init(event, timezone);
                } catch (error) {
                  loggerUtil.error(
                    `[SchedulerService.init] Error in greetingService.init for timezone ${timezone}: ${
                      error instanceof Error ? error.message : error
                    }`,
                  );
                }
              }, // onTick
              null, // onComplete
              true, // start
              timezone,
            );
          });
        }
      }
    } catch (error) {
      loggerUtil.error(
        `[SchedulerService.init] Error in initializing the scheduler service: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  private getCronExpression(time: string): string {
    const [hour, minute] = time.split(":").map(Number);

    return `${minute} ${hour} * * *`;
  }
}
