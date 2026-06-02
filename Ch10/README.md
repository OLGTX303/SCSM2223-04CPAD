# Chapter 10 Books API - MySQL/PDO

This folder contains the Chapter 10 backend REST API and the supplied Vue 3 frontend. Unlike Chapter 9, this API stores book data in MySQL through PDO.

## Requirements

- PHP 8.0 or newer with `pdo_mysql` enabled
- Composer
- MySQL, for example through Laragon
- Node.js and npm for the frontend

If PHP reports `could not find driver`, read `Fix_PDO_MySQL_Driver.md`.

## Backend Setup

Create and seed the database:

```powershell
mysql -u root < sql/schema.sql
```

Install PHP dependencies:

```powershell
composer install
```

Create the environment file:

```powershell
copy .env.example .env
```

Default Laragon settings normally work with:

```text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=books_api
DB_USER=root
DB_PASS=
DB_CHARSET=utf8mb4
```

Start the API:

```powershell
php -S localhost:8000 -t public
```

Or start the API and Vue frontend automatically:

```powershell
.\start-ch10.ps1
```

To reset and reseed the MySQL database before starting:

```powershell
.\start-ch10.ps1 -ResetDatabase
```

## API Endpoints

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/` | Health check |
| `GET` | `/api/books` | List books |
| `GET` | `/api/books?q=clean` | Search by title or author |
| `GET` | `/api/books?limit=2` | Limit returned books |
| `GET` | `/api/books/{id}` | Get one book |
| `POST` | `/api/books` | Create a book |
| `PUT` | `/api/books/{id}` | Update a book |
| `DELETE` | `/api/books/{id}` | Delete a book |

The search query uses separate placeholders for title and author:

```php
$sql .= ' WHERE title LIKE :q_title OR author LIKE :q_author';
$args[':q_title'] = '%' . $q . '%';
$args[':q_author'] = '%' . $q . '%';
```

This avoids the duplicate `:q` placeholder error when PDO emulated prepares are disabled.

## Frontend Setup

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173/`. The frontend expects the API at `http://localhost:8000`.

You can also run `.\start-ch10.ps1` from this folder to create `.env`, install missing dependencies, prepare the database if needed, start both servers, and open the frontend.
