import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const result = await login('demo@example.com', 'demo123');

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError('Demo login failed. Please check HR system is running.');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="login-container loading">
        <Loader className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="portal-icon">🏥</div>
            <h1>Unified Portal</h1>
            <p className="subtitle">One Login, Three Services</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={20} className="spinner-small" />
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Demo Login Button */}
          <button
            type="button"
            className="demo-button"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Try Demo Account
          </button>

          {/* Info Box */}
          <div className="info-box">
            <h3>Demo Credentials:</h3>
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Password:</strong> demo123</p>
            <p className="note">Make sure HR System is running on port 8080</p>
          </div>

          {/* Services Info */}
          <div className="services-info">
            <h3>Access Three Services:</h3>
            <div className="services-list">
              <div className="service-item">
                <span className="service-icon">👥</span>
                <span>HR Management</span>
              </div>
              <div className="service-item">
                <span className="service-icon">🏥</span>
                <span>Hospital</span>
              </div>
              <div className="service-item">
                <span className="service-icon">🏨</span>
                <span>Hotel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Info */}
        <div className="login-info">
          <div className="info-content">
            <h2>Welcome to the Unified Portal</h2>
            <p>
              Manage your HR profile, book hospital appointments, and reserve hotel rooms—all from one place.
            </p>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
