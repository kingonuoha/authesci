'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, FlaskConical } from 'lucide-react';
import { Role } from '@prisma/client';
import { NAV_LINKS } from '@/lib/constants/navigation';

interface SidebarProps {
  role: Role;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  toggleMobileSidebar?: () => void;
  activeProjectCount?: number;
  className?: string; // Add className prop
}

const Sidebar = ({ role, isSidebarOpen, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar, activeProjectCount, className }: SidebarProps) => {
  const pathname = usePathname();

  const currentNavLinks = [...NAV_LINKS[role]];

  // Add Projects link if active projects exist and not already in the list
  if (activeProjectCount && activeProjectCount > 0) {
    const hasProjectsLink = currentNavLinks.some(link => link.label === 'Projects');
    if (!hasProjectsLink) {
      // Insert after Dashboard
      currentNavLinks.splice(1, 0, {
        href: `/${role.toLowerCase()}/projects`,
        label: 'Projects',
        icon: FlaskConical
      });
    }
  }

  return (
    <aside className={`sidebar ${isSidebarOpen ? '' : 'active'} ${isMobileSidebarOpen ? 'sidebar-open' : ''} ${className || ''}`}>
      <button type="button" className="sidebar-close-btn !mt-4" onClick={toggleMobileSidebar}>
        <X size={24} />
      </button>
      <div>
        <Link href="/" className="sidebar-logo">
          <img src="/assets/images/logo.png" alt="site logo" className="light-logo" />
          <img src="/assets/images/logo-light.png" alt="site logo" className="dark-logo" />
          <img src="/assets/images/logo-icon.png" alt="site logo" className="logo-icon" />
        </Link>
      </div>
      <div className="sidebar-menu-area">
        <ul className="sidebar-menu" id="sidebar-menu">
          {currentNavLinks.map((link, index) => (
            <li key={index} suppressHydrationWarning>
              <Link href={link.href} className={`flex items-center justify-between ${pathname === link.href ? 'active-page' : ''}`}>
                <div className="flex items-center gap-2">
                  {link.icon && <link.icon className="menu-icon" />}
                  <span>{link.label}</span>
                </div>
                {link.label === 'Projects' && activeProjectCount && activeProjectCount > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 py-0.5 px-2 rounded-full text-xs font-medium mr-2">
                    {activeProjectCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;