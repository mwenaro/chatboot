import ResumeChatbot from '@/components/ResumeChatbot'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Resume Chatbot
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your resume and ask me anything about your career journey. 
            I'll help you explore your experience, skills, and achievements.
          </p>
        </div>
        <ResumeChatbot />
      </div>
    </main>
  )
}