import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, FileText, EyeOff } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import Alert from '../../components/admin/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusBadge from '../../components/admin/StatusBadge';
import ProjectForm from './ProjectForm';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({ types: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, metaRes] = await Promise.all([projectsApi.listAll(), projectsApi.meta()]);
      setProjects(list.data);
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
    let data = projects;

    if (typeFilter !== 'All') data = data.filter((p) => p.type === typeFilter);
    if (statusFilter !== 'All') data = data.filter((p) => p.status === statusFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((p) =>
        [p.projectId, p.name, p.type, p.status].some((v) => String(v || '').toLowerCase().includes(q))
      );
    }

    return data;
  }, [projects, search, typeFilter, statusFilter]);

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    setNotice('Project saved. The public page now reflects this change.');
    load();
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await projectsApi.remove(deleting.id);
      setDeleting(null);
      setNotice('Project deleted.');
      load();
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setDeleteBusy(false);
    }
  };

  const startAdd = () => { setEditing(null); setShowForm(true); setNotice(''); };
  const startEdit = (p) => { setEditing(p); setShowForm(true); setNotice(''); };

  if (showForm) {
    return (
      <ProjectForm
        project={editing}
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
          <h2 className="admin-card-title">Works &amp; Developments</h2>
          <p className="admin-card-sub" style={{ marginBottom: 0 }}>
            Manage the projects listed on the public Works &amp; Developments page.
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={startAdd}>
          <Plus size={16} /> Add Project
        </button>
      </div>

      <Alert type="error" message={error?.message} details={error?.details} />
      <Alert type="success" message={notice} />

      <div className="admin-filters">
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-proj-search">Search</label>
          <div style={{ position: 'relative' }}>
            <input
              id="admin-proj-search"
              className="admin-input"
              placeholder="ID, name, type…"
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
          <label className="admin-label" htmlFor="admin-proj-type">Project Type</label>
          <select id="admin-proj-type" className="admin-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All</option>
            {meta.types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-proj-status">Status</label>
          <select id="admin-proj-status" className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            {meta.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading projects…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Type</th>
                <th>Approval</th>
                <th>Est. Completion</th>
                <th>Value</th>
                <th>Status</th>
                <th>Plan</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="admin-empty">
                    {projects.length === 0
                      ? 'No projects yet. Click "Add Project" to create the first one.'
                      : 'No projects match these filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.projectId}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                      {p.isPublished === false && (
                        <span className="admin-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <EyeOff size={12} /> Hidden from public site
                        </span>
                      )}
                    </td>
                    <td>{p.type}</td>
                    <td>{formatDate(p.approvalDate)}</td>
                    <td>{formatDate(p.estCompletion)}</td>
                    <td>{p.value}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      {p.planDocumentUrl ? (
                        <a href={p.planDocumentUrl} target="_blank" rel="noreferrer" title={p.planDocumentName}>
                          <FileText size={16} />
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="admin-btn-icon" onClick={() => startEdit(p)} aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="admin-btn-icon danger" onClick={() => setDeleting(p)} aria-label="Delete">
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
        title="Delete this project?"
        message={`"${deleting?.name}" will be removed from the public Works & Developments page. This cannot be undone.`}
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
};

export default Projects;
