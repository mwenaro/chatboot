import { HfInference } from '@huggingface/inference'

// Enhanced AI service with multiple free AI providers
export class AIService {
  private hf: HfInference
  private isAvailable: boolean = true
  private hasApiKey: boolean = false

  constructor() {
    // Check for Hugging Face API key (optional, improves rate limits)
    const hfApiKey = process.env.HUGGINGFACE_API_KEY
    
    if (hfApiKey) {
      this.hf = new HfInference(hfApiKey)
      this.hasApiKey = true
      console.log('🤖 AI Service: Using Hugging Face with API key')
    } else {
      // Use free inference (limited rate but still functional)
      this.hf = new HfInference()
      console.log('🤖 AI Service: Using free Hugging Face inference')
    }
  }

  /**
   * Generate AI response using free Hugging Face models
   * Falls back to rule-based response if AI is unavailable
   */
  async generateAIResponse(
    userMessage: string, 
    resumeContent: string, 
    chatHistory: any[] = []
  ): Promise<{ response: string; isAI: boolean }> {
    try {
      // Create context from resume and chat history
      const context = this.buildContext(userMessage, resumeContent, chatHistory)
      
      // Try AI response first
      const aiResponse = await this.tryAIResponse(context, userMessage)
      
      if (aiResponse) {
        return { response: aiResponse, isAI: true }
      }
      
      // Fallback to rule-based response
      return { 
        response: this.generateRuleBasedResponse(userMessage, resumeContent, chatHistory), 
        isAI: false 
      }
      
    } catch (error) {
      console.log('AI service error, falling back to rule-based:', error)
      return { 
        response: this.generateRuleBasedResponse(userMessage, resumeContent, chatHistory), 
        isAI: false 
      }
    }
  }

  /**
   * Try to get AI response using free Hugging Face models
   */
  private async tryAIResponse(context: string, userMessage: string): Promise<string | null> {
    if (!this.isAvailable) return null

    try {
      // Use a free text generation model from Hugging Face
      const prompt = this.createPrompt(context, userMessage)
      
      // Try with different free text generation models
      const models = [
        'gpt2',
        'distilgpt2',
        'microsoft/DialoGPT-medium',
        'facebook/blenderbot-400M-distill'
      ]

      for (const model of models) {
        try {
          const response = await this.hf.textGeneration({
            model,
            inputs: prompt,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.7,
              top_p: 0.9,
              repetition_penalty: 1.1,
              return_full_text: false,
              do_sample: true
            }
          })

          if (response?.generated_text) {
            const cleaned = this.cleanAIResponse(response.generated_text)
            if (cleaned.length > 20) { // Ensure we got a meaningful response
              return cleaned
            }
          }
        } catch (modelError) {
          console.log(`Model ${model} failed, trying next...`)
          continue
        }
      }

      return null
      
    } catch (error) {
      console.log('All AI models failed:', error)
      this.isAvailable = false
      setTimeout(() => { this.isAvailable = true }, 300000) // Retry after 5 minutes
      return null
    }
  }

  /**
   * Create optimized prompt for AI models
   */
  private createPrompt(context: string, userMessage: string): string {
    const systemPrompt = `You are a professional resume assistant. Your role is to help users understand and improve their resumes. 

INSTRUCTIONS:
- Be professional, encouraging, and specific
- Use the resume context to provide personalized advice
- Keep responses concise but helpful (2-3 sentences)
- Focus on actionable insights
- If asked about skills, highlight specific technologies found in the resume
- If asked about experience, mention relevant roles and achievements
- Always be positive and constructive

RESUME CONTEXT:
${context.substring(0, 800)}

USER QUESTION: ${userMessage}

RESPONSE:`

    return systemPrompt
  }

  /**
   * Build context from resume and chat history
   */
  private buildContext(userMessage: string, resumeContent: string, chatHistory: any[]): string {
    let context = `Resume Content: ${resumeContent.substring(0, 1000)}`
    
    if (chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-3)
        .map(msg => `${msg.sender}: ${msg.text}`)
        .join('\n')
      context += `\n\nRecent Conversation:\n${recentHistory}`
    }
    
    return context
  }

  /**
   * Clean and format AI response
   */
  private cleanAIResponse(response: string): string {
    let cleaned = response.trim()
    
    // Remove common AI artifacts
    cleaned = cleaned.replace(/^(Assistant|AI|Bot|Response):\s*/i, '')
    cleaned = cleaned.replace(/\[.*?\]/g, '') // Remove square brackets
    cleaned = cleaned.replace(/Human:|User:/gi, '') // Remove conversation markers
    
    // Ensure proper formatting
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 500) + '...'
    }
    
    // Ensure it ends properly
    if (!cleaned.match(/[.!?]$/)) {
      const lastSentence = cleaned.lastIndexOf('.')
      if (lastSentence > cleaned.length - 100) {
        cleaned = cleaned.substring(0, lastSentence + 1)
      } else {
        cleaned += '.'
      }
    }
    
    return cleaned
  }

  /**
   * Enhanced rule-based response as fallback
   */
  private generateRuleBasedResponse(message: string, resumeContent: string, chatHistory: any[]): string {
    const messageLower = message.toLowerCase()
    const resumeLower = resumeContent.toLowerCase()

    // Quick skill extraction
    const commonSkills = ['javascript', 'python', 'react', 'node', 'java', 'aws', 'docker', 'git']
    const foundSkills = commonSkills.filter(skill => resumeLower.includes(skill))

    // Response patterns based on keywords
    if (messageLower.includes('skill') || messageLower.includes('technology')) {
      if (foundSkills.length > 0) {
        return `Based on your resume, I can see you have experience with ${foundSkills.slice(0, 3).join(', ')}${foundSkills.length > 3 ? ' and others' : ''}. These are valuable skills in today's market! Would you like to discuss how to highlight them effectively or explore complementary technologies?`
      }
      return "I'd love to help you identify and highlight your technical skills. Could you tell me about the main technologies, programming languages, or tools you've worked with?"
    }

    if (messageLower.includes('experience') || messageLower.includes('work') || messageLower.includes('job')) {
      const experienceKeywords = ['year', 'manager', 'developer', 'engineer', 'lead', 'senior']
      const hasExperience = experienceKeywords.some(keyword => resumeLower.includes(keyword))
      
      if (hasExperience) {
        return "Your resume shows solid professional experience! I can help you articulate your achievements and impact in previous roles. What specific aspects of your experience would you like to emphasize or discuss further?"
      }
      return "I'd like to learn more about your professional journey. What roles have you held, and what kind of impact did you make in those positions?"
    }

    if (messageLower.includes('interview') || messageLower.includes('prepare')) {
      return "Great question! For interview prep, I recommend: 1) Reviewing your resume thoroughly with specific examples, 2) Practicing the STAR method for behavioral questions, 3) Preparing thoughtful questions about the role. Would you like help formulating responses based on your specific experience?"
    }

    if (messageLower.includes('strength') || messageLower.includes('achievement')) {
      return "Your resume demonstrates your professional capabilities. The key is to quantify your achievements and show impact. What accomplishments are you most proud of, and how can we best highlight them?"
    }

    // Default encouraging response
    return "I'm here to help you make the most of your resume and career opportunities. Based on your background, you have valuable experience to offer. What specific area would you like to explore - your skills, experience, career goals, or interview preparation?"
  }

  /**
   * Check if AI service is available
   */
  isAIAvailable(): boolean {
    return this.isAvailable
  }

  /**
   * Reset AI availability (useful for retry logic)
   */
  resetAvailability(): void {
    this.isAvailable = true
  }
}

// Export singleton instance
export const aiService = new AIService()
