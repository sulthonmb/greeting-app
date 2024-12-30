import axios from "axios";
import { injectable } from "tsyringe";
import env from "../config/env";
import isLocalhost from "is-localhost-ip";
import { address } from "ip";
import loggerUtil from "../utils/logger";

interface IResponseGeolocationFromIP {
  timezone: string | null;
  city: string | null;
  country: string | null;
}

@injectable()
export class GeolocationService {
  constructor() {}

  async getGeolocationFromIP(Ip?: string): Promise<IResponseGeolocationFromIP> {
    if (!Ip) {
      Ip = await this.getPublicIp();
    }

    if (await isLocalhost(Ip)) {
      Ip = await this.getPublicIp();
    }

    const resp = await axios.get(
      `${env.BASE_URL_IPGEOLOCATION}/ipgeo?apiKey=${env.API_KEY_IPGEOLOCATION}&ip=${Ip}`,
    );

    return {
      timezone: resp.data?.time_zone?.name || null,
      city: resp.data?.city || null,
      country: resp.data?.country_name || null,
    };
  }

  async getPublicIp(): Promise<string> {
    try {
      const resp = (await axios.get(`${env.BASE_URL_IPFY}?format=json`)).data;
      return resp.ip;
    } catch (error) {
      loggerUtil.error(
        `[GeolocationService.getPublicIp] - ${JSON.stringify(error)}`,
      );
      return "114.10.41.13";
    }
  }
}
