// Enhanced AI Service with OpenAI and Hugging Face support
import { HfInference } from '@huggingface/inference'
import OpenAI from 'openai'

interface AIResponse {
  text: string
  isAI: boolean
  provider: string
  error?: string
}

export class EnhancedAIService {
  private hf: HfInference | null = null
  private openai: OpenAI | null = null
  private isAvailable: boolean = true

  constructor() {
    // Initialize OpenAI (premium, best quality)
    // if (process.env.OPENAI_API_KEY) {
    //   this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    //   console.log('🚀 AI Service: OpenAI initialized')
    // }

    // Initialize Hugging Face (free tier backup)
    if (process.env.HUGGINGFACE_API_KEY) {
      this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY)
      console.log('🤖 AI Service: Hugging Face initialized with API key')
      console.log('ℹ️ Note: Free tier has limited model availability')
    } else {
      console.log('⚠️ No Hugging Face API key found')
    }

    if (!this.openai && !this.hf) {
      console.log('⚠️ AI Service: No API keys found, using enhanced rule-based responses only')
    } else {
      console.log('💡 AI Service: Will try AI first, then fall back to intelligent rule-based responses')
    }
  }

  /**
   * Generate AI response with fallback chain: OpenAI -> Hugging Face -> Rule-based
   */
  async generateResponse(
    userMessage: string, 
    resumeContent: string, 
    chatHistory: any[] = []
  ): Promise<AIResponse> {
    try {
      // Try OpenAI first (best quality)
      if (this.openai) {
        const openaiResponse = await this.tryOpenAI(userMessage, resumeContent, chatHistory)
        if (openaiResponse) {
          return {
            text: openaiResponse,
            isAI: true,
            provider: 'OpenAI GPT-3.5'
          }
        }
      }

      // Fallback to Hugging Face (free)
      if (this.hf) {
        const hfResponse = await this.tryHuggingFace(userMessage, resumeContent, chatHistory)
        if (hfResponse) {
          return {
            text: hfResponse,
            isAI: true,
            provider: 'Hugging Face (Free)'
          }
        }
      }

      // Final fallback to rule-based
      return {
        text: this.generateRuleBasedResponse(userMessage, resumeContent, chatHistory),
        isAI: false,
        provider: 'Rule-based'
      }

    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        text: this.generateRuleBasedResponse(userMessage, resumeContent, chatHistory),
        isAI: false,
        provider: 'Rule-based (error fallback)',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Try OpenAI GPT-3.5 (your paid API key)
   */
  private async tryOpenAI(userMessage: string, resumeContent: string, chatHistory: any[]): Promise<string | null> {
    if (!this.openai) return null

    try {
      const systemPrompt = `You are a professional career advisor analyzing a resume. Provide specific, actionable advice based on the resume content. Be encouraging, professional, and concise.

Key guidelines:
- Focus on the resume content provided
- Give specific examples when possible
- Be encouraging but realistic
- Keep responses 2-3 paragraphs maximum
- If discussing skills, categorize them (languages, frameworks, tools, etc.)
- If discussing experience, highlight achievements and impact

Resume Content:
${resumeContent.substring(0, 2000)}`

      const recentHistory = chatHistory.slice(-3).map(msg => 
        `${msg.sender}: ${msg.text}`
      ).join('\n')

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...(recentHistory ? [{ role: 'user' as const, content: `Previous context: ${recentHistory}` }] : []),
        { role: 'user' as const, content: userMessage }
      ]

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
      })

      return completion.choices[0]?.message?.content || null

    } catch (error) {
      console.log('OpenAI failed:', error)
      return null
    }
  }

  /**
   * Try Hugging Face free models (your free API key)
   */
  private async tryHuggingFace(userMessage: string, resumeContent: string, chatHistory: any[]): Promise<string | null> {
    if (!this.hf) return null

    try {
      console.log('🔍 Checking available Hugging Face models...')
      
      // Since most models aren't available for inference, let's try a different approach
      // Use the inference endpoint without specifying a model (uses default)
      const prompt = `Resume Analysis Request:

Question: ${userMessage}
Resume Context: ${resumeContent.substring(0, 400)}

Professional Career Advice:`

      try {
        // Try using the default model without specifying one
        console.log('Trying default Hugging Face inference...')
        const response = await this.hf.textGeneration({
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true
          }
        })

        console.log('Hugging Face default response:', response)

        if (response?.generated_text) {
          const cleaned = this.cleanResponse(response.generated_text)
          console.log('Cleaned response:', cleaned)
          if (cleaned.length > 30) {
            return cleaned
          }
        }
      } catch (defaultError) {
        console.log('Default model failed:', defaultError)
      }

      // If that fails, try the summarization task instead (more likely to be available)
      try {
        console.log('Trying summarization as alternative...')
        const summaryResponse = await this.hf.summarization({
          inputs: `Career advice request: ${userMessage}. Resume context: ${resumeContent.substring(0, 500)}`,
          parameters: {
            max_length: 150,
            min_length: 30
          }
        })

        if (summaryResponse?.summary_text) {
          return `Based on your resume: ${summaryResponse.summary_text}`
        }
      } catch (summaryError) {
        console.log('Summarization also failed:', summaryError)
      }

      return null

    } catch (error) {
      console.log('Hugging Face completely failed:', error)
      return null
    }
  }

  /**
   * Clean AI response
   */
  private cleanResponse(response: string): string {
    let cleaned = response.trim()
    
    // Remove common prefixes
    cleaned = cleaned.replace(/^(Career Advisor|Assistant|AI|Bot|Response):\s*/i, '')
    cleaned = cleaned.replace(/^(Human|User|Question):\s*/gi, '')
    
    // Remove conversation artifacts
    cleaned = cleaned.replace(/\[.*?\]/g, '')
    cleaned = cleaned.replace(/\<.*?\>/g, '')
    cleaned = cleaned.replace(/^\s*[-•]\s*/, '') // Remove bullet points at start
    
    // Remove incomplete sentences at the end
    if (cleaned.length > 300) {
      cleaned = cleaned.substring(0, 300)
      const lastPeriod = cleaned.lastIndexOf('.')
      const lastQuestion = cleaned.lastIndexOf('?')
      const lastExclamation = cleaned.lastIndexOf('!')
      
      const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation)
      
      if (lastSentenceEnd > 200) {
        cleaned = cleaned.substring(0, lastSentenceEnd + 1)
      } else {
        cleaned += '...'
      }
    }
    
    // Ensure it's a meaningful response
    if (cleaned.length < 20 || cleaned.includes('undefined') || cleaned.includes('null')) {
      return ''
    }
    
    return cleaned
  }

  /**
   * Enhanced rule-based fallback
   */
  private generateRuleBasedResponse(message: string, resumeContent: string, chatHistory: any[]): string {
    const messageLower = message.toLowerCase()
    const resumeLower = resumeContent.toLowerCase()

    // Extract information for personalized responses
    const extractSkills = () => {
      const skills = ['javascript', 'typescript', 'python', 'java', 'react', 'node', 'aws', 'docker', 'git', 'sql']
      return skills.filter(skill => resumeLower.includes(skill))
    }

    const extractExperience = () => {
      const expPatterns = ['year', 'senior', 'lead', 'manager', 'director', 'developer', 'engineer']
      return expPatterns.some(pattern => resumeLower.includes(pattern))
    }

    // Skill-related questions
    if (messageLower.includes('skill') || messageLower.includes('technology')) {
      const skills = extractSkills()
      if (skills.length > 0) {
        return `🔧 Based on your resume, I can see you have experience with ${skills.slice(0, 4).join(', ')}${skills.length > 4 ? ' and more' : ''}. These are in-demand technologies! 

💡 To strengthen your profile, consider:
• Adding specific projects showcasing these skills
• Quantifying your impact (e.g., "Improved performance by 30%")
• Learning complementary technologies in your stack

Which specific skill would you like to discuss in more detail?`
      }
      return "I'd love to help identify your technical strengths! Could you tell me about the programming languages, frameworks, or tools you've worked with? Even if they're not clearly listed, I can help you articulate your technical experience."
    }

    // Experience questions
    if (messageLower.includes('experience') || messageLower.includes('work') || messageLower.includes('career')) {
      if (extractExperience()) {
        return `👔 Your resume shows solid professional experience! Here's how to make it shine:

🎯 **Highlight Impact**: Use numbers and metrics where possible
📈 **Show Growth**: Demonstrate progression and increased responsibilities  
🔄 **Focus on Results**: What problems did you solve? What value did you create?

What specific role or achievement would you like to emphasize for your target position?`
      }
      return "Every experience counts! Whether it's internships, projects, freelance work, or volunteer experience, I can help you present your background effectively. What work experience do you have that you'd like to highlight?"
    }

    // Interview prep
    if (messageLower.includes('interview')) {
      return `🎯 **Interview Prep Strategy**:

**Before the Interview**:
• Research the company and role thoroughly
• Prepare 3-4 specific examples using the STAR method
• Practice explaining your technical decisions

**During the Interview**:
• Ask thoughtful questions about challenges and growth
• Connect your experience to their needs
• Show enthusiasm and cultural fit

**Questions to Prepare**: "Tell me about yourself," "Why this role?" and "Describe a challenge you overcame."

Which aspect of interview prep would you like to focus on?`
    }

    // Default helpful response
    return `🌟 I'm here to help you succeed! Based on your background, you have valuable experience to offer employers.

**I can help you with**:
• 🔧 Identifying and highlighting your key skills
• 💼 Articulating your work experience effectively  
• 🎯 Preparing for interviews and common questions
• 📈 Suggesting areas for professional growth
• ✨ Optimizing how you present your achievements

What would you like to focus on first? Your technical skills, work experience, or career goals?`
  }
}

// Export singleton instance
export const enhancedAIService = new EnhancedAIService()
