'use client'

import React, { useState } from 'react';
import { Menu, ArrowRight, Search, Bell, User, Settings, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Profile } from '@prisma/client';
import { ThemeToggle } from './ThemeToggle';
import { LogoutButton } from './auth/LogoutButton';
import { VerifiedBadge } from './profile/VerifiedBadge';
import { getProfileCompletion } from '@/lib/helpers/getProfileCompletion';
import RoleSwitcher from './RoleSwitcher';
import { NotificationBell } from './NotificationBell';

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
                  className="dropdown-menu-sm z-10 absolute right-0 mt-2 w-60 rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-700"
                >
                  <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-600/25">
                    <div>
                      <h6 className="mb-0 text-lg font-semibold text-neutral-900">{user.fullName || "User"}</h6>
                      <span className="text-neutral-500">{user.role}</span>
                    </div>
                    <button type="button" className="hover:text-danger-600">
                      <XCircle className="icon text-xl" />
                    </button>
                  </div>

                  <div className="scroll-sm max-h-[400px] overflow-y-auto pe-2">
                    <ul className="flex flex-col">
                      {/* RoleSwitcher component will be rendered here */}
                      <RoleSwitcher currentRole={user.role} />
                      <li>
                        <Link className="flex items-center gap-4 px-0 py-2 text-black hover:text-primary-600" href="/profile">
                          <User className="icon text-xl" />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="flex items-center gap-4 px-0 py-2 text-black hover:text-primary-600" href="/settings">
                          <Settings className="icon text-xl" />
                          Setting
                        </Link>
                      </li>
                      <li>
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