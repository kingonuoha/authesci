'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Role } from '@prisma/client';
import { NAV_LINKS } from '@/lib/constants/navigation';

interface SidebarProps {
  role: Role;
  isSidebarOpen?: boolean; // Optional prop for external control, if needed
  toggleSidebar?: () => void; // Optional prop for external control, if needed
  isMobileSidebarOpen?: boolean; // Optional prop for external control, if needed
  toggleMobileSidebar?: () => void; // Optional prop for external control, if needed
}

const Sidebar = ({ role, isSidebarOpen, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar }: SidebarProps) => {
  const pathname = usePathname();

  const currentNavLinks = NAV_LINKS[role];

  return (
    <aside className={`sidebar ${isSidebarOpen ? '' : 'active'} ${isMobileSidebarOpen ? 'sidebar-open' : ''}`}>
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
              <li key={index}>
                <Link href={link.href} className={pathname === link.href ? 'active-page' : ''}>
                  {link.icon && <link.icon className="menu-icon" />}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
  );
};

export default Sidebar;