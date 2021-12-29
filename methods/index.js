import _getRange from "./getRange.js";
import _getDisabledDays from "./getDisabledDays.js";
import _getTable from "./getTable.js";

export const getRange = async ({ ws, id }) => {
  let range;

  try {
    range = await _getRange();
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

export const getDisabledDays = async ({ ws, payload, id }) => {
  let disabledDays;

  try {
    disabledDays = await _getDisabledDays(payload);
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

export const getTable = async ({ ws, payload, id }) => {
  let rates;

  try {
    rates = await _getTable(payload);
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
