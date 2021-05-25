const { DateTime } = require("luxon");
const nbpApi = require("../nbpApi");

async function getRange() {
  const { year, month } = DateTime.now();

  let apiResponse;

  try {
    apiResponse = await nbpApi.getRates(year, month);
  } catch (error) {
    throw new Error(`api request returned an error`);
  }

  //I trust that the tables order is always correct.
  return {
    min: "2002-01-02",
    max: apiResponse[apiResponse.length - 1].effectiveDate,
  };
}

module.exports = getRange;