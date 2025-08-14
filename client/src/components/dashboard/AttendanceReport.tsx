'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useGetAttendanceReportQuery } from '@/store/attendance/attendanceApiSlice';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ITEMS_PER_PAGE = 10;

type Filters = {
  startDate: string;
  endDate: string;
  status: '' | import('@/types/attendance').ConsequenceStatus;
  department: string;
};

export default function AttendanceReport() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    status: '',
    department: '',
  });

  // Map empty strings to undefined to satisfy AttendanceReportQuery types
  const { data, isLoading, isError, error } = useGetAttendanceReportQuery({
    page,
    limit: ITEMS_PER_PAGE,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    status: filters.status || undefined,
    department: filters.department || undefined,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    // Reset to first page when filters change
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      department: '',
    });
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading attendance data: {JSON.stringify(error)}
      </div>
    );
  }

  // Avoid using `{}` fallback which widens the type to `{}` and causes TS errors.
  const records = data?.records ?? [];
  const totalPages = data?.totalPages ?? Math.ceil((data?.totalRecords ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <Input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">All Statuses</option>
                <option value="regular">Regular</option>
                <option value="salary_deduction">Salary Deduction</option>
                <option value="suspension">Suspension</option>
                <option value="dismissal">Dismissal</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeName || 'N/A'}</TableCell>
                    <TableCell>
                      {record.date ? format(new Date(record.date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="capitalize">
                      {record.status?.replace('_', ' ') || 'N/A'}
                    </TableCell>
                    <TableCell>{record.notes || '—'}</TableCell>
                    <TableCell>{record.department || 'N/A'}</TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}