# 🔥 Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication with Google login for the AI Email Assistant.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `ai-email-assistant` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Click **Google** provider
5. Toggle **Enable**
6. Add your project support email
7. Click **Save**

## 3. Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type
5. Fill in required information:
   - App name: `AI Email Assistant`
   - User support email: Your email
   - Developer contact: Your email
6. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
7. Add test users (for development)
8. Click **Save and Continue**

## 4. Create Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Web** icon (`</>`)
4. Register app with nickname: `ai-email-assistant-web`
5. Copy the Firebase configuration object

## 5. Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
```

## 6. Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings**
2. Scroll down to **Authorized domains**
3. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yourapp.com`)

## 7. Security Rules (Optional)

For Firestore (if you plan to use it):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. You should see the login page with "Continue with Google" button

4. Click the button and complete the OAuth flow

5. You should be redirected to the main dashboard

## 9. Production Deployment

### Vercel
1. Add environment variables in Vercel dashboard
2. Deploy your app
3. Add your production domain to Firebase authorized domains

### Netlify
1. Add environment variables in Netlify dashboard
2. Deploy your app
3. Add your production domain to Firebase authorized domains

### Other Platforms
- Add environment variables to your hosting platform
- Ensure your domain is added to Firebase authorized domains

## 10. Troubleshooting

### Common Issues

#### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Firebase authorized domains
- Check that you're using the correct domain format

#### "Firebase: Error (auth/popup-closed-by-user)"
- User closed the popup during OAuth flow
- This is normal behavior, just try again

#### "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Verify Firebase configuration is correct

#### "Firebase: Error (auth/invalid-api-key)"
- Verify your API key in the `.env` file
- Make sure you're using the correct project's API key

### Debug Mode

Enable debug mode in your browser console:
```javascript
localStorage.setItem('firebase:debug', '*');
```

## 11. Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API keys** in Google Cloud Console
4. **Monitor usage** in Firebase Console
5. **Regularly rotate** API keys
6. **Use HTTPS** in production

## 12. Additional Features

### User Data Storage
You can extend the authentication to store user preferences:

```typescript
// Example: Store user preferences
const saveUserPreferences = async (userId: string, preferences: any) => {
  await setDoc(doc(db, 'users', userId), {
    preferences,
    lastUpdated: new Date()
  });
};
```

### Role-Based Access
Implement different access levels:

```typescript
// Example: Check user role
const checkUserRole = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.data()?.role || 'user';
};
```

## 🎉 You're Ready!

Your AI Email Assistant now has secure Google authentication! Users can:
- ✅ Sign in with their Google account
- ✅ Access the app securely
- ✅ Have their data protected
- ✅ Sign out when needed

The authentication is fully integrated with the existing email management features.
