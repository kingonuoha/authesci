'use client';
import {
  AuthCard,
  StatWidget,
  EmptyState,
  JobCard,
  ApplicationCard,
  SearchBar,
  ProfileCard,
  ProjectCard,
  TaskCard,
  FileCard,
  CollaboratorAvatar,
} from "@/components/modules";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Users, Award, Wallet, FileText } from 'lucide-react';

export default function TestPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Component Test Page</h1>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">StatWidget</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget
            title="Total Users"
            value="20,000"
            icon={Users}
            trend="up"
            trendValue="+4000"
            trendText="Last 30 days"
            color="cyan"
          />
          <StatWidget
            title="Total Subscription"
            value="15,000"
            icon={Award}
            trend="down"
            trendValue="-800"
            trendText="Last 30 days"
            color="purple"
          />
          <StatWidget
            title="Total Income"
            value="$42,000"
            icon={Wallet}
            trend="up"
            trendValue="+$20,000"
            trendText="Last 30 days"
            color="success"
          />
          <StatWidget
            title="Total Expense"
            value="$30,000"
            icon={FileText}
            trend="up"
            trendValue="+$5,000"
            trendText="Last 30 days"
            color="red"
          />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">AuthCard (Sign In)</h2>
        <div className="max-w-lg mx-auto">
          <AuthCard type="signin" />
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">AuthCard (Sign Up)</h2>
        <div className="max-w-lg mx-auto">
          <AuthCard type="signup" />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">EmptyState</h2>
        <EmptyState image="/assets/images/chat/empty-img.png" title="No Messages" description="You have no new messages. Why not start a conversation?" />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">JobCard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <JobCard title="Senior Frontend Developer" company="Tech Solutions Inc." location="Remote" description="Seeking an experienced frontend developer to build modern web applications." imageUrl="/assets/images/card-component/card-img1.png" />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">ApplicationCard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ApplicationCard title="Backend Engineer" company="Data Systems" status="Pending" appliedDate="2024-10-28" />
            <ApplicationCard title="UI/UX Designer" company="Creative Minds" status="Interviewing" appliedDate="2024-10-25" />
            <ApplicationCard title="DevOps Specialist" company="Cloud Services" status="Accepted" appliedDate="2024-10-22" />
            <ApplicationCard title="Project Manager" company="Agile Innovations" status="Rejected" appliedDate="2024-10-20" />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">SearchBar</h2>
        <SearchBar placeholder="Search for jobs..." onSearch={(q) => alert(`Searching for: ${q}`)} />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">ProfileCard</h2>
        <div className="max-w-md">
            <ProfileCard 
                name="Robiul Hasan"
                email="ifrandom@gmail.com"
                avatarUrl="/assets/images/user-grid/user-grid-img14.png"
                coverImageUrl="/assets/images/user-grid/user-grid-bg1.png"
                personalInfo={[
                    { label: 'Full Name', value: 'Robiul Hasan' },
                    { label: 'Email', value: 'robiulhasan9559@gmail.com' },
                    { label: 'Department', value: 'Development' },
                ]}
            />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">ProjectCard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard 
                title="New Website Design"
                description="Creating a modern and responsive design for the company website."
                imageUrl="/assets/images/card-component/card-img2.png"
                taskCount={25}
                collaboratorCount={5}
            />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">TaskCard</h2>
        <TaskCard 
            title="Create landing page"
            description="Design and implement the main landing page."
            tag="UI Design"
            date="2024-11-15"
            imageUrl="/assets/images/kanban/kanban-1.png"
            onEdit={() => alert('Edit task')}
            onDelete={() => alert('Delete task')}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">FileCard</h2>
        <div className="max-w-sm">
            <FileCard 
                name="design-specs.pdf"
                type="PDF"
                size="2.5 MB"
                onDownload={() => alert('Downloading file')}
                onDelete={() => alert('Deleting file')}
            />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">CollaboratorAvatar</h2>
        <div className="flex items-center gap-4">
            <CollaboratorAvatar name="Jane Doe" imageUrl="/assets/images/avatar/avatar1.png" size="sm" status="online" />
            <CollaboratorAvatar name="John Smith" imageUrl="/assets/images/avatar/avatar2.png" size="md" status="offline" />
            <CollaboratorAvatar name="Peter Jones" imageUrl="/assets/images/avatar/avatar3.png" size="lg" />
        </div>
      </div>

    </DashboardLayout>
  );
}
