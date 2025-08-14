import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User; isAuthenticated?: boolean }>) => {
      const { token, user, isAuthenticated = true } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = isAuthenticated;
      state.loading = false;
      // persist to localStorage
      localStorage.setItem('auth', JSON.stringify({ token, user, isAuthenticated }));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadUserFromStorage: (state) => {
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const { token, user } = JSON.parse(stored);
          if (token && user) {
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
          } else {
            state.isAuthenticated = false;
          }
        } catch (error) {
          console.error('Error parsing auth data from localStorage:', error);
          state.isAuthenticated = false;
        }
      } else {
        state.isAuthenticated = false;
      }
      state.loading = false;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
  },
});

export const { setCredentials, setLoading, setError, loadUserFromStorage, logout } = authSlice.actions;
export default authSlice.reducer;
