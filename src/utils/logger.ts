import * as winston from "winston";
import LokiTransport from "winston-loki";
import env from "../config/env";

const loggingWinston = new LokiTransport({
    host: env.LOKI_HOST,
    labels: {
        app: env.APP_NAME,
    },
    json: true,
    basicAuth: 'USER_ID:GRAFANA_CLOUD_TOKEN',
    format: winston.format.json(),
    replaceTimestamp: true,
    onConnectionError: (err) => console.error(err),
})

const loggerUtil = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    // Add Cloud Logging
    loggingWinston,
  ],
});

export default loggerUtil;
