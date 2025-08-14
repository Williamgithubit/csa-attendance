
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  startDate: string;
  endDate: string;
  department: string;
  status: string;
}

interface AttendanceState {
  filter: FilterState;
}

const initialState: AttendanceState = {
  filter: {
    startDate: '',
    endDate: '',
    department: '',
    status: '',
  },
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendanceFilter(state, action: PayloadAction<Partial<FilterState>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
  },
});

export const { setAttendanceFilter } = attendanceSlice.actions;
export default attendanceSlice.reducer;