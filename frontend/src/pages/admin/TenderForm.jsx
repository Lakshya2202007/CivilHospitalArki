import React, { useEffect, useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { tendersApi } from '../../api/tenders';
import Alert from '../../components/admin/Alert';
import DocumentListField from '../../components/admin/DocumentListField';

/** Firestore stores ISO; <input type="date"> wants YYYY-MM-DD. */
const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const EMPTY = {
  tenderId: '',
  title: '',
  description: '',
  department: '',
  type: 'Tender',
  issueDate: '',
  closingDate: '',
  estimatedValue: '',
  lifecycle: 'Open',
  eligibility: '',
  contactInfo: '',
  documents: [],
  isPublished: true,
};

const TenderForm = ({ tender, meta, onSaved, onCancel }) => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tender) {
      setForm({
        ...EMPTY,
        ...tender,
        issueDate: toDateInput(tender.issueDate),
        closingDate: toDateInput(tender.closingDate),
        documents: Array.isArray(tender.documents) ? tender.documents : [],
      });
    } else {
      setForm(EMPTY);
    }
  }, [tender]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = { ...form };
    delete payload.id;
    delete payload.docId;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.derivedStatus;
    delete payload.archived;

    try {
      if (tender) await tendersApi.update(tender.id, payload);
      else await tendersApi.create(payload);
      onSaved();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-card" onSubmit={handleSubmit}>
      <h2 className="admin-card-title">{tender ? 'Edit Tender' : 'Add New Tender'}</h2>
      <p className="admin-card-sub">
        These fields populate the public Tenders &amp; Quotations page.
      </p>

      <Alert type="error" message={error?.message} details={error?.details} />

      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="tenderId">Tender ID <span className="req">*</span></label>
          <input id="tenderId" name="tenderId" className="admin-input" value={form.tenderId} onChange={handleChange} required />
          <span className="admin-hint">e.g. CHARKI-2026-001</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="type">Type <span className="req">*</span></label>
          <select id="type" name="type" className="admin-select" value={form.type} onChange={handleChange} required>
            {meta.types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="admin-field full">
          <label className="admin-label" htmlFor="title">Title <span className="req">*</span></label>
          <input id="title" name="title" className="admin-input" value={form.title} onChange={handleChange} required />
          <span className="admin-hint">e.g. Procurement of Medical Equipment for OPD Wing</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="department">Department <span className="req">*</span></label>
          <select id="department" name="department" className="admin-select" value={form.department} onChange={handleChange} required>
            <option value="">Select a department…</option>
            {meta.departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <span className="admin-hint">Drives the public Department filter</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="estimatedValue">Estimated Value <span className="req">*</span></label>
          <input id="estimatedValue" name="estimatedValue" className="admin-input" value={form.estimatedValue} onChange={handleChange} placeholder="₹10,00,000" required />
          <span className="admin-hint">Free text, e.g. "₹10,00,000"</span>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="issueDate">Issue Date <span className="req">*</span></label>
          <input id="issueDate" name="issueDate" type="date" className="admin-input" value={form.issueDate} onChange={handleChange} required />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="closingDate">Closing Date <span className="req">*</span></label>
          <input id="closingDate" name="closingDate" type="date" className="admin-input" value={form.closingDate} onChange={handleChange} required />
        </div>

        <div className="admin-field full">
          <label className="admin-label" htmlFor="lifecycle">Status</label>
          <select id="lifecycle" name="lifecycle" className="admin-select" value={form.lifecycle} onChange={handleChange}>
            <option value="Open">Open — decided automatically by the closing date</option>
            <option value="Awarded">Awarded</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <span className="admin-hint">
            Leave on "Open" and the public page shows Active, then Closing Soon within 3 days
            of the closing date, then Closed once it passes — no action needed from you.
            Choose Awarded or Cancelled to override that.
          </span>
        </div>

        <div className="admin-field full">
          <label className="admin-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="admin-textarea" value={form.description} onChange={handleChange} />
        </div>

        <div className="admin-field full">
          <label className="admin-label" htmlFor="eligibility">Eligibility Criteria</label>
          <textarea id="eligibility" name="eligibility" className="admin-textarea" value={form.eligibility} onChange={handleChange} />
          <span className="admin-hint">Who may bid — shown in the public tender details</span>
        </div>

        <div className="admin-field full">
          <label className="admin-label" htmlFor="contactInfo">Contact Information</label>
          <textarea id="contactInfo" name="contactInfo" className="admin-textarea" style={{ minHeight: 70 }} value={form.contactInfo} onChange={handleChange} />
          <span className="admin-hint">e.g. Office of the Medical Superintendent, Civil Hospital Arki, District Solan, HP — 171102</span>
        </div>

        <DocumentListField
          documents={form.documents}
          documentTypes={meta.documentTypes}
          onChange={(documents) => setForm((f) => ({ ...f, documents }))}
        />

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
          {saving ? 'Saving…' : tender ? 'Update Tender' : 'Create Tender'}
        </button>
      </div>
    </form>
  );
};

export default TenderForm;
