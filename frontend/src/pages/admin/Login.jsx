import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/admin/Alert';
import '../../styles/admin.css';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="admin-loading">Loading…</div>;
  if (isAuthenticated) return <Navigate to={location.state?.from || '/admin'} replace />;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form.username.trim(), form.password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <img src="/hp-logo.png" alt="" className="admin-login-logo" />
        <h1 className="admin-login-title">Admin Sign In</h1>
        <p className="admin-login-sub">Civil Hospital Arki — Content Management</p>

        <Alert type="error" message={error?.message} details={error?.details} />

        <div className="admin-field" style={{ marginBottom: '0.9rem' }}>
          <label className="admin-label" htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            className="admin-input"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
            autoFocus
          />
        </div>

        <div className="admin-field" style={{ marginBottom: '1.25rem' }}>
          <label className="admin-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="admin-input"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="admin-btn w-full" style={{ justifyContent: 'center' }} disabled={submitting}>
          {submitting ? <Loader2 size={16} /> : <LogIn size={16} />}
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
