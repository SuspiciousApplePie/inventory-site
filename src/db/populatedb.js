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
    FOREIGN KEY(anime_id) REFERENCES anime (anime_id) ON DELETE CASCADE,
    FOREIGN KEY(studio_id) REFERENCES studio (studio_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anime_genre (
    anime_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY(anime_id, genre_id),
    FOREIGN KEY(anime_id) REFERENCES anime (anime_id) ON DELETE CASCADE,
    FOREIGN KEY(genre_id) REFERENCES genre (genre_id) ON DELETE CASCADE
);


INSERT INTO format (format_name) VALUES
('TV'), ('Movie'), ('OVA'), ('ONA'), ('Special'), ('TV Short');

INSERT INTO genre (genre_name) VALUES
('Action'), ('Adventure'), ('Comedy'), ('Drama'), ('Fantasy'),
('Romance'), ('Sci-Fi'), ('Thriller'), ('Mystery'), ('Horror'),
('Slice of Life'), ('Sports'), ('Supernatural'), ('Psychological'),
('Mecha'), ('Music'), ('Historical'), ('Ecchi'), ('Martial Arts'), ('Isekai');

INSERT INTO studio (studio_name) VALUES
('Madhouse'), ('MAPPA'), ('Wit Studio'), ('Bones'), ('Ufotable'),
('Kyoto Animation'), ('A-1 Pictures'), ('CloverWorks'), ('Toei Animation'),
('Pierrot'), ('Sunrise'), ('Production I.G'), ('Trigger'), ('Shaft'),
('White Fox'), ('Studio Ghibli'), ('OLM'), ('Doga Kobo'), ('P.A. Works'), ('Lerche');

INSERT INTO anime (title, rating, start_date, end_date, format_id) VALUES
('Fullmetal Alchemist: Brotherhood',10,'2009-04-05','2010-07-04',1),
('Steins;Gate',10,'2011-04-06','2011-09-14',1),
('Hunter x Hunter',10,'2011-10-02','2014-09-24',1),
('Death Note',9,'2006-10-04','2007-06-27',1),
('Attack on Titan',10,'2013-04-07','2023-11-05',1),
('Vinland Saga',9,'2019-07-08','2023-06-20',1),
('Jujutsu Kaisen',9,'2020-10-03','2023-12-28',1),
('Demon Slayer',9,'2019-04-06','2024-06-30',1),
('Mob Psycho 100',9,'2016-07-12','2022-12-22',1),
('One Punch Man',8,'2015-10-05','2019-07-02',1),
('Naruto',8,'2002-10-03','2007-02-08',1),
('Bleach',8,'2004-10-05','2023-09-30',1),
('One Piece',10,'1999-10-20',NULL,1),
('Dragon Ball Z',9,'1989-04-26','1996-01-31',1),
('My Hero Academia',8,'2016-04-03','2024-10-12',1),
('Black Clover',8,'2017-10-03','2021-03-30',1),
('Fairy Tail',8,'2009-10-12','2019-09-29',1),
('Chainsaw Man',9,'2022-10-12','2022-12-28',1),
('Spy x Family',9,'2022-04-09','2023-12-23',1),
('Dr. Stone',8,'2019-07-05','2023-12-21',1),
('Frieren: Beyond Journey''s End',10,'2023-09-29','2024-03-22',1),
('The Apothecary Diaries',9,'2023-10-22','2024-03-24',1),
('Violet Evergarden',9,'2018-01-11','2018-04-05',1),
('Clannad',9,'2007-10-04','2009-03-26',1),
('Your Lie in April',9,'2014-10-10','2015-03-20',1),
('Toradora!',9,'2008-10-02','2009-03-26',1),
('Kaguya-sama: Love Is War',9,'2019-01-12','2022-06-25',1),
('Horimiya',8,'2021-01-10','2023-10-01',1),
('Bocchi the Rock!',9,'2022-10-09','2022-12-25',1),
('K-On!',8,'2009-04-03','2010-09-28',1),
('Cowboy Bebop',9,'1998-04-03','1999-04-24',1),
('Neon Genesis Evangelion',9,'1995-10-04','1996-03-27',1),
('Code Geass',9,'2006-10-06','2008-09-28',1),
('Psycho-Pass',9,'2012-10-12','2019-12-13',1),
('Ghost in the Shell: Stand Alone Complex',9,'2002-10-01','2005-01-08',1),
('Serial Experiments Lain',9,'1998-07-06','1998-09-28',1),
('Parasyte: The Maxim',9,'2014-10-09','2015-03-26',1),
('Erased',9,'2016-01-08','2016-03-25',1),
('Another',8,'2012-01-10','2012-03-27',1),
('The Promised Neverland',8,'2019-01-11','2021-03-26',1),
('Re:Zero − Starting Life in Another World',9,'2016-04-04','2024-11-20',1),
('Overlord',8,'2015-07-07','2022-09-27',1),
('That Time I Got Reincarnated as a Slime',8,'2018-10-02','2024-09-27',1),
('Mushoku Tensei: Jobless Reincarnation',9,'2021-01-11','2024-07-01',1),
('Konosuba',8,'2016-01-14','2017-03-16',1),
('No Game No Life',8,'2014-04-09','2014-06-25',1),
('Made in Abyss',9,'2017-07-07','2022-09-28',1),
('The Rising of the Shield Hero',7,'2019-01-09','2023-12-22',1),
('Sword Art Online',8,'2012-07-08','2020-09-20',1),
('Log Horizon',8,'2013-10-05','2021-03-31',1),
('Spirited Away',10,'2001-07-20',NULL,2),
('Your Name',9,'2016-08-26',NULL,2),
('A Silent Voice',9,'2016-09-17',NULL,2),
('Princess Mononoke',9,'1997-07-12',NULL,2),
('Howl''s Moving Castle',9,'2004-11-20',NULL,2),
('Weathering with You',8,'2019-07-19',NULL,2),
('The Boy and the Heron',8,'2023-07-14',NULL,2),
('Akira',9,'1988-07-16',NULL,2),
('Perfect Blue',9,'1998-02-28',NULL,2),
('The End of Evangelion',9,'1997-07-19',NULL,2);

INSERT INTO anime_studio (anime_id, studio_id) VALUES
(1,1),(2,15),(3,1),(4,1),(5,3),(6,3),(7,2),(8,5),(9,4),(10,1),
(11,10),(12,10),(13,9),(14,9),(15,4),(16,10),(17,10),(18,2),(19,8),(20,17),
(21,1),(22,7),(23,6),(24,6),(25,7),(26,7),(27,8),(28,8),(29,18),(30,6),
(31,11),(32,14),(33,11),(34,8),(35,12),(36,12),(37,2),(38,10),(39,10),(40,10),
(41,15),(42,11),(43,8),(44,15),(45,19),(46,6),(47,7),(48,8),(49,11),(50,11),
(51,16),(52,19),(53,6),(54,16),(55,16),(56,19),(57,16),(58,12),(59,14),(60,14);

INSERT INTO anime_genre (anime_id, genre_id) VALUES
(1,1),(1,5),(1,4),(2,7),(2,8),(2,14),(3,1),(3,2),(3,5),
(4,8),(4,14),(4,9),(5,1),(5,2),(5,4),(6,1),(6,2),(6,17),
(7,1),(7,5),(7,13),(8,1),(8,5),(8,13),(9,1),(9,3),(9,13),
(10,1),(10,3),(11,1),(11,2),(11,3),(12,1),(12,2),(12,13),
(13,1),(13,2),(13,5),(14,1),(14,2),(14,5),(15,1),(15,3),(15,5),
(16,1),(16,2),(16,5),(17,1),(17,2),(17,5),(18,1),(18,8),(18,13),
(19,3),(19,6),(19,11),(20,2),(20,7),(20,3),(21,2),(21,5),(21,4),
(22,9),(22,4),(22,17),(23,4),(23,6),(23,11),(24,4),(24,6),(24,13),
(25,4),(25,6),(25,16),(26,3),(26,6),(26,11),(27,3),(27,6),(27,14),
(28,3),(28,6),(28,11),(29,3),(29,16),(29,11),(30,3),(30,16),(30,11),
(31,1),(31,2),(31,7),(32,7),(32,15),(32,14),(33,1),(33,7),(33,15),
(34,7),(34,8),(34,14),(35,1),(35,7),(35,13),(36,7),(36,14),(36,8),
(37,1),(37,8),(37,13),(38,9),(38,4),(38,8),(39,10),(39,8),(39,13),
(40,9),(40,8),(40,4),(41,5),(41,20),(41,4),(42,1),(42,5),(42,20),
(43,1),(43,5),(43,20),(44,5),(44,20),(44,4),(45,3),(45,5),(45,20),
(46,2),(46,5),(46,20),(47,2),(47,5),(47,8),(48,1),(48,5),(48,20),
(49,1),(49,5),(49,7),(50,2),(50,5),(50,7),(51,5),(51,2),(51,13),
(52,4),(52,6),(52,13),(53,4),(53,6),(53,11),(54,2),(54,5),(54,17),
(55,2),(55,5),(55,13),(56,4),(56,6),(56,11),(57,2),(57,5),(57,4),
(58,1),(58,7),(58,15),(59,8),(59,14),(59,13),(60,7),(60,15),(60,14);

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
