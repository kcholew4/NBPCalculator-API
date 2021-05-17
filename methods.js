const { DateTime } = require("luxon");
const { validate } = require("jsonschema");
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

exports.getRange = async (ws) => {
  const { year, month } = DateTime.now();

  let apiResponse;

  try {
    apiResponse = await fetchTables({ year, month });
  } catch (error) {
    ws.send(`error: ${error.message}`);
  }

  const start = "2002-01-02";
  //I trust that the tables order is always correct.
  const end = apiResponse[apiResponse.length - 1].effectiveDate;

  ws.send(
    JSON.stringify({
      start,
      end,
    })
  );
};

exports.getAvailableDays = async (ws, payload) => {
  let apiResponse;

  try {
    apiResponse = await fetchTables(payload);
  } catch (error) {
    ws.send(`error: ${error.message}`);
    return;
  }

  let days = [];

  for (const table of apiResponse) {
    const { day } = DateTime.fromISO(table.effectiveDate);
    days.push(day);
  }

  ws.send(JSON.stringify(days));
};

exports.getRates = async (ws, payload) => {
  let apiResponse;

  try {
    apiResponse = await fetchTables(payload);
  } catch (error) {
    ws.send(`error: ${error.message}`);
    return;
  }

  let res = [];

  for (const table of apiResponse) {
    let rates = [];

    for (const currency of table.rates) {
      rates.push({
        code: currency.code,
        rate: currency.mid,
      });
    }

    res.push({
      table: table.no,
      date: table.effectiveDate,
      rates,
    });
  }

  ws.send(JSON.stringify(res));
};
