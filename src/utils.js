import { getMonth, getYear } from "date-fns";

function getSeason(date) {
  const month = getMonth(date);
  if (month === 11 || (month >= 0 && month <= 1))
    return `Winter ${getYear(date)}`;
  else if (month >= 2 && month <= 4) return `Spring ${getYear(date)}`;
  else if (month >= 5 && month <= 7) return `Summer ${getYear(date)}`;
  else return `Fall ${getYear(date)}`;
}

function transformShows(shows) {
  const showList = new Map();
  for (const show of shows) {
    if (!showList.has(show.anime_id)) {
      showList.set(show.anime_id, {
        animeId: show.anime_id,
        title: show.title,
        rating: show.rating,
        startDate: show.start_date,
        endDate: show.end_date,
        format: show.format,
        genres: new Set([show.genre]),
        studios: new Set([show.studio]),
      });
    } else {
      const showData = showList.get(show.anime_id);

      if (!showData.genres.has(show.genre)) {
        showData.genres.add(show.genre);
      }

      if (!showData.studios.has(show.studio)) {
        showData.studios.add(show.studio);
      }
    }
  }
  return showList;
}

const VALID_SORTS = new Map([
  ["default", "anime.anime_id"],
  ["title", "title"],
  ["rating", "rating"],
  ["date", "start_date"],
  ["format", "format"],
  ["genre", "sort_genre"],
  ["studio", "sort_studio"],
]);
function cleanSortType(sortType) {
  return VALID_SORTS.get(sortType) ?? VALID_SORTS.get("default");
}

const VALID_ORD = new Map([
  ["asc", "ASC"],
  ["desc", "DESC"],
]);
function cleanOrdType(ord) {
  return VALID_ORD.get(ord) ?? VALID_ORD.get("asc");
}

function calculateOffSet(rows, limit = 10) {
  return Math.ceil(rows / limit);
}

function cleanOffSet(offset, maxOffset) {
  if (!offset) return 1;
  else if (offset > maxOffset) return maxOffset;
  else if (offset < 1) return 1;
  else return offset;
}

export {
  getSeason,
  transformShows,
  calculateOffSet,
  cleanOffSet,
  cleanSortType,
  cleanOrdType,
};
