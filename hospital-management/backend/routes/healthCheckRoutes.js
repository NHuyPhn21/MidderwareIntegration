import express from "express";
import {
    createScheduleFromHR,
    autoAssignDoctors,
    getSchedule,
    submitResult
} from "../controllers/healthCheckController.js";
import verifyHRToken from "../middleware/verifyHRToken.js";

const router = express.Router();

// 1. Create schedule (Called by Middleware/HR)
// router.post("/schedule", verifyHRToken, createScheduleFromHR); // Auth temporarily disabled for testing if needed
router.post("/schedule", createScheduleFromHR);

// 2. Auto assign doctors
router.post("/auto-assign", autoAssignDoctors);

// 3. Get Schedule
router.get("/schedule", getSchedule);

// 4. Submit Result
router.post("/results", submitResult);

export default router;
