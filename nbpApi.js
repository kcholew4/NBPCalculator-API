import Debug from "debug";
import axios from "axios";
import { DateTime } from "luxon";
import NodeCache from "node-cache";
import TableContainer from "./models/TableContainer.js";

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

export const getTables = async (year, month) => {
  const now = DateTime.now();
  const inCurrentMonth = DateTime.local(year, month) >= DateTime.local(now.year, now.month);

  const key = `${year}/${month}`;

  if (apiCache.has(key)) {
    debug("response from cache");
    return apiCache.get(key);
  }

  //For tables in current month use cache
  if (!inCurrentMonth) {
    const query = await TableContainer.findOne({ key }, { "tables._id": 0 });

    if (query) {
      debug("response from database");
      apiCache.set(key, query.tables.toObject(), 60 * 60 * 24);
      return query.tables.toObject();
    }
  }

  const range = getValidRange(year, month);

  try {
    debug("fetching response from api");
    const response = await instance.get(`/exchangerates/tables/A/${range.start}/${range.end}/`);

    if (!inCurrentMonth) {
      const tableContainer = new TableContainer({
        key,
        tables: response.data,
      });

      await tableContainer.save();
      apiCache.set(key, response.data, 60 * 60 * 24);
    } else {
      //Lower ttl for tables in current month
      apiCache.set(key, response.data, 1800);
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return [];
    }

    debug(error.message);
    throw new Error(error.message);
  }
};

export const getLastTable = async () => {
  if (apiCache.has("last")) {
    return apiCache.get("last");
  }

  try {
    const response = await instance.get("/exchangerates/tables/A/");

    apiCache.set("last", response.data[0], 1800);

    return response.data[0];
  } catch (error) {
    debug(error.message);
    throw new Error(error.message);
  }
};
