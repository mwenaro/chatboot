'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Upload, FileText, Bot, User, MessageSquare, Brain, Trophy, GraduationCap, Settings } from 'lucide-react'
import SettingsPanel from './SettingsPanel'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

// Conversation starters
const conversationStarters = [
  { icon: Brain, text: "What are my key technical skills?", category: "Skills" },
  { icon: Trophy, text: "Tell me about my achievements", category: "Experience" },
  { icon: GraduationCap, text: "How can I improve my resume?", category: "Growth" },
  { icon: MessageSquare, text: "Prepare me for interviews", category: "Interview" }
]

export default function ResumeChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [resumeContent, setResumeContent] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsLoading(true)
      setUploadProgress(0)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        setResumeContent(data.content)
        setResumeUploaded(true)
        
        // Add enhanced welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: `Perfect! I've successfully analyzed your resume (${data.filename}). I can now help you with:\n\n• Exploring your technical skills and experience\n• Identifying key achievements and strengths\n• Preparing for interviews\n• Suggesting areas for professional growth\n• Optimizing your resume presentation\n\nWhat would you like to discuss first?`,
          sender: 'bot',
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
        
        // Show warnings if any
        if (data.warnings && data.warnings.length > 0) {
          setTimeout(() => {
            const warningMessage: Message = {
              id: Date.now().toString() + '_warning',
              text: `📝 **Suggestions for your resume:**\n${data.warnings.map((w: string) => `• ${w}`).join('\n')}`,
              sender: 'bot',
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, warningMessage])
          }, 1000)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload resume')
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert(`Failed to upload resume: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !resumeUploaded || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          resumeContent,
          chatHistory: messages,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: Date.now().toString() + '_bot',
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleStarterClick = (starterText: string) => {
    if (isLoading) return
    setInput(starterText)
    // Auto-send the message
    setTimeout(() => {
      const event = {
        target: { value: starterText }
      } as React.ChangeEvent<HTMLTextAreaElement>
      setInput(starterText)
      setTimeout(() => sendMessage(), 100)
    }, 50)
  }

  const handleClearChat = () => {
    setMessages([])
    setShowSettings(false)
  }

  const handleExportChat = () => {
    const chatText = messages
      .map(msg => `[${msg.timestamp.toLocaleString()}] ${msg.sender.toUpperCase()}: ${msg.text}`)
      .join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-chat-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowSettings(false)
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot size={32} />
            <div>
              <h2 className="text-xl font-semibold">Career Assistant</h2>
              <p className="text-blue-100">
                {resumeUploaded ? 'Ready to chat about your resume!' : 'Upload your resume to get started'}
              </p>
            </div>
          </div>
          
          {resumeUploaded && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      {!resumeUploaded && (
        <div className="p-8 text-center border-b border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <FileText size={48} className="mx-auto text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Upload Your Resume
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Supported formats: PDF, TXT, DOC, DOCX (Max 10MB)
          </p>
          
          {isLoading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Uploading and analyzing... {uploadProgress}%</p>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Upload size={20} />
            <span>{isLoading ? 'Processing...' : 'Choose Resume File'}</span>
          </button>
        </div>
      )}

      {/* Chat Messages */}
      {resumeUploaded && (
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {/* Conversation Starters - Show only when no messages */}
          {messages.length <= 1 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Questions to Get Started:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conversationStarters.map((starter, index) => {
                  const IconComponent = starter.icon
                  return (
                    <button
                      key={index}
                      onClick={() => handleStarterClick(starter.text)}
                      disabled={isLoading}
                      className="flex items-center space-x-2 p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      <IconComponent size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-gray-300">{starter.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                >
                  {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {/* Render formatted text for bot messages */}
                    {message.sender === 'bot' ? (
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html: message.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/• /g, '• ')
                            .replace(/(\d+\.)/g, '<strong>$1</strong>')
                            .replace(/([🔧⚡💾☁️📧📱💼💻📅👔🏆📝])/g, '$1')
                        }}
                      />
                    ) : (
                      <p>{message.text}</p>
                    )}
                  </div>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Section */}
      {resumeUploaded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your career, skills, experience..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-3 rounded-lg transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      )}
      
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    </div>
  )
}
