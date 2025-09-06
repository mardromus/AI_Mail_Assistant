# 🤖 AI Email Assistant

> An intelligent email management system powered by Google Gemini AI that automates customer support workflows through sentiment analysis, priority classification, and context-aware response generation.

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

## ✨ Features

### 🧠 **AI-Powered Intelligence**
- **Sentiment Analysis**: Automatically classify emails as Positive, Negative, or Neutral
- **Priority Detection**: Smart urgency classification using keyword analysis and context
- **Context-Aware Responses**: RAG (Retrieval-Augmented-Generation) system for intelligent reply generation
- **Knowledge Base Integration**: Pre-loaded support scenarios for accurate responses

### 📧 **Email Management**
- **Gmail API Integration**: Real-time email fetching and sending
- **SMTP Support**: Alternative email delivery via SMTP
- **Smart Filtering**: Automatic filtering for support-related emails
- **Priority Queue**: Intelligent processing order based on urgency and sentiment

### 📊 **Analytics Dashboard**
- **Real-time Metrics**: Total, pending, resolved, and 24-hour email statistics
- **Interactive Charts**: Sentiment distribution, priority breakdown, hourly timeline
- **Performance Insights**: Email processing analytics and trends
- **Export Capabilities**: Data export for reporting and analysis

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Themes**: Automatic theme switching with persistence
- **Intuitive Interface**: Clean, professional dashboard design
- **Accessibility**: ARIA labels and keyboard navigation support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key
- Firebase project (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-email-assistant.git
cd ai-email-assistant

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your API keys
echo "GEMINI_API_KEY=your_api_key_here" >> .env
echo "VITE_FIREBASE_API_KEY=your_firebase_api_key" >> .env
echo "VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com" >> .env
echo "VITE_FIREBASE_PROJECT_ID=your-project-id" >> .env
echo "VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com" >> .env
echo "VITE_FIREBASE_MESSAGING_SENDER_ID=123456789" >> .env
echo "VITE_FIREBASE_APP_ID=your_app_id" >> .env

# Start development server
npm run dev
```

### Get Your API Keys

#### Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" → "Create API key"
4. Copy the key and add it to your `.env` file

#### Firebase Configuration
1. Follow the [Firebase Setup Guide](FIREBASE_SETUP.md)
2. Create a Firebase project
3. Enable Google Authentication
4. Get your Firebase config and add to `.env` file

## 🔧 Configuration

### Environment Variables

```env
# Required: Gemini AI API Key
GEMINI_API_KEY=AIza...your_key_here

# Required: Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# Optional: SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=support@yourapp.com
FROM_NAME=AI Support Assistant

# Optional: Gmail API Configuration
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
```

### Gmail API Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth2 credentials
5. Add credentials to your `.env` file

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **AI**: Google Gemini 2.5 Flash
- **Database**: IndexedDB (browser-based)
- **Email**: Gmail API + SMTP
- **Styling**: Tailwind CSS
- **Charts**: Recharts

### Project Structure
```
ai-email-assistant/
├── components/           # React components
│   ├── ApiConfig.tsx    # API configuration UI
│   ├── DashboardStats.tsx # Analytics dashboard
│   ├── EmailDetail.tsx  # Email detail view
│   ├── EmailList.tsx    # Email listing
│   ├── GmailAuth.tsx    # Gmail authentication
│   ├── SetupWizard.tsx  # First-time setup
│   ├── SettingsPanel.tsx # Settings management
│   └── StatusDashboard.tsx # Service monitoring
├── services/            # Business logic
│   ├── databaseService.ts # IndexedDB operations
│   ├── emailSendingService.ts # Email delivery
│   ├── gmailService.ts  # Gmail API integration
│   ├── geminiService.ts # AI analysis
│   ├── priorityQueueService.ts # Email prioritization
│   └── ragService.ts    # RAG system
├── types.ts            # TypeScript definitions
└── App.tsx            # Main application
```

## 🎯 Core Features

### Email Processing Pipeline
1. **Fetch**: Retrieve emails from Gmail API or SMTP
2. **Filter**: Identify support-related emails by keywords
3. **Analyze**: AI-powered sentiment and priority classification
4. **Queue**: Priority-based processing order
5. **Generate**: Context-aware response using RAG
6. **Send**: Deliver responses via Gmail API or SMTP

### RAG System
- **Knowledge Base**: Pre-loaded support scenarios
- **Context Retrieval**: Relevant information extraction
- **Response Generation**: AI-powered reply creation
- **Tone Adaptation**: Professional, empathetic responses

### Priority Queue Algorithm
- **Urgency Detection**: Keyword-based priority scoring
- **Sentiment Weighting**: Negative emails get higher priority
- **Time Factors**: Older emails receive slight priority boost
- **Dynamic Reordering**: Real-time queue optimization

## 📊 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/1e293b/ffffff?text=AI+Email+Assistant+Dashboard)

### Email Analysis
![Email Analysis](https://via.placeholder.com/800x400/1e293b/ffffff?text=AI+Powered+Email+Analysis)

### Analytics Charts
![Analytics](https://via.placeholder.com/800x400/1e293b/ffffff?text=Real-time+Analytics+Charts)

## 🛠️ Development

### Available Scripts
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful AI capabilities
- [React](https://reactjs.org/) for the amazing frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Recharts](https://recharts.org/) for data visualization

## 📞 Support

- **Documentation**: [Setup Guide](SETUP_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-email-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-email-assistant/discussions)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/ai-email-assistant&type=Date)](https://star-history.com/#yourusername/ai-email-assistant&Date)

---

<div align="center">
  <strong>Built with ❤️ for the hackathon community</strong>
</div>