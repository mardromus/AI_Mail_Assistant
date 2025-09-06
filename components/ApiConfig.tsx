import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, AlertCircleIcon, EyeIcon, EyeSlashIcon, KeyIcon, MailIcon, ServerIcon } from './icons';

interface ApiConfigProps {
  onConfigUpdate: (config: ApiConfiguration) => void;
  currentConfig: ApiConfiguration;
}

interface ApiConfiguration {
  geminiApiKey: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  gmailClientId: string;
  gmailClientSecret: string;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ onConfigUpdate, currentConfig }) => {
  const [config, setConfig] = useState<ApiConfiguration>(currentConfig);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  const handleInputChange = (field: keyof ApiConfiguration, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = async (field: keyof ApiConfiguration, value: string) => {
    if (!value.trim()) {
      setValidationResults(prev => ({ ...prev, [field]: false }));
      return;
    }

    setIsValidating(true);
    
    try {
      let isValid = false;
      
      switch (field) {
        case 'geminiApiKey':
          // Basic validation for Gemini API key format
          isValid = value.length > 20 && value.includes('AIza');
          break;
        case 'smtpHost':
          // Basic hostname validation
          isValid = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) || value.includes('smtp.');
          break;
        case 'smtpPort':
          // Port number validation
          const port = parseInt(value);
          isValid = port > 0 && port <= 65535;
          break;
        case 'fromEmail':
          // Email validation
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          break;
        case 'gmailClientId':
          // Basic Gmail client ID validation
          isValid = value.length > 20 && value.includes('.apps.googleusercontent.com');
          break;
        default:
          isValid = value.length > 0;
      }
      
      setValidationResults(prev => ({ ...prev, [field]: isValid }));
      
      if (!isValid) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: getFieldErrorMessage(field, value) 
        }));
      }
    } catch (error) {
      setValidationResults(prev => ({ ...prev, [field]: false }));
    } finally {
      setIsValidating(false);
    }
  };

  const getFieldErrorMessage = (field: keyof ApiConfiguration, value: string): string => {
    switch (field) {
      case 'geminiApiKey':
        return 'Invalid Gemini API key format. Should start with "AIza" and be at least 20 characters.';
      case 'smtpHost':
        return 'Invalid SMTP host format. Use a valid hostname like "smtp.gmail.com".';
      case 'smtpPort':
        return 'Invalid port number. Must be between 1 and 65535.';
      case 'fromEmail':
        return 'Invalid email format. Please enter a valid email address.';
      case 'gmailClientId':
        return 'Invalid Gmail Client ID format. Should end with ".apps.googleusercontent.com".';
      default:
        return 'Invalid value.';
    }
  };

  const handleSave = () => {
    const hasErrors = Object.values(errors).some(error => error.length > 0);
    const hasEmptyRequired = !config.geminiApiKey.trim();
    
    if (hasErrors || hasEmptyRequired) {
      setErrors(prev => ({
        ...prev,
        geminiApiKey: !config.geminiApiKey.trim() ? 'Gemini API key is required' : prev.geminiApiKey
      }));
      return;
    }

    onConfigUpdate(config);
  };

  const handleTestConnection = async (type: 'gemini' | 'smtp' | 'gmail') => {
    setIsValidating(true);
    
    try {
      // Simulate API testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would test the actual APIs here
      setValidationResults(prev => ({ ...prev, [`${type}Test`]: true }));
    } catch (error) {
      setValidationResults(prev => ({ ...prev, [`${type}Test`]: false }));
    } finally {
      setIsValidating(false);
    }
  };

  const InputField: React.FC<{
    label: string;
    field: keyof ApiConfiguration;
    type?: string;
    placeholder: string;
    required?: boolean;
    description?: string;
  }> = ({ label, field, type = 'text', placeholder, required = false, description }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type === 'password' && !showPasswords ? 'password' : 'text'}
          value={config[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onBlur={() => validateField(field, config[field])}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors[field] 
              ? 'border-red-300 dark:border-red-600' 
              : validationResults[field] 
                ? 'border-green-300 dark:border-green-600' 
                : 'border-slate-300 dark:border-slate-600'
          } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPasswords ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        )}
        {validationResults[field] && (
          <CheckCircleIcon className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
        )}
      </div>
      {errors[field] && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <AlertCircleIcon className="h-4 w-4 mr-1" />
          {errors[field]}
        </p>
      )}
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">API Configuration</h2>
        <button
          onClick={handleSave}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Save Configuration
        </button>
      </div>

      {/* Gemini AI Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <KeyIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200">Gemini AI Configuration</h3>
          {validationResults.geminiTest && (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          )}
        </div>
        <InputField
          label="Gemini API Key"
          field="geminiApiKey"
          placeholder="AIza..."
          required
          description="Get your API key from Google AI Studio (https://aistudio.google.com/)"
        />
        <button
          onClick={() => handleTestConnection('gemini')}
          disabled={!config.geminiApiKey || isValidating}
          className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50"
        >
          Test Connection
        </button>
      </div>

      {/* SMTP Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <MailIcon className="h-5 w-5 text-green-500" />
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200">SMTP Configuration (Optional)</h3>
          {validationResults.smtpTest && (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="SMTP Host"
            field="smtpHost"
            placeholder="smtp.gmail.com"
            description="Your SMTP server hostname"
          />
          <InputField
            label="SMTP Port"
            field="smtpPort"
            placeholder="587"
            description="Usually 587 for TLS or 465 for SSL"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="SMTP Username"
            field="smtpUser"
            placeholder="your-email@gmail.com"
            description="Your email address"
          />
          <InputField
            label="SMTP Password"
            field="smtpPassword"
            type="password"
            placeholder="Your app password"
            description="Use app-specific password for Gmail"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="From Email"
            field="fromEmail"
            placeholder="support@yourapp.com"
            description="Email address for outgoing messages"
          />
          <InputField
            label="From Name"
            field="fromName"
            placeholder="AI Support Assistant"
            description="Display name for outgoing messages"
          />
        </div>
        <button
          onClick={() => handleTestConnection('smtp')}
          disabled={!config.smtpHost || !config.smtpUser || isValidating}
          className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50"
        >
          Test SMTP Connection
        </button>
      </div>

      {/* Gmail API Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ServerIcon className="h-5 w-5 text-purple-500" />
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200">Gmail API Configuration (Optional)</h3>
          {validationResults.gmailTest && (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          )}
        </div>
        <InputField
          label="Gmail Client ID"
          field="gmailClientId"
          placeholder="xxx.apps.googleusercontent.com"
          description="Get from Google Cloud Console OAuth2 credentials"
        />
        <InputField
          label="Gmail Client Secret"
          field="gmailClientSecret"
          type="password"
          placeholder="Your client secret"
          description="Keep this secure and never share it"
        />
        <button
          onClick={() => handleTestConnection('gmail')}
          disabled={!config.gmailClientId || !config.gmailClientSecret || isValidating}
          className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 disabled:opacity-50"
        >
          Test Gmail API Connection
        </button>
      </div>

      {isValidating && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Testing connection...</span>
        </div>
      )}
    </div>
  );
};

export default ApiConfig;
