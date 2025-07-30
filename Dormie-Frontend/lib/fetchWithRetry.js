// Fetch with retry utility for Docker environment issues
export const fetchWithRetry = async (url, options = {}, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt}/${maxRetries} to:`, url)
      const response = await fetch(url, options)
      
      if (response.ok) {
        console.log(`✅ Fetch successful on attempt ${attempt}`)
        return response
      }
      
      // If it's a server error (5xx) or network error, retry
      if (response.status >= 500 || response.status === 0) {
        console.log(`⚠️ Server error ${response.status} on attempt ${attempt}, retrying...`)
        if (attempt === maxRetries) {
          return response // Return the last failed response
        }
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
        continue
      }
      
      // For client errors (4xx), don't retry
      console.log(`❌ Client error ${response.status}, not retrying`)
      return response
      
    } catch (error) {
      console.log(`❌ Network error on attempt ${attempt}:`, error.message)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}
