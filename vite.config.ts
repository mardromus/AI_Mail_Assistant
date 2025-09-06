import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.SMTP_HOST': JSON.stringify(env.SMTP_HOST || 'smtp.gmail.com'),
        'process.env.SMTP_PORT': JSON.stringify(env.SMTP_PORT || '587'),
        'process.env.SMTP_USER': JSON.stringify(env.SMTP_USER || ''),
        'process.env.SMTP_PASSWORD': JSON.stringify(env.SMTP_PASSWORD || ''),
        'process.env.FROM_EMAIL': JSON.stringify(env.FROM_EMAIL || 'support@yourapp.com'),
        'process.env.FROM_NAME': JSON.stringify(env.FROM_NAME || 'AI Support Assistant'),
        'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
        'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
        'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
        'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
        'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
