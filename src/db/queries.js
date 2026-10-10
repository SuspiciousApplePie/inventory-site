import pool from "./pool.js";

async function getGenreList() {
  const { rows } = await pool.query("SELECT * FROM genre;");
  return rows;
}
async function getStudioList() {
  const { rows } = await pool.query("SELECT * FROM studio;");
  return rows;
}

async function getFormatList() {
  const { rows } = await pool.query("SELECT * FROM format;");
  return rows;
}

async function getTitle(title) {
  const { rows } = await pool.query(
    "SELECT title FROM anime WHERE title = $1",
    [title],
  );
  return rows;
}

async function addStudioWork(showTitle, studios) {
  const { rows } = await pool.query(
    "SELECT anime_id FROM anime WHERE title = ($1)",
    [showTitle],
  );

  const title = rows[0].anime_id;

  for (const studio of studios) {
    await pool.query(
      "INSERT INTO anime_studio (anime_id, studio_id) VALUES ($1, $2)",
      [+title, +studio],
    );
  }
}

async function addAnimeGenre(showTitle, genreList) {
  const { rows } = await pool.query(
    "SELECT anime_id FROM anime WHERE title = ($1)",
    [showTitle],
  );

  const title = rows[0].anime_id;

  for (const genre of genreList) {
    await pool.query(
      "INSERT INTO anime_genre (anime_id, genre_id) VALUES ($1, $2)",
      [+title, +genre],
    );
  }
}

async function addNewShow(show) {
  await pool.query(
    `
      INSERT INTO anime (title, rating, start_date, end_date, format_id) 
        VALUES ($1, $2, $3, $4, $5);
    `,
    [show.title, show.rating, show.startDate, show.endDate, +show.format],
  );

  await addStudioWork(show.title, show.studio);
  await addAnimeGenre(show.title, show.genre);
}

async function getAllShows() {
  const { rows } = await pool.query(
    `
    SELECT anime.anime_id, title, rating, start_date, end_date, format.format_name AS format, genre.genre_name AS genre, studio.studio_name AS studio FROM anime 
    INNER JOIN anime_genre ON (anime.anime_id = anime_genre.anime_id) 
    INNER JOIN genre ON (genre.genre_id = anime_genre.genre_id)
    INNER JOIN anime_studio ON (anime.anime_id = anime_studio.anime_id)
    INNER JOIN studio ON (anime_studio.studio_id = studio.studio_id)
    INNER JOIN format ON (format.format_id = anime.format_id) WHERE format.format_id = anime.format_id;
    `,
  );

  return rows;
}

export {
  getGenreList,
  getStudioList,
  getFormatList,
  getTitle,
  addNewShow,
  getAllShows,
};
