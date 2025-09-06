import React, { useState } from 'react';
import { XIcon, SettingsIcon, KeyIcon, MailIcon, ServerIcon, TrashIcon, DownloadIcon, UploadIcon } from './icons';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdate: (config: any) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onClearData: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onConfigUpdate,
  onExportData,
  onImportData,
  onClearData
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'apis' | 'data' | 'about'>('general');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="h-4 w-4" /> },
    { id: 'apis', label: 'APIs', icon: <KeyIcon className="h-4 w-4" /> },
    { id: 'data', label: 'Data', icon: <DownloadIcon className="h-4 w-4" /> },
    { id: 'about', label: 'About', icon: <ServerIcon className="h-4 w-4" /> },
  ];

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  const handleClearData = () => {
    onClearData();
    setShowClearConfirm(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">General Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Auto-refresh emails
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically check for new emails every 5 minutes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Priority queue processing
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically process urgent emails first
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Dark mode
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use dark theme interface
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">API Configuration</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <KeyIcon className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-blue-900 dark:text-blue-200">Gemini AI</h4>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              Required for AI-powered email analysis and reply generation
            </p>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Configure
            </button>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MailIcon className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-green-900 dark:text-green-200">SMTP</h4>
            </div>
            <p className="text-sm text-green-800 dark:text-green-300 mb-3">
              Optional for sending emails via SMTP
            </p>
            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
              Configure
            </button>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ServerIcon className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium text-purple-900 dark:text-purple-200">Gmail API</h4>
            </div>
            <p className="text-sm text-purple-800 dark:text-purple-300 mb-3">
              Optional for Gmail integration and real-time email sync
            </p>
            <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Data Management</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Export Data</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Download your emails, analytics, and configuration as a backup
            </p>
            <button
              onClick={onExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Import Data</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Restore from a previously exported backup file
            </p>
            <label className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 cursor-pointer">
              <UploadIcon className="h-4 w-4" />
              <span>Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Clear All Data</h4>
            <p className="text-sm text-red-800 dark:text-red-300 mb-3">
              Permanently delete all emails, analytics, and settings. This action cannot be undone.
            </p>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Clear All Data</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">AI Email Assistant</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Version 1.0.0
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              An AI-powered email management system for customer support teams.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Features</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• AI-powered email analysis and sentiment detection</li>
              <li>• Automatic priority classification</li>
              <li>• Context-aware reply generation with RAG</li>
              <li>• Real-time analytics dashboard</li>
              <li>• Gmail integration</li>
              <li>• Priority queue processing</li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Technology Stack</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• React 19 + TypeScript</li>
              <li>• Google Gemini 2.5 Flash</li>
              <li>• IndexedDB for storage</li>
              <li>• Gmail API integration</li>
              <li>• Tailwind CSS for styling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 dark:bg-slate-700 p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'apis' && renderApiSettings()}
            {activeTab === 'data' && renderDataSettings()}
            {activeTab === 'about' && renderAboutSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
