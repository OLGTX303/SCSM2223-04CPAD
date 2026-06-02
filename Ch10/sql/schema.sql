DROP DATABASE IF EXISTS books_api;
CREATE DATABASE books_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE books_api;

CREATE TABLE books (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  genre VARCHAR(100) NOT NULL DEFAULT 'Uncategorised',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO books (title, author, year, genre) VALUES
  ('Clean Code', 'Robert C. Martin', 2008, 'Software Engineering'),
  ('Eloquent JavaScript', 'Marijn Haverbeke', 2018, 'Programming'),
  ('PHP & MySQL: Server-side Web Development', 'Jon Duckett', 2022, 'Web Development');
