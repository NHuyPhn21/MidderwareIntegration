import express from 'express';
import axios from 'axios';
import SYSTEMS from '../config/systems.js';

const router = express.Router();

router.get('/system-overview', async (req, res) => {
    try {
        // Fetch stats from all systems
        const [hospitalDocs, hrEmps, hotelRooms] = await Promise.allSettled([
            axios.get(`${SYSTEMS.hospital.baseUrl}/api/doctors`),
            axios.get(`${SYSTEMS.hr.baseUrl}/api/employees`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${SYSTEMS.hr.auth.username}:${SYSTEMS.hr.auth.password}`).toString('base64')}`
                }
            }),
            axios.get(`${SYSTEMS.hotel.baseUrl}/api/rooms`).catch(() => ({ data: [] }))
        ]);

        res.json({
            code: 0,
            message: 'System Overview Report',
            success: true,
            report: {
                hospital: {
                    doctors_count: hospitalDocs.status === 'fulfilled' ? hospitalDocs.value.data.data?.length || 0 : 'N/A',
                    status: hospitalDocs.status
                },
                hr: {
                    employees_count: hrEmps.status === 'fulfilled' ? hrEmps.value.data?.length || 0 : 'N/A',
                    status: hrEmps.status
                },
                hotel: {
                    rooms_count: hotelRooms.status === 'fulfilled' ? hotelRooms.value.data?.length || 0 : 'N/A',
                    status: hotelRooms.status
                }
            },
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            code: 5,
            message: 'Error generating report',
            success: false,
            error: error.message
        });
    }
});

export default router;
