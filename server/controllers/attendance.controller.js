import { Attendance, Employee } from "../models/index.js";
import { Op } from "sequelize";

export const getAttendance = async (req, res) => {
  const attendance = await Attendance.findAll({ include: Employee });
  res.json(attendance);
};

export const addAttendance = async (req, res) => {
  try {
    const {
      employee_id,
      attendance_date, // days missed from client
      sign_in_time,
      sign_out_time,
      status, // maps to consequence
      reason,
      comments,
    } = req.body || {};

    // Basic validation
    if (!employee_id) {
      return res.status(400).json({ message: "employee_id is required" });
    }
    if (
      attendance_date === undefined ||
      attendance_date === null ||
      attendance_date === ""
    ) {
      return res
        .status(400)
        .json({ message: "attendance_date (days missed) is required" });
    }
    const daysMissed = Number(attendance_date);
    if (Number.isNaN(daysMissed) || daysMissed < 0) {
      return res
        .status(400)
        .json({ message: "attendance_date must be a non-negative number" });
    }

    // Map to model attributes
    const payload = {
      employeeId: employee_id,
      daysMissed,
      consequence: status || null,
      comments: comments || null,
      // sign_in_time, sign_out_time, and reason are currently not modeled; ignored safely
    };

    const record = await Attendance.create(payload);
    return res.status(201).json(record);
  } catch (err) {
    console.error("Error creating attendance record:", err);
    return res
      .status(500)
      .json({ message: "Failed to create attendance", error: err.message });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      department,
    } = req.query;

    // Ensure numeric paging values
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    const include = [
      {
        model: Employee,
        // Use fields that actually exist on the Employee model
        attributes: ["id", "fullName", "employeeId", "department"],
        ...(department && { where: { department } }),
      },
    ];

    // Add status filter if provided
    if (status) {
      where.consequence = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
      offset,
      limit: limitNum,
      distinct: true, // Important for correct pagination with includes
    });

    // Format the response
    const formattedRecords = rows.map((record) => ({
      id: record.id,
      employeeName: record.Employee ? record.Employee.fullName : "N/A",
      employeeIdentifier: record.Employee?.employeeId || "N/A",
      department: record.Employee?.department || "N/A",
      date: record.createdAt,
      status: record.consequence,
      notes: record.comments || "—",
    }));

    res.json({
      records: formattedRecords,
      totalRecords: count,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({
      message: "Failed to generate attendance report",
      error: error.message,
    });
  }
};

export const exportAttendanceCsv = async (req, res) => {
  try {
    // Reuse the same filters as the report endpoint, but return all matching rows
    const { status, startDate, endDate, department } = req.query;

    const where = {};
    if (status) where.consequence = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const include = [
      {
        model: Employee,
        attributes: ["id", "fullName", "employeeId", "department"],
        ...(department && { where: { department } }),
      },
    ];

    const rows = await Attendance.findAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
    });

    // Stream CSV
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`
    );

    // Write header
    res.write(
      "id,employeeName,employeeIdentifier,department,status,date,notes\n"
    );

    for (const record of rows) {
      const r = {
        id: record.id,
        employeeName: record.Employee ? record.Employee.fullName : "",
        employeeIdentifier: record.Employee ? record.Employee.employeeId : "",
        department: record.Employee ? record.Employee.department : "",
        status: record.consequence || "",
        date: record.createdAt ? record.createdAt.toISOString() : "",
        notes: record.comments
          ? String(record.comments).replace(/\n/g, " ")
          : "",
      };

      // Escape double quotes and wrap fields containing commas/newlines
      const escape = (v) => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        if (s.includes(",") || s.includes("\n") || s.includes('"')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const line = [
        escape(r.id),
        escape(r.employeeName),
        escape(r.employeeIdentifier),
        escape(r.department),
        escape(r.status),
        escape(r.date),
        escape(r.notes),
      ].join(",");

      res.write(line + "\n");
    }

    res.end();
  } catch (error) {
    console.error("Error exporting attendance CSV:", error);
    res
      .status(500)
      .json({ message: "Failed to export CSV", error: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  const { id } = req.params;
  await Attendance.destroy({ where: { id } });
  res.json({ message: "Attendance record deleted" });
};
