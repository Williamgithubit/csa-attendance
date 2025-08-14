import { Router } from "express";
import {
  deleteAttendance,
  getAttendance,
  addAttendance,
  getAttendanceReport,
  exportAttendanceCsv,
} from "../controllers/attendance.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAttendance);
router.get("/report", authMiddleware, getAttendanceReport);
router.get("/export", authMiddleware, exportAttendanceCsv);
// Standard RESTful create route
router.post("/", authMiddleware, addAttendance);
// Legacy route kept for backward compatibility
router.post("/add-attendance/", authMiddleware, addAttendance);
router.delete("/:id", authMiddleware, deleteAttendance);

export default router;
