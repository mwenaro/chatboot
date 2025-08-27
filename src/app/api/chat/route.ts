import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/utils/rateLimit";
import { sanitizeInput } from "@/utils/validation";
import { enhancedAIService } from "@/services/enhancedAIService";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  resumeContent: string;
  chatHistory: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit (10 requests per minute)
    if (!checkRateLimit(clientIP, 10, 60000)) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait before sending another message.",
        },
        { status: 429 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, resumeContent, chatHistory } = body;

    // Validate and sanitize input
    if (!message || !resumeContent) {
      return NextResponse.json(
        { error: "Message and resume content are required" },
        { status: 400 }
      );
    }

    const sanitizedMessage = sanitizeInput(message);
    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        { error: "Invalid message content" },
        { status: 400 }
      );
    }

    // Check message length
    if (sanitizedMessage.length > 1000) {
      return NextResponse.json(
        {
          error:
            "Message too long. Please keep messages under 1000 characters.",
        },
        { status: 400 }
      );
    }

    // Generate AI-powered response with enhanced service (OpenAI + Hugging Face + Rule-based)
    const aiResponse = await enhancedAIService.generateResponse(
      sanitizedMessage,
      resumeContent,
      chatHistory || []
    );
    const res = {
      success: true,
      response: aiResponse.text,
      isAI: aiResponse.isAI,
      provider: aiResponse.provider,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(res);
  } catch (error) {
    console.error("Chat API error:", error);

    // More specific error handling
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while processing your message" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
