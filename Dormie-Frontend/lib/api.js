// API configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in browser and have window object
  if (typeof window !== 'undefined') {
    console.log('🔍 API Configuration Debug:')
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    console.log('- window.location.hostname:', window.location.hostname)
    console.log('- window.location.origin:', window.location.origin)
  }
  
  // In production, use relative URLs (nginx will proxy to backend)
  if (process.env.NODE_ENV === 'production') {
    console.log('📡 Using production config: relative URLs')
    return ''
  }
  
  // In development, use localhost
  console.log('📡 Using development config: localhost:8080')
  return 'http://localhost:8080'
}

export const API_BASE_URL = getApiBaseUrl()
export const UPLOADS_BASE_URL = `${API_BASE_URL}/uploads`

// Helper function to create API URLs
export const createApiUrl = (endpoint) => {
  const fullUrl = `${API_BASE_URL}${endpoint}`
  console.log(`🌐 createApiUrl: "${endpoint}" -> "${fullUrl}"`)
  return fullUrl
}

// Helper function for upload URLs  
export const createUploadUrl = (filename) => {
  const fullUrl = `${UPLOADS_BASE_URL}/${filename}`
  console.log(`📁 createUploadUrl: "${filename}" -> "${fullUrl}"`)
  return fullUrl
}
