'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home, Mail, MessageSquare, Calendar, LayoutGrid, FileText, BrainCircuit, Bitcoin, Component, Book, Table, BarChart2, Package, Users, Key, GalleryHorizontal, DollarSign, HelpCircle, FileCheck, Settings, ChevronDown, Circle, X, Frown, Info, Tag, Monitor, Code, Image as ImageIcon, Mic, Video, Wallet, Type, Palette, Bell, Award, CreditCard, UserPlus, UserRound, UserX, Lock, GalleryThumbnails, DollarSignIcon, FileWarning, FileTextIcon, SlidersHorizontal, Building, BellRing, BellOff, PaletteIcon, Languages
} from 'lucide-react';

const SidebarLink = ({ href, icon: Icon, text, isSidebarOpen }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <li>
      <Link href={href} className={`flex items-center gap-3 px-4 py-2.5 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-md ${isActive ? 'bg-primary-100 dark:bg-primary-600/25 text-primary-600 dark:text-primary-400' : ''}`}>
        <Icon className="menu-icon" size={20} aria-hidden="true" />
        {isSidebarOpen && <span>{text}</span>}
      </Link>
    </li>
  );
};

const SidebarDropdown = ({ icon: Icon, text, children, isOpen, onClick, isSidebarOpen }) => {
  return (
    <li className={`dropdown ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-between gap-3 px-4 py-2.5 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-md w-full"
        aria-expanded={isOpen}
        aria-controls={`submenu-${text.toLowerCase().replace(/\s/g, '-')}`}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-3">
          <Icon className="menu-icon" size={20} aria-hidden="true" />
          {isSidebarOpen && <span>{text}</span>}
        </div>
        {isSidebarOpen && <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} aria-hidden="true" />}
      </button>
      {isSidebarOpen && <ul id={`submenu-${text.toLowerCase().replace(/\s/g, '-')}`} className="sidebar-submenu" style={{ display: isOpen ? 'block' : 'none' }}>
        {children}
      </ul>}
    </li>
  );
};

const SidebarSubmenuLink = ({ href, text, color = 'primary', isSidebarOpen }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    const colorClass = `text-${color}-600`;
    return (
        <li>
            <Link href={href} className={`flex items-center gap-2 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'font-semibold' : ''}`}>
                <Circle className={`w-2 h-2 ${colorClass}`} size={8} aria-hidden="true" /> {isSidebarOpen && text}
            </Link>
        </li>
    )
};

const SidebarGroupTitle = ({ title, isSidebarOpen }) => (
  isSidebarOpen ? <li className="sidebar-menu-group-title px-4 py-2 text-xs text-neutral-500 uppercase">{title}</li> : null
);

const Sidebar = ({ isSidebarOpen, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? '' : 'w-20'} ${isMobileSidebarOpen ? 'sidebar-open' : ''} bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700`}>
        <button type="button" className="sidebar-close-btn !mt-4" onClick={toggleMobileSidebar}>
          <X size={24} />
        </button>
        <div>
          <Link href="/" className="sidebar-logo flex items-center justify-center py-4">
            <Image src="/assets/images/logo.png" alt="site logo" width={150} height={40} className="light-logo" />
            <Image src="/assets/images/logo-light.png" alt="site logo" width={150} height={40} className="dark-logo" />
            <Image src="/assets/images/logo-icon.png" alt="site logo" width={40} height={40} className="logo-icon" />
          </Link>
        </div>
        <div className="sidebar-menu-area p-4">
          <ul className="sidebar-menu" id="sidebar-menu">
            <SidebarDropdown icon={Home} text="Dashboard" isOpen={openDropdown === 'dashboard'} onClick={() => handleDropdown('dashboard')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/dashboard/ai" text="AI" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/crm" text="CRM" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/ecommerce" text="eCommerce" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/cryptocurrency" text="Cryptocurrency" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/investment" text="Investment" color="success" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/lms" text="LMS / Learning System" color="purple" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/nft-gaming" text="NFT & Gaming" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/medical" text="Medical" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/analytics" text="Analytics" color="purple" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/pos-inventory" text="POS & Inventory" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/finance-banking" text="Finance & Banking" color="success" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/booking" text="Booking System" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/help-desk" text="Help Desk" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/dashboard/podcast" text="Podcast" color="warning" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>

            <SidebarGroupTitle title="Application" isSidebarOpen={isSidebarOpen} />
            <SidebarLink href="/email" icon={Mail} text="Email" isSidebarOpen={isSidebarOpen} />
            <SidebarLink href="/chat" icon={MessageSquare} text="Chat" isSidebarOpen={isSidebarOpen} />
            <SidebarLink href="/calendar" icon={Calendar} text="Calendar" isSidebarOpen={isSidebarOpen} />
            <SidebarLink href="/kanban" icon={LayoutGrid} text="Kanban" isSidebarOpen={isSidebarOpen} />
            <SidebarDropdown icon={FileText} text="Invoice" isOpen={openDropdown === 'invoice'} onClick={() => handleDropdown('invoice')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/invoice/list" text="List" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/invoice/preview" text="Preview" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/invoice/add" text="Add new" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/invoice/edit" text="Edit" color="danger" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>
            <SidebarDropdown icon={BrainCircuit} text="Ai Application" isOpen={openDropdown === 'ai-app'} onClick={() => handleDropdown('ai-app')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/ai/text-generator" text="Text Generator" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/ai/code-generator" text="Code Generator" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/ai/image-generator" text="Image Generator" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/ai/voice-generator" text="Voice Generator" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/ai/video-generator" text="Video Generator" color="success" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>
            <SidebarDropdown icon={Bitcoin} text="Crypto Currency" isOpen={openDropdown === 'crypto'} onClick={() => handleDropdown('crypto')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/crypto/wallet" text="Wallet" color="primary" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>

            <SidebarGroupTitle title="UI Elements" isSidebarOpen={isSidebarOpen} />
            <SidebarDropdown icon={Component} text="Components" isOpen={openDropdown === 'components'} onClick={() => handleDropdown('components')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/components/typography" text="Typography" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/colors" text="Colors" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/button" text="Button" color="success" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/dropdown" text="Dropdown" color="purple" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/alert" text="Alerts" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/card" text="Card" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/carousel" text="Carousel" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/avatars" text="Avatars" color="success" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/progress" text="Progress bar" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/tabs" text="Tab & Accordion" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/pagination" text="Pagination" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/badges" text="Badges" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/tooltip" text="Tooltip & Popover" color="purple" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/videos" text="Videos" color="cyan" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/star-ratings" text="Star Ratings" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/tags" text="Tags" color="purple" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/list" text="List" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/calendar" text="Calendar" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/radio" text="Radio" color="orange" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/switch" text="Switch" color="pink" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/components/image-upload" text="Upload" color="primary" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>
            <SidebarDropdown icon={Book} text="Forms" isOpen={openDropdown === 'forms'} onClick={() => handleDropdown('forms')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/forms/input" text="Input Forms" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/forms/layout" text="Input Layout" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/forms/validation" text="Form Validation" color="success" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/forms/wizard" text="Form Wizard" color="danger" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>
            <SidebarDropdown icon={Table} text="Table" isOpen={openDropdown === 'table'} onClick={() => handleDropdown('table')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/table/basic" text="Basic Table" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/table/data" text="Data Table" color="warning" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>
            <SidebarDropdown icon={BarChart2} text="Chart" isOpen={openDropdown === 'chart'} onClick={() => handleDropdown('chart')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/chart/line" text="Line Chart" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/chart/column" text="Column Chart" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/chart/pie" text="Pie Chart" color="success" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>
            <SidebarLink href="/widgets" icon={Package} text="Widgets" isSidebarOpen={isSidebarOpen} />
            <SidebarDropdown icon={Users} text="Users" isOpen={openDropdown === 'users'} onClick={() => handleDropdown('users')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/users/list" text="Users List" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/users/grid" text="Users Grid" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/users/add" text="Add User" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/users/profile" text="View Profile" color="danger" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>

            <SidebarGroupTitle title="Application" isSidebarOpen={isSidebarOpen} />
            <SidebarDropdown icon={Key} text="Authentication" isOpen={openDropdown === 'authentication'} onClick={() => handleDropdown('authentication')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/authentication/sign-in" text="Sign In" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/authentication/sign-up" text="Sign Up" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/authentication/forgot-password" text="Forgot Password" color="info" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>
            <SidebarLink href="/gallery" icon={GalleryHorizontal} text="Gallery" isSidebarOpen={isSidebarOpen} />
            <SidebarLink href="/pricing" icon={DollarSign} text="Pricing" isSidebarOpen={isSidebarOpen} />
            <SidebarLink href="/faq" icon={HelpCircle} text="FAQs." isSidebarOpen={isSidebarOpen} />
            <SidebarLink href="/error" icon={Frown} text="404" isSidebarOpen={isSidebarOpen} />
            <SidebarLink href="/terms-condition" icon={Info} text="Terms & Conditions" isSidebarOpen={isSidebarOpen} />
            <SidebarDropdown icon={Settings} text="Settings" isOpen={openDropdown === 'settings'} onClick={() => handleDropdown('settings')} isSidebarOpen={isSidebarOpen}>
              <SidebarSubmenuLink href="/settings/company" text="Company" color="primary" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/settings/notification" text="Notification" color="warning" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/settings/notification-alert" text="Notification Alert" color="info" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/settings/theme" text="Theme" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/settings/currencies" text="Currencies" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/settings/language" text="Languages" color="danger" isSidebarOpen={isSidebarOpen} />
              <SidebarSubmenuLink href="/settings/payment-gateway" text="Payment Gateway" color="danger" isSidebarOpen={isSidebarOpen} />
            </SidebarDropdown>
          </ul>
        </div>
      </aside>
  );
};

export default Sidebar;
