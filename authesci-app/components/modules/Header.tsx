'use client'

import React from 'react';
import { Menu, ArrowRight, Search, Mail, Bell } from 'lucide-react';

const Header = ({ toggleSidebar, toggleMobileSidebar }: { toggleSidebar: () => void, toggleMobileSidebar: () => void }) => {
  return (
    <div className="navbar-header border-b border-neutral-200 dark:border-neutral-600">
      <div className="flex items-center justify-between">
        <div className="col-auto">
          <div className="flex flex-wrap items-center gap-[16px]">
            <button type="button" className="sidebar-toggle" onClick={toggleSidebar}>
              <Menu
                className="icon non-active"
              ></Menu>
              <iconify-icon
                icon="iconoir:arrow-right"
                className="icon active"
              ></iconify-icon>
            </button>
            <button type="button" className="sidebar-mobile-toggle d-flex !leading-[0]" onClick={toggleMobileSidebar}>
              <iconify-icon
                icon="heroicons:bars-3-solid"
                className="icon !text-[30px]"
              ></iconify-icon>
            </button>
            <form className="navbar-search">
              <input type="text" name="search" placeholder="Search" />
              <iconify-icon icon="ion:search-outline" className="icon"></iconify-icon>
            </form>
          </div>
        </div>
        <div className="col-auto">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="theme-toggle"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 dark:text-white"
            >
              <span id="theme-toggle-dark-icon" className="hidden">
                <i className="ri-sun-line"></i>
              </span>
              <span id="theme-toggle-light-icon" className="hidden">
                <i className="ri-moon-line"></i>
              </span>
            </button>

            {/* Language Dropdown Start  */}
            <div className="hidden sm:inline-block">
              <button
                data-dropdown-toggle="dropdownInformation"
                className="has-indicator flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 dark:text-white"
                type="button"
              >
                <img
                  src="/assets/images/lang-flag.png"
                  alt="image"
                  className="h-6 w-6 rounded-full object-cover"
                />
              </button>
              <div
                id="dropdownInformation"
                className="dropdown-menu-sm z-10 hidden rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-700"
              >
                {/* Dropdown content here */}
              </div>
            </div>
            {/* Language Dropdown End  */}

            {/* Message Dropdown Start  */}
            <button
              data-dropdown-toggle="dropdownMessage"
              className="has-indicator flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"
              type="button"
            >
              <iconify-icon
                icon="mage:email"
                className="text-xl text-neutral-900 dark:text-white"
              ></iconify-icon>
            </button>
            <div
              id="dropdownMessage"
              className="z-10 hidden w-full max-w-[394px] overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-neutral-700"
            >
              {/* Dropdown content here */}
            </div>
            {/* Message Dropdown End  */}

            {/* Notification Start  */}
            <button
              data-dropdown-toggle="dropdownNotification"
              className="has-indicator flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"
              type="button"
            >
              <iconify-icon
                icon="iconoir:bell"
                className="text-xl text-neutral-900 dark:text-white"
              ></iconify-icon>
            </button>
            <div
              id="dropdownNotification"
              className="z-10 hidden w-full max-w-[394px] overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-neutral-700"
            >
              {/* Dropdown content here */}
            </div>
            {/* Notification End  */}

            <button
              data-dropdown-toggle="dropdownProfile"
              className="flex items-center justify-center rounded-full"
              type="button"
            >
              <img
                src="/assets/images/user.png"
                alt="image"
                className="object-fit-cover h-10 w-10 rounded-full"
              />
            </button>
            <div
              id="dropdownProfile"
              className="dropdown-menu-sm z-10 hidden rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-700"
            >
              {/* Dropdown content here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;