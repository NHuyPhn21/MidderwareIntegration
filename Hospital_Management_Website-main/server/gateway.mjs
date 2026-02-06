import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.GATEWAY_PORT || 6000;

// Middleware
app.use(express.json());

// ============================================
// 1. CONFIGURATION - CẤU HÌNH 3 HỆ THỐNG
// ============================================

const SYSTEMS = {
  hospital: {
    name: 'Hospital Management',
    baseUrl: process.env.HOSPITAL_API_URL || 'http://localhost:5000',
    port: 5000,
    type: 'node',
    auth: {
      type: 'jwt-bearer'
    }
  },
  hr: {
    name: 'HR Management (Java Spring Boot)',
    baseUrl: process.env.HR_API_URL || 'http://localhost:8080',
    port: 8080,
    type: 'java',
    auth: {
      type: 'jwt-query',
      token: process.env.HR_THIRD_PARTY_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0aGlyZF9wYXJ0eV91c2VyIiwiaWF0IjoxNzI4MDAwMDAwLCJleHAiOjMzMDgwMDAwMDB9.thirdpartyfixedtoken123456789'
    }
  },
  hotel: {
    name: 'Hotel Management',
    baseUrl: process.env.HOTEL_API_URL || 'http://localhost:3000',
    port: 3000,
    type: 'unknown',
    status: 'pending' // Chờ nhóm Hotel
  }
};

// ============================================
// 2. HEALTH CHECK ENDPOINTS
// ============================================

// Gateway health
app.get('/api/gateway/health', (req, res) => {
  res.json({
    code: 0,
    message: 'API Gateway is running',
    success: true,
    timestamp: new Date(),
    systems: SYSTEMS
  });
});

// Check health của tất cả systems
app.get('/api/gateway/systems', async (req, res) => {
  const systemsStatus = {};
  
  for (const [key, system] of Object.entries(SYSTEMS)) {
    try {
      const response = await axios.get(`${system.baseUrl}/api/health`, {
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

// ============================================
// 3. AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /api/gateway/auth/login
 * Login with HR system credentials
 * Returns JWT token for accessing all 3 services
 */
app.post('/api/gateway/auth/login', async (req, res) => {
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
app.get('/api/gateway/auth/verify', async (req, res) => {
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

// ============================================
// 4. HOSPITAL ENDPOINTS (Local Proxy)
// ============================================

// Get all doctors
app.get('/api/gateway/hospital/doctors', async (req, res) => {
  try {
    const token = req.headers.authorization;
    
    const response = await axios.get(
      `${SYSTEMS.hospital.baseUrl}/api/doctors`,
      {
        headers: token ? { 'Authorization': token } : {},
        timeout: 5000
      }
    );
    res.json({
      code: 0,
      message: 'Doctors from Hospital system',
      success: true,
      source: 'Hospital Management',
      data: response.data.data || response.data
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Error fetching doctors from Hospital',
      success: false,
      error: error.message
    });
  }
});

// Get doctors with filters
app.get('/api/gateway/hospital/doctors/department/:dept', async (req, res) => {
  try {
    const token = req.headers.authorization;
    
    const response = await axios.get(
      `${SYSTEMS.hospital.baseUrl}/api/doctors/department/${req.params.dept}`,
      {
        headers: token ? { 'Authorization': token } : {},
        timeout: 5000
      }
    );
    res.json({
      code: 0,
      message: `Doctors in ${req.params.dept}`,
      success: true,
      source: 'Hospital Management',
      data: response.data.data || response.data
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Error fetching doctors from Hospital',
      success: false,
      error: error.message
    });
  }
});

// Get all doctors via HR integration endpoint (with HR token verification)
app.get('/api/gateway/hospital/hr/doctors', async (req, res) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({
        code: 1,
        message: 'Token required',
        success: false
      });
    }

    const response = await axios.get(
      `${SYSTEMS.hospital.baseUrl}/api/hr/doctors`,
      {
        headers: { 'Authorization': token },
        timeout: 5000
      }
    );
    
    res.json({
      code: 0,
      message: 'Doctors from Hospital (HR integration)',
      success: true,
      source: 'Hospital Management - HR Integration',
      data: response.data.data || response.data
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      code: 5,
      message: 'Error fetching doctors from Hospital HR endpoint',
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 5. HR ENDPOINTS (Proxy → Java API)
// ============================================


// ============================================
// 5. HR ENDPOINTS (Proxy → Java API)
// ============================================

/**
 * GET /api/gateway/hr/employees
 * Get all employees from HR system
 */
app.get('/api/gateway/hr/employees', async (req, res) => {
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
app.get('/api/gateway/hr/employees/:id', async (req, res) => {
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
app.post('/api/gateway/hr/employees', async (req, res) => {
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
app.get('/api/gateway/hr/departments', async (req, res) => {
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

// ============================================
// 7. HOTEL ENDPOINTS (Ready when Hotel team finishes)
// ============================================

app.get('/api/gateway/hotel/rooms', async (req, res) => {
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

// ============================================
// 8. SYNC ENDPOINTS
// ============================================

/**
 * POST /api/gateway/sync/hr-to-hospital
 * Sync HR employees → Hospital doctors
 */
app.post('/api/gateway/sync/hr-to-hospital', async (req, res) => {
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
app.get('/api/gateway/sync/status', async (req, res) => {
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
      code: 5,
      message: 'Sync failed',
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 7. UNIFIED REPORTS
// ============================================

app.get('/api/gateway/reports/system-overview', async (req, res) => {
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

// ============================================
// 8. ERROR HANDLING & START SERVER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    code: 2,
    message: 'Endpoint not found',
    success: false,
    path: req.path
  });
});

// ============================================
// 9. HEALTH CHECK - HIS-HRM INTEGRATION
// ============================================

/**
 * POST /api/gateway/health-check/campaigns
 * HR tạo đợt khám sức khỏe
 */
app.post('/api/gateway/health-check/campaigns', async (req, res) => {
  try {
    const { campaign_name, campaign_type, start_date, end_date, description } = req.body;

    if (!campaign_name || !campaign_type || !start_date || !end_date) {
      return res.status(400).json({
        code: 3,
        message: 'Missing required fields: campaign_name, campaign_type, start_date, end_date',
        success: false
      });
    }

    // TODO: Call HRM API to create campaign
    res.status(201).json({
      code: 0,
      message: 'Health check campaign created successfully',
      success: true,
      campaign_id: Math.floor(Math.random() * 10000)
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to create campaign',
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/campaigns
 * HR xem danh sách các đợt khám
 */
app.get('/api/gateway/health-check/campaigns', async (req, res) => {
  try {
    res.json({
      code: 0,
      message: 'Health check campaigns',
      success: true,
      campaigns: [
        {
          id: 1,
          campaign_name: 'Annual Health Check 2026',
          campaign_type: 'Annual',
          start_date: '2026-02-01',
          end_date: '2026-03-31',
          status: 'planning'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to fetch campaigns',
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/due-employees?campaign_id=1
 * Lấy danh sách nhân viên cần khám
 */
app.get('/api/gateway/health-check/due-employees', async (req, res) => {
  try {
    const { campaign_id } = req.query;

    if (!campaign_id) {
      return res.status(400).json({
        code: 3,
        message: 'campaign_id is required',
        success: false
      });
    }

    res.json({
      code: 0,
      message: 'Employees due for health check',
      success: true,
      total: 2,
      due_employees: [
        {
          id: 1,
          name: 'Nguyễn Văn A',
          email: 'a@company.com',
          department: 'Engineering',
          last_check_date: '2025-02-10',
          due_date: '2026-02-10'
        },
        {
          id: 2,
          name: 'Trần Thị B',
          email: 'b@company.com',
          department: 'HR',
          last_check_date: '2025-03-15',
          due_date: '2026-03-15'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to fetch due employees',
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gateway/health-check/sync-to-his
 * HRM gửi danh sách sang HIS
 */
app.post('/api/gateway/health-check/sync-to-his', async (req, res) => {
  try {
    const { campaign_id, employees } = req.body;

    if (!campaign_id || !employees || !Array.isArray(employees)) {
      return res.status(400).json({
        code: 3,
        message: 'Invalid request: campaign_id and employees array required',
        success: false
      });
    }

    res.json({
      code: 0,
      message: 'Health check requests sent to HIS successfully',
      success: true,
      his_campaign_id: `his_${campaign_id}_${Date.now()}`,
      total_sent: employees.length
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to sync with HIS',
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/results?campaign_id=1
 * HR xem kết quả khám
 */
app.get('/api/gateway/health-check/results', async (req, res) => {
  try {
    const { campaign_id, employee_id } = req.query;

    if (!campaign_id) {
      return res.status(400).json({
        code: 3,
        message: 'campaign_id is required',
        success: false
      });
    }

    res.json({
      code: 0,
      message: 'Health check results',
      success: true,
      results: employee_id ? [
        {
          employee_id: parseInt(employee_id),
          employee_name: 'Nguyễn Văn A',
          check_date: '2026-02-10',
          health_status: 'Type_2',
          restrictions: ['avoid_heavy_lifting'],
          doctor_conclusion: 'Huyết áp hơi cao, cần theo dõi'
        }
      ] : [
        {
          employee_id: 1,
          employee_name: 'Nguyễn Văn A',
          check_date: '2026-02-10',
          health_status: 'Type_2',
          restrictions: ['avoid_heavy_lifting'],
          doctor_conclusion: 'Huyết áp hơi cao, cần theo dõi'
        },
        {
          employee_id: 2,
          employee_name: 'Trần Thị B',
          check_date: '2026-02-12',
          health_status: 'Type_1',
          restrictions: [],
          doctor_conclusion: 'Sức khỏe bình thường'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to fetch results',
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gateway/health-check/his/submit-result
 * Bác sĩ submit kết quả khám
 */
app.post('/api/gateway/health-check/his/submit-result', async (req, res) => {
  try {
    const { appointment_id, employee_id, health_status } = req.body;

    if (!appointment_id || !employee_id || !health_status) {
      return res.status(400).json({
        code: 3,
        message: 'Missing required fields: appointment_id, employee_id, health_status',
        success: false
      });
    }

    const validStatuses = ['Type_1', 'Type_2', 'Type_3', 'Type_4'];
    if (!validStatuses.includes(health_status)) {
      return res.status(400).json({
        code: 3,
        message: `Invalid health_status. Must be one of: ${validStatuses.join(', ')}`,
        success: false
      });
    }

    res.json({
      code: 0,
      message: 'Health check result submitted successfully',
      success: true,
      his_record_id: `rec_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to submit health check result',
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gateway/health-check/report?campaign_id=1
 * HR xem báo cáo tổng hợp
 */
app.get('/api/gateway/health-check/report', async (req, res) => {
  try {
    const { campaign_id } = req.query;

    if (!campaign_id) {
      return res.status(400).json({
        code: 3,
        message: 'campaign_id is required',
        success: false
      });
    }

    res.json({
      code: 0,
      message: 'Health check report',
      success: true,
      report: {
        campaign_id,
        campaign_name: 'Annual Health Check 2026',
        total_employees: 2,
        checked_count: 2,
        pending_count: 0,
        type_1_count: 1,
        type_2_count: 1,
        type_3_count: 0,
        type_4_count: 0,
        completion_rate: '100%'
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to fetch report',
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🌐 API GATEWAY RUNNING`);
  console.log(`📌 Port: ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/gateway/health\n`);
  console.log(`📊 Connected Systems:`);
  Object.entries(SYSTEMS).forEach(([key, system]) => {
    console.log(`   ${system.name}: ${system.baseUrl} (${system.type})`);
  });
  console.log(`✅ Health Check Integration: /api/gateway/health-check/*`);
  console.log(`\n`);
});

export default app;
