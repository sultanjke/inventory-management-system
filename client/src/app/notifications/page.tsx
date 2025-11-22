"use client";

import { useUser } from "@clerk/nextjs";
import Header from "@/app/(components)/Header";
import React from "react";

const Notifications = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return <div className="py-4">Loading...</div>;
  }

  const isAdmin =
    user?.primaryEmailAddress?.emailAddress === "s.mecheyev@outlook.com" ||
    user?.fullName === "Sultan Mecheyev";

  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Unknown date";

  return (
    <div className="w-full">
      <Header name="Notifications" />
      <div className="mt-5 flex flex-col gap-4">
        {/* Registration Notification */}
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Welcome to Stockify!
              </h3>
              <p className="text-gray-600 mt-1">
                You successfully registered on {createdDate}. We are glad to have
                you here.
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
                  Admin Access Granted
                </h3>
                <p className="text-gray-600 mt-1">
                  You have been granted admin privileges. You now have access to
                  the Users page.
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
