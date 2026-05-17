import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:3001',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const method = (config.method || 'GET').toUpperCase()
  console.log(`[api] ${method} ${config.url}`)
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : 'Unable to reach the server. Check that the API is running.')

    return Promise.reject({
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors || {}
    })
  }
)

export async function fetchEmployees(params = {}) {
  const { data } = await api.get('/employees', { params })
  return data
}

export async function createEmployee(employee) {
  const { data } = await api.post('/employees', employee)
  return data
}

export async function updateEmployee(id, employee) {
  const { data } = await api.put(`/employees/${id}`, employee)
  return data
}

export async function deleteEmployee(id) {
  await api.delete(`/employees/${id}`)
}
