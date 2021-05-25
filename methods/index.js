const getRange = require("./getRange");
const getDisabledDays = require("./getDisabledDays");
const getTable = require("./getTable");

exports.getRange = async ({ ws, id }) => {
  let range;

  try {
    range = await getRange();
  } catch (error) {
    ws.send(
      JSON.stringify({
        id,
        error: error.message,
      })
    );
    return;
  }

  ws.send(
    JSON.stringify({
      id,
      response: range,
    })
  );
};

exports.getDisabledDays = async ({ ws, payload, id }) => {
  let disabledDays;

  try {
    disabledDays = await getDisabledDays(payload);
  } catch (error) {
    ws.send(
      JSON.stringify({
        id,
        error: error.message,
      })
    );
    return;
  }

  ws.send(
    JSON.stringify({
      id,
      response: disabledDays,
    })
  );
};

exports.getTable = async ({ ws, payload, id }) => {
  let rates;

  try {
    rates = await getTable(payload);
  } catch (error) {
    ws.send(
      JSON.stringify({
        id,
        error: error.message,
      })
    );
    return;
  }

  ws.send(
    JSON.stringify({
      id,
      response: rates,
    })
  );
};
