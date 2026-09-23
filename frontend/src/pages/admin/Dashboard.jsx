import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HardHat, Bell, Image, CheckCircle2, Plus } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import { noticesApi } from '../../api/notices';
import { bannersApi } from '../../api/banners';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/admin/Alert';

const Dashboard = () => {
  const { admin } = useAuth();
  const [counts, setCounts] = useState({ projects: 0, completed: 0, notices: 0, banners: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [projects, notices, banners] = await Promise.all([
          projectsApi.listAll(),
          noticesApi.listAll(),
          bannersApi.listAll(),
        ]);
        if (cancelled) return;
        setCounts({
          projects: projects.data.length,
          completed: projects.data.filter((p) => p.status === 'COMPLETED').length,
          notices: notices.data.filter((n) => n.isVisible !== false).length,
          banners: banners.data.length,
        });
      } catch (err) {
        if (!cancelled) setError({ message: err.message, details: err.details });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const tiles = [
    { label: 'Total Projects', value: counts.projects, icon: HardHat, to: '/admin/projects' },
    { label: 'Completed Projects', value: counts.completed, icon: CheckCircle2, to: '/admin/projects' },
    { label: 'Active Notices', value: counts.notices, icon: Bell, to: '/admin/notices' },
    { label: 'Hero Banners', value: counts.banners, icon: Image, to: '/admin/banners' },
  ];

  return (
    <>
      <h2 className="admin-card-title">Welcome back, {admin?.name || admin?.username}</h2>
      <p className="admin-card-sub">Manage the content shown on the public portal.</p>

      <Alert type="error" message={error?.message} details={error?.details} />

      {loading ? (
        <div className="admin-loading">Loading overview…</div>
      ) : (
        <div className="admin-stat-grid">
          {tiles.map(({ label, value, icon: Icon, to }) => (
            <Link key={label} to={to} className="admin-stat-card">
              <div className="admin-stat-icon"><Icon size={20} /></div>
              <div>
                <div className="admin-stat-value">{value}</div>
                <div className="admin-stat-label">{label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="admin-card">
        <h3 className="admin-card-title">Quick actions</h3>
        <p className="admin-card-sub">Common tasks for keeping the public site current.</p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link className="admin-btn" to="/admin/projects"><Plus size={15} /> Add Project</Link>
          <Link className="admin-btn admin-btn-outline" to="/admin/notices"><Plus size={15} /> Add Notice</Link>
          <Link className="admin-btn admin-btn-outline" to="/admin/banners"><Plus size={15} /> Add Banner</Link>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
