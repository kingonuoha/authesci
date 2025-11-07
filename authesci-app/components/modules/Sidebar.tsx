'use client'

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Sidebar = ({ isSidebarOpen, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar }: { isSidebarOpen: boolean, toggleSidebar: () => void, isMobileSidebarOpen: boolean, toggleMobileSidebar: () => void }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const handleDropdown = (dropdown: string) => {
    if (openDropdown === dropdown) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdown);
    }
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? '' : 'w-20'} ${isMobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <button type="button" className="sidebar-close-btn !mt-4" onClick={toggleMobileSidebar}>
          <iconify-icon icon="radix-icons:cross-2"></iconify-icon>
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
            <li className={`dropdown ${openDropdown === 'dashboard' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('dashboard')}>
                <iconify-icon icon="solar:home-smile-angle-outline" className="menu-icon"></iconify-icon>
                <span>Dashboard</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'dashboard' ? 'block' : 'none' }}>
                <li><Link href="/"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> AI</Link></li>
                <li><Link href="/index-2"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> CRM</Link></li>
                <li><Link href="/index-3"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> eCommerce</Link></li>
                <li><Link href="/index-4"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Cryptocurrency</Link></li>
                <li><Link href="/index-5"><i className="ri-circle-fill circle-icon text-success-600 w-auto"></i> Investment</Link></li>
                <li><Link href="/index-6"><i className="ri-circle-fill circle-icon text-purple-600 w-auto"></i> LMS / Learning System</Link></li>
                <li><Link href="/index-7"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> NFT & Gaming</Link></li>
                <li><Link href="/index-8"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Medical</Link></li>
                <li><Link href="/index-9"><i className="ri-circle-fill circle-icon text-purple-600 w-auto"></i> Analytics</Link></li>
                <li><Link href="/index-10"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> POS & Inventory</Link></li>
                <li><Link href="/index-11"><i className="ri-circle-fill circle-icon text-success-600 w-auto"></i> Finance & Banking</Link></li>
                <li><Link href="/index-12"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Booking System</Link></li>
                <li><Link href="/index-13"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> Help Desk</Link></li>
                <li><Link href="/index-14"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Podcast</Link></li>
              </ul>
            </li>
            <li className="sidebar-menu-group-title">Application</li>
            <li>
              <Link href="/email">
                <iconify-icon icon="mage:email" className="menu-icon"></iconify-icon>
                <span>Email</span>
              </Link>
            </li>
            <li>
              <Link href="/chat-message">
                <iconify-icon icon="bi:chat-dots" className="menu-icon"></iconify-icon>
                <span>Chat</span>
              </Link>
            </li>
            <li>
              <Link href="/calendar-main">
                <iconify-icon icon="solar:calendar-outline" className="menu-icon"></iconify-icon>
                <span>Calendar</span>
              </Link>
            </li>
            <li>
              <Link href="/kanban">
                <iconify-icon icon="material-symbols:map-outline" className="menu-icon"></iconify-icon>
                <span>Kanban</span>
              </Link>
            </li>
            <li className={`dropdown ${openDropdown === 'invoice' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('invoice')}>
                <iconify-icon icon="hugeicons:invoice-03" className="menu-icon"></iconify-icon>
                <span>Invoice</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'invoice' ? 'block' : 'none' }}>
                <li><Link href="/invoice-list"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> List</Link></li>
                <li><Link href="/invoice-preview"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Preview</Link></li>
                <li><Link href="/invoice-add"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> Add new</Link></li>
                <li><Link href="/invoice-edit"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Edit</Link></li>
              </ul>
            </li>
            <li className={`dropdown ${openDropdown === 'ai-app' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('ai-app')}>
                <iconify-icon icon="hugeicons:ai-brain-03" className="menu-icon"></iconify-icon>
                <span>Ai Application</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'ai-app' ? 'block' : 'none' }}>
                <li><Link href="/text-generator"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Text Generator</Link></li>
                <li><Link href="/code-generator"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Code Generator</Link></li>
                <li><Link href="/image-generator"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> Image Generator</Link></li>
                <li><Link href="/voice-generator"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Voice Generator</Link></li>
                <li><Link href="/video-generator"><i className="ri-circle-fill circle-icon text-success-600 w-auto"></i> Video Generator</Link></li>
              </ul>
            </li>

            <li className={`dropdown ${openDropdown === 'crypto' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('crypto')}>
                <iconify-icon icon="hugeicons:bitcoin-circle" className="menu-icon"></iconify-icon>
                <span>Crypto Currency</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'crypto' ? 'block' : 'none' }}>
                <li><Link href="/wallet"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Wallet</Link></li>
              </ul>
            </li>

            <li className="sidebar-menu-group-title">UI Elements</li>

            <li className={`dropdown ${openDropdown === 'components' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('components')}>
                <iconify-icon icon="solar:document-text-outline" className="menu-icon"></iconify-icon>
                <span>Components</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'components' ? 'block' : 'none' }}>
                <li><Link href="/typography"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Typography</Link></li>
                <li><Link href="/colors"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Colors</Link></li>
                <li><Link href="/button"><i className="ri-circle-fill circle-icon text-success-600 w-auto"></i> Button</Link></li>
                <li><Link href="/dropdown"><i className="ri-circle-fill circle-icon text-purple-600  dark:text-purple-400 w-auto"></i> Dropdown</Link></li>
                <li><Link href="/alert"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Alerts</Link></li>
                <li><Link href="/card"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Card</Link></li>
                <li><Link href="/carousel"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> Carousel</Link></li>
                <li><Link href="/avatar"><i className="ri-circle-fill circle-icon text-success-600 w-auto"></i> Avatars</Link></li>
                <li><Link href="/progress"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Progress bar</Link></li>
                <li><Link href="/tabs"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Tab & Accordion</Link></li>
                <li><Link href="/pagination"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Pagination</Link></li>
                <li><Link href="/badges"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> Badges</Link></li>
                <li><Link href="/tooltip"><i className="ri-circle-fill circle-icon dark:text-purple-400 w-auto"></i> Tooltip & Popover</Link></li>
                <li><Link href="/videos"><i className="ri-circle-fill circle-icon text-cyan-600 w-auto"></i> Videos</Link></li>
                <li><Link href="/star-rating"><i className="ri-circle-fill circle-icon text-[#7f27ff] w-auto"></i> Star Ratings</Link></li>
                <li><Link href="/tags"><i className="ri-circle-fill circle-icon text-[#8252e9] w-auto"></i> Tags</Link></li>
                <li><Link href="/list"><i className="ri-circle-fill circle-icon text-[#e30a0a] w-auto"></i> List</Link></li>
                <li><Link href="/calendar"><i className="ri-circle-fill circle-icon text-yellow-400 w-auto"></i> Calendar</Link></li>
                <li><Link href="/radio"><i className="ri-circle-fill circle-icon text-orange-500 w-auto"></i> Radio</Link></li>
                <li><Link href="/switch"><i className="ri-circle-fill circle-icon text-pink-600 w-auto"></i> Switch</Link></li>
                <li><Link href="/image-upload"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Upload</Link></li>
              </ul>
            </li>
            <li className={`dropdown ${openDropdown === 'forms' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('forms')}>
                <iconify-icon icon="heroicons:document" className="menu-icon"></iconify-icon>
                <span>Forms</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'forms' ? 'block' : 'none' }}>
                <li><Link href="/form"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Input Forms</Link></li>
                <li><Link href="/form-layout"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Input Layout</Link></li>
                <li><Link href="/form-validation"><i className="ri-circle-fill circle-icon text-success-600 w-auto"></i> Form Validation</Link></li>
                <li><Link href="/wizard"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Form Wizard</Link></li>
              </ul>
            </li>
            <li className={`dropdown ${openDropdown === 'table' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('table')}>
                <iconify-icon icon="mingcute:storage-line" className="menu-icon"></iconify-icon>
                <span>Table</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'table' ? 'block' : 'none' }}>
                <li><Link href="/table-basic"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Basic Table</Link></li>
                <li><Link href="/table-data"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Data Table</Link></li>
              </ul>
            </li>
            <li className={`dropdown ${openDropdown === 'chart' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('chart')}>
                <iconify-icon icon="solar:pie-chart-outline" className="menu-icon"></iconify-icon>
                <span>Chart</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'chart' ? 'block' : 'none' }}>
                <li><Link href="/line-chart"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Line Chart</Link></li>
                <li><Link href="/column-chart"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Column Chart</Link></li>
                <li><Link href="/pie-chart"><i className="ri-circle-fill circle-icon text-success-600 w-auto"></i> Pie Chart</Link></li>
              </ul>
            </li>
            <li>
              <Link href="/widgets">
                <iconify-icon icon="fe:vector" className="menu-icon"></iconify-icon>
                <span>Widgets</span>
              </Link>
            </li>
            <li className={`dropdown ${openDropdown === 'users' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('users')}>
                <iconify-icon icon="flowbite:users-group-outline" className="menu-icon"></iconify-icon>
                <span>Users</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'users' ? 'block' : 'none' }}>
                <li><Link href="/users-list"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Users List</Link></li>
                <li><Link href="/users-grid"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Users Grid</Link></li>
                <li><Link href="/add-user"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> Add User</Link></li>
                <li><Link href="/view-profile"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> View Profile</Link></li>
              </ul>
            </li>

            <li className="sidebar-menu-group-title">Application</li>

            <li className={`dropdown ${openDropdown === 'authentication' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('authentication')}>
                <iconify-icon icon="simple-line-icons:vector" className="menu-icon"></iconify-icon>
                <span>Authentication</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'authentication' ? 'block' : 'none' }}>
                <li><Link href="/sign-in"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Sign In</Link></li>
                <li><Link href="/sign-up"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Sign Up</Link></li>
                <li><Link href="/forgot-password"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> Forgot Password</Link></li>
              </ul>
            </li>
            <li>
              <Link href="/gallery">
                <iconify-icon icon="solar:gallery-wide-linear" className="menu-icon"></iconify-icon>
                <span>Gallery</span>
              </Link>
            </li>
            <li>
              <Link href="/pricing">
                <iconify-icon icon="hugeicons:money-send-square" className="menu-icon"></iconify-icon>
                <span>Pricing</span>
              </Link>
            </li>
            <li>
              <Link href="/faq">
                <iconify-icon icon="mage:message-question-mark-round" className="menu-icon"></iconify-icon>
                <span>FAQs.</span>
              </Link>
            </li>
            <li>
              <Link href="/error">
                <iconify-icon icon="streamline:straight-face" className="menu-icon"></iconify-icon>
                <span>404</span>
              </Link>
            </li>
            <li>
              <Link href="/terms-condition">
                <iconify-icon icon="octicon:info-24" className="menu-icon"></iconify-icon>
                <span>Terms & Conditions</span>
              </Link>
            </li>
            <li className={`dropdown ${openDropdown === 'settings' ? 'open' : ''}`}>
              <a href="#" onClick={() => handleDropdown('settings')}>
                <iconify-icon icon="icon-park-outline:setting-two" className="menu-icon"></iconify-icon>
                <span>Settings</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: openDropdown === 'settings' ? 'block' : 'none' }}>
                <li><Link href="/company"><i className="ri-circle-fill circle-icon text-primary-600 w-auto"></i> Company</Link></li>
                <li><Link href="/notification"><i className="ri-circle-fill circle-icon text-warning-600 w-auto"></i> Notification</Link></li>
                <li><Link href="/notification-alert"><i className="ri-circle-fill circle-icon text-info-600 w-auto"></i> Notification Alert</Link></li>
                <li><Link href="/theme"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Theme</Link></li>
                <li><Link href="/currencies"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Currencies</Link></li>
                <li><Link href="/language"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Languages</Link></li>
                <li><Link href="/payment-gateway"><i className="ri-circle-fill circle-icon text-danger-600 w-auto"></i> Payment Gateway</Link></li>
              </ul>
            </li>
          </ul>
        </div>
      </aside>
  );
};

export default Sidebar;