'use client'

import React, { useState } from 'react';
import Sidebar from '@/components/modules/dashboard/Sidebar';
import Navbar from '@/components/modules/dashboard/Navbar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className={`flex ${isMobileSidebarOpen ? 'overlay-active' : ''}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobileSidebarOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      <main className="dashboard-main">
        <Navbar toggleSidebar={toggleSidebar} toggleMobileSidebar={toggleMobileSidebar} />
        <div className="dashboard-main-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
