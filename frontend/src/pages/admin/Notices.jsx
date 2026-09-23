import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Save, X, Loader2 } from 'lucide-react';
import { noticesApi } from '../../api/notices';
import Alert from '../../components/admin/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FileUploadField from '../../components/admin/FileUploadField';

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const EMPTY = {
  title: '',
  noticeDate: new Date().toISOString().slice(0, 10),
  attachmentUrl: '',
  attachmentName: '',
  isVisible: true,
};

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await noticesApi.listAll();
      setNotices(res.data);
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const startAdd = () => { setForm(EMPTY); setEditingId(null); setShowForm(true); setNotice(''); };

  const startEdit = (n) => {
    setForm({ ...EMPTY, ...n, noticeDate: toDateInput(n.noticeDate) });
    setEditingId(n.id);
    setShowForm(true);
    setNotice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title: form.title,
      noticeDate: form.noticeDate,
      attachmentUrl: form.attachmentUrl,
      attachmentName: form.attachmentName,
      isVisible: form.isVisible,
    };

    try {
      if (editingId) await noticesApi.update(editingId, payload);
      else await noticesApi.create(payload);
      setShowForm(false);
      setEditingId(null);
      setNotice('Notice saved.');
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setSaving(false);
    }
  };

  /** Flip visibility straight from the table row. */
  const toggle = async (n) => {
    try {
      await noticesApi.toggleVisibility(n.id);
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    }
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await noticesApi.remove(deleting.id);
      setDeleting(null);
      setNotice('Notice deleted.');
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setDeleteBusy(false);
    }
  };

  if (showForm) {
    return (
      <form className="admin-card" onSubmit={handleSubmit}>
        <h2 className="admin-card-title">{editingId ? 'Edit Notice' : 'Add Notice'}</h2>
        <p className="admin-card-sub">Appears in the public notice board on the home page.</p>

        <Alert type="error" message={error?.message} details={error?.details} />

        <div className="admin-form-grid">
          <div className="admin-field full">
            <label className="admin-label" htmlFor="title">Notice Title <span className="req">*</span></label>
            <input id="title" name="title" className="admin-input" value={form.title} onChange={handleChange} required />
            <span className="admin-hint">e.g. Health Camp on 20th</span>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="noticeDate">Notice Date <span className="req">*</span></label>
            <input id="noticeDate" name="noticeDate" type="date" className="admin-input" value={form.noticeDate} onChange={handleChange} required />
          </div>

          <FileUploadField
            label="Attachment (PDF or image)"
            hint="Optional downloadable form or circular."
            value={form.attachmentUrl}
            fileName={form.attachmentName}
            onChange={({ url, name }) => setForm((f) => ({ ...f, attachmentUrl: url, attachmentName: name }))}
          />

          <div className="admin-field full">
            <div className="admin-switch-row">
              <label className="admin-switch">
                <input type="checkbox" name="isVisible" checked={form.isVisible} onChange={handleChange} />
                <span className="admin-switch-slider" />
              </label>
              <span className="admin-label" style={{ marginBottom: 0 }}>Visible on the public site</span>
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }} disabled={saving}>
            <X size={15} /> Cancel
          </button>
          <button type="submit" className="admin-btn" disabled={saving}>
            {saving ? <Loader2 size={15} /> : <Save size={15} />} {saving ? 'Saving…' : 'Save Notice'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="admin-card-title">Public Notices &amp; Announcements</h2>
          <p className="admin-card-sub" style={{ marginBottom: 0 }}>
            Notices shown on the home page notice board.
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={startAdd}>
          <Plus size={16} /> Add Notice
        </button>
      </div>

      <Alert type="error" message={error?.message} details={error?.details} />
      <Alert type="success" message={notice} />

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading notices…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Notice Title</th>
                <th>Date</th>
                <th>Attachment</th>
                <th>Visible</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr><td colSpan="5" className="admin-empty">No notices yet. Click "Add Notice" to publish one.</td></tr>
              ) : (
                notices.map((n) => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 500 }}>{n.title}</td>
                    <td>{formatDate(n.noticeDate)}</td>
                    <td>
                      {n.attachmentUrl ? (
                        <a href={n.attachmentUrl} target="_blank" rel="noreferrer" title={n.attachmentName}>
                          <FileText size={16} />
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <label className="admin-switch" title="Show or hide on the public site">
                        <input type="checkbox" checked={n.isVisible !== false} onChange={() => toggle(n)} />
                        <span className="admin-switch-slider" />
                      </label>
                    </td>
                    <td>
                      <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="admin-btn-icon" onClick={() => startEdit(n)} aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="admin-btn-icon danger" onClick={() => setDeleting(n)} aria-label="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this notice?"
        message={`"${deleting?.title}" will be removed from the public notice board.`}
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
};

export default Notices;
