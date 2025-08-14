import { apiSlice } from './apiSlice';
import { Attendance } from '@/types';

export const attendanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Add new attendance record
    addAttendance: builder.mutation<Attendance, Partial<Attendance>>({
      query: (attendanceData) => ({
        url: '/attendance',
        method: 'POST',
        body: attendanceData,
      }),
      invalidatesTags: ['Attendance'],
    }),
    
    // Get attendance records for an employee
    getEmployeeAttendance: builder.query<Attendance[], string>({
      query: (employeeId) => `/attendance/employee/${employeeId}`,
      providesTags: (result = [], error, employeeId) => [
        'Attendance',
        ...result.map(({ id }) => ({ type: 'Attendance' as const, id })),
      ],
    }),
    
    // Update attendance record
    updateAttendance: builder.mutation<Attendance, { id: string; updates: Partial<Attendance> }>({
      query: ({ id, updates }) => ({
        url: `/attendance/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Attendance', id },
      ],
    }),
  }),
});

export const {
  useAddAttendanceMutation,
  useGetEmployeeAttendanceQuery,
  useUpdateAttendanceMutation,
} = attendanceApiSlice;
