import express from 'express';
import axios from 'axios';
import SYSTEMS from '../config/systems.js';

const router = express.Router();

/**
 * POST /api/gateway/auth/login
 * Login with HR system credentials
 * Returns JWT token for accessing all 3 services
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                code: 3,
                message: 'Missing email or password',
                success: false
            });
        }

        // Call HR login endpoint
        const hrResponse = await axios.post(
            `${SYSTEMS.hr.baseUrl}/api/auth/login`,
            { email, password },
            { timeout: 5000 }
        );

        const { token, user, services } = hrResponse.data;

        // Add gateway info to response
        res.json({
            code: 0,
            message: 'Login successful',
            success: true,
            data: {
                token,
                user: {
                    ...user,
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    department: user.department,
                    role: user.role || 'EMPLOYEE'
                },
                services: services || ['hr', 'hospital', 'hotel'],
                gateway: {
                    hospital: SYSTEMS.hospital.baseUrl,
                    hr: SYSTEMS.hr.baseUrl,
                    hotel: SYSTEMS.hotel.baseUrl
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(401).json({
            code: 1,
            message: 'Login failed',
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

/**
 * GET /api/gateway/auth/verify
 * Verify JWT token
 */
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                code: 1,
                message: 'No token provided',
                success: false
            });
        }

        const token = authHeader.substring(7);

        // Verify with HR system
        const hrResponse = await axios.get(
            `${SYSTEMS.hr.baseUrl}/api/auth/verify`,
            {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            }
        );

        res.json({
            code: 0,
            message: 'Token is valid',
            success: true,
            data: hrResponse.data
        });
    } catch (error) {
        res.status(401).json({
            code: 1,
            message: 'Token verification failed',
            success: false,
            error: error.message
        });
    }
});

export default router;
