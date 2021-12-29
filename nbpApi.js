import Debug from "debug";
import axios from "axios";
import { DateTime } from "luxon";
import NodeCache from "node-cache";

const debug = Debug("nbpcalculator:api");

const apiCache = new NodeCache();

const instance = axios.create({
  baseURL: "http://api.nbp.pl/api/",
  headers: {
    Accept: "application/json",
  },
});

function getValidRange(year, month) {
  const min = DateTime.fromISO("2002-01-02");
  const now = DateTime.now();

  let date = DateTime.local(year, month);
  let end = date.plus({ months: 1 }).minus({ days: 1 });

  if (date < min) {
    date = min;
  }

  if (end > now) {
    end = now;
  }

  return {
    start: date.toISODate(),
    end: end.toISODate(),
  };
}

export const getRates = async (year, month) => {
  const now = DateTime.now();

  const range = getValidRange(year, month);

  const cacheKey = `${year}/${month}`;
  const cacheTTL = year === now.year && month === now.month ? 3600 : 0;

  debug(`ttl: ${cacheTTL} | key: ${cacheKey}`);

  if (apiCache.has(cacheKey)) {
    debug("getting response from cache");
    return apiCache.get(cacheKey);
  } else {
    let response;

    try {
      response = await instance.get(
        `/exchangerates/tables/A/${range.start}/${range.end}/`
      );
    } catch (error) {
      debug(error.message);
      throw new Error(error.message);
    }

    apiCache.set(cacheKey, response.data, cacheTTL);

    return response.data;
  }
};
