import React, { useState } from 'react';
import { CheckCircleIcon, ArrowRightIcon, ArrowLeftIcon, KeyIcon, MailIcon, ServerIcon, RocketIcon } from './icons';

interface SetupWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to AI Email Assistant',
      description: 'Let\'s get you set up in just a few steps',
      icon: <RocketIcon className="h-8 w-8 text-blue-500" />,
    },
    {
      id: 'gemini',
      title: 'Configure Gemini AI',
      description: 'Add your Gemini API key for AI-powered email analysis',
      icon: <KeyIcon className="h-8 w-8 text-blue-500" />,
    },
    {
      id: 'email',
      title: 'Email Configuration',
      description: 'Set up email sending and Gmail integration',
      icon: <MailIcon className="h-8 w-8 text-green-500" />,
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      description: 'You\'re all set! Start managing your emails with AI',
      icon: <CheckCircleIcon className="h-8 w-8 text-green-500" />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const isStepCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);

  const StepIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            index === currentStep
              ? 'border-blue-500 bg-blue-500 text-white'
              : isStepCompleted(index)
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-slate-300 dark:border-slate-600 text-slate-400'
          }`}>
            {isStepCompleted(index) ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${
              isStepCompleted(index) ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              {steps[0].icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {steps[0].title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {steps[0].description}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-lg mx-auto">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                What you'll get:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 text-left">
                <li>• AI-powered email analysis and sentiment detection</li>
                <li>• Automatic priority classification</li>
                <li>• Context-aware reply generation</li>
                <li>• Real-time analytics dashboard</li>
                <li>• Gmail integration for seamless workflow</li>
              </ul>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                {steps[1].icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {steps[1].title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {steps[1].description}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">How to get your Gemini API key:</h3>
              <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                  <span>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                  <span>Sign in with your Google account</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                  <span>Click "Get API key" and create a new key</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                  <span>Copy the key and paste it in the configuration panel</span>
                </li>
              </ol>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                {steps[2].icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {steps[2].title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {steps[2].description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                  <MailIcon className="h-5 w-5 text-green-500 mr-2" />
                  SMTP Configuration
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  For sending emails via SMTP (Gmail, Outlook, etc.)
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <li>• SMTP Host & Port</li>
                  <li>• Email credentials</li>
                  <li>• From email & name</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                  <ServerIcon className="h-5 w-5 text-purple-500 mr-2" />
                  Gmail API
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  For fetching and sending emails via Gmail API
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <li>• OAuth2 credentials</li>
                  <li>• Real-time email sync</li>
                  <li>• Advanced email features</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Email configuration is optional. You can start with just the Gemini API key and configure email settings later.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              {steps[3].icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {steps[3].title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {steps[3].description}
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 max-w-lg mx-auto">
              <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                You're ready to:
              </h3>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1 text-left">
                <li>• Process and analyze incoming emails</li>
                <li>• Generate AI-powered responses</li>
                <li>• Track email analytics and metrics</li>
                <li>• Manage your support workflow efficiently</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <StepIndicator />
          {renderStepContent()}
          
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Skip Setup
              </button>
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < steps.length - 1 && <ArrowRightIcon className="h-4 w-4 ml-2" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
