import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/PortalPages.css';

const HospitalPortalPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="portal-page">
      <div className="portal-hero">
        <div className="title">Hospital</div>
        <div className="subtitle">Appointments, doctors, and medical records</div>
      </div>

      <div className="portal-content">
        <div className="portal-card">
          <h3>Quick Actions</h3>
          <div className="portal-actions">
            <button className="portal-btn" type="button">View Doctors</button>
            <button className="portal-btn" type="button">Book Appointment</button>
            <button className="portal-btn" type="button">Medical Records</button>
            <button className="portal-btn secondary" type="button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>

        <div className="portal-card">
          <h3>Services</h3>
          <div className="portal-grid">
            <div className="portal-tile">
              <div className="tile-title">Pharmacy</div>
              <div>Browse medicines and prescriptions.</div>
              <div className="portal-links">
                <a className="portal-link" href="/services/pharmacy">Open Pharmacy</a>
              </div>
            </div>
            <div className="portal-tile">
              <div className="tile-title">Labs & Diagnostics</div>
              <div>Book lab tests and see results.</div>
              <div className="portal-links">
                <a className="portal-link" href="/services/labs-diagnostics">Open Labs</a>
              </div>
            </div>
            <div className="portal-tile">
              <div className="tile-title">Checkups</div>
              <div>Schedule and manage checkups.</div>
              <div className="portal-links">
                <a className="portal-link" href="/services/checkup">Open Checkups</a>
              </div>
            </div>
            <div className="portal-tile">
              <div className="tile-title">👨‍⚕️ Health Checks</div>
              <div>Employee health checkups & records.</div>
              <div className="portal-links">
                <a className="portal-link" href="/doctor/health-check">Manage Health Checks</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-footer">© 2026 Unified Portal</div>
    </div>
  );
};

export default HospitalPortalPage;
