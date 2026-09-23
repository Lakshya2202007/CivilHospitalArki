import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Paperclip, EyeOff } from 'lucide-react';
import { tendersApi } from '../../api/tenders';
import Alert from '../../components/admin/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusBadge from '../../components/admin/StatusBadge';
import TenderForm from './TenderForm';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const EMPTY_META = { departments: [], types: [], lifecycles: [], statuses: [], documentTypes: [] };

const Tenders = () => {
  const [tenders, setTenders] = useState([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tab, setTab] = useState('current');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, metaRes] = await Promise.all([tendersApi.listAll(), tendersApi.meta()]);
      setTenders(list.data);
      setMeta(metaRes.data);
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Client-side filtering — the admin list is small enough not to need paging. */
  const filtered = useMemo(() => {
    let data = tenders;

    data = tab === 'archived' ? data.filter((t) => t.archived) : data.filter((t) => !t.archived);
    if (deptFilter !== 'All') data = data.filter((t) => t.department === deptFilter);
    if (statusFilter !== 'All') data = data.filter((t) => t.derivedStatus === statusFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((t) =>
        [t.tenderId, t.title, t.department, t.type].some((v) => String(v || '').toLowerCase().includes(q))
      );
    }

    return data;
  }, [tenders, tab, search, deptFilter, statusFilter]);

  const counts = useMemo(() => ({
    current: tenders.filter((t) => !t.archived).length,
    archived: tenders.filter((t) => t.archived).length,
  }), [tenders]);

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    setNotice('Tender saved. The public page now reflects this change.');
    load();
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await tendersApi.remove(deleting.id);
      setDeleting(null);
      setNotice('Tender deleted.');
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setDeleteBusy(false);
    }
  };

  const startAdd = () => { setEditing(null); setShowForm(true); setNotice(''); };
  const startEdit = (t) => { setEditing(t); setShowForm(true); setNotice(''); };

  if (showForm) {
    return (
      <TenderForm
        tender={editing}
        meta={meta}
        onSaved={handleSaved}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="admin-card-title">Tenders &amp; Quotations</h2>
          <p className="admin-card-sub" style={{ marginBottom: 0 }}>
            Manage the tenders listed on the public Tenders &amp; Quotations page.
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={startAdd}>
          <Plus size={16} /> Add Tender
        </button>
      </div>

      <Alert type="error" message={error?.message} details={error?.details} />
      <Alert type="success" message={notice} />

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab${tab === 'current' ? ' active' : ''}`}
          onClick={() => setTab('current')}
        >
          Current ({counts.current})
        </button>
        <button
          type="button"
          className={`admin-tab${tab === 'archived' ? ' active' : ''}`}
          onClick={() => setTab('archived')}
        >
          Archived ({counts.archived})
        </button>
      </div>

      <div className="admin-filters">
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-tender-search">Search</label>
          <div style={{ position: 'relative' }}>
            <input
              id="admin-tender-search"
              className="admin-input"
              placeholder="ID, title, department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
            <Search
              size={15}
              style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-tender-dept">Department</label>
          <select id="admin-tender-dept" className="admin-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="All">All</option>
            {meta.departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-tender-status">Status</label>
          <select id="admin-tender-status" className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            {meta.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading tenders…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tender ID</th>
                <th>Title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Issued</th>
                <th>Closing</th>
                <th>Value</th>
                <th>Status</th>
                <th>Docs</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="10" className="admin-empty">
                    {tenders.length === 0
                      ? 'No tenders yet. Click "Add Tender" to create the first one.'
                      : 'No tenders match these filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td>{t.tenderId}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{t.title}</span>
                      {t.isPublished === false && (
                        <span className="admin-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <EyeOff size={12} /> Hidden from public site
                        </span>
                      )}
                    </td>
                    <td>{t.department}</td>
                    <td>{t.type}</td>
                    <td>{formatDate(t.issueDate)}</td>
                    <td>{formatDate(t.closingDate)}</td>
                    <td>{t.estimatedValue}</td>
                    <td>
                      <StatusBadge status={t.derivedStatus} />
                      {t.lifecycle === 'Open' && (
                        <span className="admin-hint" style={{ display: 'block' }}>auto</span>
                      )}
                    </td>
                    <td>
                      {t.documents?.length ? (
                        <span className="admin-file-name" title={`${t.documents.length} document(s)`}>
                          <Paperclip size={14} /> {t.documents.length}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="admin-btn-icon" onClick={() => startEdit(t)} aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="admin-btn-icon danger" onClick={() => setDeleting(t)} aria-label="Delete">
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
        title="Delete this tender?"
        message={`"${deleting?.title}" will be removed from the public Tenders & Quotations page. This cannot be undone.`}
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
};

export default Tenders;
