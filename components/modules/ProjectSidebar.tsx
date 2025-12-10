'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Kanban, FileText, Settings, ArrowLeft, LayoutDashboard, Activity } from 'lucide-react';
import { Project } from '@prisma/client';

interface ProjectSidebarProps {
  project: Project;
  userRole: string;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  toggleMobileSidebar?: () => void;
}

const ProjectSidebar = ({ project, userRole, isSidebarOpen, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar }: ProjectSidebarProps) => {
  const pathname = usePathname();
  const baseUrl = `/project/${project.id}`;
  const dashboardUrl = `/${userRole.toLowerCase()}/dashboard`;

  const navLinks = [
    { label: 'Overview', href: baseUrl, icon: LayoutDashboard },
    { label: 'Kanban Board', href: `${baseUrl}/kanban`, icon: Kanban },
    { label: 'Documents', href: `${baseUrl}/files`, icon: FileText },
    { label: 'Activity', href: `${baseUrl}/activity`, icon: Activity },
    // { label: 'Settings', href: `${baseUrl}/settings`, icon: Settings }, // Future
  ];

  return (
    <aside className={`sidebar ${isSidebarOpen ? '' : 'active'} ${isMobileSidebarOpen ? 'sidebar-open' : ''}`}>
      <button type="button" className="sidebar-close-btn !mt-4" onClick={toggleMobileSidebar}>
        <X size={24} />
      </button>
      <div>
        <Link href={dashboardUrl} className="sidebar-logo flex items-center gap-2 px-4 py-4">
          <ArrowLeft size={20} />
          <span className="font-bold text-lg">Back to Dashboard</span>
        </Link>
        <div className="px-6 py-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Project</h2>
          <p className="font-medium truncate" title={project.title}>{project.title}</p>
        </div>
      </div>
      <div className="sidebar-menu-area">
        <ul className="sidebar-menu" id="sidebar-menu">
          {navLinks.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                className={pathname === link.href ? 'active-page' : ''}
                onClick={() => isMobileSidebarOpen && toggleMobileSidebar && toggleMobileSidebar()}
              >
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

export default ProjectSidebar;
