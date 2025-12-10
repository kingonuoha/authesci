'use client'

import React, { useState } from 'react';
import { Menu, ArrowRight, Search, Bell, User, Settings, XCircle, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Profile } from '@prisma/client';
import { ThemeToggle } from './ThemeToggle';
import { LogoutButton } from './auth/LogoutButton';
import { VerifiedBadge } from './profile/VerifiedBadge';
import { getProfileCompletion } from '@/lib/helpers/getProfileCompletion';
import RoleSwitcher from './RoleSwitcher';
import { NotificationBell } from './NotificationBell';
import { MessageDropdown } from './MessageDropdown';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  user: Profile;
}

const Header = ({ toggleSidebar, toggleMobileSidebar, user }: HeaderProps) => {
  // const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false); // Moved to NotificationBell
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isVerified } = getProfileCompletion(user);

  return (
    <div className="navbar-header border-b border-neutral-200 dark:border-neutral-600">
      <div className="flex items-center justify-between">
        <div className="col-auto">
          <div className="flex flex-wrap items-center gap-[16px]">
            <button type="button" className="sidebar-toggle" onClick={toggleSidebar}>
              <Menu className="icon non-active" />
              <ArrowRight className="icon active" />
            </button>
            <button type="button" className="sidebar-mobile-toggle d-flex !leading-[0]" onClick={toggleMobileSidebar}>
              <Menu className="icon !text-[30px]" />
            </button>
            <form className="navbar-search">
              <input type="text" name="search" placeholder="Search" />
              <Search className="icon" />
            </form>
          </div>
        </div>
        <div className="col-auto">
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />

            {/* Message Dropdown Start  */}
            <MessageDropdown />
            {/* Message Dropdown End  */}

            {/* Notification Start  */}
            <NotificationBell />
            {/* Notification End  */}

            <div className="relative flex items-center gap-2">
              {isVerified && <VerifiedBadge />}
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center justify-center rounded-full"
                type="button"
              >
                <Image
                  src={user.avatarUrl || "/assets/images/user.png"}
                  alt={user.fullName || "User avatar"}
                  width={40}
                  height={40}
                  className="object-fit-cover h-10 w-10 rounded-full"
                />
              </button>
              {isProfileDropdownOpen && (
                <div
                  id="dropdownProfile"
                  className="absolute right-0 top-full mt-3 w-64 rounded-xl bg-white p-3 shadow-xl z-50 dark:bg-neutral-700 border border-neutral-100 dark:border-neutral-600"
                >
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-600/25">
                    <div className="overflow-hidden">
                      <h6 className="mb-0 text-base font-semibold text-neutral-900 dark:text-white truncate" title={user.fullName || "User"}>
                        {user.fullName || "User"}
                      </h6>
                      <p className="text-xs text-neutral-500 dark:text-neutral-300 capitalize truncate">{user.role.toLowerCase()}</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-neutral-500 hover:text-danger-600 dark:text-neutral-400 dark:hover:text-danger-400"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      aria-label="Close profile menu"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    <ul className="flex flex-col gap-1">
                      {/* RoleSwitcher component will be rendered here */}
                      <RoleSwitcher currentRole={user.role} />
                      <li>
                        <Link
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-md transition-colors"
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-md transition-colors"
                          href="/messages"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Mail className="h-4 w-4" />
                          Inbox
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-md transition-colors"
                          href="/settings"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </li>
                      <li className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-600">
                        <LogoutButton />
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;