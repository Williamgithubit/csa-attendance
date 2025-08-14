import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttendanceStats } from '@/types';

interface DashboardState {
  stats: AttendanceStats;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    regular: 0,
    salary_deduction: 0,
    suspension: 0,
    dismissal: 0,
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<AttendanceStats>) => {
      state.stats = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setStats, setLoading, setError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
