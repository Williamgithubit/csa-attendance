"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

const DashboardHeader = () => {
  const router = useRouter();
  const [exporting, setExporting] = React.useState(false);

  const exportCsv = async () => {
    try {
      setExporting(true);
      // Get token from localStorage (matches how RTK prepareHeaders stores it)
      let token: string | null = null;
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("auth");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            token = parsed?.token || parsed?.data?.token || null;
          } catch (e) {
            // ignore parse errors
          }
        }
      }

      const params = new URLSearchParams({});
      // If you want filters, add them to params here
      const res = await fetch(`/api/attendance/export?${params.toString()}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Export failed: ${res.status} ${txt}`);
      }

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        window.alert("No attendance records to export.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      a.href = url;
      a.download = `attendance-export-${y}${m}${d}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      window.alert(err?.message ?? "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <>
      {/* Top hero */}
      <header className="bg-white shadow rounded p-6 mb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/assets/csa-logo.jpg"
              alt="CSA logo"
              className="h-12 w-12 object-cover rounded-full hidden sm:block"
            />
            <div>
              <h1 className="text-2xl font-bold">
                Government of Liberia Attendance
              </h1>
              <p className="text-sm text-gray-600">Civil Service Agency</p>
              <p className="mt-2 text-gray-700">
                Welcome,{" "}
                <span className="font-medium">
                  {user?.fullName ?? user?.email ?? "Administrator"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/dashboard?tab=add-attendance")}
            >
              + Add Attendance
            </Button>
            <Button variant="outline" onClick={exportCsv} disabled={exporting}>
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
