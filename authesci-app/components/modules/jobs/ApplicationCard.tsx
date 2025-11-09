import React from 'react';
import { Briefcase, Clock, XCircle, CheckCircle } from 'lucide-react';

interface ApplicationCardProps {
  title: string;
  company: string;
  status: 'Pending' | 'Interviewing' | 'Rejected' | 'Accepted';
  appliedDate: string;
}

const statusConfig = {
    Pending: { icon: Clock, color: 'purple' },
    Interviewing: { icon: Briefcase, color: 'blue' },
    Accepted: { icon: CheckCircle, color: 'success' },
    Rejected: { icon: XCircle, color: 'danger' },
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({ title, company, status, appliedDate }) => {
    const { icon: Icon, color } = statusConfig[status];
    const colorClasses = {
        purple: 'bg-purple-200 dark:bg-purple-600/25 text-purple-600 dark:text-purple-500',
        blue: 'bg-blue-200 dark:bg-blue-600/25 text-blue-600 dark:text-blue-500',
        success: 'bg-success-100 dark:bg-success-600/25 text-success-600 dark:text-success-500',
        danger: 'bg-danger-100 dark:bg-danger-600/25 text-danger-600 dark:text-danger-500',
    }

  return (
    <div className="card h-full rounded-xl overflow-hidden border-0 shadow-lg">
      <div className="card-body p-6">
        <div className={`w-[64px] h-[64px] inline-flex items-center justify-center ${colorClasses[color]} mb-4 rounded-xl`}>
          <Icon className="h5 mb-0" aria-hidden="true" />
        </div>
        <h6 className="mb-1 text-lg font-semibold">{title}</h6>
        <p className="text-sm text-neutral-500 mb-2">{company}</p>
        <p className="card-text mb-2 text-secondary-light">Applied on: {appliedDate}</p>
        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${colorClasses[color]}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default ApplicationCard;
