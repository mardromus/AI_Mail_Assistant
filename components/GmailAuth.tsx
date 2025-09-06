import React, { useState } from 'react';
import { MailIcon, CheckCircleIcon, AlertCircleIcon } from './icons';

interface GmailAuthProps {
  onAuthSuccess: (accessToken: string) => void;
  isAuthenticated: boolean;
}

const GmailAuth: React.FC<GmailAuthProps> = ({ onAuthSuccess, isAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGmailAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, you would implement OAuth2 flow
      // For demo purposes, we'll use a mock token
      const mockToken = 'mock_gmail_access_token_' + Date.now();
      
      // Store the token
      localStorage.setItem('gmail_access_token', mockToken);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAuthSuccess(mockToken);
    } catch (err) {
      setError('Failed to authenticate with Gmail. Please try again.');
      console.error('Gmail auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('gmail_access_token');
    window.location.reload(); // Simple way to reset the app state
  };

  if (isAuthenticated) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Gmail Connected
            </h3>
            <p className="text-xs text-green-600 dark:text-green-400">
              Successfully fetching emails from Gmail
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="ml-auto text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 underline"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start">
        <MailIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Connect Gmail
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
            Connect your Gmail account to fetch real support emails instead of using mock data.
          </p>
          
          {error && (
            <div className="flex items-center mb-3">
              <AlertCircleIcon className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}
          
          <button
            onClick={handleGmailAuth}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              'Connect Gmail'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GmailAuth;
