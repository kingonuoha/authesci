
import React from 'react';

interface JobCardProps {
  title: string;
  description: string;
  icon: string;
}

const JobCard: React.FC<JobCardProps> = ({ title, description, icon }) => {
  return (
    <div className="card h-full rounded-xl overflow-hidden border-0 text-center">
      <div className="card-body p-6">
        <div className="w-[64px] h-[64px] inline-flex items-center justify-center bg-primary-100 dark:bg-primary-600/25 dark:text-primary-500 text-primary-600 mb-4 rounded-xl">
          {/* Note: The <iconify-icon> tag is not standard HTML and will not render without a library. */}
          <iconify-icon icon={icon} className="h5 mb-0"></iconify-icon>
        </div>
        <h6 className="mb-2">{title}</h6>
        <p className="card-text mb-2 text-secondary-light">{description}</p>
        <a href="javascript:void(0)" className="btn text-primary-600 dark:text-primary-600 hover:underline px-0 py-2.5 inline-flex items-center gap-2">
          Read More
          {/* Note: The <iconify-icon> tag is not standard HTML and will not render without a library. */}
          <iconify-icon icon="iconamoon:arrow-right-2" className="text-xl"></iconify-icon>
        </a>
      </div>
    </div>
  );
};

export default JobCard;
