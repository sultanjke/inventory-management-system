"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Bell, ChevronDown, Globe, Menu, Moon, Settings, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Locale, useTranslation } from "@/i18n";

const Navbar = () => {
  const { user, isLoaded } = useUser();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { t, locale, setLocale } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const languages = useMemo(
    () => [
      { code: "en" as Locale, label: "English" },
      { code: "ru" as Locale, label: "Русский" },
    ],
    []
  );
  const currentLang =
    languages.find((lang) => lang.code === locale) ?? languages[0];

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  }

  const isAdmin = user?.primaryEmailAddress?.emailAddress === "s.mecheyev@outlook.com" || user?.fullName === "Sultan Mecheyev";
  const notificationCount = isLoaded && user ? (isAdmin ? 2 : 1) : 0;

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-md hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative">

          <input
            type="search"
            placeholder={t("common.searchPlaceholder")}
            className="pl-10 pr-1 py-2 w-50 md:w-80 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
          />

          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Bell className="text-gray-500" size={20} />
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5 px-5">
          <div>
            <button onClick={toggleDarkMode}>
              {isDarkMode ? (
                <Sun className="cursor-pointer text-gray-500" size={24} />
              ) : (
                <Moon className="cursor-pointer text-gray-500" size={24} />
              )}
            </button>
          </div>
          <div className="relative">
            <Link href="/notifications">
              <Bell className="cursor-pointer text-gray-500" size={24} />
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
                {notificationCount}
              </span>
            </Link>
          </div>
          <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />
          <div
            className="relative"
            tabIndex={0}
            onBlur={() => setTimeout(() => setIsLangOpen(false), 100)}
          >
            <button
              onClick={() => setIsLangOpen((prev) => !prev)}
              className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm hover:border-blue-400 focus:outline-none"
              aria-expanded={isLangOpen}
              aria-label={t("navbar.languageLabel")}
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">{currentLang.label}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isLangOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                      lang.code === locale
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      setLocale(lang.code);
                      setIsLangOpen(false);
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 cursor-pointer">
            <Image
              src={user?.imageUrl || "/server/assets/user.png"}
              alt="Profile"
              width={30}
              height={30}
              className="rounded-xl h-full object-cover"
            />
          </div>
          <span className="font-semibold">{user?.fullName}</span>
        </div>
        <Link href="/settings">
          <Settings className="cursor-pointer text-gray-500" size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
