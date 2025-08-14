// store/auth/authApiSlice.ts
import { apiSlice } from '../api/apiSlice';
import { setCredentials } from './authSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/v1/users/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => {
        // Ensure the response has the expected structure
        if (!response) {
          throw new Error('No response received from server');
        }
        
        const userData = response.data?.user || response.user;
        const token = response.token || response.data?.token;
        
        if (!token) {
          throw new Error('No authentication token received');
        }
        
        return {
          token,
          user: {
            id: userData?.id || '',
            email: userData?.email || '',
            role: userData?.role || 'user',
            ...userData,
          },
          isAuthenticated: true,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth', JSON.stringify(data));
          }
        } catch (error) {
          console.error('Login failed:', error);
          // Don't re-throw here, let the component handle the error
        }
      },
      // Add transformErrorResponse to handle and format errors
      transformErrorResponse: (response) => {
        console.log('Raw error response:', response);
        
        // Handle different shapes of the error response
        if (typeof response === 'string') {
          return {
            status: 'CUSTOM_ERROR',
            error: response || 'Authentication failed. Please check your credentials.'
          };
        }
        
        if ('error' in response) {
          return {
            status: 'CUSTOM_ERROR',
            error: response.error || 'Authentication failed. Please check your credentials.'
          };
        }
        
        // Handle standard error response with status and data
        return {
          status: response.status,
          data: response.data || {
            message: 'Authentication failed. Please check your credentials.'
          }
        };
      },
    }),
  }),
});

export const { useLoginMutation } = authApiSlice;
