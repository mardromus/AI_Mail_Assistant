import React from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { DashboardStatsData, Sentiment, Priority } from '../types';
import { BarChartIcon, CheckCircleIcon, ClockIcon, CalendarIcon } from './icons';

interface DashboardStatsProps {
  stats: DashboardStatsData;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow flex items-center">
    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const sentimentData = [
    { name: 'Positive', value: stats.sentimentCounts[Sentiment.Positive] },
    { name: 'Negative', value: stats.sentimentCounts[Sentiment.Negative] },
    { name: 'Neutral', value: stats.sentimentCounts[Sentiment.Neutral] },
  ];

  const priorityData = [
    { name: 'Urgent', value: stats.priorityCounts[Priority.Urgent] },
    { name: 'Not Urgent', value: stats.priorityCounts[Priority.NotUrgent] },
  ];

  const SENTIMENT_COLORS = {
    'Positive': '#10B981', // Emerald 500
    'Negative': '#EF4444', // Red 500
    'Neutral': '#F59E0B',  // Amber 500
  };

  const PRIORITY_COLORS = {
    'Urgent': '#EF4444', // Red 500
    'Not Urgent': '#3B82F6', // Blue 500
  };


  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Total Emails" value={stats.total} icon={<BarChartIcon className="h-6 w-6" />} />
        <StatCard title="In last 24h" value={stats.emailsInLast24h} icon={<CalendarIcon className="h-6 w-6" />} />
        <StatCard title="Pending" value={stats.pending} icon={<ClockIcon className="h-6 w-6" />} />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircleIcon className="h-6 w-6" />} />
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <h3 className="text-md font-semibold mb-2 text-center">Sentiment Distribution</h3>
        <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <PieChart>
                <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                        borderColor: '#475569',
                        borderRadius: '0.5rem'
                    }} 
                />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <h3 className="text-md font-semibold mb-2 text-center">Priority Breakdown</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={priorityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b' }} fontSize={12} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  borderColor: '#475569',
                  borderRadius: '0.5rem'
                }} 
              />
              <Bar dataKey="value" name="Count">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;