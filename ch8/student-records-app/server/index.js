const express = require('express')
const cors = require('cors')
const pool = require('./db')

const app = express()
const allowedFields = ['matricNo', 'name', 'course', 'faculty', 'gpa', 'email', 'year', 'active']
const matricRegex = /^[A-Z][0-9]{2}[A-Z]{2}[0-9]{4}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

app.use(cors())
app.use(express.json())

function validateStudent(body, partial = false) {
 const errors = {}
 const has = (field) => Object.prototype.hasOwnProperty.call(body, field)
 const required = (field) => !partial || has(field)

 if (required('matricNo')) {
 const matricNo = String(body.matricNo || '').trim().toUpperCase()
 if (!matricNo) errors.matricNo = 'Matric number is required.'
 else if (!matricRegex.test(matricNo)) errors.matricNo = 'Format: A21CS0001'
 }

 if (required('name')) {
 const name = String(body.name || '').trim()
 if (name.length < 3) errors.name = 'Name must be at least 3 characters.'
 }

 if (required('course') && !String(body.course || '').trim()) {
 errors.course = 'Course is required.'
 }

 if (required('faculty') && !String(body.faculty || '').trim()) {
 errors.faculty = 'Faculty is required.'
 }

 if (required('email')) {
 const email = String(body.email || '').trim()
 if (!emailRegex.test(email)) errors.email = 'Please enter a valid email address.'
 }

 if (required('gpa')) {
 const gpa = Number(body.gpa)
 if (Number.isNaN(gpa) || gpa < 0 || gpa > 4) errors.gpa = 'Must be 0-4'
 }

 if (required('year')) {
 const year = Number(body.year)
 if (!Number.isInteger(year) || year < 1 || year > 6) errors.year = 'Must be between 1 and 6'
 }

 if (has('active') && typeof body.active !== 'boolean' && body.active !== 0 && body.active !== 1) {
 errors.active = 'Must be true or false.'
 }

 return errors
}

function normalizeStudent(body) {
 return {
 matricNo: String(body.matricNo || '').trim().toUpperCase(),
 name: String(body.name || '').trim(),
 course: String(body.course || '').trim(),
 faculty: String(body.faculty || '').trim(),
 gpa: Number(body.gpa),
 email: String(body.email || '').trim(),
 year: Number(body.year),
 active: body.active ? 1 : 0
 }
}

async function findDuplicateEmail(email, currentId = null) {
 if (!email) return false
 const params = [email]
 let sql = 'SELECT id FROM students WHERE email = ?'
 if (currentId) {
 sql += ' AND id <> ?'
 params.push(currentId)
 }
 const [rows] = await pool.query(sql, params)
 return rows.length > 0
}

app.get('/', (req, res) => res.json({ status: 'ok' }))

app.get('/students', async (req, res) => {
 try {
 const { q, sortBy, order } = req.query
 const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
 const size = Math.min(Math.max(Number.parseInt(req.query.size, 10) || 10, 1), 50)
 const offset = (page - 1) * size
 const params = []
 const where = []

 if (q) {
 where.push(`(name LIKE ?
 OR matricNo LIKE ?
 OR email LIKE ?
 OR course LIKE ?)`)
 const like = `%${q}%`
 params.push(like, like, like, like)
 }

 const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : ''
 const allowedSort = ['id', 'name', 'matricNo', 'gpa', 'year']
 const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'id'
 const direction = order === 'desc' ? 'DESC' : 'ASC'

 const [rows] = await pool.query(
 `SELECT * FROM students${whereSql} ORDER BY ${sortColumn} ${direction} LIMIT ? OFFSET ?`,
 [...params, size, offset]
 )
 const [countRows] = await pool.query(
 `SELECT COUNT(*) AS total FROM students${whereSql}`,
 params
 )

 res.json({ data: rows, total: countRows[0].total, page, size })
 } catch (err) {
 console.error(err)
 res.status(500).json({ error: 'Database error' })
 }
})

app.get('/students/:id', async (req, res) => {
 try {
 const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id])
 if (!rows.length) return res.status(404).json({ error: 'Not found' })
 res.json(rows[0])
 } catch (err) {
 res.status(500).json({ error: 'Database error' })
 }
})

app.post('/students', async (req, res) => {
 try {
 const errors = validateStudent(req.body)
 if (Object.keys(errors).length) return res.status(400).json({ errors })
 if (await findDuplicateEmail(String(req.body.email || '').trim())) {
 errors.email = 'Email already exists.'
 }
 if (Object.keys(errors).length) return res.status(400).json({ errors })

 const student = normalizeStudent(req.body)
 const [r] = await pool.query(
 `INSERT INTO students
 (matricNo, name, course, faculty, gpa, email, year, active)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
 [student.matricNo, student.name, student.course, student.faculty, student.gpa,
 student.email, student.year, student.active]
 )
 res.status(201).json({ id: r.insertId, ...student, active: Boolean(student.active) })
 } catch (err) {
 if (err.code === 'ER_DUP_ENTRY') {
 return res.status(400).json({ errors: { matricNo: 'Matric number already exists.' } })
 }
 console.error(err)
 res.status(500).json({ error: 'Database error' })
 }
})

app.put('/students/:id', async (req, res) => {
 try {
 const errors = validateStudent(req.body)
 if (Object.keys(errors).length) return res.status(400).json({ errors })
 if (await findDuplicateEmail(String(req.body.email || '').trim(), req.params.id)) {
 errors.email = 'Email already exists.'
 }
 if (Object.keys(errors).length) return res.status(400).json({ errors })

 const student = normalizeStudent(req.body)
 const [r] = await pool.query(
 `UPDATE students SET
 matricNo=?, name=?, course=?, faculty=?,
 gpa=?, email=?, year=?, active=?
 WHERE id=?`,
 [student.matricNo, student.name, student.course, student.faculty, student.gpa,
 student.email, student.year, student.active, req.params.id]
 )
 if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
 res.json({ id: Number(req.params.id), ...student, active: Boolean(student.active) })
 } catch (err) {
 if (err.code === 'ER_DUP_ENTRY') {
 return res.status(400).json({ errors: { matricNo: 'Matric number already exists.' } })
 }
 res.status(500).json({ error: 'Database error' })
 }
})

app.patch('/students/:id', async (req, res) => {
 try {
 const entries = Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
 if (!entries.length) return res.status(400).json({ errors: { form: 'No valid fields to update.' } })

 const errors = validateStudent(Object.fromEntries(entries), true)
 if (Object.keys(errors).length) return res.status(400).json({ errors })
 if (entries.some(([key]) => key === 'email') &&
 await findDuplicateEmail(String(req.body.email || '').trim(), req.params.id)) {
 errors.email = 'Email already exists.'
 }
 if (Object.keys(errors).length) return res.status(400).json({ errors })

 const setClause = entries.map(([key]) => `${key}=?`).join(', ')
 const params = entries.map(([key, value]) => {
 if (key === 'matricNo') return String(value).trim().toUpperCase()
 if (['name', 'course', 'faculty', 'email'].includes(key)) return String(value).trim()
 if (['gpa', 'year'].includes(key)) return Number(value)
 if (key === 'active') return value ? 1 : 0
 return value
 })
 const [r] = await pool.query(`UPDATE students SET ${setClause} WHERE id=?`, [...params, req.params.id])
 if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })

 const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id])
 res.json(rows[0])
 } catch (err) {
 if (err.code === 'ER_DUP_ENTRY') {
 return res.status(400).json({ errors: { matricNo: 'Matric number already exists.' } })
 }
 console.error(err)
 res.status(500).json({ error: 'Database error' })
 }
})

app.delete('/students/:id', async (req, res) => {
 try {
 const [r] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id])
 if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
 res.json({ deleted: true })
 } catch (err) {
 res.status(500).json({ error: 'Database error' })
 }
})

const PORT = 3000
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`))
