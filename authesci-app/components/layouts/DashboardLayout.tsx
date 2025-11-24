'use client'

import React, { useState } from 'react';
import Sidebar  from '@/components/modules/Sidebar';
import Header  from '@/components/modules/Header';
import Breadcrumb from '@/components/modules/Breadcrumb';
import Footer from '@/components/modules/Footer'; // Import Footer
import { Profile } from '@prisma/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile: Profile;
  activeProjectCount?: number;
}

const DashboardLayout = ({ children, profile, activeProjectCount }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div >
      <Sidebar
        role={profile.role}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
        activeProjectCount={activeProjectCount}
      />
      <main className={`dashboard-main ${!isSidebarOpen ? 'active' : ''}`}>
        <Header
          user={profile}
          toggleSidebar={toggleSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <div className="dashboard-main-body">
          <Breadcrumb pageTitle="Dashboard" activePage="AI" />
          {children}
        </div>
        <Footer /> {/* Include Footer here */}
      </main>
    </div>
  );
};

export default DashboardLayout;
