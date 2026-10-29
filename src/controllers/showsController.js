import {
  getGenreList,
  getStudioList,
  getFormatList,
  getTitle,
  addNewShow,
  getShowById,
  updateShowById,
  checkIfUnique,
  deleteShowById,
  getShowSortBy,
  getTotalShows,
  getHashedPassword,
} from "../db/queries.js";
import { matchedData, body, query, validationResult } from "express-validator";
import {
  getSeason,
  transformShows,
  calculateMaxPage,
  cleanPageCount,
  cleanSortType,
  cleanOrdType,
  getURLs,
  getPrevNext,
} from "../utils.js";
import { BadRequest, PageNotFound } from "../errors/errors.js";
import { format as formatDate } from "date-fns";
import argon2 from "argon2";

const navBar = [
  { url: "/", text: "Home" },
  { url: "/shows", text: "Shows" },
];
const titleValidation = body("title")
  .trim()
  .isLength({ min: 1, max: 255 })
  .withMessage("Title must contain at least 1-255 characters.")
  .custom(async (value) => {
    const titles = await getTitle(value);
    if (titles.length !== 0) throw new Error("Show title already exists.");
  });

const newTitleValidation = body("new-title")
  .trim()
  .isLength({ min: 1, max: 255 })
  .withMessage("Title must contain at least 1-255 characters.")
  .custom(async (value, { req }) => {
    const { "new-title": newTitle } = req.body;
    const showId = req.params.animeId;
    const isUnique = await checkIfUnique(showId, newTitle);

    if (!isUnique) throw new Error("Show title already exist.");
  });

const passwordValidation = body("password")
  .trim()
  .notEmpty()
  .withMessage("Password field cannot be empty.")
  .bail()
  .custom(async (password) => {
    const hashedPass = await getHashedPassword();
    if (!(await argon2.verify(hashedPass, password)))
      throw new Error("Password is wrong");
  });

const validateShow = [
  body("rating")
    .trim()
    .isNumeric()
    .withMessage("Please enter a valid number 1-10")
    .bail()
    .isInt({ min: 1, max: 10 })
    .withMessage("Rating is only range 1-10"),
  body("start-date")
    .notEmpty()
    .withMessage("Start date is required.")
    .bail()
    .isISO8601()
    .withMessage("Start date is invalid."),
  body("end-date")
    .optional({ values: "falsy" })
    .isISO8601()
    .isDate()
    .withMessage("End date is invalid.")
    .custom((endDate, { req }) => {
      const { "start-date": startDate } = req.body;
      if (endDate) {
        if (new Date(startDate) > new Date(endDate)) {
          throw new Error("End date should be after start date.");
        }
      }
      return true;
    }),
  body("format")
    .notEmpty()
    .withMessage("Format is required.")
    .bail()
    .isNumeric()
    .withMessage("Invalid format value")
    .custom(async (formatId) => {
      const formats = await getFormatList();
      if (!formats.some((format) => format.format_id === +formatId)) {
        throw new Error("Select a valid format type.");
      }
    }),
  body("genre")
    .notEmpty()
    .withMessage("Genre is required")
    .bail()
    .customSanitizer((genre) => (Array.isArray(genre) ? genre : [genre])),
  body("genre.*").custom(async (genreId) => {
    const genres = await getGenreList();
    if (!genres.some((genre) => genre.genre_id === +genreId)) {
      throw new Error("Select a valid genre type.");
    }
  }),
  body("studio")
    .notEmpty()
    .withMessage("Studio is required")
    .bail()
    .customSanitizer((studio) => (Array.isArray(studio) ? studio : [studio])),
  body("studio.*").custom(async (studioId) => {
    const studios = await getStudioList();
    if (!studios.some((studio) => studio.studio_id === +studioId)) {
      throw new Error("Select a valid studio.");
    }
  }),
];

const validateSearch = [
  query("search")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Characters cannot exceed 255 characters"),
];

async function getShowForm(req, res, next) {
  try {
    const genres = await getGenreList();
    const studios = await getStudioList();
    const formats = await getFormatList();
    res.render("add_show", {
      genres: genres,
      studios: studios,
      formats: formats,
      navBar,
      active: null,
    });
  } catch {
    next(new PageNotFound("Page not found."));
  }
}

function getHomepage(req, res) {
  res.render("index", { navBar, active: navBar[0].url });
}

const getShows = [
  validateSearch,
  async (req, res, next) => {
    try {
      const { sort, ord, page } = req.query;
      const safeSort = cleanSortType(sort);
      const safeOrd = cleanOrdType(ord);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const totalShows = await getTotalShows();
        const totalPage = calculateMaxPage(totalShows);
        const safePage = cleanPageCount(page, totalPage);
        const showRaw = await getShowSortBy(sort, safeOrd, safePage);
        const shows = transformShows(showRaw);
        const pageURLs = getURLs(totalPage, sort, ord, "", safePage);
        const { prev, next } = getPrevNext(safePage, totalPage, sort, ord);
        res.render("shows", {
          errors: errors.array(),
          shows,
          getSeason,
          formatDate,
          pageURLs,
          prev,
          next,
        });
      } else {
        const { search } = matchedData(req);
        const totalShows = await getTotalShows(search);
        const totalPage = calculateMaxPage(totalShows);
        const safePage = cleanPageCount(page, totalPage);
        const showRaw = await getShowSortBy(
          safeSort,
          safeOrd,
          safePage,
          search,
        );
        const pageURLs = getURLs(totalPage, sort, ord, search, safePage);
        const shows = transformShows(showRaw);
        const { prev, next } = getPrevNext(
          safePage,
          totalPage,
          sort,
          ord,
          search,
        );
        res.render("shows", {
          shows,
          getSeason,
          formatDate,
          pageURLs,
          prev,
          next,
          navBar,
          active: navBar[1].url,
        });
      }
    } catch {
      next(new PageNotFound("Page not found."));
    }
  },
];
const addShow = [
  [titleValidation, ...validateShow, passwordValidation],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const genres = await getGenreList();
        const studios = await getStudioList();
        const formats = await getFormatList();

        return res.status(400).render("add_show", {
          errors: errors.array(),
          genres: genres,
          studios: studios,
          formats: formats,
          navBar,
          active: null,
        });
      }
      const {
        title,
        rating,
        format,
        "start-date": startDate,
        "end-date": endDate,
        studio,
        genre,
      } = matchedData(req);
      await addNewShow({
        title,
        rating,
        format,
        startDate,
        endDate,
        studio,
        genre,
      });
      res.redirect("/shows");
    } catch {
      next(new BadRequest("Bad Request"));
    }
  },
];

async function getUpdateForm(req, res, next) {
  try {
    const animeId = +req.params.animeId;
    const showRaw = await getShowById(animeId);
    const formats = await getFormatList();
    const genres = await getGenreList();
    const studios = await getStudioList();

    const show = transformShows(showRaw);

    res.render("update_show", {
      show: show.get(animeId),
      formats: formats,
      genres: genres,
      studios: studios,
      formatDate: formatDate,
      navBar,
      active: null,
    });
  } catch {
    next(new PageNotFound("Page not found."));
  }
}

const updateShow = [
  [newTitleValidation, ...validateShow, passwordValidation],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const animeId = +req.params.animeId;
      if (!errors.isEmpty()) {
        const showRaw = await getShowById(animeId);
        const formats = await getFormatList();
        const genres = await getGenreList();
        const studios = await getStudioList();

        const show = transformShows(showRaw);
        return res.render("update_show", {
          show: show.get(animeId),
          formats: formats,
          genres: genres,
          studios: studios,
          formatDate: formatDate,
          errors: errors.array(),
          navBar,
          active: null,
        });
      }

      const {
        "new-title": title,
        rating,
        format,
        "start-date": startDate,
        "end-date": endDate,
        studio,
        genre,
      } = matchedData(req);

      await updateShowById({
        animeId,
        title,
        rating,
        format,
        startDate,
        endDate,
        studio,
        genre,
      });

      res.redirect("/shows");
    } catch {
      next(new BadRequest("Bad Request"));
    }
  },
];

async function getDeleteForm(req, res, next) {
  try {
    const animeId = +req.params.animeId;
    const showRaw = await getShowById(animeId);
    const show = transformShows(showRaw);
    const title = show.get(animeId).title;
    res.render("delete_show", {
      show: { animeId, title },
      navBar,
      active: null,
    });
  } catch {
    next(new PageNotFound("Page not found."));
  }
}
const deleteShow = [
  [passwordValidation],
  async (req, res, next) => {
    try {
      const animeId = +req.params.animeId;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const showRaw = await getShowById(animeId);
        const show = transformShows(showRaw);
        const title = show.get(animeId).title;
        return res.render("delete_show", {
          show: { animeId, title },
          errors: errors.array(),
          navBar,
          active: null,
        });
      }
      await deleteShowById(animeId);
      res.redirect("/shows");
    } catch {
      next(new BadRequest("Bad Request"));
    }
  },
];

export {
  addShow,
  getShowForm,
  getShows,
  getUpdateForm,
  updateShow,
  getDeleteForm,
  deleteShow,
  getHomepage,
};
