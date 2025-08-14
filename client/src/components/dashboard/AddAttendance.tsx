"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppSelector } from "@/app/hooks";
import {
  useAddAttendanceMutation,
  useGetEmployeesQuery,
} from "@/store/api/apiSlice";
import { Employee } from "@/types";
import { ConsequenceStatus } from "@/types/attendance";

type RootState = {
  auth: {
    isAuthenticated: boolean;
  };
};

export default function AddAttendance() {
  const [employeeId, setEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [signInTime, setSignInTime] = useState("");
  const [signOutTime, setSignOutTime] = useState("");
  const [status, setStatus] = useState<ConsequenceStatus>("Select Consequence");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [employeeQuery, setEmployeeQuery] = useState("");

  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // RTK Query hooks
  const { data: employees = [], isLoading: isLoadingEmployees } =
    useGetEmployeesQuery(undefined, {
      skip: !isAuthenticated,
    });

  const [addAttendance, { isLoading: isAdding }] = useAddAttendanceMutation();

  // Filter employees by name or ID based on search query
  const filteredEmployees = employees.filter((emp: Employee) => {
    const q = employeeQuery.toLowerCase();
    return (
      emp.fullName?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q)
    );
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Map days missed to consequence
  const computeConsequence = (days: number): ConsequenceStatus => {
    if (isNaN(days) || days < 0)
      return "select_consequence" as ConsequenceStatus;
    if (days <= 2) return "regular" as ConsequenceStatus;
    if (days <= 5) return "salary_deduction" as ConsequenceStatus;
    if (days <= 10) return "suspension" as ConsequenceStatus;
    return "dismissal" as ConsequenceStatus;
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!employeeId) newErrors.employeeId = "Please select an employee";
    if (!attendanceDate)
      newErrors.attendanceDate = "Please select the attendance date";

    if (signInTime && signOutTime) {
      if (signOutTime <= signInTime) {
        newErrors.signOutTime = "Sign-out time must be after sign-in time";
      }
    }

    if (!signInTime) newErrors.signInTime = "Please enter sign-in time";
    if (!signOutTime) newErrors.signOutTime = "Please enter sign-out time";

    if (!status) newErrors.status = "Please select attendance status";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    if (!validateForm()) {
      setNotification({
        type: "error",
        message: "Please correct the errors in the form",
      });
      toast.error("Please correct the errors in the form");
      return;
    }

    const toastId = toast.loading("Saving attendance...");

    try {
      const attendanceData = {
        employee_id: employeeId,
        attendance_date: attendanceDate,
        sign_in_time: signInTime,
        sign_out_time: signOutTime,
        status,
        reason: reason || null,
        comments,
      };

      await addAttendance(attendanceData).unwrap();

      // Reset form
      setEmployeeId("");
      setAttendanceDate("");
      setSignInTime("");
      setSignOutTime("");
      setStatus("Select Consequence");
      setReason("");
      setComments("");
      setErrors({});
      setNotification({
        type: "success",
        message: "Attendance record added successfully!",
      });

      toast.success("Attendance record added successfully!", { id: toastId });

      setTimeout(() => {
        setNotification(null);
        router.push("/dashboard");
      }, 1200);
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to add attendance. Please try again.",
      });
      toast.error("Failed to add attendance. Please try again.", {
        id: toastId,
      });
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All changes will be lost."
      )
    ) {
      router.push("/dashboard");
    }
  };

  //ConsequenceStatuses
  const consequenceStatuses = [
    { value: "select_consequence", label: "Select Consequence" },
    { value: "regular", label: "Regular" },
    { value: "salary_deduction", label: "Salary Deduction" },
    { value: "on_leave", label: "On Leave" },
    { value: "suspension", label: "Suspension" },
    { value: "dismissal", label: "Dismissal" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow rounded-lg p-6"
        >
          {notification && (
            <div
              className={`mb-6 p-4 rounded-md ${
                notification.type === "success" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p
                className={`text-sm ${
                  notification.type === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {notification.message}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-label="Add Attendance Form"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="employee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Employee <span className="text-red-500">*</span>
                </label>
                {/* Employee Search */}
                <input
                  type="text"
                  id="employeeSearch"
                  value={employeeQuery}
                  onChange={(e) => setEmployeeQuery(e.target.value)}
                  className="w-full p-2 border rounded-md shadow-sm focus:ring-brand focus:border-brand border-gray-300"
                  placeholder="Search by name or ID..."
                  aria-label="Search employees by name or ID"
                />
                <select
                  id="employee"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className={`w-full p-2 border rounded-md shadow-sm focus:ring-brand focus:border-brand ${
                    errors.employeeId ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={
                    isLoadingEmployees || filteredEmployees.length === 0
                  }
                  required
                  aria-invalid={!!errors.employeeId}
                  aria-describedby={
                    errors.employeeId ? "employee-error" : undefined
                  }
                >
                  <option value="">Select Employee</option>
                  {filteredEmployees.length === 0 ? (
                    <option value="" disabled>
                      No employees found
                    </option>
                  ) : (
                    filteredEmployees.map((emp: Employee) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeId})
                      </option>
                    ))
                  )}
                </select>
                {errors.employeeId && (
                  <p id="employee-error" className="text-sm text-red-500">
                    {errors.employeeId}
                  </p>
                )}
              </div>

              {/* Attendance Date */}
              <div className="space-y-2">
                <label
                  htmlFor="attendanceDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Day Missed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="attendanceDate"
                  value={attendanceDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAttendanceDate(val);
                    const days = Number(val);
                    const next = computeConsequence(days);
                    setStatus(next);
                  }}
                  className={`w-full p-2 border rounded-md shadow-sm focus:ring-brand focus:border-brand ${
                    errors.attendanceDate ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  aria-invalid={!!errors.attendanceDate}
                  aria-describedby={
                    errors.attendanceDate ? "attendanceDate-error" : undefined
                  }
                />
                {errors.attendanceDate && (
                  <p id="attendanceDate-error" className="text-sm text-red-500">
                    {errors.attendanceDate}
                  </p>
                )}
              </div>

              {/* Sign-in Time */}
              <div className="space-y-2">
                <label
                  htmlFor="signInTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Sign-in Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="signInTime"
                  value={signInTime}
                  onChange={(e) => setSignInTime(e.target.value)}
                  className={`w-full p-2 border rounded-md shadow-sm focus:ring-brand focus:border-brand ${
                    errors.signInTime ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  aria-invalid={!!errors.signInTime}
                  aria-describedby={
                    errors.signInTime ? "signInTime-error" : undefined
                  }
                />
                {errors.signInTime && (
                  <p id="signInTime-error" className="text-sm text-red-500">
                    {errors.signInTime}
                  </p>
                )}
              </div>

              {/* Sign-out Time */}
              <div className="space-y-2">
                <label
                  htmlFor="signOutTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Sign-out Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="signOutTime"
                  value={signOutTime}
                  onChange={(e) => setSignOutTime(e.target.value)}
                  className={`w-full p-2 border rounded-md shadow-sm focus:ring-brand focus:border-brand ${
                    errors.signOutTime ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  aria-invalid={!!errors.signOutTime}
                  aria-describedby={
                    errors.signOutTime ? "signOutTime-error" : undefined
                  }
                />
                {errors.signOutTime && (
                  <p id="signOutTime-error" className="text-sm text-red-500">
                    {errors.signOutTime}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Consequence <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ConsequenceStatus)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand"
                  required
                  aria-invalid={!!errors.status}
                  aria-describedby={errors.status ? "status-error" : undefined}
                >
                  {consequenceStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p id="status-error" className="text-sm text-red-500">
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Reason (optional)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand"
                  placeholder="Provide reason for absence, lateness, or leave"
                />
              </div>

              {/* Comments */}
              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="comments"
                  className="block text-sm font-medium text-gray-700"
                >
                  Comments
                </label>
                <textarea
                  id="comments"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand"
                  placeholder="Additional notes or comments..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </form>
        </motion.section>
      </main>
    </div>
  );
}
