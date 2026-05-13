# Student Records App

Student Records Manager is a full stack CRUD application for managing student records. The frontend is built with Vue 3 and Vite, the API uses Express, and the data is stored in a MySQL database named `student_records`.

## Project Structure

```text
student-records-app/
  server/              Express API and MySQL connection
  sql/schema.sql       Database schema and sample records
  src/                 Vue frontend source files
  test.http            API request examples
  package.json         Frontend dependencies and scripts
```

The repository excludes dependency folders. Run `npm install` in the frontend folder and in the backend folder after cloning.

## Database Setup

1. Start MySQL.
2. Import `sql/schema.sql`.
3. Copy `server/.env.example` to `server/.env`.
4. Confirm the backend connection settings in `server/.env`.

The default backend configuration expects:

```text
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=student_records
```

## Run The Backend

```bash
cd ch8/student-records-app/server
npm install
node index.js
```

The API runs at `http://localhost:3000`.

## Run The Frontend

Open another terminal:

```bash
cd ch8/student-records-app
npm install
npm run dev
```

The Vite app usually runs at `http://localhost:5173`.

## API Endpoints

```text
GET    /                Health check
GET    /students        List students, with optional q, sortBy, and order query params
GET    /students/:id    Get one student
POST   /students        Create a student
PUT    /students/:id    Update a student
PATCH  /students/:id    Partially update a student
DELETE /students/:id    Delete a student
```

## Features

- List student records from MySQL.
- Add new student records.
- Edit existing student details.
- Delete student records.
- Search and sort through the API.
- Use Axios request and response interceptors for frontend API calls.

## Extensions Attempted

### Extension A - Pagination

`GET /students` now accepts `page` and `size` query parameters. The API returns a wrapped response so the Vue UI can show the current page:

```json
{
 "data": [],
 "total": 5,
 "page": 1,
 "size": 5
}
```

Working check: use `GET http://localhost:3000/students?page=2&size=5` from `test.http` or click the Prev / Next buttons in the UI.

### Extension B - PATCH endpoint and active toggle

The backend now supports `PATCH /students/:id` and only updates fields included in the request body. The table includes a one-click Activate / Deactivate button that sends a small payload:

```json
{
 "active": false
}
```

The UI flips the active state immediately and rolls it back if the API call fails.

### Extension C - Server-side validation

The backend validates matric number, name, course, faculty, email, GPA, year, active status, and duplicate email before writing to MySQL. Invalid requests return HTTP 400 with field-level errors:

```json
{
 "errors": {
 "matricNo": "Format: A21CS0001",
 "gpa": "Must be 0-4"
 }
}
```

The Vue form copies those API errors into its inline error messages.

### Extension E - Environment variables with dotenv

Database credentials were moved out of `server/db.js` into environment variables loaded by `dotenv`. The committed file is `server/.env.example`; the real `server/.env` stays ignored by Git.

## Code Review Against Chapter 8 Learning Outcomes

| LO | Outcome | Review |
| --- | --- | --- |
| LO 1 | Connecting Vue to a Backend | Met. The Vue app calls the Express API through a centralized Axios client, and DB credentials now use the production-style dotenv pattern. |
| LO 2 | Axios HTTP Client | Met. CRUD helpers are centralized in `src/api/studentApi.js`, and the new pagination and PATCH toggle both use Axios requests. |
| LO 3 | Form Handling in Vue | Met. The form keeps client validation for UX and now displays trusted server-side 400 validation errors inline. |
| LO 4 | Persistent CRUD | Met. Create, read, update, partial update, delete, pagination, and active toggling all persist through MySQL-backed endpoints. |

Extension D was not attempted. The selected extensions focus on HTTP, validation, persistence, and configuration depth.
