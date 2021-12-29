import { DateTime } from "luxon";
import _ from "lodash";
import Joi from "joi";

import * as nbpApi from "./nbpApi.js";

function returnDisabledDays({ year, month }, tables) {
  const start = DateTime.local(year, month);
  let allDays = [];

  for (let i = 0; i < start.daysInMonth; i++) {
    allDays.push(start.plus({ days: i }).toISODate());
  }

  const availableDays = tables.map((table) => table.effectiveDate);

  return _.without(allDays, ...availableDays);
}

export default (io, socket) => {
  socket.on("table:range", async (payload, callback) => {
    const { year, month } = DateTime.now();

    try {
      const response = await nbpApi.getRates(year, month);

      callback({
        ok: true,
        response: {
          min: "2002-01-02",
          max: response[response.length - 1].effectiveDate,
        },
      });
    } catch (error) {
      callback({ ok: false });
    }
  });

  socket.on("table:disabled-days", async (payload, callback) => {
    const schema = Joi.object({
      year: Joi.number().integer(),
      month: Joi.number().integer(),
    });

    const { error } = schema.validate(payload);

    if (error) {
      return callback({ ok: false, message: "invalid payload" });
    }

    try {
      const response = await nbpApi.getRates(payload.year, payload.month);

      callback({ ok: true, response: returnDisabledDays(payload, response) });
    } catch (error) {
      callback({ ok: false });
    }
  });

  socket.on("table:get", async (payload, callback) => {
    const schema = Joi.object({
      date: Joi.string().isoDate(),
    });

    const { error } = schema.validate(payload);

    if (error) {
      return callback({ ok: false, message: "invalid payload" });
    }

    const date = DateTime.fromISO(payload.date);

    try {
      const response = await nbpApi.getRates(date.year, date.month);

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
