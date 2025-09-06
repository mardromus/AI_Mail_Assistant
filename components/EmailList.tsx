
import React from 'react';
import { ProcessedEmail, Priority, Sentiment } from '../types';
import EmailListItem from './EmailListItem';
import { InboxIcon, SendIcon } from './icons';

interface EmailListProps {
  emails: ProcessedEmail[];
  selectedEmail: ProcessedEmail | null;
  onSelectEmail: (email: ProcessedEmail) => void;
  priorityFilter: Priority | 'All';
  sentimentFilter: Sentiment | 'All';
  onPriorityFilterChange: (priority: Priority | 'All') => void;
  onSentimentFilterChange: (sentiment: Sentiment | 'All') => void;
  activeTab: 'inbox' | 'sent';
  onTabChange: (tab: 'inbox' | 'sent') => void;
}

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-2.5 py-1 text-xs font-medium rounded-full transition whitespace-nowrap ${
            isActive 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
        }`}
    >
        {label}
    </button>
);

const TabButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
            isActive
                ? 'text-blue-600 dark:text-blue-400 border-blue-600'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);


const EmailList: React.FC<EmailListProps> = ({ 
    emails, 
    selectedEmail, 
    onSelectEmail,
    priorityFilter,
    sentimentFilter,
    onPriorityFilterChange,
    onSentimentFilterChange,
    activeTab,
    onTabChange
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden h-full max-h-[calc(100vh-12rem)] flex flex-col">
       <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
          <div className="flex">
              <TabButton label="Inbox" icon={<InboxIcon className="h-5 w-5" />} isActive={activeTab === 'inbox'} onClick={() => onTabChange('inbox')} />
              <TabButton label="Sent" icon={<SendIcon className="h-5 w-5" />} isActive={activeTab === 'sent'} onClick={() => onTabChange('sent')} />
          </div>
      </div>
      
      {activeTab === 'inbox' && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filter Emails</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{emails.length} filtered</p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-14 flex-shrink-0">Priority:</span>
                    <FilterButton label="All" isActive={priorityFilter === 'All'} onClick={() => onPriorityFilterChange('All')} />
                    <FilterButton label={Priority.Urgent} isActive={priorityFilter === Priority.Urgent} onClick={() => onPriorityFilterChange(Priority.Urgent)} />
                    <FilterButton label={Priority.NotUrgent} isActive={priorityFilter === Priority.NotUrgent} onClick={() => onPriorityFilterChange(Priority.NotUrgent)} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-14 flex-shrink-0">Sentiment:</span>
                    <FilterButton label="All" isActive={sentimentFilter === 'All'} onClick={() => onSentimentFilterChange('All')} />
                    <FilterButton label={Sentiment.Positive} isActive={sentimentFilter === Sentiment.Positive} onClick={() => onSentimentFilterChange(Sentiment.Positive)} />
                    <FilterButton label={Sentiment.Negative} isActive={sentimentFilter === Sentiment.Negative} onClick={() => onSentimentFilterChange(Sentiment.Negative)} />
                    <FilterButton label={Sentiment.Neutral} isActive={sentimentFilter === Sentiment.Neutral} onClick={() => onSentimentFilterChange(Sentiment.Neutral)} />
                </div>
            </div>
        </div>
      )}

      <ul className="divide-y divide-slate-200 dark:divide-slate-700 overflow-y-auto flex-grow">
        {emails.length > 0 ? (
          emails.map(email => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={selectedEmail?.id === email.id}
              onSelect={() => onSelectEmail(email)}
            />
          ))
        ) : (
          <li className="p-4 text-center text-slate-500">
            {activeTab === 'inbox' ? 'No matching emails found.' : 'No sent emails yet.'}
          </li>
        )}
      </ul>
    </div>
  );
};

export default EmailList;