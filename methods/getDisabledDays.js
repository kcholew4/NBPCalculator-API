import { DateTime } from "luxon";
import { validate } from "jsonschema";
import _ from "lodash";
import * as nbpApi from "../nbpApi.js";

function returnDisabledDays({ year, month }, tables) {
  const start = DateTime.local(year, month);
  let allDays = [];

  for (let i = 0; i < start.daysInMonth; i++) {
    allDays.push(start.plus({ days: i }).toISODate());
  }

  const availableDays = tables.map((table) => table.effectiveDate);

  return _.without(allDays, ...availableDays);
}

async function getDisabledDays(payload) {
  const payloadSchema = {
    type: "object",
    properties: {
      year: {
        type: "number",
      },
      month: {
        type: "number",
      },
    },
    required: ["year", "month"],
  };

  const { valid } = validate(payload, payloadSchema, { required: true });

  if (!valid) {
    throw new Error("cannot validate payload");
  }

  let apiResponse;

  try {
    apiResponse = await nbpApi.getRates(payload.year, payload.month);
  } catch (error) {
    throw new Error("api request returned an error");
  }

  //Payload is already verified, so it can be passed to the function
  return returnDisabledDays(payload, apiResponse);
}

export default getDisabledDays;
