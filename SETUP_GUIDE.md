# 🚀 AI Email Assistant - Complete Setup Guide

## Quick Start (5 Minutes)

### 1. **Get Your Gemini API Key** (Required)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" → "Create API key"
4. Copy the key (starts with "AIza...")

### 2. **Run the Application**
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your API key to .env
echo "GEMINI_API_KEY=your_api_key_here" >> .env

# Start the application
npm run dev
```

### 3. **First-Time Setup**
- The app will show a setup wizard on first launch
- Follow the guided steps to configure your APIs
- You can skip optional configurations and add them later

## 🔧 Complete Configuration

### Environment Variables (.env file)

```env
# Required: Gemini AI API Key
GEMINI_API_KEY=AIza...your_key_here

# Optional: SMTP Configuration (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=support@yourapp.com
FROM_NAME=AI Support Assistant

# Optional: Gmail API Configuration (for fetching emails)
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
```

## 📧 Email Configuration Options

### Option 1: Gmail API (Recommended)
**Best for**: Real-time email sync, advanced features

1. **Set up Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Gmail API

2. **Create OAuth2 Credentials**:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Add authorized redirect URIs: `http://localhost:5173` (for development)
   - Copy Client ID and Client Secret

3. **Configure in App**:
   - Use the "Connect Gmail" button in the app
   - Or add credentials to `.env` file

### Option 2: SMTP (Alternative)
**Best for**: Simple email sending without Gmail API

1. **Gmail SMTP Setup**:
   - Enable 2-factor authentication on your Gmail account
   - Generate an "App Password" for this application
   - Use your Gmail address and app password

2. **Other SMTP Providers**:
   - Outlook: `smtp-mail.outlook.com:587`
   - Yahoo: `smtp.mail.yahoo.com:587`
   - Custom: Use your provider's SMTP settings

## 🎯 Features Overview

### ✅ **Core Features**
- **AI Email Analysis**: Sentiment detection, priority classification
- **Smart Reply Generation**: Context-aware responses using RAG
- **Priority Queue**: Automatic urgent email processing
- **Real-time Analytics**: Comprehensive dashboard with charts
- **Gmail Integration**: Fetch and send emails seamlessly

### 🔧 **Configuration Features**
- **Setup Wizard**: Guided first-time configuration
- **API Management**: Easy API key configuration
- **Service Status**: Real-time connection monitoring
- **Data Management**: Export/import/clear data
- **Settings Panel**: Comprehensive configuration options

## 📊 Dashboard Features

### **Email Management**
- **Inbox**: Pending emails with AI analysis
- **Sent**: Resolved emails with attachments
- **Filtering**: By priority and sentiment
- **Search**: Quick email finding

### **Analytics**
- **Key Metrics**: Total, pending, resolved, 24h volume
- **Sentiment Chart**: Visual sentiment distribution
- **Priority Chart**: Urgent vs non-urgent breakdown
- **Hourly Timeline**: 24-hour email activity

### **AI Features**
- **Smart Analysis**: Automatic email categorization
- **Context-Aware Replies**: RAG-powered response generation
- **Priority Detection**: Urgent email identification
- **Knowledge Base**: Pre-loaded support scenarios

## 🛠️ Troubleshooting

### Common Issues

#### **"API_KEY environment variable is not set"**
- Add your Gemini API key to `.env` file
- Restart the application
- Check the key format (should start with "AIza")

#### **"Failed to fetch emails from Gmail"**
- Check Gmail API credentials
- Ensure Gmail API is enabled in Google Cloud Console
- Verify OAuth2 redirect URI matches your domain

#### **"SMTP connection failed"**
- Verify SMTP credentials
- Check if 2FA is enabled (use app password for Gmail)
- Test with different SMTP settings

#### **"Database not initialized"**
- Clear browser data and refresh
- Check browser console for errors
- Try incognito/private browsing mode

### **Service Status Indicators**
- 🟢 **Connected**: Service is working properly
- 🔴 **Error**: Service has an issue (check error message)
- ⚪ **Disconnected**: Service not configured
- 🔵 **Loading**: Service is being checked

## 🔒 Security Notes

### **API Keys**
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate keys regularly
- Use app-specific passwords for Gmail

### **Data Privacy**
- All data is stored locally in your browser
- No data is sent to external servers except for AI processing
- Gmail API only accesses emails you explicitly authorize

## 📈 Performance Tips

### **Optimization**
- Use Gmail API for better performance than SMTP
- Enable auto-refresh for real-time updates
- Clear old data periodically
- Use priority queue for urgent emails

### **Scaling**
- For high volume: Consider backend implementation
- Database: Upgrade to PostgreSQL for production
- Caching: Implement Redis for better performance
- Monitoring: Add logging and analytics

## 🆘 Support

### **Getting Help**
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify all API keys are correct
4. Test with mock data first

### **Feature Requests**
- Use the feedback form in settings
- Check the roadmap in the about section
- Submit issues via the support system

## 🎉 You're Ready!

Once configured, your AI Email Assistant will:
- ✅ Automatically analyze incoming emails
- ✅ Generate context-aware responses
- ✅ Prioritize urgent emails
- ✅ Provide real-time analytics
- ✅ Streamline your support workflow

**Happy emailing! 🚀**
