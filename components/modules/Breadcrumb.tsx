// authesci-app/components/modules/Breadcrumb.tsx
import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react'; // Using lucide-react for icons

interface BreadcrumbProps {
  pageTitle: string;
  activePage: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, activePage }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-6"> {/* Matched template's outer div classes */}
      <h6 className="font-semibold mb-0 dark:text-white">{pageTitle}</h6> {/* Changed to h6 */}
      <ul className="flex items-center gap-[6px]">
        <li className="font-medium">
          <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-white dark:hover:text-primary-600">
            <Home className="icon text-lg" /> {/* Using Lucide Home icon */}
            Dashboard
          </Link>
        </li>
        <li className="text-neutral-600 dark:text-white">-</li> {/* Changed separator to - */}
        <li className="text-neutral-600 font-medium dark:text-white">{activePage}</li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
