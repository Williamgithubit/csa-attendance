export interface Employee {
  id: number;
  fullName: string;
  employeeId: string;
  department: string;
  dutyStation: string;
  position: string;
  employmentStatus: string;
  profilePicture?: string;
}

export interface AttendanceRecord {
  id: number;
  full_name: string;
  employee_id: string;
  department: string;
  duty_station: string;
  position: string;
  employment_status: string;
  days_missed: number;
  consequence: string;
  comments: string;
  start_date: string;
  end_date: string;
  profile_picture?: string;
}