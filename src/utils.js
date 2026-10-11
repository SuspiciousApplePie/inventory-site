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

export { getSeason, transformShows };
