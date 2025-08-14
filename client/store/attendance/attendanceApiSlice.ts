import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AttendanceRecord,
  AttendanceReportResponse,
  AttendanceReportQuery,
  ConsequenceStatus,
} from "@/types/attendance";

// Type guard to validate attendance status
function isAttendanceStatus(status: string): status is ConsequenceStatus {
  return ["regular", "salary_deduction", "suspension", "dismissal"].includes(
    status
  );
}

// Transform function to ensure data matches our types
const transformAttendanceResponse = (
  response: any
): AttendanceReportResponse => {
  if (!response || !Array.isArray(response.records)) {
    throw new Error("Invalid response format");
  }

  const transformedRecords = response.records.map(
    (record: AttendanceRecord) => ({
      ...record,
      consequence: isAttendanceStatus(record.status)
        ? record.status
        : "regular", // Default to 'regular' if invalid
    })
  );

  return {
    ...response,
    records: transformedRecords,
  };
};

export const attendanceApiSlice = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/attendance",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      try {
        if (typeof window === "undefined") return headers;
        const raw = localStorage.getItem("auth");
        if (!raw) {
          if (process.env.NODE_ENV === "development")
            console.log("[attendanceApi] no auth in localStorage");
          return headers;
        }
        const parsed = JSON.parse(raw);
        // authSlice stores { token, user, isAuthenticated }
        const token =
          parsed?.token ||
          parsed?.data?.token ||
          (parsed?.data && parsed.data.token) ||
          null;
        if (process.env.NODE_ENV === "development")
          console.log("[attendanceApi] token present:", Boolean(token));
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development")
          console.error(
            "[attendanceApi] prepareHeaders error parsing token",
            err
          );
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAttendanceReport: builder.query<
      AttendanceReportResponse,
      AttendanceReportQuery
    >({
      query: ({ page, limit, startDate, endDate, department, status }) => ({
        url: "/report",
        params: { page, limit, startDate, endDate, department, status },
      }),
      transformResponse: (response: any) =>
        transformAttendanceResponse(response),
    }),
  }),
});

export const { useGetAttendanceReportQuery } = attendanceApiSlice;
