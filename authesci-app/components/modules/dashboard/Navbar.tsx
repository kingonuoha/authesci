'use client'

import React, { useState } from 'react';
import { Menu, ArrowRight, Search, Mail, Bell, Sun, Moon, ChevronDown, User, Settings, LogOut, Globe, MessageSquare, CheckCircle, XCircle, Info, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = ({ toggleSidebar, toggleMobileSidebar }: { toggleSidebar: () => void, toggleMobileSidebar: () => void }) => {
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isMessageDropdownOpen, setIsMessageDropdownOpen] = useState(false);
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
              <label htmlFor="navbar-search-input" className="sr-only">Search</label>
              <input type="text" name="search" placeholder="Search" id="navbar-search-input" />
              <Search className="icon" aria-hidden="true" />
            </form>
          </div>
        </div>
        <div className="col-auto">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="theme-toggle"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 dark:text-white"
              aria-label="Toggle theme"
            >
              <span id="theme-toggle-dark-icon" className="hidden">
                <Sun aria-hidden="true" />
              </span>
              <span id="theme-toggle-light-icon" className="hidden">
                <Moon aria-hidden="true" />
              </span>
            </button>

            {/* Language Dropdown Start  */}
            <div className="hidden sm:inline-block relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="has-indicator flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 dark:text-white"
                type="button"
                aria-haspopup="true"
                aria-expanded={isLanguageDropdownOpen}
                aria-controls="dropdownInformation"
                aria-label="Select language"
              >
                <Image
                  src="/assets/images/lang-flag.png"
                  alt="Current language flag"
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                />
              </button>
              {isLanguageDropdownOpen && (
                <div
                  id="dropdownInformation"
                  className="z-10 absolute right-0 mt-2 w-44 rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-700"
                >
                  {/* Language Dropdown content here */}
                  <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-600/25">
                    <div>
                      <h6 className="mb-0 text-lg font-semibold text-neutral-900">Choose Your Language</h6>
                    </div>
                  </div>
                  <div className="scroll-sm max-h-[400px] overflow-y-auto pe-2">
                    <div className="mt-4 flex flex-col gap-4">
                      <div className="form-check style-check flex items-center justify-between">
                        <label className="form-check-label line-height-1 text-secondary-light font-medium" htmlFor="english">
                          <span className="hover-bXg-transparent hover-text-primary flex items-center gap-3 text-black">
                            <Image src="/assets/images/flags/flag1.png" alt="Flag of English" width={36} height={36} className="bg-success-subtle h-9 w-9 shrink-0 rounded-full text-success-600" />
                            <span className="mb-0 text-base font-semibold">English</span>
                          </span>
                        </label>
                        <input className="form-check-input rounded-full" name="language" type="radio" id="english" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Language Dropdown End  */}

            {/* Message Dropdown Start  */}
            <div className="relative">
              <button
                onClick={() => setIsMessageDropdownOpen(!isMessageDropdownOpen)}
                className="has-indicator flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"
                type="button"
                aria-haspopup="true"
                aria-expanded={isMessageDropdownOpen}
                aria-controls="dropdownMessage"
                aria-label="View messages"
              >
                <Mail className="text-xl text-neutral-900 dark:text-white" />
              </button>
              {isMessageDropdownOpen && (
                <div
                  id="dropdownMessage"
                  className="z-10 absolute right-0 mt-2 w-full max-w-[394px] overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-neutral-700"
                >
                  {/* Message Dropdown content here */}
                  <div className="m-4 flex items-center justify-between gap-2 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-600/25">
                    <h6 className="mb-0 text-lg font-semibold text-neutral-900">Message</h6>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-primary-600 dark:bg-neutral-600 dark:text-white">05</span>
                  </div>
                  <div className="scroll-sm !border-t-0">
                    <div className="max-h-[400px] overflow-y-auto">
                      <a href="#" className="flex justify-between gap-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <Image className="h-11 w-11 rounded-full" src="/assets/images/notification/profile-3.png" alt="User profile picture" width={44} height={44} />
                            <span className="absolute bottom-[2px] end-[2px] h-2.5 w-2.5 rounded-full border border-white bg-success-500 dark:border-gray-600"></span>
                          </div>
                          <div>
                            <h6 className="fw-semibold mb-1 text-sm">Robiul Hasan</h6>
                            <p className="mb-0 line-clamp-1 text-sm">hey! there i'm...</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-sm text-neutral-500">12:30 PM</span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-warning-600 text-xs text-white">8</span>
                        </div>
                      </a>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <Link href="/messages" className="text-center font-semibold text-primary-600 hover:underline dark:text-primary-600">See All Message</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Message Dropdown End  */}

            {/* Notification Start  */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className="has-indicator flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"
                type="button"
                aria-haspopup="true"
                aria-expanded={isNotificationDropdownOpen}
                aria-controls="dropdownNotification"
                aria-label="View notifications"
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
                            <CheckCircle className="text-2xl" />
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
                      <Link href="/notifications" className="text-center font-semibold text-primary-600 hover:underline dark:text-primary-600">See All Notification</Link>
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
                aria-haspopup="true"
                aria-expanded={isProfileDropdownOpen}
                aria-controls="dropdownProfile"
                aria-label="User profile menu"
              >
                <Image
                  src="/assets/images/user.png"
                  alt="User profile picture"
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
                      <h6 className="mb-0 text-lg font-semibold text-neutral-900">Robiul Hasan</h6>
                      <span className="text-neutral-500">Admin</span>
                    </div>
                    <button type="button" className="hover:text-danger-600" aria-label="Close profile menu">
                      <XCircle className="icon text-xl" />
                    </button>
                  </div>

                  <div className="scroll-sm max-h-[400px] overflow-y-auto pe-2">
                    <ul className="flex flex-col">
                      <li>
                        <Link className="flex items-center gap-4 px-0 py-2 text-black hover:text-primary-600" href="/view-profile">
                          <User className="icon text-xl" />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="flex items-center gap-4 px-0 py-2 text-black hover:text-primary-600" href="/email">
                          <Mail className="icon text-xl" />
                          Inbox
                        </Link>
                      </li>
                      <li>
                        <Link className="flex items-center gap-4 px-0 py-2 text-black hover:text-primary-600" href="/company">
                          <Settings className="icon text-xl" />
                          Setting
                        </Link>
                      </li>
                      <li>
                        <button type="button" className="flex items-center gap-4 px-0 py-2 text-black hover:text-danger-600">
                          <LogOut className="icon text-xl" />
                          Log Out
                        </button>
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

export default Navbar;