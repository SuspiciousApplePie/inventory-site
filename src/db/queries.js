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

export { getGenreList, getStudioList, getFormatList, getTitle, addNewShow };
