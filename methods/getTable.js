import { DateTime } from "luxon";
import { validate } from "jsonschema";
import _ from "lodash";
import * as nbpApi from "../nbpApi.js";
import getRange from "./getRange.js";

async function getTable(payload) {
  const payloadSchema = { type: "string" };

  const { valid } = validate(payload, payloadSchema, { required: true });

  if (!valid) {
    throw new Error("cannot validate payload");
  }

  const date = DateTime.fromISO(payload);

  if (!date.isValid) {
    throw new Error("invalid date format");
  }

  const range = await getRange();

  if (
    date < DateTime.fromISO(range.min) ||
    date > DateTime.fromISO(range.max)
  ) {
    throw new Error("date out of range");
  }

  let apiResponse;

  try {
    apiResponse = await nbpApi.getRates(date.year, date.month);
  } catch (error) {
    throw new Error("api request returned an error");
  }

  const table = apiResponse.find((el) => el.effectiveDate === payload);

  if (!table) {
    throw new Error("cannot find table for this date");
  }

  const rates = table.rates.map((currency) => {
    return {
      code: currency.code,
      rate: currency.mid,
    };
  });

  return {
    table: table.no,
    date: table.effectiveDate,
    rates,
  };
}

export default getTable;
