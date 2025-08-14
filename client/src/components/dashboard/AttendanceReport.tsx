"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useGetAttendanceReportQuery } from "@/store/attendance/attendanceApiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 10;

type Filters = {
  startDate: string;
  endDate: string;
  status: "" | import("@/types/attendance").ConsequenceStatus;
  department: string;
};

export default function AttendanceReport() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    startDate: "",
    endDate: "",
    status: "",
    department: "",
  });

  // Map empty strings to undefined to satisfy AttendanceReportQuery types
  const { data, isLoading, isError, error } = useGetAttendanceReportQuery({
    page,
    limit: ITEMS_PER_PAGE,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    status: filters.status || undefined,
    department: filters.department || undefined,
  });

  // Chat / visualization state (hooks must be declared before any early returns)
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: "user" | "bot";
      text?: string;
      chart?: { label: string; value: number }[];
    }>
  >([]);

  const pushMessage = (m: {
    sender: "user" | "bot";
    text?: string;
    chart?: { label: string; value: number }[];
  }) => {
    setMessages((s) => [
      ...s,
      { id: String(Date.now()) + Math.random().toString(36).slice(2), ...m },
    ]);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset to first page when filters change
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      department: "",
    });
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading attendance data: {JSON.stringify(error)}
      </div>
    );
  }

  // Avoid using `{}` fallback which widens the type to `{}` and causes TS errors.
  const records = data?.records ?? [];
  const totalPages =
    data?.totalPages ?? Math.ceil((data?.totalRecords ?? 0) / ITEMS_PER_PAGE);

  const aggregateByDepartment = () => {
    const counts: Record<string, number> = {};
    records.forEach((r: any) => {
      const d = r.department || "Unknown";
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  const aggregateByDate = () => {
    const counts: Record<string, number> = {};
    records.forEach((r: any) => {
      const d = r.date
        ? new Date(r.date).toISOString().slice(0, 10)
        : "Unknown";
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const topEmployees = (n = 5) => {
    const counts: Record<string, number> = {};
    records.forEach((r: any) => {
      const name = r.employeeName || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  };

  const aggregateByStatus = () => {
    const counts: Record<string, number> = {
      regular: 0,
      salary_deduction: 0,
      suspension: 0,
      dismissal: 0,
    };
    records.forEach((r: any) => {
      const s = (r.status || "").toString();
      if (s === "regular") counts.regular += 1;
      else if (s === "salary_deduction") counts.salary_deduction += 1;
      else if (s === "suspension") counts.suspension += 1;
      else if (s === "dismissal") counts.dismissal += 1;
    });
    const out = [
      { label: "Regular", value: counts.regular },
      { label: "Salary Deduction", value: counts.salary_deduction },
      { label: "Suspension", value: counts.suspension },
      { label: "Dismissal", value: counts.dismissal },
    ];
    // Return only categories that have data to avoid empty bars
    return out.filter((o) => o.value > 0);
  };

  const handleChat = (text: string) => {
    if (!text.trim()) return;
    pushMessage({ sender: "user", text });

    const normalized = text.trim().toLowerCase();

    // simple command parsing
    if (normalized.includes("department")) {
      const dataDept = aggregateByDepartment();
      if (dataDept.length === 0) {
        pushMessage({ sender: "bot", text: "No department data available." });
      } else {
        pushMessage({
          sender: "bot",
          text: "Attendance by department:",
          chart: dataDept,
        });
      }
    } else if (
      normalized.includes("trend") ||
      normalized.includes("over time") ||
      normalized.includes("date")
    ) {
      const dataDate = aggregateByDate();
      if (dataDate.length === 0) {
        pushMessage({ sender: "bot", text: "No date trend data available." });
      } else {
        pushMessage({
          sender: "bot",
          text: "Attendance trend over time:",
          chart: dataDate.slice(-12),
        });
      }
    } else if (normalized.startsWith("top")) {
      const parts = normalized.split(/\s+/);
      const num = Number(parts[1]) || 5;
      const top = topEmployees(num);
      if (top.length === 0) {
        pushMessage({ sender: "bot", text: "No employee data available." });
      } else {
        pushMessage({
          sender: "bot",
          text: `Top ${top.length} employees by occurrences:`,
          chart: top,
        });
      }
    } else if (normalized.includes("summary") || normalized.includes("total")) {
      const total = records.length;
      const uniqueEmployees = new Set(records.map((r: any) => r.employeeName))
        .size;
      const dates = records
        .map((r: any) => r.date)
        .filter(Boolean)
        .sort();
      const range = dates.length
        ? `${dates[0].slice(0, 10)} → ${dates[dates.length - 1].slice(0, 10)}`
        : "N/A";
      pushMessage({
        sender: "bot",
        text: `Total records: ${total}\nUnique employees: ${uniqueEmployees}\nDate range: ${range}`,
      });
    } else {
      pushMessage({
        sender: "bot",
        text: "I didn't understand that. Try: 'by department', 'trend', 'top 5', or 'summary'.",
      });
    }
  };

  const Chart = ({
    data,
    height = 300,
  }: {
    data: { label: string; value: number }[];
    height?: number;
  }) => {
    if (!data || data.length === 0) return <div>No data to chart</div>;

    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend
    );

    const labels = data.map((d) => d.label);
    const values = data.map((d) => d.value);

    const colorMap: Record<string, string> = {
      Regular: "rgba(220, 60, 34, 0.9)", // brand
      "Salary Deduction": "rgba(245, 158, 11, 0.9)", // amber
      Suspension: "rgba(139, 92, 246, 0.9)", // violet
      Dismissal: "rgba(239, 68, 68, 0.9)", // red
    };

    const bgColors = labels.map((l) => colorMap[l] ?? "rgba(220, 60, 34, 0.9)");

    const chartData = {
      labels,
      datasets: [
        {
          label: "Count",
          data: values,
          backgroundColor: bgColors,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        x: { ticks: { color: "#374151" } },
        y: { ticks: { color: "#374151" }, beginAtZero: true },
      },
    } as any;

    return (
      <div className="mt-3 w-full" style={{ height }}>
        <Bar data={chartData} options={options} height={height} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">All Statuses</option>
                <option value="regular">Regular</option>
                <option value="salary_deduction">Salary Deduction</option>
                <option value="suspension">Suspension</option>
                <option value="dismissal">Dismissal</option>
              </select>
            </div>
            {/* Clear Filter */}
            <div className="flex items-end">
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Status distribution chart */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Status Distribution</h4>
            <div className="rounded-md border p-4 bg-white">
              <Chart data={aggregateByStatus()} height={320} />
              {aggregateByStatus().length === 0 && (
                <div className="text-sm text-gray-500 mt-2">
                  No status data to display
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            {/* Chat-driven visualization */}
            <div className="p-4 border-b">
              <h4 className="font-medium mb-2">Data Chat & Visualization</h4>
              <div className="space-y-3">
                <div className="max-h-40 overflow-auto p-2 bg-gray-50 rounded">
                  {messages.length === 0 && (
                    <div className="text-sm text-gray-500">
                      Ask the data: e.g. "by department", "trend", "top 5",
                      "summary".
                    </div>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-2 ${
                        m.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {m.text && (
                        <div
                          className={`inline-block px-3 py-1 rounded ${
                            m.sender === "user"
                              ? "bg-brand/10 text-brand"
                              : "bg-white text-gray-800"
                          }`}
                        >
                          {m.text.split("\n").map((line, idx) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </div>
                      )}
                      {m.chart && (
                        <div className="mt-2">
                          <Chart data={m.chart} height={200} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleChat(chatInput);
                        setChatInput("");
                      }
                    }}
                    placeholder="Ask the dataset (e.g. 'by department')"
                  />
                  <Button
                    onClick={() => {
                      handleChat(chatInput);
                      setChatInput("");
                    }}
                  >
                    Ask
                  </Button>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeName || "N/A"}</TableCell>
                    <TableCell>
                      {record.date
                        ? format(new Date(record.date), "MMM dd, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {record.status?.replace("_", " ") || "N/A"}
                    </TableCell>
                    <TableCell>{record.notes || "—"}</TableCell>
                    <TableCell>{record.department || "N/A"}</TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
