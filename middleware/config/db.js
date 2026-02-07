import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    const GATEWAY_MONGO_URI = process.env.GATEWAY_MONGO_URI || process.env.MONGO_URI;
    if (GATEWAY_MONGO_URI) {
        try {
            await mongoose.connect(GATEWAY_MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ Gateway MongoDB Connected');
        } catch (err) {
            console.error('❌ Gateway MongoDB Error:', err);
            // Optionally exit if DB is critical
        }
    } else {
        console.warn('⚠️ GATEWAY_MONGO_URI/MONGO_URI not set. Health check APIs will fail.');
    }
};

export default connectDB;
