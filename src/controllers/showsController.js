import {
  getGenreList,
  getStudioList,
  getFormatList,
  addNewShow,
  getTitle,
} from "../db/queries.js";
import { matchedData, body, validationResult } from "express-validator";

const validateAddShow = [
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

const addShow = [
  validateAddShow,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const genres = await getGenreList();
        const studios = await getStudioList();
        const formats = await getFormatList();
        console.log(errors);
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
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong");
    }
  },
];

export { addShow, getShowForm };
