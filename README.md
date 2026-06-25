# ESGSyncPRO Landing Page

A modern ESG assessment platform with AI-powered content generation, multilingual support, and comprehensive backend API.

## 🚀 Features

- **AI-Powered Content Generation** - Dynamic ESG reports with unique text variants
- **Backend API Server** - Express.js server with AI proxy functionality
- **Multilingual Support** - English and Polish languages
- **Responsive Design** - Mobile-first approach for all screen sizes
- **ESG Assessment Tool** - Interactive questionnaire with intelligent scoring
- **PDF Export** - Automated PDF generation with AI-personalized content
- **Multiple AI Endpoints** - Content generation, analysis, and text variant selection
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

## 🛠️ Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
Create a `.env` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

3. Start the server:
```bash
# Using npm
npm start

# Using the provided scripts
./start-server.sh    # Linux/Mac
start-server.bat     # Windows

# Development mode with auto-reload
npm run dev
```

4. Open your browser to `http://localhost:3001`

## 🤖 AI Features & API Endpoints

The system includes a comprehensive AI backend with multiple endpoints:

### Core AI Functionality
- **Text Variant Selection** - Intelligent selection of content variants (A/B/C) based on ESG level and language
- **ESG Content Generation** - Dynamic report content creation
- **PDF Content Generation** - Structured PDF report content
- **ESG Data Analysis** - Automated analysis with scoring and recommendations
- **Fallback System** - Works without OpenAI API key using smart fallbacks

### Available API Endpoints
- `POST /api/esg-variants` - Get text variants for reports
- `POST /api/generate-esg-content` - Generate comprehensive ESG content
- `POST /api/generate-pdf-content` - Create structured PDF content
- `POST /api/analyze-esg-data` - Analyze ESG data with AI insights
- `GET /api/health` - Check API status and configuration

## 🔒 Security & Environment

- **Environment variables supported** - use `OPENAI_API_KEY` in `.env` file
- **Secure API proxy** - Frontend never exposes API keys
- **Fallback system** - Works without API key for development
- **CORS enabled** - Secure cross-origin requests
- Never commit real API keys to version control

## 📁 Project Structure

```
esgsyncprolanding/
├── server.js              # Express.js backend server with AI proxy
├── index.html             # Frontend application with AI integration
├── pdf-template.js        # PDF generation with AI text selection
├── package.json           # Node.js dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── start-server.bat       # Windows server startup script
├── start-server.sh        # Linux/Mac server startup script
├── css/
│   ├── tailwind.css       # Tailwind source file with utilities
│   └── main.css           # Compiled CSS output
└── public/
    ├── assets/images/     # Static images and icons
    ├── english.mp4        # Demo video (English)
    ├── polish.mp4         # Demo video (Polish)
    └── invideo-ai-1080... # Additional demo content
```

## 🌐 Development vs Production

### Development Mode
```bash
npm run dev  # Auto-reload with nodemon
```

### Production Mode
```bash
npm start    # Standard production server
```

### Frontend Only (Static)
If you only need the frontend without AI features:
1. Open `index.html` directly in browser
2. AI features will use fallback mode

## 📊 API Response Examples

### Text Variants Selection
```json
{
  "summary": "A",
  "nextSteps": "B", 
  "cta": "C",
  "premiumTeaser": "A"
}
```

### Health Check Response
```json
{
  "status": "ok",
  "apiKeyConfigured": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 🚀 Deployment

The application runs on Node.js and can be deployed to any platform supporting Express.js:

- **Heroku**: `git push heroku main`
- **Vercel**: Deploy with serverless functions
- **Railway**: Connect GitHub repository
- **Local**: Use provided startup scripts

## 🎯 Usage

1. **Start the server** using one of the methods above
2. **Access the application** at `http://localhost:3001`
3. **Complete the ESG assessment** using the interactive form
4. **Generate reports** with AI-powered content
5. **Export to PDF** with personalized recommendations

## 🔧 Troubleshooting

- **Port already in use**: Change `PORT` in `.env` file
- **AI features not working**: Check OpenAI API key configuration
- **CORS errors**: Ensure server is running on correct port
- **PDF generation fails**: Verify all dependencies are installed

## 🙏 Acknowledgments

- Built with Express.js and Node.js
- Frontend powered by HTML5 and Tailwind CSS
- AI integration via OpenAI API
- PDF generation with jsPDF and html2canvas