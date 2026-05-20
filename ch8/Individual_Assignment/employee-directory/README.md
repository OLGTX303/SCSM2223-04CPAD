# Employee Directory

Name: `ZUO BOYU`
Matric Number: `A24CS4045`

This project is the Chapter 8 individual assignment: a Vue 3 Employee Directory connected to an Express REST API and a MySQL database.

## Tech Stack

- Frontend: Vue 3, Composition API, Vite
- HTTP client: Axios with one shared service instance and interceptors
- Backend: Node.js, Express
- Database: MySQL through `mysql2/promise`

## Setup

1. Open Laragon and start MySQL.
2. Open a terminal in the project folder:

```powershell
cd D:\5Gcase\cpd\ch8\Individual_Assignment\employee-directory
```

3. Import the database schema and seed data:

```bash
mysql -uroot < sql/schema.sql
```

In PowerShell, use:

```powershell
Get-Content .\sql\schema.sql | mysql -uroot
```

If `mysql` is not in your PATH, use the Laragon MySQL executable. On this machine it is:

```powershell
Get-Content .\sql\schema.sql | D:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe -uroot
```

4. Install dependencies:

```bash
npm install
```

5. Start both servers:

```bash
npm run dev
```

On Windows, you can also run:

```powershell
.\start-app.ps1
```

The API runs on `http://127.0.0.1:3001`.
The Vue app runs on `http://127.0.0.1:5174`.

6. Check that the API can read MySQL data:

```powershell
Invoke-RestMethod "http://127.0.0.1:3001/employees?page=1&pageSize=7"
```

The response should include employee records and `total: 21`.

## MySQL Configuration

The default connection values match a standard Laragon MySQL setup:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=employee_directory
PORT=3001
```

Create a `.env` file in the project root if your MySQL credentials differ. Use `.env.example` as the template.

## Troubleshooting

- If the frontend says it cannot reach the server, make sure the backend is running on `http://127.0.0.1:3001`.
- If the backend says the database connection failed, start Laragon MySQL and import `sql/schema.sql`.
- If port `3001` is already in use, close the old backend terminal before running `npm run dev` again.
- If port `5174` is already in use, close the old Vite/frontend terminal before restarting the app.

## Features

- Full CRUD for employee records through `/employees`.
- Server-side search using SQL `LIKE` on name, employee ID, email, and department.
- Server-side sorting with whitelisted columns: `name`, `hireDate`, `salary`, and `department`.
- Server-side pagination with page switching in the employee table.
- Prepared statements for database values.
- Vue form validation for employee ID, name, email, department, position, hire date, salary, and active status.
- Loading state, error banner, active/inactive badges, responsive layout, and Malaysian Ringgit salary formatting.

## API Endpoints

- `GET /employees`
- `GET /employees?q=it`
- `GET /employees?sortBy=salary&order=desc`
- `GET /employees?page=2&pageSize=7`
- `GET /employees/:id`
- `POST /employees`
- `PUT /employees/:id`
- `DELETE /employees/:id`

## Notes

The parent `App.vue` component owns the employee array and request state. Child components receive data through props and communicate actions through emits. Axios logic is kept in `src/services/api.js` so components do not contain inline Axios calls.

Do not commit `node_modules/`, `dist/`, logs, generated report files, or temporary Word lock files.

## Sources and References

Official documentation consulted during implementation. All code was written by me; AI assistants were used only for explanations and debugging.

- Vue 3 - Composition API: https://vuejs.org/guide/introduction.html
- Vite configuration: https://vitejs.dev/config/
- Axios - instance configuration: https://axios.rest/pages/advanced/interceptors
