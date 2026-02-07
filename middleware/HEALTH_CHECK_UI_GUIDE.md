# 🏥 Health Check Management UI - Doctor Interface

## Overview

Complete React UI component for managing employee health checkups in the HIS (Hospital Information System).

## Components

### 1. **HealthCheckSchedule** - Daily Schedule View
Doctors view and manage health check appointments for the day.

**Features:**
- 📅 Date picker to view schedule for any day
- 🕐 Appointment time slots
- 👥 Employee information
- 📊 Status tracking (pending, confirmed, checked, missed)
- 🎯 Quick "Start Checkup" button

**Usage:**
```jsx
import { HealthCheckSchedule } from './health-check-ui';

export default function SchedulePage() {
  return <HealthCheckSchedule />;
}
```

**API Called:**
- `GET /api/gateway/health-check/schedule?date=YYYY-MM-DD`

---

### 2. **HealthCheckModal** - Detailed Health Check Form
Modal form for doctors to input complete health check results.

**Sections (Tabs):**

#### Tab 1: Vital Signs
Input physical examination measurements:
- Height (cm)
- Weight (kg)
- Blood Pressure (mmHg)
- Heart Rate (bpm)
- Temperature (°C)
- Respiratory Rate
- Oxygen Saturation (%)

#### Tab 2: Lab Results
Record laboratory test results:
- RBC (Red Blood Cell count)
- WBC (White Blood Cell count)
- Hemoglobin (Hb)
- Glucose
- Additional lab notes

#### Tab 3: Conclusion
Final health assessment:
- **Health Status** (Type 1-4)
  - Type 1: ✅ Healthy (no issues)
  - Type 2: ⚠️ Healthy with notes
  - Type 3: 🔔 Needs monitoring
  - Type 4: ❌ Not fit for work

- **Work Restrictions**
  - no_height_work (no working at heights)
  - avoid_heavy_lifting (no heavy objects)
  - sit_8h_max (sitting max 8 hours)
  - avoid_extreme_temperature
  - limited_physical_activity
  - no_chemical_exposure

- **Doctor Conclusion** (for HR)
  - Brief summary (NOT detailed diagnosis)
  - Example: "Blood pressure slightly elevated, needs monitoring"

- **Detailed Diagnosis** (HIS only)
  - Full medical findings (confidential)
  - NOT sent to HR system

**API Called:**
- `POST /api/gateway/health-check/his/submit-result`

**Request Body:**
```json
{
  "appointment_id": "apt123",
  "employee_id": 456,
  "check_date": "2026-02-10",
  "doctor_id": "doc1",
  "health_status": "Type_2",
  "restrictions": ["avoid_heavy_lifting"],
  "doctor_conclusion": "Blood pressure hơi cao, cần theo dõi",
  "detailed_diagnosis": "Tăng huyết áp stage 1, tiền sử gia đình",
  "vitals": {
    "height": 170,
    "weight": 65,
    "blood_pressure": "120/80",
    "heart_rate": 72,
    "temperature": 36.5,
    "respiratory_rate": 16,
    "oxygen_saturation": 98
  },
  "lab_results": {
    "RBC": 4.5,
    "WBC": 7.0,
    "Hb": 14.0,
    "glucose": 100,
    "notes": "All normal"
  }
}
```

---

### 3. **HealthCheckResults** - Results Table
View submitted health check results for a campaign.

**Features:**
- 📋 Table view of all results
- 👤 Employee names
- 📅 Check dates
- 🏥 Health status with icon
- ⚠️ Work restrictions count
- 📝 Doctor conclusions

**Usage:**
```jsx
import { HealthCheckResults } from './health-check-ui';

export default function ResultsPage() {
  return <HealthCheckResults campaignId={1} />;
}
```

**API Called:**
- `GET /api/gateway/health-check/results?campaign_id=1`

---

## Installation

### 1. Copy Files
```bash
# React component
cp server/health-check-ui.jsx client/src/components/

# CSS styles
cp server/styles/health-check.css client/src/styles/
```

### 2. Import in Client
```jsx
// client/src/pages/DoctorDashboard.js
import { HealthCheckSchedule, HealthCheckResults } from '../components/health-check-ui';
import '../styles/health-check.css';

export default function DoctorDashboard() {
  return (
    <div>
      <HealthCheckSchedule />
    </div>
  );
}
```

### 3. Add Route in App.js
```jsx
import DoctorDashboard from './pages/DoctorDashboard';

<Route path="/doctor/health-check" element={<DoctorDashboard />} />
<Route path="/doctor/health-check-results" element={
  <HealthCheckResults campaignId={1} />
} />
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCTOR WORKFLOW                         │
└─────────────────────────────────────────────────────────────┘

1. VIEW SCHEDULE
   └─ Doctor opens /doctor/health-check
   └─ Selects date (defaults to today)
   └─ Sees list of employees to check today
   └─ Each appointment shows:
      - Time (09:00 AM)
      - Employee name
      - Department
      - Status

2. START CHECKUP
   └─ Doctor clicks "Start Checkup"
   └─ Modal opens with health check form
   └─ Three tabs: Vital Signs → Lab Results → Conclusion

3. ENTER DATA
   ├─ Tab 1: Measure vital signs
   │  └─ Height, weight, BP, HR, temp, etc.
   │
   ├─ Tab 2: Enter lab test results
   │  └─ RBC, WBC, Hb, glucose, notes
   │
   └─ Tab 3: Complete conclusion
      ├─ Select health status (Type 1-4)
      ├─ Check work restrictions
      ├─ Write doctor conclusion (for HR)
      └─ Write detailed diagnosis (HIS only)

4. SUBMIT
   └─ Click "Submit Health Check"
   └─ API POST to /api/gateway/health-check/his/submit-result
   └─ Result saved in HIS (MongoDB)

5. VIEW RESULTS (Later)
   └─ HR can view aggregated results
   └─ Only sees: health status, restrictions, conclusion
   └─ NOT detailed diagnosis or lab values
```

---

## Security Model

### What Gets Sent to HR
✅ Health status (Type 1-4)
✅ Work restrictions list
✅ Doctor conclusion (summary only)
❌ Detailed diagnosis
❌ Lab test values
❌ Vital signs details

### What Stays in HIS
✅ All vital signs measurements
✅ Complete lab results
✅ Detailed medical diagnosis
✅ Doctor's private notes
✅ Treatment recommendations

---

## Styling

All styles are in `server/styles/health-check.css`

**Color Scheme:**
- Primary: #2196F3 (Blue)
- Success: #4CAF50 (Green)
- Warning: #FFA500 (Orange)
- Error: #f44336 (Red)
- Background: #f8f9fa (Light Gray)

**Responsive Design:**
- Desktop: Grid layout, 340px cards
- Tablet: Adjusted grid
- Mobile: Single column, full-width inputs

---

## API Integration

### Prerequisites
- Gateway running on `localhost:6000`
- Authentication token in localStorage

### Endpoints Used

#### 1. Get Schedule
```http
GET /api/gateway/health-check/schedule?date=2026-02-10
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "date": "2026-02-10",
  "schedule": [
    {
      "appointment_id": "apt123",
      "employee_id": 456,
      "employee_name": "Nguyễn Văn A",
      "department": "Engineering",
      "doctor_id": "doc1",
      "doctor_name": "Dr. Trần Thị B",
      "scheduled_date": "2026-02-10",
      "scheduled_time": "09:00 AM",
      "status": "pending"
    }
  ]
}
```

#### 2. Submit Result
```http
POST /api/gateway/health-check/his/submit-result
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Testing

### Manual Testing Steps

1. **Test Schedule View**
   ```bash
   curl -H "Authorization: Bearer demo_token" \
     http://localhost:6000/api/gateway/health-check/schedule?date=2026-02-10
   ```

2. **Test Submit Result**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer demo_token" \
     -H "Content-Type: application/json" \
     -d '{
       "appointment_id": "apt123",
       "employee_id": 456,
       "health_status": "Type_2",
       "restrictions": ["avoid_heavy_lifting"],
       "doctor_conclusion": "Blood pressure hơi cao"
     }' \
     http://localhost:6000/api/gateway/health-check/his/submit-result
   ```

3. **Test Results View**
   ```bash
   curl -H "Authorization: Bearer demo_token" \
     http://localhost:6000/api/gateway/health-check/results?campaign_id=1
   ```

---

## Component Props

### HealthCheckSchedule
No props required. Uses localStorage for auth token.

### HealthCheckResults
```jsx
<HealthCheckResults 
  campaignId={1}  // Required: Campaign ID from HRM
/>
```

---

## Error Handling

The components handle:
- ✅ Network errors (shows alert)
- ✅ Missing required fields
- ✅ Invalid health status selection
- ✅ Loading states
- ✅ Empty results

---

## Future Enhancements

1. 📷 Upload health check images
2. 📊 PDF report generation
3. 🔍 Search/filter by employee
4. 📧 Email notifications to HR
5. 📱 Mobile-optimized view
6. 🖨️ Print schedules
7. 🔔 Appointment reminders

---

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile Safari: ⚠️ Limited (modal may not be responsive)

---

## Files

- `server/health-check-ui.jsx` - React components
- `server/styles/health-check.css` - Styles
- `server/routes/health-check-gateway.js` - API routes (already integrated)

---

**Last Updated:** Feb 6, 2026
**Version:** 1.0.0
