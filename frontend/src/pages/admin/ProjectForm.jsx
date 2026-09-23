import React, { useEffect, useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import Alert from '../../components/admin/Alert';
import FileUploadField from '../../components/admin/FileUploadField';

/** Firestore stores ISO; <input type="date"> wants YYYY-MM-DD. */
const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const EMPTY = {
  projectId: '',
  name: '',
  description: '',
  type: '',
  approvalDate: '',
  estCompletion: '',
  value: '',
  status: 'PLANNED',
  progress: 0,
  planDocumentUrl: '',
  planDocumentName: '',
  detailedInformation: '',
  isPublished: true,
};

/**
 * Add / Edit Project form — one input per row of section 1.A of the mapping plan.
 * `project` null means "create"; otherwise we're editing that record.
 */
const ProjectForm = ({ project, meta, onSaved, onCancel }) => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        ...EMPTY,
        ...project,
        approvalDate: toDateInput(project.approvalDate),
        estCompletion: toDateInput(project.estCompletion),
      });
    } else {
      setForm(EMPTY);
    }
  }, [project]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === 'checkbox' ? checked : value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = { ...form, progress: Number(form.progress) || 0 };
    delete payload.id;
    delete payload.docId;
    delete payload.createdAt;
    delete payload.updatedAt;

    try {
      if (project) await projectsApi.update(project.id, payload);
      else await projectsApi.create(payload);
      onSaved();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-card" onSubmit={handleSubmit}>
      <h2 className="admin-card-title">{project ? 'Edit Project' : 'Add New Project'}</h2>
      <p className="admin-card-sub">
        These fields populate the public Works &amp; Developments table.
      </p>

      <Alert type="error" message={error?.message} details={error?.details} />

      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="projectId">Project ID <span className="req">*</span></label>
          <input id="projectId" name="projectId" className="admin-input" value={form.projectId} onChange={handleChange} required />
          <span className="admin-hint">Shown in the first column, e.g. 12557523</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="name">Project Name <span className="req">*</span></label>
          <input id="name" name="name" className="admin-input" value={form.name} onChange={handleChange} required />
          <span className="admin-hint">e.g. Maternal Ward Construction</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="type">Project Type <span className="req">*</span></label>
          <select id="type" name="type" className="admin-select" value={form.type} onChange={handleChange} required>
            <option value="">Select a type…</option>
            {meta.types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="admin-hint">Drives the public Project Type filter</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="status">Status <span className="req">*</span></label>
          <select id="status" name="status" className="admin-select" value={form.status} onChange={handleChange} required>
            {meta.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="admin-hint">Controls the badge colour on the public table</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="approvalDate">Approval Date <span className="req">*</span></label>
          <input id="approvalDate" name="approvalDate" type="date" className="admin-input" value={form.approvalDate} onChange={handleChange} required />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="estCompletion">Estimated Completion <span className="req">*</span></label>
          <input id="estCompletion" name="estCompletion" type="date" className="admin-input" value={form.estCompletion} onChange={handleChange} required />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="value">Value (Estimate) <span className="req">*</span></label>
          <input id="value" name="value" className="admin-input" value={form.value} onChange={handleChange} placeholder="₹1.5 Cr" required />
          <span className="admin-hint">Free text, e.g. "₹1.5 Cr" or "₹50 Lakhs"</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="progress">Progress (%)</label>
          <input id="progress" name="progress" type="number" min="0" max="100" className="admin-input" value={form.progress} onChange={handleChange} />
        </div>

        <div className="admin-field full">
          <label className="admin-label" htmlFor="description">Short Description</label>
          <textarea id="description" name="description" className="admin-textarea" value={form.description} onChange={handleChange} />
          <span className="admin-hint">Summary shown in the "View Details" modal</span>
        </div>

        <FileUploadField
          label="Plan Document (PDF)"
          hint='When a file is attached, the "Download Plan" button appears on the public table.'
          accept=".pdf"
          value={form.planDocumentUrl}
          fileName={form.planDocumentName}
          onChange={({ url, name }) => setForm((f) => ({ ...f, planDocumentUrl: url, planDocumentName: name }))}
        />

        <div className="admin-field full">
          <label className="admin-label" htmlFor="detailedInformation">Detailed Information</label>
          <textarea
            id="detailedInformation"
            name="detailedInformation"
            className="admin-textarea tall"
            value={form.detailedInformation}
            onChange={handleChange}
          />
          <span className="admin-hint">
            Extra text shown when a visitor clicks "View Details". Basic HTML is allowed.
          </span>
        </div>

        <div className="admin-field full">
          <div className="admin-switch-row">
            <label className="admin-switch">
              <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
              <span className="admin-switch-slider" />
            </label>
            <span className="admin-label" style={{ marginBottom: 0 }}>
              Published — visible on the public site
            </span>
          </div>
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="admin-btn admin-btn-outline" onClick={onCancel} disabled={saving}>
          <X size={15} /> Cancel
        </button>
        <button type="submit" className="admin-btn" disabled={saving}>
          {saving ? <Loader2 size={15} /> : <Save size={15} />}
          {saving ? 'Saving…' : project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
