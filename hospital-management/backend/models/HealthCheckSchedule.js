import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  employee_id: { type: Number, required: true },
  employee_name: { type: String, required: true },
  department: { type: String },
  
  // Doctor assignment
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctor_name: { type: String },
  
  // Scheduling
  scheduled_date: { type: Date },
  scheduled_time: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'missed', 'cancelled'],
    default: 'pending'
  },
  
  // Result (simplified for now, could be separate document)
  result: {
    check_date: Date,
    health_status: String, // Type 1, 2, 3, 4
    doctor_conclusion: String,
    restrictions: [String],
    detailed_diagnosis: String, // Private
    recommended_treatment: String // Private
  }
});

const healthCheckScheduleSchema = new mongoose.Schema({
  hrm_campaign_id: { type: Number, required: true, unique: true }, // ID from HR System
  campaign_name: { type: String },
  
  appointments: [appointmentSchema],
  
  total_employees: { type: Number, default: 0 },
  scheduled_count: { type: Number, default: 0 },
  completed_count: { type: Number, default: 0 },
  
  status: {
    type: String,
    enum: ['planning', 'active', 'completed'],
    default: 'planning'
  }
}, { timestamps: true });

export default mongoose.model("HealthCheckSchedule", healthCheckScheduleSchema);
