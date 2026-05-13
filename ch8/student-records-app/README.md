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
3. Confirm the backend connection settings in `server/db.js`.

The default backend configuration expects:

```text
host: localhost
port: 3306
user: root
password:
database: student_records
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
DELETE /students/:id    Delete a student
```

## Features

- List student records from MySQL.
- Add new student records.
- Edit existing student details.
- Delete student records.
- Search and sort through the API.
- Use Axios request and response interceptors for frontend API calls.
