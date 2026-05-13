import axios from 'axios'
// 1. Pre-configured Axios instance
const apiClient = axios.create({
 baseURL: 'http://localhost:3000',
 timeout: 5000,
 headers: {
 'Content-Type': 'application/json',
 Accept: 'application/json'
 }
})
// 2. Request interceptor — runs before every outgoing request
apiClient.interceptors.request.use(
 (config) => {
 console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
 return config
 },
 (error) => Promise.reject(error)
)
// 3. Response interceptor — runs on every response
apiClient.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response) {
 console.error(`[API ERROR] ${error.response.status} -
${error.response.statusText}`)
 } else if (error.request) {
 console.error('[API ERROR] No response from server (is the API running?)')
 } else {
 console.error('[API ERROR]', error.message)
 }
 return Promise.reject(error)
 }
)
// 4. CRUD helpers
export const getStudents = (params = {}) =>
 apiClient.get('/students', { params })
export const getStudent = (id) => apiClient.get(`/students/${id}`)
export const createStudent = (s) => apiClient.post('/students', s)
export const updateStudent = (id, s) => apiClient.put(`/students/${id}`, s)
export const deleteStudent = (id) => apiClient.delete(`/students/${id}`)
export default apiClient