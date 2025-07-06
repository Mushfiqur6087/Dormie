// API configuration for different environments
const getApiBaseUrl = () => {
  // In production, use relative URLs (nginx will proxy to backend)
  if (process.env.NODE_ENV === 'production') {
    return ''
  }
  // In development, use localhost
  return 'http://localhost:8080'
}

export const API_BASE_URL = getApiBaseUrl()
export const UPLOADS_BASE_URL = `${API_BASE_URL}/uploads`
