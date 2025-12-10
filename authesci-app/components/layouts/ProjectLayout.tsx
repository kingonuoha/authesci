'use client'

import React, { useState } from 'react';
import ProjectSidebar from '@/components/modules/ProjectSidebar';
import Header from '@/components/modules/Header';
import Breadcrumb from '@/components/modules/Breadcrumb';
import Footer from '@/components/modules/Footer';
import { Profile, Project } from '@prisma/client';

interface ProjectLayoutProps {
  children: React.ReactNode;
  profile: Profile;
  project: Project;
}

const ProjectLayout = ({ children, profile, project }: ProjectLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div>
      <ProjectSidebar
        project={project}
        userRole={profile.role}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
      />
      <main className={`dashboard-main ${!isSidebarOpen ? 'active' : ''}`}>
        <Header
          user={profile}
          toggleSidebar={toggleSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <div className="dashboard-main-body">
          <Breadcrumb pageTitle={project.title} activePage="Workspace" />
          {children}
        </div>
        {/* <Footer /> */}
      </main>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[1040] bg-black/50 lg:hidden mobile-overlay"
          onClick={toggleMobileSidebar}
        />
      )}
    </div>
  );
};

export default ProjectLayout;
