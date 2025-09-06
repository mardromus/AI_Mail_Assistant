import React, { useState, useRef, useEffect } from 'react';
import { ProcessedEmail, AttachmentInfo } from '../types';
import { ClipboardIcon, MailIcon, PhoneIcon, SendIcon, PaperclipIcon, XIcon, CheckCircleIcon } from './icons';

interface EmailDetailProps {
  email: ProcessedEmail;
  onSendReply: (emailId: string, attachments: File[]) => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-2">{title}</h4>
        <div className="text-sm text-slate-800 dark:text-slate-200">{children}</div>
    </div>
);

const AttachmentItem: React.FC<{ name: string; size?: number; onRemove?: () => void; isReadOnly: boolean }> = ({ name, size, onRemove, isReadOnly }) => (
    <div className="flex items-center justify-between text-xs p-2 bg-slate-100 dark:bg-slate-700 rounded">
        <span className="truncate flex items-center gap-2">
            <PaperclipIcon className="h-4 w-4 text-slate-500" />
            {name}
        </span>
        <div className="flex items-center">
            {size && <span className="text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">{(size / 1024).toFixed(1)} KB</span>}
            {!isReadOnly && (
                 <button onClick={onRemove} className="text-slate-500 hover:text-red-500 ml-2">
                    <XIcon className="h-4 w-4"/>
                </button>
            )}
        </div>
    </div>
);


const EmailDetail: React.FC<EmailDetailProps> = ({ email, onSendReply }) => {
  const [draft, setDraft] = useState(email.draftReply);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(email.draftReply);
    setAttachments([]);
  }, [email]);

  const formattedDate = new Date(email.date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        setAttachments(prev => [...prev, ...Array.from(event.target.files as FileList)]);
    }
  };

  const handleRemoveAttachment = (fileName: string) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
  };
  
  const handleSendReply = () => {
    console.log("Sending email:", {
      to: email.sender,
      subject: `Re: ${email.subject}`,
      body: draft,
      attachments: attachments.map(f => f.name),
    });
    onSendReply(email.id, attachments);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden h-full max-h-[calc(100vh-9rem)] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{email.subject}</h3>
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                <p>From: <span className="font-medium text-slate-700 dark:text-slate-300">{email.sender}</span></p>
                <span className="mx-2">|</span>
                <p>Received: {formattedDate}</p>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
            <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Extracted Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="Summary">
                        <p>{email.summary}</p>
                    </InfoCard>
                    <InfoCard title="Customer Request">
                        <p>{email.customerRequest}</p>
                    </InfoCard>
                    {email.contactDetails && (Object.keys(email.contactDetails).length > 0) && (
                        <InfoCard title="Contact Details">
                            <ul className="space-y-1">
                                {email.contactDetails.phone && (
                                    <li className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2" />{email.contactDetails.phone}</li>
                                )}
                                {email.contactDetails.alternateEmail && (
                                    <li className="flex items-center"><MailIcon className="h-4 w-4 mr-2" />{email.contactDetails.alternateEmail}</li>
                                )}
                            </ul>
                        </InfoCard>
                    )}
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Draft Reply</h4>
                <div className="relative">
                    <textarea
                        rows={8}
                        className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="AI response will be generated here..."
                        disabled={email.status === 'Resolved'}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button onClick={copyToClipboard} className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600" title="Copy reply">
                            <ClipboardIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {(attachments.length > 0 || (email.attachments && email.attachments.length > 0)) && (
                    <div className="mt-2 space-y-1">
                        {email.status === 'Pending' && attachments.map(file => (
                            <AttachmentItem
                                key={file.name}
                                name={file.name}
                                size={file.size}
                                onRemove={() => handleRemoveAttachment(file.name)}
                                isReadOnly={false}
                            />
                        ))}
                        {email.status === 'Resolved' && email.attachments?.map(file => (
                           <AttachmentItem
                                key={file.name}
                                name={file.name}
                                size={file.size}
                                isReadOnly={true}
                            />
                        ))}
                    </div>
                )}
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />

                {email.status === 'Pending' && (
                  <div className="mt-2 flex justify-end items-center gap-3">
                      <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500" title="Add attachment">
                          <PaperclipIcon className="h-4 w-4"/>
                      </button>
                      <button onClick={handleSendReply} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <SendIcon className="h-4 w-4"/>
                          Send Reply
                      </button>
                  </div>
                )}
            </div>

            <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Original Email</h4>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {email.body}
                </div>
            </div>
        </div>
    </div>
  );
};

export default EmailDetail;