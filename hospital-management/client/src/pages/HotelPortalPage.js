import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/PortalPages.css';

const HotelPortalPage = () => {
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
        <div className="title">Hotel</div>
        <div className="subtitle">Room booking and reservations</div>
      </div>

      <div className="portal-content">
        <div className="portal-card">
          <h3>Quick Actions</h3>
          <div className="portal-actions">
            <button className="portal-btn" type="button">Find Rooms</button>
            <button className="portal-btn" type="button">My Bookings</button>
            <button className="portal-btn" type="button">Amenities</button>
            <button className="portal-btn secondary" type="button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>

        <div className="portal-card">
          <h3>Highlights</h3>
          <div className="portal-grid">
            <div className="portal-tile">
              <div className="tile-title">Premium Rooms</div>
              <div>Browse premium rooms with flexible dates.</div>
            </div>
            <div className="portal-tile">
              <div className="tile-title">Special Offers</div>
              <div>See seasonal offers and discounts.</div>
            </div>
            <div className="portal-tile">
              <div className="tile-title">Support</div>
              <div>Contact concierge and hotel services.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-footer">© 2026 Unified Portal</div>
    </div>
  );
};

export default HotelPortalPage;
