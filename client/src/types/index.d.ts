// Auth types
declare namespace Auth {
  interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
  }

  interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  }
}

// Employee types
export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Attendance types
export interface Attendance {
  id: string;
  employeeId: string;
  daysMissed: number;
  consequence: 'regular' | 'salary_deduction' | 'suspension' | 'dismissal';
  comments: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  regular: number;
  salary_deduction: number;
  suspension: number;
  dismissal: number;
}

// Root state
declare interface RootState {
  auth: Auth.AuthState;
  dashboard: {
    stats: AttendanceStats;
    loading: boolean;
    error: string | null;
  };
}


