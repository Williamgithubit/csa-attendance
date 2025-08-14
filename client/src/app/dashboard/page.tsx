"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

// Dynamically import the DashboardContent component with SSR disabled
const DashboardContent = dynamic<{}>(
  () =>
    import("../../components/dashboard/DashboardContent").then(
      (mod) => mod.default
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    ),
  }
);

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
          </div>
        }
      >
        <DashboardHeader />
        <DashboardContent />
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Government of Liberia - Civil Service
            Agency
          </p>
        </footer>
      </Suspense>
    </ProtectedRoute>
  );
};

export default DashboardPage;
