// server/index.js
const express = require('express')
const cors = require('cors')
const pool = require('./db')
const app = express()
app.use(cors()) // allow requests from http://localhost:5173
app.use(express.json()) // parse application/json request bodies
// --- Health check ---
app.get('/', (req, res) => res.json({ status: 'ok' }))
// --- READ list (with optional search & sort) ---
app.get('/students', async (req, res) => {
 try {
 const { q, sortBy, order } = req.query
 let sql = 'SELECT * FROM students'
 const params = []
 if (q) {
 sql += ` WHERE name LIKE ?
 OR matricNo LIKE ?
 OR email LIKE ?
 OR course LIKE ?`
 const like = `%${q}%`
 params.push(like, like, like, like)
 }
 const allowedSort = ['name', 'matricNo', 'gpa', 'year']
 if (sortBy && allowedSort.includes(sortBy)) {
 const direction = order === 'desc' ? 'DESC' : 'ASC'
 sql += ` ORDER BY ${sortBy} ${direction}`
 }
 const [rows] = await pool.query(sql, params)
 res.json(rows)
 } catch (err) {
 console.error(err)
 res.status(500).json({ error: 'Database error' })
 }
})
// --- READ single ---
app.get('/students/:id', async (req, res) => {
 try {
 const [rows] = await pool.query(
 'SELECT * FROM students WHERE id = ?', [req.params.id])
 if (!rows.length) return res.status(404).json({ error: 'Not found' })
 res.json(rows[0])
 } catch (err) {
 res.status(500).json({ error: 'Database error' })
 }
})
// --- CREATE ---
app.post('/students', async (req, res) => {
 try {
 const { matricNo, name, course, faculty, gpa, email, year, active } = req.body
 const [r] = await pool.query(
 `INSERT INTO students
 (matricNo, name, course, faculty, gpa, email, year, active)VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
 [matricNo, name, course, faculty, gpa, email, year, active ? 1 : 0]
 )
 res.status(201).json({ id: r.insertId, ...req.body })
 } catch (err) {
 if (err.code === 'ER_DUP_ENTRY') {
 return res.status(409).json({ error: 'Matric number already exists' })
 }
 console.error(err)
 res.status(500).json({ error: 'Database error' })
 }
})
// --- UPDATE ---
app.put('/students/:id', async (req, res) => {
 try {
 const { matricNo, name, course, faculty, gpa, email, year, active } = req.body
 const [r] = await pool.query(
 `UPDATE students SET
 matricNo=?, name=?, course=?, faculty=?,
 gpa=?, email=?, year=?, active=?
 WHERE id=?`,
 [matricNo, name, course, faculty, gpa, email, year,
 active ? 1 : 0, req.params.id]
 )
 if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
 res.json({ id: Number(req.params.id), ...req.body })
 } catch (err) {
 res.status(500).json({ error: 'Database error' })
 }
})
// --- DELETE ---
app.delete('/students/:id', async (req, res) => {
 try {
 const [r] = await pool.query(
 'DELETE FROM students WHERE id = ?', [req.params.id])
 if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
 res.json({ deleted: true })
 } catch (err) {
 res.status(500).json({ error: 'Database error' })
 }
})
const PORT = 3000
app.listen(PORT, () =>
 console.log(`API running at http://localhost:${PORT}`))