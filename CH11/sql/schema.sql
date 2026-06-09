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

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('member','admin') NOT NULL DEFAULT 'member',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Demo Admin', 'admin@books.test', '$2y$10$nVcp78x58MYQGrbsiZMpEeFPHCwjuoIkKEPqaoPpzJlhjkVIJbqsO', 'admin'),
  ('Demo Member', 'member@books.test', '$2y$10$nVcp78x58MYQGrbsiZMpEeFPHCwjuoIkKEPqaoPpzJlhjkVIJbqsO', 'member');
