import { apiSlice } from './apiSlice';
import type { Employee } from '@/types';

export const employeeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all employees
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
      providesTags: ['Employee'],
    }),
    
    // Get single employee by ID
    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
    
    // Add new employee
    addEmployee: builder.mutation<Employee, Partial<Employee>>({
      query: (employeeData) => ({
        url: '/employees',
        method: 'POST',
        body: employeeData,
      }),
      invalidatesTags: ['Employee'],
    }),
    
    // Update employee
    updateEmployee: builder.mutation<Employee, { id: string; updates: Partial<Employee> }>({
      query: ({ id, updates }) => ({
        url: `/employees/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employee', id },
        'Employee',
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
} = employeeApiSlice;
