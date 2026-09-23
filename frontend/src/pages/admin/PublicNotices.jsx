import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2 } from 'lucide-react';
import { publicNoticesApi } from '../../api/publicNotices';
import Alert from '../../components/admin/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import DocumentListField from '../../components/admin/DocumentListField';

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const EMPTY = {
  noticeId: '',
  title: '',
  category: '',
  publishDate: new Date().toISOString().slice(0, 10),
  deadlineDate: '',
  description: '',
  eligibility: '',
  contactInfo: '',
  lifecycle: 'Auto',
  documents: [],
  isPublished: true,
};

const DOC_TYPES = ['notice', 'specs', 'terms', 'corrigendum'];

/** The citizen-facing notice board shown on the public Public Notices page. */
const PublicNotices = () => {
  const [notices, setNotices] = useState([]);
  const [meta, setMeta] = useState({ categories: [], lifecycles: [] });

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
      const [list, metaRes] = await Promise.all([
        publicNoticesApi.listAll(),
        publicNoticesApi.meta(),
      ]);
      setNotices(list.data);
      setMeta(metaRes.data);
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
    setForm({
      ...EMPTY,
      ...n,
      publishDate: toDateInput(n.publishDate),
      deadlineDate: toDateInput(n.deadlineDate),
      documents: n.documents || [],
    });
    setEditingId(n.id);
    setShowForm(true);
    setNotice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      noticeId: form.noticeId,
      title: form.title,
      category: form.category,
      publishDate: form.publishDate,
      description: form.description,
      eligibility: form.eligibility,
      contactInfo: form.contactInfo,
      lifecycle: form.lifecycle,
      documents: form.documents,
      isPublished: form.isPublished,
    };
    // Optional: a standing circular need not expire, and the API rejects ''.
    if (form.deadlineDate) payload.deadlineDate = form.deadlineDate;

    try {
      if (editingId) await publicNoticesApi.update(editingId, payload);
      else await publicNoticesApi.create(payload);
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

  /** Notices have no visibility endpoint of their own — update the flag directly. */
  const togglePublished = async (n) => {
    try {
      await publicNoticesApi.update(n.id, { isPublished: n.isPublished === false });
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    }
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await publicNoticesApi.remove(deleting.id);
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
        <p className="admin-card-sub">Shown on the public Public Notices page.</p>

        <Alert type="error" message={error?.message} details={error?.details} />

        <div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-label" htmlFor="noticeId">Notice ID <span className="req">*</span></label>
            <input id="noticeId" name="noticeId" className="admin-input" value={form.noticeId} onChange={handleChange} required />
            <span className="admin-hint">e.g. CHA/NOT/2026/014</span>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="category">Category <span className="req">*</span></label>
            <select id="category" name="category" className="admin-select" value={form.category} onChange={handleChange} required>
              <option value="">Select a category…</option>
              {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="admin-field full">
            <label className="admin-label" htmlFor="title">Title <span className="req">*</span></label>
            <input id="title" name="title" className="admin-input" value={form.title} onChange={handleChange} required />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="publishDate">Publish Date <span className="req">*</span></label>
            <input id="publishDate" name="publishDate" type="date" className="admin-input" value={form.publishDate} onChange={handleChange} required />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="deadlineDate">Deadline / Event Date</label>
            <input id="deadlineDate" name="deadlineDate" type="date" className="admin-input" value={form.deadlineDate} onChange={handleChange} />
            <span className="admin-hint">Leave blank for a standing circular that never expires.</span>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="lifecycle">Status Override</label>
            <select id="lifecycle" name="lifecycle" className="admin-select" value={form.lifecycle} onChange={handleChange}>
              {meta.lifecycles.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <span className="admin-hint">“Auto” lets the dates decide New / Active / Closed.</span>
          </div>

          <div className="admin-field full">
            <label className="admin-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" className="admin-input" rows="4" value={form.description} onChange={handleChange} />
          </div>

          <div className="admin-field full">
            <label className="admin-label" htmlFor="eligibility">Eligibility</label>
            <textarea id="eligibility" name="eligibility" className="admin-input" rows="3" value={form.eligibility} onChange={handleChange} />
          </div>

          <div className="admin-field full">
            <label className="admin-label" htmlFor="contactInfo">Contact Information</label>
            <input id="contactInfo" name="contactInfo" className="admin-input" value={form.contactInfo} onChange={handleChange} />
          </div>

          <DocumentListField
            documents={form.documents}
            documentTypes={DOC_TYPES}
            onChange={(documents) => setForm((f) => ({ ...f, documents }))}
          />

          <div className="admin-field full">
            <div className="admin-switch-row">
              <label className="admin-switch">
                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
                <span className="admin-switch-slider" />
              </label>
              <span className="admin-label" style={{ marginBottom: 0 }}>Published on the public site</span>
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
          <h2 className="admin-card-title">Public Notices</h2>
          <p className="admin-card-sub" style={{ marginBottom: 0 }}>
            The notice board on the public Public Notices page.
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
                <th>Notice ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Published</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Live</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr><td colSpan="8" className="admin-empty">No notices yet.</td></tr>
              ) : (
                notices.map((n) => (
                  <tr key={n.id}>
                    <td>{n.noticeId}</td>
                    <td style={{ fontWeight: 500 }}>{n.title}</td>
                    <td>{n.category}</td>
                    <td>{formatDate(n.publishDate)}</td>
                    <td>{formatDate(n.deadlineDate)}</td>
                    <td>
                      {n.status && (
                        <span className={`admin-badge ${String(n.status).toLowerCase()}`}>{n.status}</span>
                      )}
                    </td>
                    <td>
                      <label className="admin-switch" title="Publish or unpublish on the public site">
                        <input type="checkbox" checked={n.isPublished !== false} onChange={() => togglePublished(n)} />
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
        message={`"${deleting?.title}" will be removed from the public notices page.`}
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
};

export default PublicNotices;
