import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stockify",
  description: "Inventory Management System",
  icons: {
    icon: "https://aws-s3-inventorymanagement-basicsofis.s3.eu-north-1.amazonaws.com/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <DashboardWrapper>{children}</DashboardWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
