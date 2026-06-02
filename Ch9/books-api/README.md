# Books REST API - Slim 4 Lab

This folder contains the Chapter 9 Books REST API built with Slim 4. The API is documented and testable with `Books_API_Postman_Collection.json`.

## Requirements

- PHP 8.0 or newer
- Composer

## Install

```powershell
composer install
```

The `vendor` folder is already included in this lab folder, but running `composer install` is still the normal way to restore dependencies from `composer.json` and `composer.lock`.

## Run

From this folder:

```powershell
php -S localhost:8000 -t public
```

The Postman collection and Vue frontend use:

- `base_url`: `http://localhost:8000`

## Authentication

Chapter 9 v2 does not require authentication. The included Vue frontend calls the API directly from Vite, so the API allows unauthenticated requests and enables CORS.

## API Endpoints

| Name | Method | URL | Auth | Expected result |
| --- | --- | --- | --- | --- |
| Health Check | `GET` | `/` | No | `200 OK` with API name and version |
| List All Books | `GET` | `/api/books` | No | `200 OK` with `count` and all books |
| Search Books | `GET` | `/api/books?q=clean` | No | `200 OK` with books matching title or author |
| Limit Books | `GET` | `/api/books?limit=2` | No | `200 OK` with two books |
| Get Book By ID | `GET` | `/api/books/1` | No | `200 OK` with book id `1` |
| Get Book Not Found | `GET` | `/api/books/999` | No | `404 Not Found` with an error message |
| Create Book | `POST` | `/api/books` | No | `201 Created` with `Location` header and saved JSON data |
| Create Book Validation Error | `POST` | `/api/books` | No | `400 Bad Request` with validation errors |
| Update Book | `PUT` | `/api/books/1` | No | `200 OK` with updated book data saved to JSON |
| Delete Book | `DELETE` | `/api/books/2` | No | `200 OK` with deleted book data removed from JSON |
| Reset Books | `POST` | `/api/reset` | No | `200 OK` with seed data restored |
| CORS Preflight | `OPTIONS` | `/api/books` | No | `204 No Content` with CORS headers |

## Example Requests

Health check:

```powershell
curl http://localhost:8000/
```

List all books:

```powershell
curl http://localhost:8000/api/books
```

Search books:

```powershell
curl "http://localhost:8000/api/books?q=clean"
```

Create a book:

```powershell
curl -X POST http://localhost:8000/api/books `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"JavaScript Everywhere\",\"author\":\"Adam D. Scott\",\"year\":2020}"
```

Update a book:

```powershell
curl -X PUT http://localhost:8000/api/books/1 `
  -H "Content-Type: application/json" `
  -d "{\"year\":2009}"
```

Delete a book:

```powershell
curl -X DELETE http://localhost:8000/api/books/2
```

Reset seed data:

```powershell
curl -X POST http://localhost:8000/api/reset
```

## Seed Data

The API starts with four books from `src/Data/books.php`:

- `1` - Clean Code
- `2` - Eloquent JavaScript
- `3` - Vue.js 3 By Example
- `4` - PHP & MySQL: Server-side Web Development

Created, updated, and deleted books are stored in `var/books.json`. If the file does not exist, the API creates it from `src/Data/books.php`. Use `POST /api/reset` to restore the original seed list.

## Postman Testing

1. Open Postman.
2. Import `Books_API_Postman_Collection.json`.
3. Make sure the local server is running at `http://localhost:8000`.
4. Run the requests in the collection.

The collection includes successful CRUD requests, reset, validation checks, and CORS preflight.

## Frontend

The v2 frontend is in `frontend/`.

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173/`. The frontend expects the API to run at `http://localhost:8000`.
