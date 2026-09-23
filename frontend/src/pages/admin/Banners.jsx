import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2 } from 'lucide-react';
import { bannersApi } from '../../api/banners';
import Alert from '../../components/admin/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FileUploadField from '../../components/admin/FileUploadField';

const EMPTY = {
  title: '',
  subtitle: '',
  imageUrl: '',
  buttonText: '',
  buttonLink: '',
  displayOrder: 0,
  isVisible: true,
};

const Banners = () => {
  const [banners, setBanners] = useState([]);
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
      const res = await bannersApi.listAll();
      setBanners(res.data);
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
  const startEdit = (b) => { setForm({ ...EMPTY, ...b }); setEditingId(b.id); setShowForm(true); setNotice(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      imageUrl: form.imageUrl,
      buttonText: form.buttonText,
      buttonLink: form.buttonLink,
      displayOrder: Number(form.displayOrder) || 0,
      isVisible: form.isVisible,
    };

    try {
      if (editingId) await bannersApi.update(editingId, payload);
      else await bannersApi.create(payload);
      setShowForm(false);
      setEditingId(null);
      setNotice('Banner saved.');
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await bannersApi.remove(deleting.id);
      setDeleting(null);
      setNotice('Banner deleted.');
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
        <h2 className="admin-card-title">{editingId ? 'Edit Banner' : 'Add Banner'}</h2>
        <p className="admin-card-sub">Slides shown in the hero section at the top of the home page.</p>

        <Alert type="error" message={error?.message} details={error?.details} />

        <div className="admin-form-grid">
          <div className="admin-field full">
            <label className="admin-label" htmlFor="title">Banner Title <span className="req">*</span></label>
            <input id="title" name="title" className="admin-input" value={form.title} onChange={handleChange} required />
          </div>

          <div className="admin-field full">
            <label className="admin-label" htmlFor="subtitle">Banner Subtitle</label>
            <textarea id="subtitle" name="subtitle" className="admin-textarea" value={form.subtitle} onChange={handleChange} />
          </div>

          <FileUploadField
            label="Banner Image"
            hint="Wide image recommended (around 1920×600). Leave empty to use the default hero image."
            accept=".jpg,.jpeg,.png,.webp"
            value={form.imageUrl}
            fileName=""
            preview
            onChange={({ url }) => setForm((f) => ({ ...f, imageUrl: url }))}
          />

          <div className="admin-field">
            <label className="admin-label" htmlFor="buttonText">Button Text</label>
            <input id="buttonText" name="buttonText" className="admin-input" value={form.buttonText} onChange={handleChange} placeholder="Read More" />
            <span className="admin-hint">Leave empty to hide the button</span>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="buttonLink">Button Link</label>
            <input id="buttonLink" name="buttonLink" className="admin-input" value={form.buttonLink} onChange={handleChange} placeholder="/works-developments" />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="displayOrder">Display Order</label>
            <input id="displayOrder" name="displayOrder" type="number" min="0" className="admin-input" value={form.displayOrder} onChange={handleChange} />
            <span className="admin-hint">Lower numbers appear first</span>
          </div>

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
            {saving ? <Loader2 size={15} /> : <Save size={15} />} {saving ? 'Saving…' : 'Save Banner'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="admin-card-title">Hero Banners</h2>
          <p className="admin-card-sub" style={{ marginBottom: 0 }}>
            The slider at the top of the home page. With no banners, the default hero is shown.
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={startAdd}>
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <Alert type="error" message={error?.message} details={error?.details} />
      <Alert type="success" message={notice} />

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading banners…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Button</th>
                <th>Order</th>
                <th>Visible</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr><td colSpan="6" className="admin-empty">No banners yet. The public site is showing the default hero.</td></tr>
              ) : (
                banners.map((b) => (
                  <tr key={b.id}>
                    <td>
                      {b.imageUrl
                        ? <img src={b.imageUrl} alt="" style={{ height: 34, width: 60, objectFit: 'cover', borderRadius: 4 }} />
                        : '—'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{b.title}</span>
                      {b.subtitle && <span className="admin-hint" style={{ display: 'block' }}>{b.subtitle.slice(0, 60)}…</span>}
                    </td>
                    <td>{b.buttonText || '—'}</td>
                    <td>{b.displayOrder ?? 0}</td>
                    <td>
                      <span className={`admin-badge ${b.isVisible !== false ? 'completed' : 'planned'}`}>
                        {b.isVisible !== false ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="admin-btn-icon" onClick={() => startEdit(b)} aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="admin-btn-icon danger" onClick={() => setDeleting(b)} aria-label="Delete">
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
        title="Delete this banner?"
        message={`"${deleting?.title}" will be removed from the home page slider.`}
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
};

export default Banners;
