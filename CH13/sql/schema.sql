DROP DATABASE IF EXISTS books_api;
CREATE DATABASE books_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE books_api;

DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS books;
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

CREATE TABLE books (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  genre VARCHAR(100) NOT NULL DEFAULT 'Uncategorised',
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Demo Admin', 'admin@books.test', '$2y$10$nVcp78x58MYQGrbsiZMpEeFPHCwjuoIkKEPqaoPpzJlhjkVIJbqsO', 'admin'),
  ('Demo Member', 'member@books.test', '$2y$10$nVcp78x58MYQGrbsiZMpEeFPHCwjuoIkKEPqaoPpzJlhjkVIJbqsO', 'member');

INSERT INTO books (title, author, year, genre, created_by) VALUES
  ('Clean Code', 'Robert C. Martin', 2008, 'Software Engineering', 1),
  ('Eloquent JavaScript', 'Marijn Haverbeke', 2018, 'Programming', 2),
  ('PHP & MySQL: Server-side Web Development', 'Jon Duckett', 2022, 'Web Development', 1);

CREATE TABLE audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_id INT UNSIGNED NULL,
  action VARCHAR(50) NOT NULL,
  target VARCHAR(80) NULL,
  ip_address VARCHAR(45) NULL,
  detail VARCHAR(500) NULL,
  INDEX idx_action (action),
  INDEX idx_actor (actor_id)
) ENGINE=InnoDB;
