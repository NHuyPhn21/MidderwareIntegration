/**
 * HIS-HRM Health Check Integration Routes
 * API Gateway cho quản lý khám sức khỏe định kỳ
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configuration
const HIS_BASE_URL = process.env.HIS_API_URL || 'http://localhost:3000';
const HRM_BASE_URL = process.env.HRM_API_URL || 'http://localhost:3001';

/**
 * ============================================================================
 * HRM ENDPOINTS (HR Manager sử dụng)
 * ============================================================================
 */

/**
 * POST /api/gateway/health-check/campaigns
 * HR tạo mới đợt khám sức khỏe
 */
router.post('/campaigns', async (req, res) => {
  try {
    const { campaign_name, campaign_type, start_date, end_date, description } = req.body;

    // Validate
    if (!campaign_name || !campaign_type || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: campaign_name, campaign_type, start_date, end_date'
      });
    }

    // Call HRM API to create campaign
    const response = await axios.post(`${HRM_BASE_URL}/api/health-check/campaigns`, {
      campaign_name,
      campaign_type,
      start_date,
      end_date,
      description,
      created_by: req.user?.id || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Health check campaign created successfully',
      campaign_id: response.data.campaign_id
    });
  } catch (error) {
    console.error('Error creating campaign:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/campaigns
 * HR xem danh sách các đợt khám
 */
router.get('/campaigns', async (req, res) => {
  try {
    const response = await axios.get(`${HRM_BASE_URL}/api/health-check/campaigns`);

    res.json({
      success: true,
      campaigns: response.data.campaigns || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/due-employees?campaign_id=1
 * Lấy danh sách nhân viên cần khám (theo campaign)
 * Hệ thống tự động check: last_check_date < 12 tháng trước
 */
router.get('/due-employees', async (req, res) => {
  try {
    const { campaign_id } = req.query;

    if (!campaign_id) {
      return res.status(400).json({
        success: false,
        message: 'campaign_id is required'
      });
    }

    const response = await axios.get(
      `${HRM_BASE_URL}/api/health-check/due-employees?campaign_id=${campaign_id}`
    );

    res.json({
      success: true,
      total: response.data.total || 0,
      due_employees: response.data.due_employees || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch due employees',
      error: error.message
    });
  }
});

/**
 * POST /api/gateway/health-check/sync-to-his
 * HRM gửi danh sách nhân viên cần khám sang HIS
 * HIS sẽ tự động sắp xếp lịch khám
 */
router.post('/sync-to-his', async (req, res) => {
  try {
    const { campaign_id, employees } = req.body;

    if (!campaign_id || !employees || !Array.isArray(employees)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: campaign_id and employees array required'
      });
    }

    // Call HIS to sync
    const hisResponse = await axios.post(
      `${HIS_BASE_URL}/api/health-check/schedule`,
      {
        hrm_campaign_id: campaign_id,
        employees
      }
    );

    // Store sync status in HRM
    await axios.post(`${HRM_BASE_URL}/api/health-check/sync-status`, {
      campaign_id,
      his_campaign_id: hisResponse.data.his_campaign_id,
      status: 'synced',
      synced_at: new Date()
    });

    res.json({
      success: true,
      message: 'Health check requests sent to HIS successfully',
      his_campaign_id: hisResponse.data.his_campaign_id,
      total_sent: employees.length
    });
  } catch (error) {
    console.error('Error syncing to HIS:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to sync with HIS',
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/results?campaign_id=1
 * HR xem kết quả khám (tổng hợp từ HIS)
 */
router.get('/results', async (req, res) => {
  try {
    const { campaign_id, employee_id } = req.query;

    if (!campaign_id) {
      return res.status(400).json({
        success: false,
        message: 'campaign_id is required'
      });
    }

    const params = new URLSearchParams({ campaign_id });
    if (employee_id) params.append('employee_id', employee_id);

    const response = await axios.get(
      `${HRM_BASE_URL}/api/health-check/results?${params.toString()}`
    );

    res.json({
      success: true,
      results: response.data.results || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/report?campaign_id=1
 * HR xem báo cáo tổng hợp khám sức khỏe
 */
router.get('/report', async (req, res) => {
  try {
    const { campaign_id } = req.query;

    if (!campaign_id) {
      return res.status(400).json({
        success: false,
        message: 'campaign_id is required'
      });
    }

    const response = await axios.get(
      `${HRM_BASE_URL}/api/health-check/report?campaign_id=${campaign_id}`
    );

    res.json({
      success: true,
      report: response.data.report || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * HIS ENDPOINTS (Bác sĩ, nhân viên y tế sử dụng)
 * ============================================================================
 */

/**
 * GET /api/gateway/his/health-check/pending
 * HIS lấy danh sách nhân viên cần khám từ HRM
 */
router.get('/his/pending', async (req, res) => {
  try {
    const response = await axios.get(`${HIS_BASE_URL}/api/health-check/pending-requests`);

    res.json({
      success: true,
      pending_requests: response.data.requests || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending health checks',
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/his/health-check/schedule?date=2026-02-10
 * Bác sĩ xem lịch khám của ngày hôm nay
 */
router.get('/his/schedule', async (req, res) => {
  try {
    const { date, doctor_id } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date parameter is required (YYYY-MM-DD)'
      });
    }

    const params = new URLSearchParams({ date });
    if (doctor_id) params.append('doctor_id', doctor_id);

    const response = await axios.get(
      `${HIS_BASE_URL}/api/health-check/schedule?${params.toString()}`
    );

    res.json({
      success: true,
      date,
      schedule: response.data.appointments || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
});

/**
 * POST /api/gateway/his/health-check/submit-result
 * Bác sĩ submit kết quả khám (CHỈ lưu chi tiết bệnh lý tại HIS)
 */
router.post('/his/submit-result', async (req, res) => {
  try {
    const {
      appointment_id,
      employee_id,
      check_date,
      doctor_id,
      health_status,
      restrictions,
      doctor_conclusion,
      detailed_diagnosis,
      recommended_treatment,
      vitals,
      lab_results,
      imaging
    } = req.body;

    // Validate
    if (!appointment_id || !employee_id || !health_status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: appointment_id, employee_id, health_status'
      });
    }

    // Validate health_status
    const validStatuses = ['Type_1', 'Type_2', 'Type_3', 'Type_4'];
    if (!validStatuses.includes(health_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid health_status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Call HIS to save result
    const response = await axios.post(`${HIS_BASE_URL}/api/health-check/results`, {
      appointment_id,
      employee_id,
      check_date,
      doctor_id,
      health_status,
      restrictions: restrictions || [],
      doctor_conclusion,
      detailed_diagnosis,
      recommended_treatment,
      vitals,
      lab_results,
      imaging,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Health check result submitted successfully',
      his_record_id: response.data.his_record_id
    });
  } catch (error) {
    console.error('Error submitting health check result:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit health check result',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * AUTO SYNC ENDPOINTS (Cron jobs gọi)
 * ============================================================================
 */

/**
 * POST /api/gateway/health-check/auto-sync-from-his
 * Auto-sync: HIS → HRM (pull completed results)
 * Được gọi bởi cron job mỗi 2 giờ
 */
router.post('/auto-sync-from-his', async (req, res) => {
  try {
    // Get completed results from HIS
    const hisResults = await axios.get(`${HIS_BASE_URL}/api/health-check/completed`);

    if (!hisResults.data.results || hisResults.data.results.length === 0) {
      return res.json({
        success: true,
        message: 'No completed health checks to sync'
      });
    }

    // Send results to HRM
    const hrmResponse = await axios.post(
      `${HRM_BASE_URL}/api/health-check/receive-results`,
      {
        results: hisResults.data.results
      }
    );

    res.json({
      success: true,
      message: 'Auto sync completed',
      synced_count: hisResults.data.results.length,
      hrm_response: hrmResponse.data
    });
  } catch (error) {
    console.error('Error in auto-sync:', error.message);
    res.status(500).json({
      success: false,
      message: 'Auto sync failed',
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/sync-status
 * Kiểm tra trạng thái sync
 */
router.get('/sync-status', async (req, res) => {
  try {
    const response = await axios.get(`${HRM_BASE_URL}/api/health-check/sync-status`);

    res.json({
      success: true,
      sync_status: response.data.sync_status || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sync status',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * HEALTH CHECK ENDPOINT
 * ============================================================================
 */

/**
 * GET /api/gateway/health-check/health
 * Kiểm tra trạng thái tích hợp
 */
router.get('/health', async (req, res) => {
  try {
    const [hrmHealth, hisHealth] = await Promise.allSettled([
      axios.get(`${HRM_BASE_URL}/api/health`),
      axios.get(`${HIS_BASE_URL}/api/health`)
    ]);

    res.json({
      success: true,
      gateway: 'OK',
      hrm: hrmHealth.status === 'fulfilled' ? 'OK' : 'DOWN',
      his: hisHealth.status === 'fulfilled' ? 'OK' : 'DOWN'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gateway health check failed',
      error: error.message
    });
  }
});

module.exports = router;
