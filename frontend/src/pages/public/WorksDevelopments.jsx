import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Search, Globe, Building2, Bell, MessageSquare, ChevronRight, Users, X, FileText, Download } from 'lucide-react';
import './WorksDevelopments.css';

import { ALL_PROJECTS } from '../../data/projectsData'; // Fallback if API fails

const ROWS_PER_PAGE = 7;

const PROJECT_TYPES = ['All', 'Construction', 'Maintenance', 'Medical', 'IT', 'Infrastructure', 'Equipment / Facility Upgrade', 'Civil'];
const PROJECT_STATUSES = ['All', 'Planned', 'In Progress', 'Completed', 'On Hold'];

/* ────────── Helpers ────────── */
const statusClass = (s) => {
  switch (s) {
    case 'IN PROGRESS': return 'status-in-progress';
    case 'COMPLETED': return 'status-completed';
    case 'PLANNED': return 'status-planned';
    case 'ON HOLD': return 'status-on-hold';
    default: return '';
  }
};

/* ────────── Component ────────── */
const WorksDevelopments = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [projectsData, setProjectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects?limit=100');
        const json = await res.json();
        if (json.success && json.data) {
          setProjectsData(json.data);
        } else {
          setProjectsData(ALL_PROJECTS);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjectsData(ALL_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let data = projectsData;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
      );
    }

    // Type
    if (typeFilter !== 'All') {
      data = data.filter(p => p.type.toLowerCase() === typeFilter.toLowerCase());
    }

    // Status
    if (statusFilter !== 'All') {
      const sf = statusFilter.toUpperCase();
      data = data.filter(p => p.status === sf);
    }

    return data;
  }, [search, typeFilter, statusFilter, projectsData]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Reset to page 1 when filters change
  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleType = (v) => { setTypeFilter(v); setPage(1); };
  const handleStatus = (v) => { setStatusFilter(v); setPage(1); };

  /* ── Pagination range builder ── */
  const pageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 4) pages.push('...');
      if (page > 3 && page < totalPages) pages.push(page);
      if (page < totalPages - 1) pages.push('...');
      pages.push(totalPages);
      // deduplicate
      return [...new Set(pages)];
    }
    return pages;
  };

  return (
    <div className="wd-page">
      <Header />

      {/* ──── Page Title / Breadcrumb ──── */}
      <section className="wd-title-section">
        <div className="container flex items-center justify-between">
          <h2 className="wd-page-title">Works & Developments</h2>
          <div className="wd-breadcrumb">
            <a href="/">Home</a> <ChevronRight size={14} /> <span>Works &amp; Developments</span>
          </div>
        </div>
      </section>

      {/* ──── Search & Filters ──── */}
      <section className="wd-filters-section">
        <div className="container">
          <div className="wd-filters-row">
            {/* Search */}
            <div className="wd-filter-group">
              <label className="wd-filter-label">Search</label>
              <div className="wd-search-input-wrap">
                <input
                  type="text"
                  className="wd-search-input"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Search size={16} className="wd-search-icon" />
              </div>
            </div>

            {/* Project Type */}
            <div className="wd-filter-group">
              <label className="wd-filter-label">Project Type</label>
              <select
                className="wd-select"
                value={typeFilter}
                onChange={(e) => handleType(e.target.value)}
              >
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="wd-filter-group">
              <label className="wd-filter-label">Project Status</label>
              <select
                className="wd-select"
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value)}
              >
                {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Latest Project Updates heading ──── */}
      <section className="wd-table-section">
        <div className="container">

          {/* Table */}
          <div className="wd-table-container">
            <table className="wd-table">
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Project Name / Description</th>
                  <th>Project Type</th>
                  <th>Approval Date</th>
                  <th>Estimated Completion</th>
                  <th>Value (Estimate)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="wd-no-results">Loading projects...</td>
                  </tr>
                ) : paged.length > 0 ? paged.map((proj, idx) => (
                  <tr key={`${proj.id}-${idx}`}>
                    <td>{proj.id}</td>
                    <td className="fw-500">{proj.name}</td>
                    <td>{proj.type}</td>
                    <td>{proj.approvalDate}</td>
                    <td>{proj.estCompletion}</td>
                    <td>{proj.value}</td>
                    <td>
                      <span className={`wd-badge ${statusClass(proj.status)}`}>{proj.status}</span>
                    </td>
                    <td>
                      <button
                        className="wd-action-btn"
                        onClick={() => setSelectedProject(proj)}
                      >
                        View Details
                      </button>
                      {proj.planDocumentUrl && (
                        <a
                          className="wd-action-btn wd-action-btn-outline"
                          style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', gap: '4px' }}
                          href={proj.planDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download size={12} /> Plan
                        </a>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="wd-no-results">No projects found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Progress count */}
          <div className="wd-progress-count">
            Progress {page} of {totalPages}
          </div>

          {/* Pagination */}
          <div className="wd-pagination">
            {pageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="wd-page-dots">…</span>
              ) : (
                <button
                  key={p}
                  className={`wd-page-btn${page === p ? ' active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            {page < totalPages && (
              <button className="wd-page-btn wd-next-btn" onClick={() => setPage(page + 1)}>
                Next &gt;
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* ──── Project Details Modal ──── */}
      {selectedProject && (
        <div className="wd-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="wd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="wd-modal-close" onClick={() => setSelectedProject(null)}>
              <X size={20} />
            </button>

            <div className="wd-modal-header">
              <h2 className="wd-modal-title">{selectedProject.name}</h2>
              <span className={`wd-badge ${statusClass(selectedProject.status)}`}>{selectedProject.status}</span>
            </div>

            <div className="wd-modal-body">
              <div className="wd-modal-info-grid">
                <div className="wd-modal-info-item">
                  <span className="wd-modal-label">Project ID</span>
                  <span className="wd-modal-value">{selectedProject.id}</span>
                </div>
                <div className="wd-modal-info-item">
                  <span className="wd-modal-label">Project Type</span>
                  <span className="wd-modal-value">{selectedProject.type}</span>
                </div>
                <div className="wd-modal-info-item">
                  <span className="wd-modal-label">Approval Date</span>
                  <span className="wd-modal-value">{selectedProject.approvalDate}</span>
                </div>
                <div className="wd-modal-info-item">
                  <span className="wd-modal-label">Estimated Completion</span>
                  <span className="wd-modal-value">{selectedProject.estCompletion}</span>
                </div>
                <div className="wd-modal-info-item">
                  <span className="wd-modal-label">Estimated Value</span>
                  <span className="wd-modal-value">{selectedProject.value}</span>
                </div>
                <div className="wd-modal-info-item">
                  <span className="wd-modal-label">Progress</span>
                  <span className="wd-modal-value">{selectedProject.progress}%</span>
                </div>
              </div>



              {/* Description */}
              <div className="wd-modal-desc-section">
                <label className="wd-modal-label">Description</label>
                <p className="wd-modal-desc">{selectedProject.description}</p>
              </div>

              {/* Documents */}
              {selectedProject.planDocumentUrl && (
                <div className="wd-modal-docs-section">
                  <label className="wd-modal-label">Important Documents / Notices</label>
                  <ul className="wd-modal-docs-list">
                    <li>
                      <FileText size={14} />
                      <span>{selectedProject.planDocumentName || 'Plan Document'}</span>
                      <a 
                        className="wd-doc-btn" 
                        href={selectedProject.planDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Download size={12} /> Download
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksDevelopments;
