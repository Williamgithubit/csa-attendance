"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetDashboardStatsQuery } from "@/store/dashboard/dashboardApiSlice";
import { useGetAttendanceReportQuery } from "@/store/attendance/attendanceApiSlice";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import Employees from "@/components/dashboard/Employees";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RootState } from "@/types";

const DashboardContent = () => {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const {
    data: statsData,
    isLoading,
    error,
  } = useGetDashboardStatsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const {
    data: attendanceData,
    isLoading: attLoading,
    error: attError,
  } = useGetAttendanceReportQuery(
    { page: 1, limit: 5 },
    { skip: !isAuthenticated }
  );

  // Provide default values for stats
  const stats = statsData || {
    regular: 0,
    salary_deduction: 0,
    suspension: 0,
    dismissal: 0,
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Format number with commas, safely handling undefined, null, or non-number values
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num as any)) return "0";
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Stats configuration
  const statCards = [
    {
      title: "Regular Attendance",
      value: formatNumber(stats.regular),
      colorClass: "bg-green-50",
      icon: (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Salary Deduction",
      value: formatNumber(stats.salary_deduction),
      colorClass: "bg-yellow-50",
      icon: (
        <svg
          className="w-6 h-6 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Suspension",
      value: formatNumber(stats.suspension),
      colorClass: "bg-orange-50",
      icon: (
        <svg
          className="w-6 h-6 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      title: "Dismissal",
      value: formatNumber(stats.dismissal),
      colorClass: "bg-red-50",
      icon: (
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  // If the URL requests a tab other than the main dashboard, render only the tabs
  if (activeTab !== "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DashboardTabs />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation tabs (keeps existing tab component) */}
        <div className="mb-6">
          <DashboardTabs />
        </div>

        {/* Action bar & search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-1/2">
            <Input placeholder="Search employees or attendance records" />
            <Button
              variant="ghost"
              onClick={() => {
                /* quick filter stub */
              }}
            >
              Filters
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button onClick={() => router.push("/dashboard?tab=reports")}>
              View Reports
            </Button>
          </div>
        </div>

        {/* Stats grid */}
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {statCards.map((card) => (
            <Card key={card.title} className="shadow-sm">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${card.colorClass}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Updated now</div>
              </CardHeader>
            </Card>
          ))}
        </section>

        {/* Main content: recent attendance + employees preview */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full">
          <div className="lg:col-span-2 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {attLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                ) : attError ? (
                  <div className="text-red-600">Error loading attendance</div>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full text-left">
                      <thead className="text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="py-2">Employee</th>
                          <th className="py-2">Dept</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData && attendanceData.records.length > 0 ? (
                          attendanceData.records.map((r) => (
                            <tr className="border-t" key={r.id}>
                              <td className="py-2">{r.employeeName}</td>
                              <td className="py-2">{r.department}</td>
                              <td className="py-2">{r.status}</td>
                              <td className="py-2">
                                {r.date?.slice(0, 10) ?? "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-4 text-center text-gray-500"
                            >
                              No recent attendance records
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardContent;
