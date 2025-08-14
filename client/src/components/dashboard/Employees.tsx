"use client";

import React, { useMemo, useState } from "react";
import { useGetEmployeesQuery } from "@/store/api/apiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Employees() {
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetEmployeesQuery(
    undefined,
    {
      // keepUnusedDataFor: 30, // optional
    }
  );

  const employees: any[] = data || [];

  const filtered = useMemo(() => {
    if (!query) return employees;
    const q = query.toLowerCase();
    return employees.filter(
      (e) =>
        (e.fullName || "").toLowerCase().includes(q) ||
        (e.employeeId || "").toLowerCase().includes(q) ||
        (e.department || "").toLowerCase().includes(q) ||
        (e.position || "").toLowerCase().includes(q)
    );
  }, [employees, query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search by name, ID, department or position"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              refetch();
            }}
          >
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="text-red-500">
            Error loading employees:{" "}
            {String((error as any)?.data || (error as any)?.message || error)}
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Full name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.employeeId || "—"}</TableCell>
                    <TableCell>{emp.fullName || "—"}</TableCell>
                    <TableCell>{emp.department || "—"}</TableCell>
                    <TableCell>{emp.position || "—"}</TableCell>
                    <TableCell>{emp.employmentStatus || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filtered.length === 0 && (
              <div className="py-4 text-center text-muted-foreground">
                No employees found.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
