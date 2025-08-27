# Resume Chatbot - Enhanced AI Career Assistant

An intelligent chatbot application that analyzes resumes and provides personalized career guidance, interview preparation, and professional development insights.

## 🚀 Features

### Core Functionality
- **Smart Resume Analysis**: Upload and parse PDF, DOC, DOCX, and TXT resume files
- **AI-Powered Conversations**: Get insights about your skills, experience, and career path
- **Interview Preparation**: Practice answers and get tailored advice
- **Career Guidance**: Receive suggestions for professional growth and skill development

### Enhanced Features (Recent Improvements)
- **Advanced Response Generation**: Categorized skill analysis with emojis and formatting
- **Conversation Starters**: Quick-access buttons for common questions
- **Progress Indicators**: Visual upload progress and loading states
- **Settings Panel**: Export chat history, clear conversations, toggle dark mode
- **Rate Limiting**: API protection against excessive requests
- **Input Validation**: Comprehensive file and message validation
- **Error Handling**: Detailed error messages and recovery options
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Technical Improvements
- **Enhanced AI Logic**: Better pattern recognition for skills, experience, and education
- **Contact Information Extraction**: Automatic detection of email, phone, LinkedIn, GitHub
- **Achievement Highlighting**: Identifies and emphasizes key accomplishments
- **Content Validation**: Ensures uploaded resumes contain meaningful data
- **Security Features**: Input sanitization and rate limiting

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **File Processing**: pdf-parse, mammoth (for DOCX)
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatboot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started
1. **Upload Your Resume**: Click "Choose Resume File" and select your resume (PDF, DOC, DOCX, or TXT)
2. **Wait for Analysis**: The system will extract and analyze your resume content
3. **Start Chatting**: Use conversation starters or ask specific questions about your career

### Conversation Examples
- "What are my key technical skills?"
- "Tell me about my achievements"
- "How can I improve my resume?"
- "Prepare me for interviews"
- "What salary range should I expect?"
- "What are my career strengths?"

### Advanced Features
- **Export Chat**: Save your conversation as a text file for future reference
- **Clear History**: Start fresh with a new conversation
- **Settings**: Access additional options through the settings panel

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts           # Enhanced chat API with rate limiting
│   │   └── upload-resume/route.ts  # File upload with validation
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ResumeChatbot.tsx          # Main chat interface
│   └── SettingsPanel.tsx         # Settings and options panel
├── utils/
│   ├── validation.ts              # Input and file validation
│   └── rateLimit.ts              # API rate limiting
└── types/
    └── pdf-parse.d.ts            # Type definitions
```

## 🔧 API Endpoints

### POST /api/upload-resume
Upload and parse resume files.

**Request**: FormData with file
**Response**: 
```json
{
  "success": true,
  "content": "extracted text content",
  "filename": "resume.pdf",
  "size": 1024,
  "type": "application/pdf",
  "warnings": ["optional warnings array"]
}
```

### POST /api/chat
Send messages and get AI responses.

**Request**:
```json
{
  "message": "user message",
  "resumeContent": "parsed resume text",
  "chatHistory": [...]
}
```

**Response**:
```json
{
  "success": true,
  "response": "AI generated response"
}
```

## 🛡️ Security Features

- **Rate Limiting**: 10 chat requests per minute, 3 uploads per minute
- **Input Sanitization**: Removes potentially harmful content
- **File Validation**: Checks file type, size, and content
- **Error Handling**: Comprehensive error catching and user feedback

## 🎨 Customization

### Adding New Conversation Starters
Edit `src/components/ResumeChatbot.tsx`:
```typescript
const conversationStarters = [
  { icon: YourIcon, text: "Your question", category: "Category" },
  // Add more starters
]
```

### Extending AI Responses
Modify `src/app/api/chat/route.ts` to add new response patterns:
```typescript
if (messageLower.includes('your-keyword')) {
  // Add your custom response logic
  return "Your custom response"
}
```

### Styling Changes
Update Tailwind classes in components or modify `src/app/globals.css` for global styles.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 🔍 Troubleshooting

### Common Issues

**File Upload Fails**
- Ensure file is under 10MB
- Check file format (PDF, DOC, DOCX, TXT only)
- Verify file is not corrupted or password-protected

**API Rate Limiting**
- Wait before sending more requests
- Rate limits reset after 1 minute

**Poor Resume Analysis**
- Ensure resume has clear sections (Experience, Education, Skills)
- Include contact information and dates
- Use standard resume formatting

### Development Issues

**TypeScript Errors**
```bash
npm run lint
npm run type-check
```

**Build Errors**
```bash
rm -rf .next
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆕 Recent Updates

### Version 1.0 Improvements
- Enhanced AI response generation with categorized skills analysis
- Added conversation starters for better user experience
- Implemented progress indicators and loading states
- Added settings panel with export and clear functionality
- Improved error handling and validation
- Added rate limiting for API protection
- Enhanced mobile responsiveness
- Added dark mode support (UI ready)

### Planned Features
- Integration with external APIs (LinkedIn, GitHub)
- Resume scoring and improvement suggestions
- Industry-specific advice
- Multi-language support
- Voice chat capabilities
- Resume template generation

---

**Built with ❤️ using Next.js and TypeScript**
