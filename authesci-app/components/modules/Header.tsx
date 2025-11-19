'use client'

import React, { useState } from 'react';
import { Menu, ArrowRight, Search, Bell, User, Settings, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Profile } from '@prisma/client';
import { ThemeToggle } from './ThemeToggle';
import { LogoutButton } from './auth/LogoutButton';
import RoleSwitcher from './RoleSwitcher'; // Import RoleSwitcher

interface HeaderProps {
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  user: Profile;
}

const Header = ({ toggleSidebar, toggleMobileSidebar, user }: HeaderProps) => {
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

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
            <div className="relative">
              <button
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className="has-indicator flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"
                type="button"
              >
                <Bell className="text-xl text-neutral-900 dark:text-white" />
              </button>
              {isNotificationDropdownOpen && (
                <div
                  id="dropdownNotification"
                  className="z-10 absolute right-0 mt-2 w-full max-w-[394px] overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-neutral-700"
                >
                  {/* Notification Dropdown content here */}
                  <div className="m-4 flex items-center justify-between gap-2 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-600/25">
                    <h6 className="mb-0 text-lg font-semibold text-neutral-900">Notification</h6>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-primary-600 dark:bg-neutral-600 dark:text-white">05</span>
                  </div>
                  <div className="scroll-sm !border-t-0">
                    <div className="max-h-[400px] overflow-y-auto">
                      <a href="#" className="flex justify-between gap-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-success-200 text-success-600 dark:bg-success-600/25">
                            {/* <CheckCircle className="text-2xl" /> */}
                          </div>
                          <div>
                            <h6 className="fw-semibold mb-1 text-sm">Congratulations</h6>
                            <p className="mb-0 line-clamp-1 text-sm">Your profile has been Verified. Your profile has been Verified</p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="text-sm text-neutral-500">23 Mins ago</span>
                        </div>
                      </a>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <a href="#" className="text-center font-semibold text-primary-600 hover:underline dark:text-primary-600">See All Notification</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Notification End  */}

            <div className="relative">
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