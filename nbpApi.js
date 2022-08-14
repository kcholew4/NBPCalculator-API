import Debug from "debug";
import axios from "axios";
import { DateTime } from "luxon";

const debug = Debug("nbpcalculator:api");

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
  const range = getValidRange(year, month);

  try {
    debug("fetching response from api");
    const response = await instance.get(`/exchangerates/tables/A/${range.start}/${range.end}/`);

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
  try {
    const response = await instance.get("/exchangerates/tables/A/");

    return response.data[0];
  } catch (error) {
    debug(error.message);
    throw new Error(error.message);
  }
};
