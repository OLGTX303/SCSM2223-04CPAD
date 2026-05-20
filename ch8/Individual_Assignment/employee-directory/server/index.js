const express = require('express')
const cors = require('cors')
require('dotenv').config()
const pool = require('./db')

const app = express()
const port = Number(process.env.PORT || 3001)

const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations']
const empIdRegex = /^EMP[0-9]{3,5}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const allowedSortColumns = {
  name: 'name',
  hireDate: 'hireDate',
  salary: 'salary',
  department: 'department'
}

app.use(cors({ origin: ['http://127.0.0.1:5174', 'http://localhost:5174'] }))
app.use(express.json())

app.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'employee-directory-api' })
})

app.get('/employees', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    const sortBy = String(req.query.sortBy || 'name')
    const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC'
    const sortColumn = allowedSortColumns[sortBy] || 'name'
    const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize || '7', 10), 1), 25)
    const offset = (page - 1) * pageSize

    let whereSql = ''
    const params = []

    if (q) {
      whereSql = ' WHERE name LIKE ? OR empId LIKE ? OR email LIKE ? OR department LIKE ?'
      const like = `%${q}%`
      params.push(like, like, like, like)
    }

    let sql = 'SELECT id, empId, name, email, department, position, hireDate, salary, active FROM employees'
    sql += whereSql
    sql += ` ORDER BY ${sortColumn} ${order}, id ASC`
    sql += ' LIMIT ? OFFSET ?'

    const [countRows] = await pool.execute(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN active = TRUE THEN 1 ELSE 0 END) AS activeTotal
       FROM employees${whereSql}`,
      params
    )
    const [rows] = await pool.execute(sql, [...params, pageSize, offset])
    const total = Number(countRows[0].total)
    const activeTotal = Number(countRows[0].activeTotal || 0)

    res.json({
      data: rows.map(normalizeEmployee),
      total,
      activeTotal,
      inactiveTotal: total - activeTotal,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1)
    })
  } catch (error) {
    handleError(res, error)
  }
})

app.get('/employees/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, empId, name, email, department, position, hireDate, salary, active FROM employees WHERE id = ?',
      [req.params.id]
    )

    if (!rows.length) return res.status(404).json({ message: 'Employee not found.' })
    res.json(normalizeEmployee(rows[0]))
  } catch (error) {
    handleError(res, error)
  }
})

app.post('/employees', async (req, res) => {
  const { valid, errors, employee } = validateEmployee(req.body)
  if (!valid) return res.status(400).json({ message: 'Validation failed.', errors })

  try {
    const [result] = await pool.execute(
      `INSERT INTO employees
        (empId, name, email, department, position, hireDate, salary, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee.empId,
        employee.name,
        employee.email,
        employee.department,
        employee.position,
        employee.hireDate,
        employee.salary,
        employee.active
      ]
    )

    const [rows] = await pool.execute(
      'SELECT id, empId, name, email, department, position, hireDate, salary, active FROM employees WHERE id = ?',
      [result.insertId]
    )
    res.status(201).json(normalizeEmployee(rows[0]))
  } catch (error) {
    handleError(res, error)
  }
})

app.put('/employees/:id', async (req, res) => {
  const { valid, errors, employee } = validateEmployee(req.body)
  if (!valid) return res.status(400).json({ message: 'Validation failed.', errors })

  try {
    const [result] = await pool.execute(
      `UPDATE employees
       SET empId = ?, name = ?, email = ?, department = ?, position = ?, hireDate = ?, salary = ?, active = ?
       WHERE id = ?`,
      [
        employee.empId,
        employee.name,
        employee.email,
        employee.department,
        employee.position,
        employee.hireDate,
        employee.salary,
        employee.active,
        req.params.id
      ]
    )

    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found.' })

    const [rows] = await pool.execute(
      'SELECT id, empId, name, email, department, position, hireDate, salary, active FROM employees WHERE id = ?',
      [req.params.id]
    )
    res.json(normalizeEmployee(rows[0]))
  } catch (error) {
    handleError(res, error)
  }
})

app.delete('/employees/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM employees WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found.' })
    res.status(204).send()
  } catch (error) {
    handleError(res, error)
  }
})

function validateEmployee(body) {
  const errors = {}
  const employee = {
    empId: String(body.empId || '').trim().toUpperCase(),
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    department: String(body.department || '').trim(),
    position: String(body.position || '').trim(),
    hireDate: String(body.hireDate || '').trim(),
    salary: Number(body.salary),
    active: Boolean(body.active)
  }

  if (!employee.empId) errors.empId = 'Employee ID is required.'
  else if (!empIdRegex.test(employee.empId)) errors.empId = 'Use EMP followed by 3 to 5 digits.'

  if (employee.name.length < 3) errors.name = 'Name must be at least 3 characters.'
  if (!emailRegex.test(employee.email)) errors.email = 'Enter a valid email address.'
  if (!departments.includes(employee.department)) errors.department = 'Select a valid department.'
  if (!employee.position) errors.position = 'Position is required.'

  const today = new Date().toISOString().slice(0, 10)
  if (!employee.hireDate) errors.hireDate = 'Hire date is required.'
  else if (employee.hireDate > today) errors.hireDate = 'Hire date cannot be in the future.'

  if (!Number.isFinite(employee.salary)) errors.salary = 'Salary must be numeric.'
  else if (employee.salary < 1500 || employee.salary > 50000) {
    errors.salary = 'Salary must be between RM1,500 and RM50,000.'
  }

  return { valid: Object.keys(errors).length === 0, errors, employee }
}

function normalizeEmployee(row) {
  return {
    ...row,
    salary: Number(row.salary),
    active: Boolean(row.active)
  }
}

function handleError(res, error) {
  if (error && error.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      message: 'Employee ID or email already exists.',
      errors: { empId: 'Employee ID must be unique.', email: 'Email must be unique.' }
    })
  }

  if (error && error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      message: 'Database connection failed. Start Laragon MySQL and confirm it is listening on port 3306.'
    })
  }

  console.error(error)
  res.status(500).json({ message: 'Server error. Please try again later.' })
}

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Employee Directory API running at http://127.0.0.1:${port}`)
})

server.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
