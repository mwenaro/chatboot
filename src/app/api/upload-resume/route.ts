import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { validateFileType, validateResumeContent } from '@/utils/validation'
import { checkRateLimit } from '@/utils/rateLimit'

// File interface for processing
interface FileData {
  name: string
  type: string
  size: number
  buffer: Buffer
}

// Helper function to extract text from different file types
async function extractTextFromFile(file: FileData): Promise<string> {
  const { type, buffer } = file

  switch (type) {
    case 'application/pdf':
      try {
        const pdfData = await pdf(buffer)
        return pdfData.text
      } catch (error) {
        throw new Error('Failed to parse PDF file')
      }

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      try {
        const result = await mammoth.extractRawText({ buffer })
        return result.value
      } catch (error) {
        throw new Error('Failed to parse DOCX file')
      }

    case 'application/msword':
      throw new Error('Legacy DOC files are not supported. Please convert to DOCX or PDF.')

    case 'text/plain':
      return buffer.toString('utf-8')

    default:
      throw new Error('Unsupported file type')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Check rate limit (3 uploads per minute)
    if (!checkRateLimit(clientIP, 3, 60000)) {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Convert NextRequest to a format compatible with multer
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file before processing
    const fileValidation = validateFileType(file)
    if (!fileValidation.isValid) {
      return NextResponse.json(
        { error: fileValidation.errors.join(', ') },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Create a file data object
    const fileData: FileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: buffer
    }

    // Extract text from the file
    const extractedText = await extractTextFromFile(fileData)

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content found in the uploaded file' },
        { status: 400 }
      )
    }

    // Validate resume content
    const contentValidation = validateResumeContent(extractedText)
    if (!contentValidation.isValid) {
      return NextResponse.json(
        { error: contentValidation.errors.join(', ') },
        { status: 400 }
      )
    }

    // Return the extracted content with validation warnings
    return NextResponse.json({
      success: true,
      content: extractedText,
      filename: file.name,
      size: file.size,
      type: file.type,
      warnings: fileValidation.warnings.concat(contentValidation.warnings)
    })

  } catch (error) {
    console.error('File upload error:', error)
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('PDF')) {
        return NextResponse.json(
          { error: 'PDF file appears to be corrupted or password protected. Please try a different file.' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('DOCX') || error.message.includes('DOC')) {
        return NextResponse.json(
          { error: 'Word document could not be processed. Please try converting to PDF or plain text.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the file' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
