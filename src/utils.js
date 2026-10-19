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
function calculateMaxPage(rows, limit = 10) {
  const ceil = Math.ceil(rows / limit);
  return ceil ? ceil : 1;
}

function cleanPageCount(page, totalPage) {
  const cleanPage = +page;
  if (!cleanPage) return 1;
  else if (cleanPage > totalPage) return totalPage;
  else if (cleanPage < 1) return 1;
  else return cleanPage;
}

function getURLs(
  totalPage,
  sort = "default",
  ord = "asc",
  search = null,
  currentPage = 1,
) {
  const pages = arrangeURLPageNumbers(currentPage, totalPage);
  const pageURLs = constructURL(pages, sort, ord, search, currentPage);
  return pageURLs;
}

function arrangeURLPageNumbers(currentPage, totalPage) {
  const start = currentPage - 1;
  const end = currentPage + 1;
  const pages = new Set([1, totalPage]);

  for (let curr = start; curr <= end; curr++) {
    if (curr <= 1) continue;
    else if (curr >= totalPage) continue;
    else pages.add(curr);
  }

  if (start - 1 === 2) pages.add(start - 1);
  if (totalPage - end === 2) pages.add(end + 1);

  return [...pages].sort((a, b) => a - b);
}

function constructURL(pages, sort, ord, search, currentPage) {
  const pageURLs = [];
  let prev = null;
  for (const pageNum of pages) {
    const pageURL = new URLSearchParams([
      ["sort", sort],
      ["ord", ord],
      ["search", search],
      ["page", pageNum],
    ]);
    if (prev) {
      if (pageNum - prev !== 1) {
        pageURLs.push(createURLObject("...", null, true));
        pageURLs.push(
          createURLObject(
            pageURL.toString(),
            pageURL.get("page"),
            false,
            pageNum === currentPage,
          ),
        );
      } else {
        pageURLs.push(
          createURLObject(
            pageURL.toString(),
            pageURL.get("page"),
            false,
            pageNum === currentPage,
          ),
        );
      }
    } else {
      pageURLs.push(
        createURLObject(
          pageURL.toString(),
          pageURL.get("page"),
          false,
          pageNum === currentPage,
        ),
      );
    }
    prev = pageNum;
  }

  return [
    createURLObject(
      new URLSearchParams([
        ["sort", sort],
        ["ord", ord],
        ["search", search],
        ["page", currentPage - 1],
      ]),
      "Prev",
    ),
    ...pageURLs,
    createURLObject(
      new URLSearchParams([
        ["sort", sort],
        ["ord", ord],
        ["search", search],
        ["page", currentPage + 1],
      ]),
      "Next",
    ),
  ];
}

function createURLObject(url, text, isEllipsis = false, isActive = false) {
  return { url, text, isEllipsis, isActive };
}
export {
  getSeason,
  transformShows,
  calculateMaxPage,
  cleanPageCount,
  cleanSortType,
  cleanOrdType,
  getURLs,
};
