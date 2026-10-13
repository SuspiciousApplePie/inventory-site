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

  const animeId = rows[0].anime_id;
  await addEachStudioWork(animeId, studios);
}

async function addEachStudioWork(animeId, studios) {
  for (const studio of studios) {
    await pool.query(
      "INSERT INTO anime_studio (anime_id, studio_id) VALUES ($1, $2)",
      [+animeId, +studio],
    );
  }
}

async function addAnimeGenre(showTitle, genres) {
  const { rows } = await pool.query(
    "SELECT anime_id FROM anime WHERE title = ($1)",
    [showTitle],
  );

  const animeId = rows[0].anime_id;
  await addEachAnimeGenre(animeId, genres);
}

async function addEachAnimeGenre(animeId, genres) {
  for (const genre of genres) {
    await pool.query(
      "INSERT INTO anime_genre (anime_id, genre_id) VALUES ($1, $2)",
      [+animeId, +genre],
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
    SELECT anime.anime_id, title, rating, start_date, end_date, 
    format.format_name AS format, genre.genre_name AS genre, 
    studio.studio_name AS studio FROM anime 
    INNER JOIN anime_genre ON (anime.anime_id = anime_genre.anime_id) 
    INNER JOIN genre ON (genre.genre_id = anime_genre.genre_id)
    INNER JOIN anime_studio ON (anime.anime_id = anime_studio.anime_id)
    INNER JOIN studio ON (anime_studio.studio_id = studio.studio_id)
    INNER JOIN format ON (format.format_id = anime.format_id) 
    WHERE format.format_id = anime.format_id;
    `,
  );

  return rows;
}

async function getShowById(animeId) {
  const { rows } = await pool.query(
    `
    SELECT anime.anime_id, title, rating, start_date, end_date, 
    format_id AS format, genre.genre_id AS genre, 
    studio.studio_id AS studio FROM anime
    INNER JOIN anime_genre ON (anime.anime_id = anime_genre.anime_id)
    INNER JOIN genre ON (genre.genre_id = anime_genre.genre_id)
    INNER JOIN anime_studio ON (anime.anime_id = anime_studio.anime_id)
    INNER JOIN studio ON (studio.studio_id = anime_studio.studio_id)
    WHERE anime.anime_id = $1;
    `,
    [animeId],
  );

  return rows;
}

async function updateShowById(show) {
  await pool.query(
    `
    UPDATE anime
    SET
      title = $1,
      rating = $2,
      start_date = $3,
      end_date = $4,
      format_id = $5
    WHERE
      anime_id = $6;
    `,
    [
      show.title,
      show.rating,
      show.startDate,
      show.endDate,
      +show.format,
      show.animeId,
    ],
  );

  await updateAnimeGenre(show.animeId, show.genre);
  await updateStudioWork(show.animeId, show.studio);
}

async function updateAnimeGenre(showId, genres) {
  await pool.query("DELETE FROM anime_genre WHERE anime_id = $1;", [showId]);
  await addEachAnimeGenre(showId, genres);
}

async function updateStudioWork(showId, studios) {
  await pool.query("DELETE FROM anime_studio WHERE anime_id = $1", [showId]);
  await addEachStudioWork(showId, studios);
}

async function checkIfUnique(showId, title) {
  const { rows } = await pool.query(
    "SELECT anime_id FROM anime WHERE title = $1 AND anime_id != $2;",
    [title, showId],
  );

  return rows.length === 0 ? true : false;
}

async function deleteShowById(showId) {
  await pool.query("DELETE FROM anime WHERE anime_id = $1;", [showId]);
}

async function getShowSortBy(sort, ordType) {
  const ordBy = ordType === "asc" ? "ASC" : "DESC";
  const { rows } = await pool.query(
    `
    SELECT anime.anime_id, title, rating, start_date, end_date, 
    format.format_name AS format, genre.genre_name AS genre, 
    studio.studio_name AS studio FROM anime 
    INNER JOIN anime_genre ON (anime.anime_id = anime_genre.anime_id) 
    INNER JOIN genre ON (genre.genre_id = anime_genre.genre_id)
    INNER JOIN anime_studio ON (anime.anime_id = anime_studio.anime_id)
    INNER JOIN studio ON (anime_studio.studio_id = studio.studio_id)
    INNER JOIN format ON (format.format_id = anime.format_id) 
    WHERE format.format_id = anime.format_id ORDER BY ${sort} ${ordBy};
    `,
  );

  return rows;
}

async function getShowBySearch(search) {
  const { rows } = await pool.query(
    `
    SELECT anime.anime_id, title, rating, start_date, end_date, 
    format.format_name AS format, genre.genre_name AS genre, 
    studio.studio_name AS studio FROM anime 
    INNER JOIN anime_genre ON (anime.anime_id = anime_genre.anime_id) 
    INNER JOIN genre ON (genre.genre_id = anime_genre.genre_id)
    INNER JOIN anime_studio ON (anime.anime_id = anime_studio.anime_id)
    INNER JOIN studio ON (anime_studio.studio_id = studio.studio_id)
    INNER JOIN format ON (format.format_id = anime.format_id) 
    WHERE format.format_id = anime.format_id AND title ILIKE ($1);
    `,
    [`%${search}%`],
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
  getShowById,
  updateShowById,
  checkIfUnique,
  deleteShowById,
  getShowSortBy,
  getShowBySearch,
};
