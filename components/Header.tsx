import React from 'react';
import { RefreshCwIcon, SunIcon, MoonIcon, SettingsIcon } from './icons';
import UserProfile from './UserProfile';
import { AuthUser } from '../services/authService';

interface HeaderProps {
  onRefresh: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  user: AuthUser | null;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, theme, onToggleTheme, onOpenSettings, user }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h1 className="text-xl font-bold ml-3 text-slate-900 dark:text-white">
              AI Communication Assistant
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={onRefresh}
              className="flex items-center justify-center p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Refresh emails"
            >
              <RefreshCwIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Open settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
            {user && <UserProfile />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
