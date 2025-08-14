"use client";

import { useState, useEffect, useRef } from "react";
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Close mobile menu when clicking/tapping outside
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              CSA Attendance System
            </h1>
          </div>

          {/* Desktop tabs/actions */}
          <div className="hidden md:flex items-center space-x-4">
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
            <Button onClick={handleLogout} className="ml-2" size="sm">
              Logout
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((s) => !s)}
              ref={menuButtonRef}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile tab bar (horizontal scroll) */}
        <div className="md:hidden border-t bg-white">
          <div className="flex space-x-2 overflow-x-auto py-2 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  handleTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-brand text-white"
                    : "bg-white text-gray-700 border"
                }`}
              >
                {tab.name}
              </button>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-700 border"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute inset-x-4 top-20 z-40 bg-white shadow-md rounded-md p-3"
          >
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activeTab === tab.id
                      ? "bg-brand text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Tab Content */}
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
};

export default DashboardTabs;
