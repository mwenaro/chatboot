// Rate limiting utility for API endpoints

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitStore: RateLimitStore = {}

export function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  Object.keys(rateLimitStore).forEach(k => {
    if (rateLimitStore[k].resetTime < now) {
      delete rateLimitStore[k]
    }
  })

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs
    }
    return true
  }

  if (rateLimitStore[key].resetTime < now) {
    // Reset the window
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs
    }
    return true
  }

  if (rateLimitStore[key].count >= limit) {
    return false
  }

  rateLimitStore[key].count++
  return true
}

export function getRemainingRequests(identifier: string, limit: number = 10): number {
  const entry = rateLimitStore[identifier]
  if (!entry || entry.resetTime < Date.now()) {
    return limit
  }
  return Math.max(0, limit - entry.count)
}

export function getResetTime(identifier: string): number {
  const entry = rateLimitStore[identifier]
  if (!entry || entry.resetTime < Date.now()) {
    return 0
  }
  return entry.resetTime
}
