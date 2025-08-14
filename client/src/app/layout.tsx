import type { Metadata } from "next";
import RootLayoutClient from "./RootLayoutClient";
import "./globals.css";

export const metadata: Metadata = {
  title: "Government of Liberia - CSA Attendance",
  description: "Civil Service Agency Attendance Management System",
  icons: {
    icon: '/assets/csa-logo.jpg',
    apple: '/assets/csa-logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
