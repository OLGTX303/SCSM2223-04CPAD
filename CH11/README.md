# Chapter 11 Books API - JWT Auth

This folder contains the Chapter 11 REST API and Vue frontend. It builds on Chapter 10 by adding JWT authentication with `firebase/php-jwt`.

## Demo Accounts

Both seeded users use password `password`.

| Email | Role |
| --- | --- |
| `admin@books.test` | `admin` |
| `member@books.test` | `member` |

## Quick Start

Start the API and frontend automatically:

```powershell
.\start-ch11.ps1
```

Reset and reseed the database before starting:

```powershell
.\start-ch11.ps1 -ResetDatabase
```

The frontend opens at `http://localhost:5173/` and the API runs at `http://localhost:8000/`.

## Manual Setup

Install PHP dependencies:

```powershell
composer install
```

Create `.env` from `.env.example`, then replace `JWT_SECRET` with a random value:

```powershell
copy .env.example .env
php -r "echo bin2hex(random_bytes(32));"
```

Create and seed the database:

```powershell
mysql -u root < sql/schema.sql
```

Start the backend:

```powershell
php -S localhost:8000 -t public
```

Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | URL | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Register a member user |
| `POST` | `/auth/login` | No | Login and receive JWT |
| `GET` | `/auth/me` | JWT | Current user |
| `GET` | `/api/books` | No | List books with `q`, `limit`, `page` |
| `GET` | `/api/books/{id}` | No | Get one book |
| `POST` | `/api/books` | JWT | Create a book |
| `PUT` | `/api/books/{id}` | JWT | Update a book |
| `DELETE` | `/api/books/{id}` | Admin JWT | Delete a book |

## Test Flow

1. Login as `member@books.test` / `password`.
2. Create or edit a book.
3. Try deleting as member and confirm `403 Admins only`.
4. Login as `admin@books.test` / `password`.
5. Delete a book and confirm it succeeds.
