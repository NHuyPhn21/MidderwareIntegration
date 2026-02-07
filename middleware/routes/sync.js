import express from 'express';
import axios from 'axios';
import SYSTEMS from '../config/systems.js';

const router = express.Router();

/**
 * POST /api/gateway/sync/hr-to-hospital
 * Sync HR employees → Hospital doctors
 */
router.post('/hr-to-hospital', async (req, res) => {
    try {
        // 1. Fetch employees from HR
        const hrResponse = await axios.get(
            `${SYSTEMS.hr.baseUrl}/api/employees/third-party/all`,
            {
                params: { token: SYSTEMS.hr.auth.token },
                timeout: 5000
            }
        );

        const employees = hrResponse.data;
        const syncData = {
            employees: employees.map(emp => ({
                id: emp.id,
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                department: emp.department,
                age: emp.age,
                specialization: 'General Physician',
                photoUrl: 'https://via.placeholder.com/150'
            }))
        };

        // 2. Call Hospital sync endpoint
        const hospitalResponse = await axios.post(
            `${SYSTEMS.hospital.baseUrl}/api/hr/sync/doctors`,
            syncData,
            {
                headers: { 'Authorization': `Bearer ${SYSTEMS.hr.auth.token}` },
                timeout: 5000
            }
        );

        res.json({
            code: 0,
            message: 'Sync HR employees to Hospital doctors completed',
            success: true,
            timestamp: new Date(),
            data: {
                employees_count: employees.length,
                sync_results: hospitalResponse.data
            }
        });
    } catch (error) {
        console.error('Sync error:', error.message);
        res.status(500).json({
            code: 5,
            message: 'Error syncing HR to Hospital',
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/gateway/sync/status
 * Get sync status overview
 */
router.get('/status', async (req, res) => {
    try {
        // Get Hospital sync status
        const hospitalResponse = await axios.get(
            `${SYSTEMS.hospital.baseUrl}/api/hr/sync/status`,
            {
                headers: { 'Authorization': `Bearer ${SYSTEMS.hr.auth.token}` },
                timeout: 5000
            }
        );

        res.json({
            code: 0,
            message: 'Sync status',
            success: true,
            data: {
                hospital: hospitalResponse.data.data,
                lastCheck: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            code: 5,
            message: 'Error fetching sync status',
            success: false,
            error: error.message
        });
    }
});

export default router;
