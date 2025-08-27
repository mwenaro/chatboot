// Validation utilities for the chatbot

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateResumeContent(content: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check minimum content length
  if (content.length < 100) {
    errors.push('Resume content appears to be too short. Please ensure the file was uploaded correctly.')
  }

  // Check for common resume sections
  const sections = ['experience', 'education', 'skills', 'work', 'employment']
  const hasResumeSection = sections.some(section => 
    content.toLowerCase().includes(section)
  )

  if (!hasResumeSection) {
    warnings.push('Resume may be missing standard sections (Experience, Education, Skills). Consider adding these sections for better analysis.')
  }

  // Check for contact information
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/
  const phoneRegex = /[\+]?[\d\s\(\)\-]{10,}/
  
  if (!emailRegex.test(content)) {
    warnings.push('No email address found. Consider adding contact information.')
  }

  if (!phoneRegex.test(content)) {
    warnings.push('No phone number found. Consider adding contact information.')
  }

  // Check for dates (experience timeline)
  const dateRegex = /\b(19|20)\d{2}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(19|20)\d{2}\b/i
  
  if (!dateRegex.test(content)) {
    warnings.push('No dates found. Consider adding dates to your experience and education sections.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function validateFileType(file: File): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ]

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not supported. Please use PDF, DOC, DOCX, or TXT files.`)
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB limit.`)
  }

  if (file.size < 1024) { // Less than 1KB
    warnings.push('File appears to be very small. Please ensure it contains your complete resume.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function sanitizeInput(input: string): string {
  // Remove potentially harmful content while preserving formatting
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .substring(0, 1000) // Limit input length
}
