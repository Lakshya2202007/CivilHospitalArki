import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/public/Home';
import WorksDevelopments from './pages/public/WorksDevelopments';
import TendersQuotations from './pages/public/TendersQuotations';
import PublicNotices from './pages/public/PublicNotices';
import GlobalSearch from './pages/public/GlobalSearch';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Projects from './pages/admin/Projects';
import Tenders from './pages/admin/Tenders';
import AdminPublicNotices from './pages/admin/PublicNotices';
import Notices from './pages/admin/Notices';
import Banners from './pages/admin/Banners';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public portal ── */}
          <Route path="/" element={<Home />} />
          <Route path="/works-developments" element={<WorksDevelopments />} />
          <Route path="/tenders" element={<TendersQuotations />} />
          <Route path="/notices" element={<PublicNotices />} />
          <Route path="/search" element={<GlobalSearch />} />

          {/* ── Admin panel ── */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tenders" element={<Tenders />} />
            <Route path="public-notices" element={<AdminPublicNotices />} />
            <Route path="notices" element={<Notices />} />
            <Route path="banners" element={<Banners />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
