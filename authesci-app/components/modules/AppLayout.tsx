'use client'

import React, { useState } from 'react';
import Sidebar from '@/components/modules/Sidebar';
import Header from '@/components/modules/Header';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
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
        <Header toggleSidebar={toggleSidebar} toggleMobileSidebar={toggleMobileSidebar} />
        <div className="dashboard-main-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
