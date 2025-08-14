"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/app/hooks";
import { logout } from "@/store/auth/authSlice";
import toast from "react-hot-toast";
import AddAttendance from "./AddAttendance";
import AttendanceReport from "./AttendanceReport";
import Employees from "./Employees";
import { Button } from "@/components/ui/button";

const DashboardTabs = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear auth state synchronously to avoid UIs that depend on auth from re-rendering slowly
      dispatch(logout());

      // Show success message immediately
      toast.success("Successfully logged out");

      // Give React a tick to render the logged-out state, then navigate
      setTimeout(() => {
        try {
          router.push("/login");
        } catch (e) {
          console.error("Router navigation failed after logout:", e);
        }
      }, 150);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  // Set active tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab") || "dashboard";
    setActiveTab(tab);
  }, [searchParams]);

  // Tab configuration
  const tabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "add-attendance", name: "Add Attendance" },
    { id: "reports", name: "Attendance Reports" },
    { id: "employees", name: "Employees" },
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard?tab=${tabId}`);
  };

  // Render the selected tab's component below the header
  const renderTabContent = () => {
    switch (activeTab) {
      case "add-attendance":
        return <AddAttendance />;
      case "reports":
        return <AttendanceReport />;
      case "employees":
        return <Employees />;
      case "dashboard":
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            CSA Attendance System
          </h1>
          <div className="flex items-center space-x-4">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                className="px-3"
              >
                {tab.name}
              </Button>
            ))}
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
};

export default DashboardTabs;
