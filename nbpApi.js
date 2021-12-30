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

export const getRates = async (year, month) => {
  const now = DateTime.now();
  const inCurrentMonth =
    DateTime.local(year, month) >= DateTime.local(now.year, now.month);

  const key = `${year}/${month}`;

  if (inCurrentMonth) {
    //For tables in current month use cache
    if (apiCache.has(key)) {
      debug("response from cache");
      return apiCache.get(key);
    }
  } else {
    const query = await TableContainer.findOne({ key });

    if (query) {
      return query.tables;
    }
  }

  const range = getValidRange(year, month);

  try {
    const response = await instance.get(
      `/exchangerates/tables/A/${range.start}/${range.end}/`
    );

    if (inCurrentMonth) {
      apiCache.set(key, response.data);
    } else {
      const tableContainer = new TableContainer({
        key,
        tables: response.data,
      });

      await tableContainer.save();
    }

    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};
