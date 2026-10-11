import {
  getGenreList,
  getStudioList,
  getFormatList,
  getTitle,
  addNewShow,
  getAllShows,
  getShowById,
  updateShowById,
} from "../db/queries.js";
import { matchedData, body, validationResult } from "express-validator";
import { getSeason, transformShows } from "../utils.js";
import { format as formatDate } from "date-fns";

const validateShow = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must contain at least 1-255 characters.")
    .custom(async (value) => {
      const titles = await getTitle(value);
      if (titles.length !== 0) throw new Error("Show title already exists.");
    }),
  body("rating")
    .trim()
    .isInt({ min: 1, max: 10 })
    .withMessage("Rating is only range 1-10"),
  body("start-date")
    .isISO8601()
    .isDate()
    .withMessage("Start date is required."),
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

async function getShows(req, res) {
  try {
    const shows = await getAllShows();
    const transformedShows = transformShows(shows);
    res.render("shows", {
      shows: transformedShows,
      getSeason: getSeason,
      formatDate: formatDate,
    });
  } catch {
    throw new Error("Something went wrong.");
  }
}
const addShow = [
  validateShow,
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
      res.redirect("/");
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
    console.log(show);
    res.render("update_show", {
      show: show.get(animeId),
      formats: formats,
      genres: genres,
      studios: studios,
      formatDate: formatDate,
    });
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch show info");
  }
}

const updateShow = [
  validateShow,
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
        title,
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
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong.");
    }
  },
];

export { addShow, getShowForm, getShows, getUpdateForm, updateShow };
