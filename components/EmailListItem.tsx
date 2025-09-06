import React from 'react';
import { ProcessedEmail, Priority, Sentiment } from '../types';
import { AlertCircleIcon, CheckCircleIcon, MinusCircleIcon, TrendingUpIcon, ZapIcon, PaperclipIcon } from './icons';

interface EmailListItemProps {
  email: ProcessedEmail;
  isSelected: boolean;
  onSelect: () => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles = {
    [Priority.Urgent]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [Priority.NotUrgent]: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  };
  const icon = {
    [Priority.Urgent]: <ZapIcon className="h-3 w-3" />,
    [Priority.NotUrgent]: <TrendingUpIcon className="h-3 w-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[priority]}`}>
      {icon[priority]}
      {priority}
    </span>
  );
};

const SentimentBadge: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
  const styles = {
    [Sentiment.Positive]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [Sentiment.Negative]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [Sentiment.Neutral]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  };
  const icon = {
    [Sentiment.Positive]: <CheckCircleIcon className="h-3 w-3" />,
    [Sentiment.Negative]: <AlertCircleIcon className="h-3 w-3" />,
    [Sentiment.Neutral]: <MinusCircleIcon className="h-3 w-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[sentiment]}`}>
      {icon[sentiment]}
      {sentiment}
    </span>
  );
};

const EmailListItem: React.FC<EmailListItemProps> = ({ email, isSelected, onSelect }) => {
  const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round((new Date(email.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  );

  return (
    <li
      className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
        isSelected ? 'bg-blue-50 dark:bg-slate-700' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{email.sender}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">{relativeTime}</p>
      </div>
      <div className="flex items-center mt-1">
        {email.attachments && email.attachments.length > 0 && email.status === 'Resolved' && (
            <PaperclipIcon className="h-4 w-4 text-slate-400 mr-1.5 flex-shrink-0" />
        )}
        <p className="text-sm truncate text-slate-600 dark:text-slate-300">{email.subject}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <PriorityBadge priority={email.priority} />
        <SentimentBadge sentiment={email.sentiment} />
      </div>
    </li>
  );
};

export default EmailListItem;