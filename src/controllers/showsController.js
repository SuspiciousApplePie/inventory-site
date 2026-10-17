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
} from "../db/queries.js";
import { matchedData, body, query, validationResult } from "express-validator";
import {
  getSeason,
  transformShows,
  calculateOffSet,
  cleanOffSet,
  cleanSortType,
  cleanOrdType,
} from "../utils.js";
import { format as formatDate } from "date-fns";

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
    .customSanitizer((format) => (Array.isArray(format) ? format : [format]))
    .isArray({ min: 1 })
    .withMessage("Format is required."),
  body("format.*").custom(async (formatId) => {
    const formats = await getFormatList();
    if (!formats.some((format) => format.format_id === +formatId)) {
      throw new Error("Select a format type.");
    }
  }),
  body("genre")
    .customSanitizer((genre) => (Array.isArray(genre) ? genre : [genre]))
    .isArray({ min: 1 })
    .withMessage("Genre is required."),
  body("genre.*").custom(async (genreId) => {
    const genres = await getGenreList();
    if (!genres.some((genre) => genre.genre_id === +genreId)) {
      throw new Error("Select a genre type.");
    }
  }),
  body("studio")
    .customSanitizer((studio) => (Array.isArray(studio) ? studio : [studio]))
    .isArray()
    .withMessage("Studio is required."),
  body("studio.*").custom(async (studioId) => {
    const studios = await getStudioList();
    if (!studios.some((studio) => studio.studio_id === +studioId)) {
      throw new Error("Select a studio.");
    }
  }),
];

const validateSearch = [
  query("search")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Characters cannot exceed 255 characters"),
];

async function getShowForm(req, res) {
  try {
    const genres = await getGenreList();
    const studios = await getStudioList();
    const formats = await getFormatList();
    res.render("add_show", {
      genres: genres,
      studios: studios,
      formats: formats,
    });
  } catch {
    throw new Error("Something went wrong");
  }
}

const getShows = [
  validateSearch,
  async (req, res) => {
    try {
      const { sort, ord, offset } = req.query;
      const totalShows = await getTotalShows();
      const maxOffset = calculateOffSet(totalShows);
      const safeOffset = cleanOffSet(offset, maxOffset);
      const safeSort = cleanSortType(sort);
      const safeOrd = cleanOrdType(ord);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const showRaw = await getShowSortBy(safeSort, safeOrd, safeOffset);
        const shows = transformShows(showRaw);
        res.render("shows", {
          errors: errors.array(),
          shows: shows,
          getSeason,
          formatDate,
        });
      } else {
        const { search } = matchedData(req);
        const showRaw = await getShowSortBy(
          safeSort,
          safeOrd,
          safeOffset,
          search,
        );
        const shows = transformShows(showRaw);
        res.render("shows", {
          shows: shows,
          getSeason,
          formatDate,
        });
      }
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong.");
    }
  },
];
const addShow = [
  [titleValidation, ...validateShow],
  async (req, res) => {
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
      throw new Error("Something went wrong");
    }
  },
];

async function getUpdateForm(req, res) {
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
    });
  } catch {
    throw new Error("Failed to fetch show info");
  }
}

const updateShow = [
  [newTitleValidation, ...validateShow],
  async (req, res) => {
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
      throw new Error("Something went wrong.");
    }
  },
];

async function getDeleteForm(req, res) {
  const animeId = +req.params.animeId;
  try {
    const showRaw = await getShowById(animeId);
    const show = transformShows(showRaw);
    const title = show.get(animeId).title;
    res.render("delete_show", { show: { animeId, title } });
  } catch {
    throw new Error("Something went wrong");
  }
}
async function deleteShow(req, res) {
  const animeId = +req.params.animeId;
  try {
    await deleteShowById(animeId);
    res.redirect("/shows");
  } catch {
    throw new Error("Something went wrong");
  }
}

export {
  addShow,
  getShowForm,
  getShows,
  getUpdateForm,
  updateShow,
  getDeleteForm,
  deleteShow,
};
