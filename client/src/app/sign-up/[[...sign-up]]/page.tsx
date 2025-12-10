"use client";

import { SignUp, useAuth } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const showLoader = authLoaded && isSignedIn;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 rounded-lg">
          <Image
            src="https://aws-s3-inventorymanagement-basicsofis.s3.eu-north-1.amazonaws.com/logo.png"
            alt="Stockify Logo"
            width={40}
            height={40}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Stockify
        </h1>
      </div>
      {showLoader && (
        <div className="mb-6 flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      )}
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-blue-500 hover:bg-blue-600 text-white !shadow-none",
          },
        }}
      />
    </div>
  );
}
