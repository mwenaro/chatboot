# 🤖 Free AI Setup Guide

Your resume chatbot now supports **multiple FREE AI options**! Choose the one that works best for you:

## 🚀 Quick Start (Already Working!)

The app is **already configured** to use **free Hugging Face models** without any setup required. Just upload your resume and start chatting!

## 🔧 Enhanced Free Options

### Option 1: Hugging Face API Key (Recommended)
- **Cost**: 100% FREE (1,000 requests/month)
- **Setup**: 2 minutes
- **Benefits**: Better rate limits, more reliable responses

1. Get free API key: https://huggingface.co/settings/tokens
2. Create `.env.local` file in your project root:
   ```
   HUGGINGFACE_API_KEY=your_token_here
   ```
3. Restart the app

### Option 2: Google Gemini (Free Tier)
- **Cost**: 100% FREE (15 requests/minute)
- **Setup**: 5 minutes
- **Benefits**: Very intelligent responses

1. Get free API key: https://makersuite.google.com/app/apikey
2. Install package: `npm install @google/generative-ai`
3. Add to `.env.local`:
   ```
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

### Option 3: Ollama (100% Local & Free)
- **Cost**: 100% FREE forever
- **Setup**: 10 minutes
- **Benefits**: Completely private, no internet required

1. Install Ollama: https://ollama.ai/download
2. Run in terminal:
   ```bash
   ollama pull llama2:7b
   ollama serve
   ```
3. The app will automatically detect local Ollama

## 📊 AI Model Comparison

| Provider | Cost | Setup | Response Quality | Privacy |
|----------|------|-------|------------------|---------|
| HuggingFace Free | Free | None | Good | Shared |
| HuggingFace API | Free | 2 min | Better | Shared |
| Google Gemini | Free | 5 min | Excellent | Shared |
| Ollama | Free | 10 min | Very Good | 100% Private |

## 🛠️ Advanced Setup

### Adding Cohere (Free Tier)
```bash
npm install cohere-ai
```

### Adding OpenAI (Paid but Powerful)
```bash
npm install openai
```

## 🆘 Troubleshooting

### If AI responses aren't working:
1. Check browser console for errors
2. Verify `.env.local` file format
3. Restart the development server
4. The app will automatically fall back to rule-based responses

### Common Issues:
- **Rate limits**: Use Hugging Face API key for better limits
- **Slow responses**: Try different models or use local Ollama
- **No AI indicator**: Check API key configuration

## 🔄 How the Hybrid System Works

Your chatbot uses a **smart hybrid approach**:

1. **First**: Tries AI response (if configured)
2. **Fallback**: Uses enhanced rule-based responses
3. **Always**: Provides helpful, relevant answers

This ensures your chatbot **always works**, even if AI services are down!

## 📈 Next Steps

1. **Test with different questions** to see AI vs rule-based responses
2. **Add API keys** for better AI responses
3. **Try local Ollama** for complete privacy
4. **Customize prompts** in `src/services/aiService.ts`

Your resume chatbot is now **AI-powered and future-ready**! 🎉
