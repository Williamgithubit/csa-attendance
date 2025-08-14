import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store/store';
import type { Attendance, Employee } from '@/types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Auth', 'Employee', 'Attendance', 'Stats', 'Dashboard'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<{ token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    // Employee endpoints
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
      providesTags: ['Employee'],
    }),
    
    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
    
    addEmployee: builder.mutation<Employee, Partial<Employee>>({
      query: (employeeData) => ({
        url: '/employees',
        method: 'POST',
        body: employeeData,
      }),
      invalidatesTags: ['Employee'],
    }),
    
    // Attendance endpoints
    addAttendance: builder.mutation<Attendance, Partial<Attendance>>({
      query: (attendanceData) => ({
        url: '/attendance',
        method: 'POST',
        body: attendanceData,
      }),
      invalidatesTags: ['Attendance'],
    }),
    
    getEmployeeAttendance: builder.query<Attendance[], string>({
      query: (employeeId) => `/attendance/employee/${employeeId}`,
      providesTags: (result = [], error, employeeId) => [
        'Attendance',
        ...result.map(({ id }) => ({ type: 'Attendance' as const, id })),
      ],
    }),
    
    // Dashboard endpoints
    // Note: Dashboard stats endpoint has been moved to dashboardApiSlice
    // This endpoint is kept for backward compatibility but should be removed in future versions
  }),
});

export const {
  // Auth
  useLoginMutation,
  
  // Employees
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useAddEmployeeMutation,
  
  // Attendance
  useAddAttendanceMutation,
  useGetEmployeeAttendanceQuery,
} = apiSlice;
