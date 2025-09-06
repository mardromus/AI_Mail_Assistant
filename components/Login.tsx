import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { GoogleIcon, MailIcon, ShieldIcon, ZapIcon } from './icons';

const Login: React.FC = () => {
  const { signInWithGoogle, loading } = useUser();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const features = [
    {
      icon: <ZapIcon className="h-6 w-6 text-blue-500" />,
      title: "AI-Powered Analysis",
      description: "Intelligent email processing with sentiment analysis and priority detection"
    },
    {
      icon: <MailIcon className="h-6 w-6 text-green-500" />,
      title: "Smart Email Management",
      description: "Automated email filtering, categorization, and response generation"
    },
    {
      icon: <ShieldIcon className="h-6 w-6 text-purple-500" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                AI Email Assistant
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                Transform your customer support with intelligent email management powered by AI
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Sign in to access your AI-powered email dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
