/**
 * Health Check Management UI Components
 * For doctors and health check staff
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Check,
  AlertCircle,
  Save,
  X,
  Stethoscope,
  Activity
} from 'lucide-react';

/**
 * ============================================================================
 * HEALTH CHECK SCHEDULE PAGE
 * ============================================================================
 * Hiển thị lịch khám sức khỏe của ngày hôm nay
 */
export const HealthCheckSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gateway/health-check/schedule?date=${selectedDate}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }
      );
      const data = await response.json();
      setSchedule(data.success ? data.schedule : []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-check-container">
      <div className="health-check-header">
        <h1>👨‍⚕️ Health Check Schedule</h1>
        <p>Daily appointments for employee health checkups</p>
      </div>

      {/* Date Selector */}
      <div className="date-selector">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
        <button className="btn-today" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
          Today
        </button>
      </div>

      {/* Schedule List */}
      <div className="schedule-grid">
        {loading ? (
          <p className="loading">Loading schedule...</p>
        ) : schedule.length === 0 ? (
          <p className="empty-state">No appointments for {selectedDate}</p>
        ) : (
          schedule.map((appointment, idx) => (
            <ScheduleCard
              key={idx}
              appointment={appointment}
              onSelect={() => setSelectedAppointment(appointment)}
            />
          ))
        )}
      </div>

      {/* Health Check Form Modal */}
      {selectedAppointment && (
        <HealthCheckModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSubmit={() => {
            setSelectedAppointment(null);
            fetchSchedule();
          }}
        />
      )}
    </div>
  );
};

/**
 * ============================================================================
 * SCHEDULE CARD - Thẻ hiển thị một lịch hẹn
 * ============================================================================
 */
const ScheduleCard = ({ appointment, onSelect }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#4CAF50',
      checked: '#2196F3',
      missed: '#f44336'
    };
    return colors[status] || '#999';
  };

  return (
    <div
      className="schedule-card"
      style={{ borderLeftColor: getStatusColor(appointment.status) }}
      onClick={onSelect}
    >
      <div className="card-header">
        <div className="card-time">
          <Clock size={20} />
          <span className="time">{appointment.scheduled_time}</span>
        </div>
        <span className={`status-badge status-${appointment.status}`}>
          {appointment.status}
        </span>
      </div>

      <div className="card-body">
        <div className="employee-info">
          <User size={18} />
          <div>
            <p className="employee-name">{appointment.employee_name}</p>
            <p className="employee-detail">{appointment.department}</p>
          </div>
        </div>

        <div className="doctor-info">
          <Stethoscope size={18} />
          <span>{appointment.doctor_name || 'Assigned Doctor'}</span>
        </div>
      </div>

      <button className="btn-check" onClick={(e) => {
        e.stopPropagation();
        // Trigger modal
      }}>
        Start Checkup
      </button>
    </div>
  );
};

/**
 * ============================================================================
 * HEALTH CHECK MODAL - Form nhập kết quả khám
 * ============================================================================
 */
const HealthCheckModal = ({ appointment, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    vitals: {
      height: '',
      weight: '',
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      respiratory_rate: '',
      oxygen_saturation: ''
    },
    lab_results: {
      RBC: '',
      WBC: '',
      Hb: '',
      glucose: '',
      blood_pressure_result: '',
      notes: ''
    },
    health_status: 'Type_1',
    restrictions: [],
    doctor_conclusion: '',
    detailed_diagnosis: ''
  });

  const [activeTab, setActiveTab] = useState('vitals');
  const [loading, setLoading] = useState(false);

  const handleVitalsChange = (field, value) => {
    setFormData({
      ...formData,
      vitals: { ...formData.vitals, [field]: value }
    });
  };

  const handleLabChange = (field, value) => {
    setFormData({
      ...formData,
      lab_results: { ...formData.lab_results, [field]: value }
    });
  };

  const handleSubmit = async () => {
    if (!formData.health_status) {
      alert('Please select health status');
      return;
    }

    if (!formData.doctor_conclusion) {
      alert('Please enter doctor conclusion');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gateway/health-check/his/submit-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          appointment_id: appointment.appointment_id,
          employee_id: appointment.employee_id,
          check_date: new Date().toISOString().split('T')[0],
          doctor_id: 'current_doctor',
          health_status: formData.health_status,
          restrictions: formData.restrictions,
          doctor_conclusion: formData.doctor_conclusion,
          detailed_diagnosis: formData.detailed_diagnosis,
          vitals: formData.vitals,
          lab_results: formData.lab_results
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Health check result submitted successfully!');
        onSubmit();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting result:', error);
      alert('Failed to submit health check result');
    } finally {
      setLoading(false);
    }
  };

  const restrictions = [
    'no_height_work',
    'avoid_heavy_lifting',
    'sit_8h_max',
    'avoid_extreme_temperature',
    'limited_physical_activity',
    'no_chemical_exposure'
  ];

  const toggleRestriction = (restriction) => {
    const updated = formData.restrictions.includes(restriction)
      ? formData.restrictions.filter(r => r !== restriction)
      : [...formData.restrictions, restriction];
    setFormData({ ...formData, restrictions: updated });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content health-check-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2>Health Check: {appointment.employee_name}</h2>
            <p className="modal-subtitle">{appointment.department}</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'vitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('vitals')}
          >
            <Activity size={18} /> Vital Signs
          </button>
          <button
            className={`tab ${activeTab === 'labs' ? 'active' : ''}`}
            onClick={() => setActiveTab('labs')}
          >
            <FileText size={18} /> Lab Results
          </button>
          <button
            className={`tab ${activeTab === 'conclusion' ? 'active' : ''}`}
            onClick={() => setActiveTab('conclusion')}
          >
            <Check size={18} /> Conclusion
          </button>
        </div>

        {/* Tab Content */}
        <div className="modal-body">
          {/* Vital Signs Tab */}
          {activeTab === 'vitals' && (
            <div className="form-section">
              <h3>📊 Vital Signs</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    placeholder="170"
                    value={formData.vitals.height}
                    onChange={(e) => handleVitalsChange('height', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="65"
                    value={formData.vitals.weight}
                    onChange={(e) => handleVitalsChange('weight', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={formData.vitals.blood_pressure}
                    onChange={(e) => handleVitalsChange('blood_pressure', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Heart Rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={formData.vitals.heart_rate}
                    onChange={(e) => handleVitalsChange('heart_rate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input
                    type="number"
                    placeholder="36.5"
                    step="0.1"
                    value={formData.vitals.temperature}
                    onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Respiratory Rate (breaths/min)</label>
                  <input
                    type="number"
                    placeholder="16"
                    value={formData.vitals.respiratory_rate}
                    onChange={(e) => handleVitalsChange('respiratory_rate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Oxygen Saturation (%)</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={formData.vitals.oxygen_saturation}
                    onChange={(e) => handleVitalsChange('oxygen_saturation', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lab Results Tab */}
          {activeTab === 'labs' && (
            <div className="form-section">
              <h3>🧪 Lab Results</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>RBC (Red Blood Cells)</label>
                  <input
                    type="number"
                    placeholder="4.5"
                    step="0.1"
                    value={formData.lab_results.RBC}
                    onChange={(e) => handleLabChange('RBC', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>WBC (White Blood Cells)</label>
                  <input
                    type="number"
                    placeholder="7.0"
                    step="0.1"
                    value={formData.lab_results.WBC}
                    onChange={(e) => handleLabChange('WBC', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hemoglobin (Hb)</label>
                  <input
                    type="number"
                    placeholder="14.0"
                    step="0.1"
                    value={formData.lab_results.Hb}
                    onChange={(e) => handleLabChange('Hb', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Glucose</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.lab_results.glucose}
                    onChange={(e) => handleLabChange('glucose', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Lab Notes</label>
                <textarea
                  placeholder="Additional lab observations..."
                  value={formData.lab_results.notes}
                  onChange={(e) => handleLabChange('notes', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Conclusion Tab */}
          {activeTab === 'conclusion' && (
            <div className="form-section">
              <h3>✅ Health Check Conclusion</h3>

              {/* Health Status */}
              <div className="form-group">
                <label>Health Status *</label>
                <select
                  value={formData.health_status}
                  onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
                  className="health-status-select"
                >
                  <option value="Type_1">✅ Type 1: Healthy (No issues)</option>
                  <option value="Type_2">⚠️ Type 2: Healthy with notes</option>
                  <option value="Type_3">🔔 Type 3: Needs monitoring</option>
                  <option value="Type_4">❌ Type 4: Not fit for work</option>
                </select>
              </div>

              {/* Restrictions */}
              <div className="form-group">
                <label>Work Restrictions</label>
                <div className="restrictions-grid">
                  {restrictions.map((restriction) => (
                    <label key={restriction} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.restrictions.includes(restriction)}
                        onChange={() => toggleRestriction(restriction)}
                      />
                      <span className="restriction-name">
                        {restriction.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Doctor Conclusion */}
              <div className="form-group">
                <label>Doctor Conclusion *</label>
                <textarea
                  placeholder="Brief summary for HR (e.g., 'Blood pressure slightly elevated, needs monitoring')"
                  value={formData.doctor_conclusion}
                  onChange={(e) => setFormData({ ...formData, doctor_conclusion: e.target.value })}
                  rows="3"
                />
              </div>

              {/* Detailed Diagnosis */}
              <div className="form-group">
                <label>Detailed Diagnosis (Private - Only HIS)</label>
                <textarea
                  placeholder="Detailed medical findings (NOT sent to HR)"
                  value={formData.detailed_diagnosis}
                  onChange={(e) => setFormData({ ...formData, detailed_diagnosis: e.target.value })}
                  rows="4"
                />
              </div>

              {/* Info Box */}
              <div className="info-box">
                <AlertCircle size={20} />
                <div>
                  <p><strong>Data Privacy:</strong> Detailed diagnosis and lab results remain confidential in HIS. Only health status, restrictions, and doctor conclusion are shared with HR.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '✅ Submit Health Check'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * HEALTH CHECK RESULTS PAGE - Xem kết quả khám đã submit
 * ============================================================================
 */
export const HealthCheckResults = ({ campaignId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [campaignId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gateway/health-check/results?campaign_id=${campaignId}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }
      );
      const data = await response.json();
      setResults(data.success ? data.results : []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      Type_1: '✅',
      Type_2: '⚠️',
      Type_3: '🔔',
      Type_4: '❌'
    };
    return icons[status] || '?';
  };

  return (
    <div className="results-container">
      <h2>📋 Health Check Results</h2>

      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p className="empty-state">No results yet</p>
      ) : (
        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check Date</th>
                <th>Status</th>
                <th>Restrictions</th>
                <th>Conclusion</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr key={idx}>
                  <td className="employee-cell">
                    <strong>{result.employee_name}</strong>
                  </td>
                  <td>{result.check_date}</td>
                  <td>
                    <span className={`status-badge status-${result.health_status}`}>
                      {getStatusIcon(result.health_status)} {result.health_status}
                    </span>
                  </td>
                  <td>
                    {result.restrictions && result.restrictions.length > 0 ? (
                      <span className="restrictions-tag">
                        {result.restrictions.length} restrictions
                      </span>
                    ) : (
                      <span className="no-restrictions">None</span>
                    )}
                  </td>
                  <td className="conclusion-cell">
                    {result.doctor_conclusion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * STYLES (CSS-in-JS)
 * ============================================================================
 */

const styles = `
/* Health Check Container */
.health-check-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.health-check-header {
  margin-bottom: 30px;
}

.health-check-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.health-check-header p {
  color: #666;
  font-size: 14px;
}

/* Date Selector */
.date-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.date-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.btn-today {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-today:hover {
  background-color: #45a049;
}

/* Schedule Grid */
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.schedule-card {
  background: white;
  border-left: 4px solid #4CAF50;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.schedule-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background-color: #ffe8cc;
  color: #cc7000;
}

.status-confirmed {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.status-checked {
  background-color: #bbdefb;
  color: #1565c0;
}

.status-missed {
  background-color: #ffcccc;
  color: #c62828;
}

.card-body {
  margin-bottom: 12px;
}

.employee-info,
.doctor-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.employee-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.employee-detail {
  font-size: 12px;
  color: #999;
}

.btn-check {
  width: 100%;
  padding: 8px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-check:hover {
  background-color: #0b7dda;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.health-check-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  color: #333;
}

.modal-subtitle {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 0;
}

.btn-close:hover {
  color: #333;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 0 20px;
  gap: 10px;
}

.tab {
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab.active {
  color: #2196F3;
  border-bottom-color: #2196F3;
}

/* Modal Body */
.modal-body {
  padding: 20px;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.health-status-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

/* Restrictions Grid */
.restrictions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.checkbox-label:hover {
  background-color: #f5f5f5;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.restriction-name {
  font-size: 13px;
  color: #555;
  text-transform: capitalize;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background-color: #e3f2fd;
  border-left: 4px solid #2196F3;
  border-radius: 6px;
  margin-top: 20px;
}

.info-box p {
  margin: 0;
  font-size: 13px;
  color: #1565c0;
  line-height: 1.5;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-secondary:disabled {
  background-color: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
}

/* Results Table */
.results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.results-table {
  overflow-x: auto;
}

.results-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results-table th {
  background-color: #f5f5f5;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.results-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.results-table tr:hover {
  background-color: #f9f9f9;
}

.employee-cell {
  font-weight: 500;
}

.restrictions-tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 12px;
  font-size: 12px;
}

.no-restrictions {
  color: #999;
  font-size: 12px;
}

.conclusion-cell {
  font-size: 13px;
  color: #555;
  max-width: 300px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}
`;

export default { HealthCheckSchedule, HealthCheckResults, styles };
