import { DateTime } from "luxon";
import _ from "lodash";

export const returnDisabledDays = ({ year, month }, tables) => {
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
};

export const getValidDateRange = (year, month) => {
  const min = DateTime.fromISO("2002-01-02");
  const now = DateTime.now();

  let date = DateTime.local(year, month);
  let end = date.plus({ months: 1 }).minus({ days: 1 });

  if (date < min) {
    date = min;
  }

  if (end > now) {
    end = now;
  }

  return {
    start: date.toISODate(),
    end: end.toISODate(),
  };
};
