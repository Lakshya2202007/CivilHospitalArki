import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, HardHat, FileSpreadsheet, Megaphone, Image, Users,
  LogOut, Menu, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Works & Projects', icon: HardHat },
  { to: '/admin/tenders', label: 'Tenders & Quotations', icon: FileSpreadsheet },
  { to: '/admin/public-notices', label: 'Public Notices', icon: Megaphone },
  { to: '/admin/banners', label: 'Hero Banners', icon: Image },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = admin?.role === 'superadmin'
    ? [...NAV_ITEMS, { to: '/admin/users', label: 'Admin Users', icon: Users }]
    : NAV_ITEMS;

  return (
    <div className="admin-root">
      <div className="admin-layout">
        <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="admin-sidebar-brand">
            <img src="/hp-logo.png" alt="" />
            <span>Civil Hospital Arki<br />Admin Panel</span>
          </div>

          <nav className="admin-nav">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-user">
              <strong>{admin?.name || admin?.username}</strong>
              {admin?.role === 'superadmin' ? 'Super Admin' : 'Administrator'}
            </div>
            <button type="button" className="admin-logout-btn" onClick={handleLogout}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="flex items-center" style={{ gap: '0.6rem' }}>
              <button
                type="button"
                className="admin-btn-icon admin-menu-toggle"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle navigation"
              >
                <Menu size={20} />
              </button>
              <h1>Admin Panel</h1>
            </div>

            <div className="admin-topbar-actions">
              <a
                className="admin-btn admin-btn-outline admin-btn-sm"
                href="/"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={14} /> View site
              </a>
            </div>
          </header>

          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
