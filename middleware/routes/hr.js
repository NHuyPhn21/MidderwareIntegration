import express from 'express';
import axios from 'axios';
import SYSTEMS from '../config/systems.js';

const router = express.Router();

/**
 * GET /api/gateway/hr/employees
 * Get all employees from HR system
 */
router.get('/employees', async (req, res) => {
    try {
        const response = await axios.get(
            `${SYSTEMS.hr.baseUrl}/api/employees/third-party/all`,
            {
                params: { token: SYSTEMS.hr.auth.token },
                timeout: 5000
            }
        );

        res.json({
            code: 0,
            message: 'Employees from HR system',
            success: true,
            source: 'HR Management (Java Spring Boot)',
            data: response.data
        });
    } catch (error) {
        console.error('Error fetching HR employees:', error.message);
        res.status(500).json({
            code: 5,
            message: 'Error fetching employees from HR',
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/gateway/hr/employees/:id
 * Get employee by ID from HR system
 */
router.get('/employees/:id', async (req, res) => {
    try {
        const response = await axios.get(
            `${SYSTEMS.hr.baseUrl}/api/employees/${req.params.id}`,
            { timeout: 5000 }
        );

        res.json({
            code: 0,
            message: 'Employee from HR system',
            success: true,
            source: 'HR Management',
            data: response.data
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            code: 5,
            message: 'Error fetching employee from HR',
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/gateway/hr/employees
 * Create new employee (requires HR token in query)
 */
router.post('/employees', async (req, res) => {
    try {
        const response = await axios.post(
            `${SYSTEMS.hr.baseUrl}/api/employees/third-party`,
            req.body,
            {
                params: { token: SYSTEMS.hr.auth.token },
                timeout: 5000
            }
        );

        res.status(201).json({
            code: 0,
            message: 'Employee created in HR system',
            success: true,
            source: 'HR Management',
            data: response.data
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            code: 5,
            message: 'Error creating employee in HR',
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/gateway/hr/departments
 * Get all departments from HR system
 */
router.get('/departments', async (req, res) => {
    try {
        const response = await axios.get(
            `${SYSTEMS.hr.baseUrl}/api/departments`,
            { timeout: 5000 }
        );

        res.json({
            code: 0,
            message: 'Departments from HR system',
            success: true,
            source: 'HR Management',
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            code: 5,
            message: 'Error fetching departments from HR',
            success: false,
            error: error.message
        });
    }
});

export default router;
