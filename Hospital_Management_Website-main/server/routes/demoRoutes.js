// Demo Routes for Other Teams
// Public endpoints - No authentication required
// Only returns doctors data, no sensitive information

import express from "express";
import Doctor from "../models/doctor.js";

const router = express.Router();

// GET all doctors - Public demo endpoint
router.get("/demo/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("id name specialization department Experience availability photoUrl")
      .lean();

    res.json({
      code: 0,
      message: "Demo: Doctors list for testing by other teams",
      success: true,
      totalDoctors: doctors.length,
      data: doctors,
      info: {
        note: "This is a public demo endpoint",
        access: "Read-only",
        visibleData: "Only doctors collection",
        hiddenData: "Medicines, Appointments, Users, Lab, Surgery"
      }
    });
  } catch (error) {
    console.error("Demo API Error:", error);
    res.status(500).json({
      code: 5,
      message: "Database error",
      success: false,
      error: error.message
    });
  }
});

// GET doctor by ID - Public demo endpoint
router.get("/demo/doctors/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ id: parseInt(req.params.id) })
      .select("id name specialization department Experience availability photoUrl")
      .lean();

    if (!doctor) {
      return res.status(404).json({
        code: 2,
        message: `Doctor with ID ${req.params.id} not found`,
        success: false
      });
    }

    res.json({
      code: 0,
      message: "Doctor found",
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error("Demo API Error:", error);
    res.status(500).json({
      code: 5,
      message: "Database error",
      success: false,
      error: error.message
    });
  }
});

// GET doctors by department - Public demo endpoint
router.get("/demo/doctors/department/:dept", async (req, res) => {
  try {
    const doctors = await Doctor.find({ 
      department: new RegExp(req.params.dept, 'i') 
    })
      .select("id name specialization department Experience availability photoUrl")
      .lean();

    res.json({
      code: 0,
      message: `Found ${doctors.length} doctors in ${req.params.dept} department`,
      success: true,
      totalDoctors: doctors.length,
      department: req.params.dept,
      data: doctors
    });
  } catch (error) {
    console.error("Demo API Error:", error);
    res.status(500).json({
      code: 5,
      message: "Database error",
      success: false,
      error: error.message
    });
  }
});

// GET doctors by specialization - Public demo endpoint
router.get("/demo/doctors/specialization/:spec", async (req, res) => {
  try {
    const doctors = await Doctor.find({ 
      specialization: new RegExp(req.params.spec, 'i') 
    })
      .select("id name specialization department Experience availability photoUrl")
      .lean();

    res.json({
      code: 0,
      message: `Found ${doctors.length} ${req.params.spec}(s)`,
      success: true,
      totalDoctors: doctors.length,
      specialization: req.params.spec,
      data: doctors
    });
  } catch (error) {
    console.error("Demo API Error:", error);
    res.status(500).json({
      code: 5,
      message: "Database error",
      success: false,
      error: error.message
    });
  }
});

// GET demo API info
router.get("/demo/info", (req, res) => {
  res.json({
    code: 0,
    message: "Demo API Information",
    success: true,
    info: {
      purpose: "Public demo for other teams to test",
      access: "No authentication required",
      visibleCollections: ["doctors"],
      hiddenCollections: ["medicines", "appointments", "users", "lab", "surgery"],
      endpoints: {
        getAllDoctors: "/api/demo/doctors",
        getDoctorById: "/api/demo/doctors/:id",
        getByDepartment: "/api/demo/doctors/department/:dept",
        getBySpecialization: "/api/demo/doctors/specialization/:spec"
      },
      examples: {
        getAllDoctors: "GET http://localhost:5000/api/demo/doctors",
        getDoctor1: "GET http://localhost:5000/api/demo/doctors/1",
        getCardiology: "GET http://localhost:5000/api/demo/doctors/department/Cardiology",
        getCardiologists: "GET http://localhost:5000/api/demo/doctors/specialization/Cardiologist"
      },
      testInBrowser: "Yes! Just paste the URL in your browser",
      needPostman: "No, but you can use it if you want"
    }
  });
});

export default router;
