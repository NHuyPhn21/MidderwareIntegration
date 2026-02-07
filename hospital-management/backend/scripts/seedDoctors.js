import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "../models/doctor.js";

dotenv.config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log("✅ MongoDB Connected");

        // Clear existing doctors
        await Doctor.deleteMany({});
        console.log("🗑️ Cleared existing doctors");

        const doctors = [
            {
                id: 1,
                name: "Dr. Nguyen Van A",
                specialization: "Cardiologist",
                department: "Cardiology",
                Experience: "10 years",
                availability: "Mon-Fri",
                photoUrl: "https://via.placeholder.com/150"
            },
            {
                id: 2,
                name: "Dr. Tran Thi B",
                specialization: "Neurologist",
                department: "Neurology",
                Experience: "8 years",
                availability: "Mon-Wed, Fri",
                photoUrl: "https://via.placeholder.com/150"
            },
            {
                id: 3,
                name: "Dr. Le Van C",
                specialization: "Dermatologist",
                department: "Dermatology",
                Experience: "5 years",
                availability: "Tue-Thu",
                photoUrl: "https://via.placeholder.com/150"
            }
        ];

        await Doctor.insertMany(doctors);
        console.log(`✅ Seeded ${doctors.length} doctors`);

        mongoose.disconnect();
    })
    .catch(err => {
        console.error("❌ Error:", err);
        process.exit(1);
    });
