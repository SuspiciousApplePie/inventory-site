import { getMonth, getYear } from "date-fns";

function getSeason(date) {
  const month = getMonth(date);
  if (month === 11 || (month >= 0 && month <= 1))
    return `Winter ${getYear(date)}`;
  else if (month >= 2 && month <= 4) return `Spring ${getYear(date)}`;
  else if (month >= 5 && month <= 7) return `Summer ${getYear(date)}`;
  else return `Fall ${getYear(date)}`;
}

export default getSeason;
