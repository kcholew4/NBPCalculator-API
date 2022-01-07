import { DateTime } from "luxon";
import _ from "lodash";
import Joi from "joi";
import Debug from "debug";

const debug = Debug("nbpcalculator:handler");

import * as nbpApi from "./nbpApi.js";

function returnDisabledDays({ year, month }, tables) {
  const start = DateTime.local(year, month);
  let allDays = [];

  for (let i = 0; i < start.daysInMonth; i++) {
    const date = start.plus({ days: i });

    //If it's saturday or sunday, don't include
    if (date.weekday === 7 || date.weekday === 6) {
      continue;
    }

    allDays.push(date.toISODate());
  }

  const availableDays = tables.map((table) => table.effectiveDate);

  return _.without(allDays, ...availableDays);
}

export default (io, socket) => {
  socket.on("table:range", async (payload, callback) => {
    try {
      const response = await nbpApi.getLastTable();

      callback({
        ok: true,
        response: {
          min: "2002-01-02",
          max: response.effectiveDate,
        },
      });
    } catch (error) {
      callback({ ok: false });
    }
  });

  socket.on("table:disabled-days", async (payload, callback) => {
    const schema = Joi.object({
      year: Joi.number().integer().required(),
      month: Joi.number().integer().required(),
    });

    const { error } = schema.validate(payload);

    if (error) {
      return callback({ ok: false, message: "invalid payload" });
    }

    try {
      const response = await nbpApi.getTables(payload.year, payload.month);

      callback({ ok: true, response: returnDisabledDays(payload, response) });
    } catch (error) {
      callback({ ok: false });
    }
  });

  socket.on("table:get", async (payload, callback) => {
    const schema = Joi.object({
      date: Joi.string().isoDate().required(),
    });

    const { error } = schema.validate(payload);

    if (error) {
      return callback({ ok: false, message: "invalid payload" });
    }

    const date = DateTime.fromISO(payload.date);

    try {
      const response = await nbpApi.getTables(date.year, date.month);

      const table = response.find((el) => el.effectiveDate === payload.date);

      if (!table) {
        return callback({ ok: false, message: "table not found" });
      }

      const rates = table.rates.map((currency) => {
        return {
          code: currency.code,
          rate: currency.mid,
        };
      });

      callback({
        ok: true,
        response: {
          table: table.no,
          date: table.effectiveDate,
          rates,
        },
      });
    } catch (error) {
      callback({ ok: false });
    }
  });
};
