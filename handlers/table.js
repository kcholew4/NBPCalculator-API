import Joi from "joi";
import Debug from "debug";

import nbpApiService from "../services/nbpApi.js";
import { getValidDateRange, returnDisabledDays } from "../utils/dateHelpers.js";

const debug = Debug("nbpcalculator:handlers");

const tableRange = async (payload, callback) => {
  try {
    const table = await nbpApiService.getLastTable("A");

    callback({
      ok: true,
      response: {
        min: "2002-01-02",
        max: table.effectiveDate,
      },
    });
  } catch (error) {
    debug(error.message);
    callback({ ok: false });
  }
};

const tableDisabledDays = async (payload, callback) => {
  const schema = Joi.object({
    year: Joi.number().integer().required(),
    month: Joi.number().integer().required(),
  });

  const { error } = schema.validate(payload);

  if (error) {
    debug(error);
    return callback({ ok: false, message: "invalid payload" });
  }

  const { start, end } = getValidDateRange(payload.year, payload.month);

  try {
    const tables = await nbpApiService.getTables("A", start, end);

    callback({ ok: true, response: returnDisabledDays(payload, tables) });
  } catch (error) {
    debug(error.message);
    callback({ ok: false });
  }
};

const tableGet = async (payload, callback) => {
  const schema = Joi.object({
    date: Joi.string().isoDate().required(),
  });

  const { error } = schema.validate(payload);

  if (error) {
    debug(error);
    return callback({ ok: false, message: "invalid payload" });
  }

  try {
    const table = await nbpApiService.getTable("A", payload.date);

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
    debug(error.message);
    callback({ ok: false });
  }
};

export default (io, socket) => {
  socket.on("table:range", tableRange);
  socket.on("table:disabled-days", tableDisabledDays);
  socket.on("table:get", tableGet);
};
