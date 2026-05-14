import axios from 'axios'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Inject auth token on every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('aimes_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Unauthorized → redirect to login
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('aimes_token')
      localStorage.removeItem('aimes_user')
      window.location.href = '/scheduling/login'
    }
    return Promise.reject(error)
  },
)

export default http
