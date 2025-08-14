export type ConsequenceStatus = 'Select Consequence' | 'Regular' | 'Salary Deduction' | 'Suspension' | 'Dismissal';

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  status: ConsequenceStatus;
  notes: string;
}

export interface AttendanceReportResponse {
  records: AttendanceRecord[];
  totalRecords: number;
  totalPages: number;
}

export interface AttendanceReportQuery {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  department?: string;
  status?: ConsequenceStatus;
}
