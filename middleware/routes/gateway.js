import express from 'express';
import axios from 'axios';
import SYSTEMS from '../config/systems.js';
import { SyncLog } from '../models/HealthCheck.js';

const router = express.Router();

// Gateway health
router.get('/health', (req, res) => {
    res.json({
        code: 0,
        message: 'API Gateway is running',
        success: true,
        timestamp: new Date(),
        systems: SYSTEMS
    });
});

// Check health của tất cả systems
router.get('/systems', async (req, res) => {
    const systemsStatus = {};

    for (const [key, system] of Object.entries(SYSTEMS)) {
        try {
            const healthPath = system.healthCheckPath || '/api/health';
            const response = await axios.get(`${system.baseUrl}${healthPath}`, {
                timeout: 3000
            });
            systemsStatus[key] = {
                name: system.name,
                status: 'online',
                type: system.type,
                response: response.data
            };
        } catch (error) {
            systemsStatus[key] = {
                name: system.name,
                status: 'offline',
                type: system.type,
                error: error.message
            };
        }
    }

    res.json({
        code: 0,
        message: 'Systems status',
        success: true,
        systems: systemsStatus
    });
});

/**
 * GET /api/gateway/logs
 */
router.get('/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const logs = await SyncLog.find().sort({ initiated_at: -1 }).limit(limit);
        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
