import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
   id: {
     type: Number,
     required: true,
     unique: true 
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    sparse: true  // Allow null values but enforce uniqueness when present
  },
  specialization: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    default: "General"
  },
  Experience:{
    type:String,
    required:true,
  },
  availability: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    required: true,
  },
  // HR System Integration Fields
  hr_employee_id: {
    type: Number,
    sparse: true  // Reference to HR Employee ID
  },
  hr_sync_status: {
    type: String,
    enum: ['synced', 'pending', 'failed', 'manual'],
    default: 'manual'
  },
  hr_sync_date: {
    type: Date,
    default: null
  },
  hr_last_updated: {
    type: Date,
    default: null
  },
  // System Source
  source_system: {
    type: String,
    enum: ['hospital', 'hr', 'manual'],
    default: 'hospital'
  }
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
