import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  Building,
  FlaskConical,
  ClipboardCheck,
  User,
  Bell,
  Shield,
} from 'lucide-react';

export const NAV_LINKS = {
  EMPLOYER: [
    { href: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/employer/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/employer/applicants', label: 'Applicants', icon: Users },
    { href: '/employer/profile', label: 'Company Profile', icon: Building },
    { href: '/employer/settings', label: 'Settings', icon: Settings },
  ],
  SCIENTIST: [
    { href: '/scientist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/scientist/jobs', label: 'Browse Jobs', icon: Briefcase },
    { href: '/scientist/applications', label: 'My Applications', icon: FileText },
    { href: '/scientist/profile', label: 'My Profile', icon: User },
    { href: '/scientist/settings', label: 'Settings', icon: Settings },
  ],
  COLLABORATOR: [
    { href: '/collaborator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/collaborator/projects', label: 'Projects', icon: FlaskConical },
    { href: '/collaborator/tasks', label: 'My Tasks', icon: ClipboardCheck },
    { href: '/collaborator/profile', label: 'My Profile', icon: User },
    { href: '/collaborator/settings', label: 'Settings', icon: Settings },
  ],
  ADMIN: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
    { href: '/admin/projects', label: 'Manage Projects', icon: FlaskConical },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/security', label: 'Security', icon: Shield },
  ],
};
