"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { Archive, CircleDollarSign, Clipboard, CodeXml, Layout, LucideIcon, Menu, SlidersHorizontal, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useTranslation } from "@/i18n";
import { useUserRole } from "@/hooks/useUserRole";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  badge?: string;
  badgeClassName?: string;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  badge,
  badgeClassName,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        }
        hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
          isActive ? "bg-blue-200 text-white" : ""
        }
        }`}
      >
        <Icon className="w-6 h-6 shrink-0 !text-gray-700"></Icon>

        <span
          className={`${
            isCollapsed ? "hidden" : "inline-flex items-center gap-4"
          } font-medium text-gray-700`}
        >
          <span>{label}</span>
          {badge && (
            <span
              className={`rounded-lg border px-3 py-0.5 text-[10px] tracking-wide ${badgeClassName || "bg-red-600/60 text-white border-red-950/15"}`}
            >
              {badge}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const { t } = useTranslation();
  const { role } = useUserRole();

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  const canAccessUsers = role === "ADMIN";
  const canAccessExpenses = role === "ADMIN" || role === "MANAGER";

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}

      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <Image
          src="https://aws-s3-inventorymanagement-basicsofis.s3.eu-north-1.amazonaws.com/logo.png"
          alt="stockify-logo"
          width={27}
          height={27}
          className="rounded w-8"
        />
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-2xl`}
        >
          {t("common.appName")}
        </h1>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-md hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* LINKS */}

      <div className="flex-grow mt-8">
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label={t("sidebar.dashboard")}
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/inventory"
          icon={Archive}
          label={t("sidebar.inventory")}
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/products"
          icon={Clipboard}
          label={t("sidebar.products")}
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/settings"
          icon={SlidersHorizontal}
          label={t("sidebar.settings")}
          isCollapsed={isSidebarCollapsed}
        />
        {canAccessExpenses && (
          <SidebarLink
            href="/expenses"
            icon={CircleDollarSign}
            label={t("sidebar.expenses")}
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {canAccessUsers && (
          <SidebarLink
            href="/users"
            icon={CodeXml}
            label={t("sidebar.users")}
            isCollapsed={isSidebarCollapsed}
            badge="Admin"
          />
        )}
      </div>

      {/* BOTTOM SETTINGS */}

      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-500">
          {t("sidebar.footer")}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
