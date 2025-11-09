import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface StatWidgetProps {
  title: string;
  value: string;
  icon: React.ComponentType<LucideProps>;
  trend: 'up' | 'down';
  trendValue: string;
  trendText: string;
  color: 'cyan' | 'purple' | 'blue' | 'success' | 'red';
}

const StatWidget: React.FC<StatWidgetProps> = ({ title, value, icon: Icon, trend, trendValue, trendText, color }) => {
  const colorClasses = {
    cyan: 'bg-cyan-600',
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    success: 'bg-success-600',
    red: 'bg-red-600',
  };

  const gradientClasses = {
    cyan: 'from-cyan-600/10',
    purple: 'from-purple-600/10',
    blue: 'from-blue-600/10',
    success: 'from-success-600/10',
    red: 'from-red-600/10',
  }

  const trendColor = trend === 'up' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400';
  const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown;

  return (
    <div className={`card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r ${gradientClasses[color]} to-bg-white`}>
      <div className="card-body p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-neutral-900 dark:text-white mb-1">{title}</p>
            <h6 className="mb-0 dark:text-white">{value}</h6>
          </div>
          <div className={`w-[50px] h-[50px] ${colorClasses[color]} rounded-full flex justify-center items-center`}>
            <Icon className="text-white text-2xl mb-0" aria-hidden="true" />
          </div>
        </div>
        <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="text-xs" aria-hidden="true" /> {trendValue}
          </span>
          {trendText}
        </p>
      </div>
    </div>
  );
};

export default StatWidget;
