import HealthCheckSchedule from "../models/HealthCheckSchedule.js";
import Doctor from "../models/doctor.js";

// 1. Receive Request from HRM -> Create Schedule (Initial, no doctors assigned yet or auto-assign)
export const createScheduleFromHR = async (req, res, next) => {
    try {
        const { hrm_campaign_id, campaign_name, employees } = req.body;

        if (!hrm_campaign_id || !employees) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        let schedule = await HealthCheckSchedule.findOne({ hrm_campaign_id });

        if (schedule) {
            return res.status(409).json({ success: false, message: "Schedule for this campaign already exists" });
        }

        // Initialize appointments
        const appointments = employees.map(emp => ({
            employee_id: emp.id,
            employee_name: emp.name,
            department: emp.department,
            status: 'pending'
        }));

        schedule = new HealthCheckSchedule({
            hrm_campaign_id,
            campaign_name,
            appointments,
            total_employees: employees.length,
            status: 'active'
        });

        await schedule.save();

        res.status(201).json({
            success: true,
            message: "Schedule created successfully",
            data: schedule
        });
    } catch (err) {
        next(err);
    }
};

// 2. Auto Assign Doctors (Simplified Round Robin)
export const autoAssignDoctors = async (req, res, next) => {
    try {
        const { hrm_campaign_id } = req.body;

        const schedule = await HealthCheckSchedule.findOne({ hrm_campaign_id });
        if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

        // Get available doctors
        const doctors = await Doctor.find({});
        if (doctors.length === 0) return res.status(400).json({ success: false, message: "No doctors available" });

        let docIndex = 0;
        let assignedCount = 0;

        // Assign doctors to pending appointments
        schedule.appointments.forEach(apt => {
            if (!apt.doctor_id) {
                const doctor = doctors[docIndex];
                apt.doctor_id = doctor._id;
                apt.doctor_name = doctor.name;
                apt.status = 'confirmed';

                // Simple date assignment (start from tomorrow)
                const date = new Date();
                date.setDate(date.getDate() + 1 + Math.floor(assignedCount / 10)); // 10 checkups per day logic
                apt.scheduled_date = date;

                docIndex = (docIndex + 1) % doctors.length;
                assignedCount++;
            }
        });

        schedule.scheduled_count = schedule.appointments.filter(a => a.doctor_id).length;
        await schedule.save();

        res.json({
            success: true,
            message: `Auto-assigned ${assignedCount} appointments`,
            data: schedule
        });
    } catch (err) {
        next(err);
    }
};

// 3. Get Schedule (For Doctor View)
export const getSchedule = async (req, res, next) => {
    try {
        const { doctor_id, date } = req.query;

        // Find all schedules
        const schedules = await HealthCheckSchedule.find({});

        // Flatten appointments based on filters
        let appointments = [];
        schedules.forEach(sch => {
            const filtered = sch.appointments.filter(apt => {
                let match = true;
                if (doctor_id && apt.doctor_id?.toString() !== doctor_id) match = false;
                // Simple date check
                if (date && apt.scheduled_date) {
                    const d = new Date(apt.scheduled_date).toISOString().split('T')[0];
                    if (d !== date) match = false;
                }
                return match;
            });
            appointments.push(...filtered.map(a => ({ ...a.toObject(), campaign_id: sch.hrm_campaign_id })));
        });

        res.json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        next(err);
    }
};

// 4. Submit Result (Doctor Action)
export const submitResult = async (req, res, next) => {
    try {
        const { hrm_campaign_id, employee_id, health_status, doctor_conclusion, detailed_diagnosis } = req.body;

        const schedule = await HealthCheckSchedule.findOne({ hrm_campaign_id });
        if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

        const appointment = schedule.appointments.find(a => a.employee_id === Number(employee_id));
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found for this employee" });

        // Update result
        appointment.status = 'completed';
        appointment.result = {
            check_date: new Date(),
            health_status,
            doctor_conclusion,
            detailed_diagnosis,
            restrictions: [] // Can be added
        };

        schedule.completed_count = schedule.appointments.filter(a => a.status === 'completed').length;

        await schedule.save();

        res.json({ success: true, message: "Result recorded", data: appointment });
    } catch (err) {
        next(err);
    }
};
