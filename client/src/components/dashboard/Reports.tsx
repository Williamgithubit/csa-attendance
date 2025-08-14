"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useGetEmployeeAttendanceQuery } from "@/store/api/apiSlice";
import { RootState } from "@/store/store";
import { setAttendanceFilter } from "@/store/attendance/attendanceSlice";
import { AttendanceRecord, ConsequenceStatus } from "@/types/attendance";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type AttendanceWithEmployee = AttendanceRecord & {
  employeeName: string;
  department: string;
};

// Define filter state interface
interface FilterState {
  startDate: string;
  endDate: string;
  department: string;
  status: ConsequenceStatus | "";
}

const Reports = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const filter = useSelector((state: RootState) => state.attendance.filter);

  // Fetch attendance data for all employees
  const {
    data: attendanceData = [],
    isLoading,
    error,
  } = useGetEmployeeAttendanceQuery(
    "", // Empty string to get all employees' attendance
    {
      skip: !isAuthenticated,
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data as AttendanceWithEmployee[] | undefined,
      }),
    }
  );

  // Type guard to check if record has required properties
  const isAttendanceWithEmployee = (
    record: any
  ): record is AttendanceWithEmployee => {
    return (
      record &&
      typeof record.id === "string" &&
      typeof record.employeeName === "string" &&
      typeof record.department === "string" &&
      typeof record.date === "string" &&
      typeof record.status === "string" &&
      (typeof record.notes === "string" || record.notes === undefined)
    );
  };

  // Local state for pagination and export
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  // Transform the data to match the expected format
  const attendanceRecords: AttendanceWithEmployee[] = Array.isArray(
    attendanceData
  )
    ? attendanceData
    : [];
  const totalRecords = attendanceRecords.length;

  // Handle error state
  const [errorState, setErrorState] = useState<Error | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    dispatch(setAttendanceFilter({ [name]: value }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    if (!currentRecords.length) return;

    const headers = ["Employee Name", "Department", "Date", "Status", "Notes"];
    const csvContent = [
      headers.join(","),
      ...currentRecords.map(
        (record) =>
          `"${record.employeeName}","${record.department}","${record.date}","${
            record.status
          }","${record.notes || ""}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `attendance_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.click();
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const currentRecords = attendanceRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
    >
      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              name="department"
              value={filter.department}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="hr">Human Resources</option>
              <option value="finance">Finance</option>
              <option value="it">IT</option>
              <option value="operations">Operations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="regular">Regular</option>
              <option value="salary_deduction">Salary Deduction</option>
              <option value="suspension">Suspension</option>
              <option value="dismissal">Dismissal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Attendance Report
          </h3>
          <Button
            onClick={handleExportCSV}
            disabled={isLoading || !attendanceRecords.length}
          >
            Export to CSV
          </Button>
        </div>
        {isLoading ? (
          <div className="animate-pulse p-6">
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ) : errorState ? (
          <div className="p-6 text-red-500">
            Error loading attendance report
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords
                  .filter(isAttendanceWithEmployee)
                  .map((record) => {
                    // Ensure the status is one of the allowed values
                    const status: ConsequenceStatus =
                      record.status === "regular" ||
                      record.status === "salary_deduction" ||
                      record.status === "suspension" ||
                      record.status === "dismissal"
                        ? record.status
                        : "regular"; // default to 'regular' if invalid

                    return (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.employeeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(record.date), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatStatus(status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {record.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && attendanceRecords.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
            {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
            {totalRecords} records
          </div>
          <div className="flex space-x-2">
            {pageNumbers.map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Reports;
