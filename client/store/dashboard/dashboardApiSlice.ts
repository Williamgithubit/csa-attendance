import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store/store';

export const dashboardApiSlice = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<{
      regular: number;
      salary_deduction: number;
      suspension: number;
      dismissal: number;
    }, void>({
      query: () => '/stats/dashboard',
      transformResponse: (response: { data: any }) => {
        // Initialize default values
        const stats = {
          regular: 0,
          salary_deduction: 0,
          suspension: 0,
          dismissal: 0
        };

        // Map the backend response to the expected format
        if (response?.data?.attendanceStats) {
          response.data.attendanceStats.forEach((stat: { consequence: string; count: number }) => {
            const key = stat.consequence.toLowerCase().replace(/ /g, '_');
            if (key in stats) {
              stats[key as keyof typeof stats] = stat.count;
            }
          });
        }

        return stats;
      },
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApiSlice;
