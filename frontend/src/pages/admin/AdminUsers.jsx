import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, Trash2, Loader2, KeyRound } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/admin/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const EMPTY_NEW = { username: '', password: '', name: '', role: 'admin' };

/** Superadmin-only: manage who can sign in to the admin panel. */
const AdminUsers = () => {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const [newAdmin, setNewAdmin] = useState(EMPTY_NEW);
  const [creating, setCreating] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwBusy, setPwBusy] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.listAdmins();
      setAdmins(res.data);
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice('');
    setCreating(true);
    try {
      await authApi.createAdmin(newAdmin);
      setNewAdmin(EMPTY_NEW);
      setNotice('Admin account created.');
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setCreating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice('');
    setPwBusy(true);
    try {
      await authApi.changePassword(pw.currentPassword, pw.newPassword);
      setPw({ currentPassword: '', newPassword: '' });
      setNotice('Your password has been changed.');
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setPwBusy(false);
    }
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await authApi.removeAdmin(deleting.id);
      setDeleting(null);
      setNotice('Admin removed.');
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <h2 className="admin-card-title">Admin Users</h2>
      <p className="admin-card-sub">Accounts that can sign in and edit site content.</p>

      <Alert type="error" message={error?.message} details={error?.details} />
      <Alert type="success" message={notice} />

      <div className="admin-table-wrap" style={{ marginBottom: '1.25rem' }}>
        {loading ? (
          <div className="admin-loading">Loading accounts…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Username</th><th>Role</th><th>Last Sign-in</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>
                    {a.name}
                    {a.id === admin?.id && <span className="admin-hint"> (you)</span>}
                  </td>
                  <td>{a.username}</td>
                  <td>
                    <span className={`admin-badge ${a.role === 'superadmin' ? 'completed' : 'planned'}`}>
                      {a.role}
                    </span>
                  </td>
                  <td>{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString('en-IN') : '—'}</td>
                  <td>
                    <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="admin-btn-icon danger"
                        onClick={() => setDeleting(a)}
                        disabled={a.id === admin?.id}
                        title={a.id === admin?.id ? 'You cannot delete your own account' : 'Delete'}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form className="admin-card" onSubmit={handleCreate}>
        <h3 className="admin-card-title">Add an admin</h3>
        <p className="admin-card-sub">The new account can sign in immediately.</p>

        <div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-name">Full Name <span className="req">*</span></label>
            <input id="new-name" className="admin-input" value={newAdmin.name}
              onChange={(e) => setNewAdmin((n) => ({ ...n, name: e.target.value }))} required />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-username">Username <span className="req">*</span></label>
            <input id="new-username" className="admin-input" value={newAdmin.username} autoComplete="off"
              onChange={(e) => setNewAdmin((n) => ({ ...n, username: e.target.value }))} required />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-password">Password <span className="req">*</span></label>
            <input id="new-password" type="password" className="admin-input" value={newAdmin.password} autoComplete="new-password"
              minLength={8}
              onChange={(e) => setNewAdmin((n) => ({ ...n, password: e.target.value }))} required />
            <span className="admin-hint">At least 8 characters</span>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-role">Role</label>
            <select id="new-role" className="admin-select" value={newAdmin.role}
              onChange={(e) => setNewAdmin((n) => ({ ...n, role: e.target.value }))}>
              <option value="admin">Admin — manages content</option>
              <option value="superadmin">Super Admin — also manages accounts</option>
            </select>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn" disabled={creating}>
            {creating ? <Loader2 size={15} /> : <UserPlus size={15} />} {creating ? 'Creating…' : 'Create Admin'}
          </button>
        </div>
      </form>

      <form className="admin-card" onSubmit={handleChangePassword}>
        <h3 className="admin-card-title">Change your password</h3>
        <p className="admin-card-sub">Updates the password for {admin?.username}.</p>

        <div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-label" htmlFor="cur-pw">Current Password <span className="req">*</span></label>
            <input id="cur-pw" type="password" className="admin-input" value={pw.currentPassword} autoComplete="current-password"
              onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} required />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-pw">New Password <span className="req">*</span></label>
            <input id="new-pw" type="password" className="admin-input" value={pw.newPassword} autoComplete="new-password"
              minLength={8}
              onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} required />
            <span className="admin-hint">At least 8 characters</span>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn" disabled={pwBusy}>
            {pwBusy ? <Loader2 size={15} /> : <KeyRound size={15} />} {pwBusy ? 'Updating…' : 'Change Password'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove this admin?"
        message={`${deleting?.name} (${deleting?.username}) will no longer be able to sign in.`}
        confirmLabel="Remove"
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
};

export default AdminUsers;
