"use client";

import { useUser } from "@clerk/nextjs";
import Header from "@/app/(components)/Header";
import React from "react";
import { useTranslation } from "@/i18n";
import { useUserRole } from "@/hooks/useUserRole";

const Notifications = () => {
  const { user, isLoaded } = useUser();
  const { t, locale } = useTranslation();
  const { role } = useUserRole();
  const dateLocale = locale === "ru" ? "ru-RU" : "en-US";

  if (!isLoaded || !user) {
    return <div className="py-4">{t("common.loading")}</div>;
  }

  const isAdmin = role === "ADMIN";

  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(dateLocale)
    : t("common.unknownDate");

  return (
    <div className="w-full">
      <Header name={t("notifications.title")} />
      <div className="mt-5 flex flex-col gap-4">
        {/* Registration Notification */}
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                {t("notifications.welcomeTitle")}
              </h3>
              <p className="text-gray-600 mt-1">
                {t("notifications.welcomeBody", { date: createdDate })}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Notification */}
        {isAdmin && (
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {t("notifications.adminTitle")}
                </h3>
                <p className="text-gray-600 mt-1">
                  {t("notifications.adminBody")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
