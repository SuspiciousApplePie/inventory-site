import { Client } from "pg";
import process from "node:process";

const SQL = `
CREATE TABLE IF NOT EXISTS format(
    format_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    format_name VARCHAR ( 20 ) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS anime (
    anime_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR ( 255 ) NOT NULL UNIQUE,
    rating INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    format_id INT NOT NULL,
    FOREIGN KEY(format_id) REFERENCES format (format_id),
    CHECK (end_date IS NULL OR end_date >= start_date),
    CHECK (rating BETWEEN 1 AND 10)
);

CREATE TABLE IF NOT EXISTS genre (
    genre_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    genre_name VARCHAR (50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS studio (
    studio_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    studio_name VARCHAR (50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS anime_studio (
    anime_id INT NOT NULL,
    studio_id INT NOT NULL,
    PRIMARY KEY(anime_id, studio_id),
    FOREIGN KEY(anime_id) REFERENCES anime (anime_id),
    FOREIGN KEY(studio_id) REFERENCES studio (studio_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anime_genre (
    anime_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY(anime_id, genre_id),
    FOREIGN KEY(anime_id) REFERENCES anime (anime_id),
    FOREIGN KEY(genre_id) REFERENCES genre (genre_id) ON DELETE CASCADE
);

INSERT INTO format (format_name) VALUES ('TV');
INSERT INTO genre (genre_name) VALUES ('Action');
INSERT INTO genre (genre_name) VALUES ('Comedy');
INSERT INTO studio (studio_name) VALUES ('Ufotable');
INSERT INTO studio (studio_name) VALUES ('Toei');
`;

async function main() {
  const client = new Client({
    connectionString: process.argv[2],
  });

  console.log("...seeding");

  await client.connect();
  await client.query(SQL);
  await client.end();

  console.log("Done.");
}

main();
