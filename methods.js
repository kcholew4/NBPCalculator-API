const { DateTime } = require("luxon");
const { validate } = require("jsonschema");
const _ = require("lodash");
const nbpApi = require("./nbpApi");

async function fetchTables(payload) {
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
    throw new Error("invalid payload");
  }

  const response = await nbpApi.getRates(payload.year, payload.month);

  if (!response) {
    throw new Error("api request returned an error");
  }

  return response;
}

exports.getRange = async ({ ws, id }) => {
  const { year, month } = DateTime.now();

  let apiResponse;

  try {
    apiResponse = await fetchTables({ year, month });
  } catch (error) {
    ws.send(`error: ${error.message}`);
  }

  //I trust that the tables order is always correct.
  ws.send(
    JSON.stringify({
      id,
      response: {
        min: "2002-01-02",
        max: apiResponse[apiResponse.length - 1].effectiveDate,
      },
    })
  );
};

exports.getDisabledDays = async ({ ws, payload, id }) => {
  let apiResponse;

  try {
    apiResponse = await fetchTables(payload);
  } catch (error) {
    ws.send(`error: ${error.message}`);
    return;
  }

  //Payload is already verified
  const start = DateTime.local(payload.year, payload.month);
  let allDays = [];

  for (let i = 0; i < start.daysInMonth; i++) {
    allDays.push(start.plus({ days: i }).toISODate());
  }

  let availableDays = [];

  for (const table of apiResponse) {
    availableDays.push(table.effectiveDate);
  }

  ws.send(
    JSON.stringify({
      id,
      response: _.without(allDays, ...availableDays),
    })
  );
};

exports.getRates = async ({ ws, payload, id }) => {
  let apiResponse;

  try {
    apiResponse = await fetchTables(payload);
  } catch (error) {
    ws.send(`error: ${error.message}`);
    return;
  }

  let tables = [];

  for (const table of apiResponse) {
    let rates = [];

    for (const currency of table.rates) {
      rates.push({
        code: currency.code,
        rate: currency.mid,
      });
    }

    tables.push({
      table: table.no,
      date: table.effectiveDate,
      rates,
    });
  }

  ws.send(
    JSON.stringify({
      id,
      response: {
        key: `${payload.year}/${payload.month}`,
        tables,
      },
    })
  );
};
