'use client'

import React, { useState } from 'react';
import Sidebar from '@/components/modules/Sidebar';
import { MobileSidebar } from '@/components/modules/MobileSidebar';
import Header from '@/components/modules/Header';
import Breadcrumb from '@/components/modules/Breadcrumb';
import Footer from '@/components/modules/Footer'; // Import Footer
import { Profile } from '@prisma/client';
import { RealtimeProvider } from '@/components/chat/realtime-provider';

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
    <RealtimeProvider userId={profile.id}>
      <div >
        {/* Desktop Sidebar - Hidden on Mobile */}
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div >
          <Sidebar
            role={profile.role}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            activeProjectCount={activeProjectCount}
          />
        </div>

        {/* Mobile Sidebar - Sheet based */}
        <MobileSidebar
          role={profile.role}
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
            {/* <Breadcrumb pageTitle="Dashboard" activePage="AI" /> */}
            {children}
          </div>
          <Footer /> {/* Include Footer here */}
        </main>
      </div>
    </RealtimeProvider>
  );
};

export default DashboardLayout;
