import express from "express";
import Doctor from "../models/doctor.js";
import verifyHRToken from "../middleware/verifyHRToken.js";

const router = express.Router();

/**
 * HR Integration Routes
 * All routes verify JWT token from HR system via Gateway
 */

// ============== GET ENDPOINTS ==============

/**
 * GET /api/hr/doctors
 * Get all doctors (accessible to all authenticated HR users)
 */
router.get("/doctors", verifyHRToken, async (req, res) => {
  try {
    const { department, specialization, availability } = req.query;
    
    // Build filter
    const filter = {};
    if (department) filter.department = department;
    if (specialization) filter.specialization = specialization;
    if (availability) filter.availability = availability;

    const doctors = await Doctor.find(filter)
      .select("-__v")
      .sort({ name: 1 });

    return res.json({
      code: 0,
      message: "Doctors retrieved successfully",
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return res.status(500).json({
      code: 5,
      message: "Error fetching doctors",
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/hr/doctors/:id
 * Get doctor by ID
 */
router.get("/doctors/:id", verifyHRToken, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        code: 2,
        message: "Doctor not found",
        success: false
      });
    }

    return res.json({
      code: 0,
      message: "Doctor retrieved successfully",
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return res.status(500).json({
      code: 5,
      message: "Error fetching doctor",
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/hr/doctors/sync-status/:hrEmployeeId
 * Get doctor sync status for HR employee
 */
router.get("/doctors/sync-status/:hrEmployeeId", verifyHRToken, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      hr_employee_id: req.params.hrEmployeeId
    }).select("name email hr_sync_status hr_sync_date hr_last_updated");

    if (!doctor) {
      return res.json({
        code: 0,
        message: "Doctor not synced",
        success: true,
        data: {
          synced: false,
          hr_employee_id: req.params.hrEmployeeId
        }
      });
    }

    return res.json({
      code: 0,
      message: "Sync status retrieved",
      success: true,
      data: {
        synced: doctor.hr_sync_status === 'synced',
        ...doctor.toObject()
      }
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return res.status(500).json({
      code: 5,
      message: "Error fetching sync status",
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/hr/departments
 * Get list of all departments
 */
router.get("/departments", verifyHRToken, async (req, res) => {
  try {
    const departments = await Doctor.distinct("department");
    
    return res.json({
      code: 0,
      message: "Departments retrieved successfully",
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(500).json({
      code: 5,
      message: "Error fetching departments",
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/hr/specializations
 * Get list of all specializations
 */
router.get("/specializations", verifyHRToken, async (req, res) => {
  try {
    const specializations = await Doctor.distinct("specialization");
    
    return res.json({
      code: 0,
      message: "Specializations retrieved successfully",
      success: true,
      data: specializations,
      count: specializations.length
    });
  } catch (error) {
    console.error("Error fetching specializations:", error);
    return res.status(500).json({
      code: 5,
      message: "Error fetching specializations",
      success: false,
      error: error.message
    });
  }
});

// ============== POST ENDPOINTS ==============

/**
 * POST /api/hr/doctors
 * Create new doctor from HR employee (with HR sync)
 */
router.post("/doctors", verifyHRToken, async (req, res) => {
  try {
    const { name, email, specialization, department, experience, hr_employee_id } = req.body;

    // Validation
    if (!name || !specialization || !department || !email) {
      return res.status(400).json({
        code: 3,
        message: "Missing required fields: name, email, specialization, department",
        success: false
      });
    }

    // Check if doctor already exists with this hr_employee_id
    if (hr_employee_id) {
      const existingDoctor = await Doctor.findOne({ hr_employee_id });
      if (existingDoctor) {
        return res.status(409).json({
          code: 4,
          message: "Doctor with this HR employee ID already exists",
          success: false,
          data: existingDoctor
        });
      }
    }

    // Generate ID
    const maxIdDoctor = await Doctor.findOne().sort({ id: -1 });
    const newId = (maxIdDoctor?.id || 0) + 1;

    const newDoctor = new Doctor({
      id: newId,
      name,
      email,
      specialization,
      department,
      Experience: experience || "0",
      availability: "true",
      photoUrl: req.body.photoUrl || "https://via.placeholder.com/150",
      hr_employee_id: hr_employee_id || null,
      hr_sync_status: hr_employee_id ? 'synced' : 'manual',
      hr_sync_date: hr_employee_id ? new Date() : null,
      source_system: hr_employee_id ? 'hr' : 'manual'
    });

    await newDoctor.save();

    return res.status(201).json({
      code: 0,
      message: "Doctor created successfully",
      success: true,
      data: newDoctor
    });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return res.status(500).json({
      code: 5,
      message: "Error creating doctor",
      success: false,
      error: error.message
    });
  }
});

// ============== PUT ENDPOINTS ==============

/**
 * PUT /api/hr/doctors/:id
 * Update doctor information
 */
router.put("/doctors/:id", verifyHRToken, async (req, res) => {
  try {
    const { name, email, specialization, department, experience, availability } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (specialization) updateData.specialization = specialization;
    if (department) updateData.department = department;
    if (experience) updateData.Experience = experience;
    if (availability !== undefined) updateData.availability = availability;
    
    // Update HR sync metadata
    updateData.hr_last_updated = new Date();

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        code: 2,
        message: "Doctor not found",
        success: false
      });
    }

    return res.json({
      code: 0,
      message: "Doctor updated successfully",
      success: true,
      data: updatedDoctor
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return res.status(500).json({
      code: 5,
      message: "Error updating doctor",
      success: false,
      error: error.message
    });
  }
});

// ============== DELETE ENDPOINTS ==============

/**
 * DELETE /api/hr/doctors/:id
 * Delete doctor
 */
router.delete("/doctors/:id", verifyHRToken, async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!deletedDoctor) {
      return res.status(404).json({
        code: 2,
        message: "Doctor not found",
        success: false
      });
    }

    return res.json({
      code: 0,
      message: "Doctor deleted successfully",
      success: true,
      data: deletedDoctor
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return res.status(500).json({
      code: 5,
      message: "Error deleting doctor",
      success: false,
      error: error.message
    });
  }
});

// ============== SYNC ENDPOINTS ==============

/**
 * POST /api/hr/sync/doctors
 * Sync doctors from HR employees
 * Body: { employees: [...] }
 */
router.post("/sync/doctors", verifyHRToken, async (req, res) => {
  try {
    const { employees } = req.body;

    if (!Array.isArray(employees)) {
      return res.status(400).json({
        code: 3,
        message: "Invalid request: employees must be an array",
        success: false
      });
    }

    const syncResults = [];

    for (const emp of employees) {
      try {
        // Check if doctor already exists with this hr_employee_id
        let doctor = await Doctor.findOne({ hr_employee_id: emp.id });

        const doctorData = {
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          specialization: emp.specialization || "General Physician",
          department: emp.department?.name || "General",
          Experience: emp.age?.toString() || "0",
          availability: "true",
          photoUrl: emp.photoUrl || "https://via.placeholder.com/150",
          hr_employee_id: emp.id,
          hr_sync_status: 'synced',
          hr_sync_date: new Date(),
          source_system: 'hr'
        };

        if (doctor) {
          // Update existing
          await Doctor.findByIdAndUpdate(doctor._id, doctorData);
          syncResults.push({
            empId: emp.id,
            action: 'updated',
            status: 'success'
          });
        } else {
          // Create new
          const maxIdDoctor = await Doctor.findOne().sort({ id: -1 });
          const newId = (maxIdDoctor?.id || 0) + 1;

          const newDoctor = new Doctor({
            id: newId,
            ...doctorData
          });
          
          await newDoctor.save();
          syncResults.push({
            empId: emp.id,
            action: 'created',
            status: 'success'
          });
        }
      } catch (error) {
        syncResults.push({
          empId: emp.id,
          action: 'failed',
          status: 'error',
          error: error.message
        });
      }
    }

    return res.json({
      code: 0,
      message: "Sync completed",
      success: true,
      data: {
        total: employees.length,
        results: syncResults,
        syncDate: new Date()
      }
    });
  } catch (error) {
    console.error("Error syncing doctors:", error);
    return res.status(500).json({
      code: 5,
      message: "Error syncing doctors",
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/hr/sync/status
 * Get sync status overview
 */
router.get("/sync/status", verifyHRToken, async (req, res) => {
  try {
    const total = await Doctor.countDocuments();
    const synced = await Doctor.countDocuments({ hr_sync_status: 'synced' });
    const manual = await Doctor.countDocuments({ source_system: 'manual' });
    const failed = await Doctor.countDocuments({ hr_sync_status: 'failed' });

    return res.json({
      code: 0,
      message: "Sync status retrieved",
      success: true,
      data: {
        total,
        synced,
        manual,
        failed,
        syncPercentage: total > 0 ? Math.round((synced / total) * 100) : 0
      }
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return res.status(500).json({
      code: 5,
      message: "Error fetching sync status",
      success: false,
      error: error.message
    });
  }
});

export default router;
