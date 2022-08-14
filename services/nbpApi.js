import axios from "axios";
import Debug from "debug";

const debug = Debug("nbpcalculator:services:nbp");

const nbpApi = axios.create({
  baseURL: "http://api.nbp.pl/api/",
  headers: {
    Accept: "application/json",
  },
});

nbpApi.interceptors.request.use((config) => {
  debug(`requesting ${config.url}`);
  return config;
});

nbpApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 404) {
        return null;
      }

      debug(`got status code ${error.response.status} requesting ${error.config.url}`);
      return Promise.reject(error);
    }
  }
);

const getLastTable = async (table) => {
  const data = await nbpApi.get(`exchangerates/tables/${table}`);
  return data && data[0]; //In case of null
};

const getLastTables = async (table, topCount) => {
  return await nbpApi.get(`exchangerates/tables/${table}/last/${topCount}`);
};

const getTable = async (table, date) => {
  const data = await nbpApi.get(`exchangerates/tables/${table}/${date}`);
  return data && data[0];
};

const getTables = async (table, startDate, endDate) => {
  return await nbpApi.get(`exchangerates/tables/${table}/${startDate}/${endDate}`);
};

export default { getLastTable, getLastTables, getTable, getTables };
