import express from 'express';
import axios from 'axios';
import SYSTEMS from '../config/systems.js';

const router = express.Router();

router.get('/rooms', async (req, res) => {
    try {
        const token = req.headers.authorization;

        const response = await axios.get(
            `${SYSTEMS.hotel.baseUrl}/api/rooms`,
            {
                headers: token ? { 'Authorization': token } : {},
                timeout: 5000
            }
        );

        res.json({
            code: 0,
            message: 'Rooms from Hotel system',
            success: true,
            source: 'Hotel Management',
            data: response.data
        });
    } catch (error) {
        res.status(503).json({
            code: 5,
            message: 'Hotel system is not ready or unavailable',
            success: false,
            status: SYSTEMS.hotel.status,
            error: error.message
        });
    }
});

export default router;
