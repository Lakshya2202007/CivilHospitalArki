import React, { useState, useMemo, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  Search, ChevronRight, X,
  FileText, Download, Calendar, Clock, AlertCircle, RefreshCw,
  FileStack, CheckCircle2, Timer, Archive, Megaphone
} from 'lucide-react';
import {
  ALL_NOTICES, // Fallback
  NOTICE_STATUSES,
  NOTICE_CATEGORIES,
  ROWS_PER_PAGE,
  deriveNoticeStatus,
} from '../../data/noticesData';
import './PublicNotices.css';

/* ────────── Helpers ────────── */

const statusCssClass = (status) => {
  switch (status) {
    case 'New': return 'pn-status-new';
    case 'Active': return 'pn-status-active';
    case 'Closed': return 'pn-status-closed';
    case 'Archived': return 'pn-status-archived';
    default: return '';
  }
};

const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isArchived = (notice) => {
  if (notice.status === 'Archived') return true;
  if (!notice.deadlineDate) return false;
  const deadline = new Date(notice.deadlineDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return deadline < sixMonthsAgo;
};

/* ────────── Sort Config ────────── */
const SORT_OPTIONS = [
  { value: 'publishDate-desc', label: 'Publish Date (latest)' },
  { value: 'publishDate-asc', label: 'Publish Date (earliest)' },
];

/* ────────── Component ────────── */
const PublicNotices = () => {
  /* ── State ── */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'archived'
  const [sortBy, setSortBy] = useState('publishDate-desc');
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [noticesData, setNoticesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch('/api/public-notices?limit=100');
        const json = await res.json();
        if (json.success && json.data) {
          setNoticesData(json.data);
        } else {
          setNoticesData(ALL_NOTICES);
        }
      } catch (err) {
        console.error('Failed to fetch notices:', err);
        setNoticesData(ALL_NOTICES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

  /* ── Enrich notices with derived status ── */
  const enrichedNotices = useMemo(() =>
    noticesData.map(n => ({
      ...n,
      derivedStatus: deriveNoticeStatus(n),
      archived: isArchived(n),
    })),
    [noticesData]
  );

  /* ── Stats ── */
  const stats = useMemo(() => {
    const all = enrichedNotices;
    return {
      total: all.length,
      new: all.filter(n => n.derivedStatus === 'New').length,
      active: all.filter(n => n.derivedStatus === 'Active').length,
      archived: all.filter(n => n.archived || n.derivedStatus === 'Archived').length,
    };
  }, [enrichedNotices]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let data = enrichedNotices;

    // Tab filter
    if (activeTab === 'current') {
      data = data.filter(n => !n.archived);
    } else {
      data = data.filter(n => n.archived);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(n =>
        (n.id && n.id.toLowerCase().includes(q)) ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      data = data.filter(n => n.derivedStatus === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'All Categories') {
      data = data.filter(n => n.category === categoryFilter);
    }

    // Sort
    const [sortField, sortDir] = sortBy.split('-');
    data = [...data].sort((a, b) => {
      const valA = new Date(a[sortField]);
      const valB = new Date(b[sortField]);
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    return data;
  }, [enrichedNotices, search, statusFilter, categoryFilter, activeTab, sortBy]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  /* ── Handlers ── */
  const handleSearch = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleStatus = useCallback((v) => { setStatusFilter(v); setPage(1); }, []);
  const handleCategory = useCallback((v) => { setCategoryFilter(v); setPage(1); }, []);
  const handleTab = useCallback((tab) => { setActiveTab(tab); setPage(1); }, []);
  const handleSort = useCallback((v) => { setSortBy(v); setPage(1); }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('All');
    setCategoryFilter('All Categories');
    setPage(1);
  }, []);

  /* ── Pagination range builder ── */
  const pageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  /* ── Status Badge ── */
  const StatusBadge = ({ status }) => (
    <span className={`pn-status-badge ${statusCssClass(status)}`}>
      <span className="pn-status-dot" aria-hidden="true"></span>
      {status}
    </span>
  );

  /* ── Render: Notice Detail Modal ── */
  const renderModal = () => {
    if (!selectedNotice) return null;
    const n = selectedNotice;
    return (
      <div
        className="pn-modal-overlay"
        onClick={() => setSelectedNotice(null)}
        role="dialog"
        aria-modal="true"
        aria-label={`Notice details: ${n.title}`}
      >
        <div className="pn-modal" onClick={(e) => e.stopPropagation()}>
          <button
            className="pn-modal-close"
            onClick={() => setSelectedNotice(null)}
            aria-label="Close notice details"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="pn-modal-header">
            <div className="pn-modal-header-text">
              <div className="pn-modal-notice-id">{n.id}</div>
              <h2 className="pn-modal-title">{n.title}</h2>
              <StatusBadge status={n.derivedStatus} />
            </div>
          </div>

          {/* Body */}
          <div className="pn-modal-body">
            {/* Info Grid */}
            <div className="pn-modal-info-grid">
              <div className="pn-modal-info-item">
                <span className="pn-modal-label">Category</span>
                <span className="pn-modal-value">{n.category}</span>
              </div>
              <div className="pn-modal-info-item">
                <span className="pn-modal-label">Current Status</span>
                <span className="pn-modal-value">{n.derivedStatus}</span>
              </div>
            </div>

            {/* Important Dates */}
            <div className="pn-modal-dates-section">
              <div className="pn-modal-label" style={{ marginBottom: '10px' }}>Important Dates</div>
              <div className="pn-modal-dates-grid">
                <div className="pn-modal-date-item">
                  <Calendar size={16} className="pn-modal-date-icon" />
                  <div className="pn-modal-date-info">
                    <span className="pn-modal-date-label">Publish Date</span>
                    <span className="pn-modal-date-value">{formatDate(n.publishDate)}</span>
                  </div>
                </div>
                {n.deadlineDate && (
                  <div className="pn-modal-date-item">
                    <Clock size={16} className="pn-modal-date-icon" />
                    <div className="pn-modal-date-info">
                      <span className="pn-modal-date-label">Deadline / Event Date</span>
                      <span className="pn-modal-date-value">{formatDate(n.deadlineDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="pn-modal-desc-section">
              <div className="pn-modal-label">Description</div>
              <p className="pn-modal-desc">{n.description}</p>
            </div>

            {/* Eligibility */}
            {n.eligibility && (
              <div className="pn-modal-eligibility-section">
                <div className="pn-modal-label">Eligibility / Notes</div>
                <p className="pn-modal-eligibility-text">{n.eligibility}</p>
              </div>
            )}

            {/* Contact */}
            {n.contactInfo && (
              <div className="pn-modal-contact-section">
                <div className="pn-modal-label">Contact / Office</div>
                <p className="pn-modal-contact-text">{n.contactInfo}</p>
              </div>
            )}

            {/* Documents */}
            {n.documents && n.documents.length > 0 && (
              <div className="pn-modal-docs-section">
                <div className="pn-modal-label">Documents</div>
                <ul className="pn-modal-docs-list">
                  {n.documents.map((doc, i) => (
                    <li key={i}>
                      <FileText size={16} color="#1e3a8a" />
                      <div className="pn-modal-doc-info">
                        <span className="pn-modal-doc-name">{doc.name}</span>
                        <span className="pn-modal-doc-size">{doc.size}</span>
                      </div>
                      <span className="pn-demo-label">Demo</span>
                      <a
                        className="pn-doc-btn"
                        aria-label={`Download ${doc.name}`}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <Download size={12} /> Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pn-page">
      <Header />

      {/* ──── Page Title / Breadcrumb ──── */}
      <section className="pn-title-section">
        <div className="container">
          <div className="pn-title-row">
            <div>
              <h1 className="pn-page-title">Public Notices &amp; Announcements</h1>
              <p className="pn-page-subtitle">Latest circulars, health camps, and hospital announcements — Civil Hospital Arki</p>
            </div>
            <nav className="pn-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <ChevronRight size={14} aria-hidden="true" />
              <span>Notices &amp; Announcements</span>
            </nav>
          </div>
        </div>
      </section>

      {/* ──── Stats Summary ──── */}
      <section className="pn-stats-section" aria-label="Notices statistics summary">
        <div className="container">
          <div className="pn-stats-row">
            <div className="pn-stat-card">
              <div className="pn-stat-icon total" aria-hidden="true"><Megaphone size={20} /></div>
              <div className="pn-stat-info">
                <span className="pn-stat-number">{stats.total}</span>
                <span className="pn-stat-label">Total Notices</span>
              </div>
            </div>
            <div className="pn-stat-card">
              <div className="pn-stat-icon new" aria-hidden="true"><AlertCircle size={20} /></div>
              <div className="pn-stat-info">
                <span className="pn-stat-number">{stats.new}</span>
                <span className="pn-stat-label">New</span>
              </div>
            </div>
            <div className="pn-stat-card">
              <div className="pn-stat-icon active" aria-hidden="true"><CheckCircle2 size={20} /></div>
              <div className="pn-stat-info">
                <span className="pn-stat-number">{stats.active}</span>
                <span className="pn-stat-label">Active</span>
              </div>
            </div>
            <div className="pn-stat-card">
              <div className="pn-stat-icon archived" aria-hidden="true"><Archive size={20} /></div>
              <div className="pn-stat-info">
                <span className="pn-stat-number">{stats.archived}</span>
                <span className="pn-stat-label">Archived</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Tabs ──── */}
      <section className="pn-tabs-section">
        <div className="container">
          <div className="pn-tabs" role="tablist" aria-label="Notice categories">
            <button
              role="tab"
              aria-selected={activeTab === 'current'}
              className={`pn-tab${activeTab === 'current' ? ' active' : ''}`}
              onClick={() => handleTab('current')}
              id="tab-current"
            >
              Current Notices
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'archived'}
              className={`pn-tab${activeTab === 'archived' ? ' active' : ''}`}
              onClick={() => handleTab('archived')}
              id="tab-archived"
            >
              Archived Notices
            </button>
          </div>
        </div>
      </section>

      {/* ──── Search & Filters ──── */}
      <section className="pn-filters-section" aria-label="Search and filter notices">
        <div className="container">
          <div className="pn-filters-row">
            {/* Search */}
            <div className="pn-filter-group">
              <label htmlFor="pn-search" className="pn-filter-label">Search</label>
              <div className="pn-search-input-wrap">
                <input
                  id="pn-search"
                  type="text"
                  className="pn-search-input"
                  placeholder="Search by ID, title, description..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Search size={16} className="pn-search-icon" aria-hidden="true" />
              </div>
            </div>

            {/* Status */}
            <div className="pn-filter-group">
              <label htmlFor="pn-status" className="pn-filter-label">Status</label>
              <select
               id="pn-status"
                className="pn-select"
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value)}
              >
                {NOTICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Category */}
            <div className="pn-filter-group">
              <label htmlFor="pn-category" className="pn-filter-label">Category</label>
              <select
                id="pn-category"
                className="pn-select"
                value={categoryFilter}
                onChange={(e) => handleCategory(e.target.value)}
              >
                {NOTICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Reset */}
            <div className="pn-filter-group" style={{ flex: '0 0 auto', justifyContent: 'flex-end' }}>
              <span className="pn-filter-label">&nbsp;</span>
              <button
                className="pn-reset-btn"
                onClick={resetFilters}
                aria-label="Reset all filters"
              >
                <RefreshCw size={14} /> Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Table Section ──── */}
      <section className="pn-table-section" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        <div className="container">
          {/* Results count & sort */}
          <div className="pn-table-header-row">
            <div className="pn-results-count">
              Showing <strong>{paged.length}</strong> of <strong>{filtered.length}</strong> {activeTab === 'archived' ? 'archived ' : ''}notices
            </div>
            <div className="pn-sort-group">
              <label htmlFor="pn-sort">Sort by:</label>
              <select
                id="pn-sort"
                className="pn-sort-select"
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Desktop Table ── */}
          <div className="pn-table-container">
            <table className="pn-table" role="table">
              <thead>
                <tr>
                  <th scope="col">Notice ID</th>
                  <th scope="col">Title / Description</th>
                  <th scope="col">Category</th>
                  <th scope="col">Publish Date</th>
                  <th scope="col">Deadline / Event</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="pn-no-results">
                      <div className="pn-no-results-text">Loading notices...</div>
                    </td>
                  </tr>
                ) : paged.length > 0 ? paged.map((notice) => (
                  <tr key={notice.id}>
                    <td><span className="pn-notice-id">{notice.id}</span></td>
                    <td><span className="pn-notice-title" title={notice.title}>{notice.title}</span></td>
                    <td><span className="pn-category-badge">{notice.category}</span></td>
                    <td><span className="pn-date-text">{formatDate(notice.publishDate)}</span></td>
                    <td><span className="pn-date-text">{formatDate(notice.deadlineDate)}</span></td>
                    <td><StatusBadge status={notice.derivedStatus} /></td>
                    <td>
                      <div className="pn-actions-cell">
                        <button
                          className="pn-action-btn"
                          onClick={() => setSelectedNotice(notice)}
                          aria-label={`View details for ${notice.title}`}
                        >
                          View Details
                        </button>
                        {notice.documents && notice.documents.length > 0 ? (
                          <button
                          className="pn-action-btn pn-action-btn-outline"
                          onClick={() => {
                            if (notice.documents && notice.documents.length > 0) {
                              window.open(notice.documents[0].url, '_blank');
                            } else {
                              alert("No documents available for this notice.");
                            }
                          }}
                          aria-label={`Download document for ${notice.title}`}
                        >
                          <Download size={12} /> Doc
                        </button>
                        ) : (
                          <div style={{ width: '64px' }}></div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="pn-no-results">
                      <AlertCircle size={36} className="pn-no-results-icon" />
                      <div className="pn-no-results-title">No notices found</div>
                      <div className="pn-no-results-text">
                        No {activeTab === 'archived' ? 'archived ' : ''}notices match your current search and filter criteria.
                      </div>
                      <button className="pn-reset-btn" onClick={resetFilters}>
                        <RefreshCw size={14} /> Reset Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="pn-cards-container">
            {isLoading ? (
              <div className="pn-no-results" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div className="pn-no-results-text">Loading notices...</div>
              </div>
            ) : paged.length > 0 ? paged.map((notice) => (
              <div key={notice.id} className="pn-card">
                <div className="pn-card-header">
                  <span className="pn-card-id">{notice.id}</span>
                  <StatusBadge status={notice.derivedStatus} />
                </div>
                <div className="pn-card-title">{notice.title}</div>
                <div className="pn-card-meta">
                  <div className="pn-card-meta-item">
                    <span className="pn-card-meta-label">Category</span>
                    <span className="pn-card-meta-value">{notice.category}</span>
                  </div>
                  <div className="pn-card-meta-item">
                    <span className="pn-card-meta-label">Publish Date</span>
                    <span className="pn-card-meta-value">{formatDate(notice.publishDate)}</span>
                  </div>
                </div>
                <div className="pn-card-footer">
                  <button
                    className="pn-action-btn"
                    onClick={() => setSelectedNotice(notice)}
                    aria-label={`View details for ${notice.title}`}
                  >
                    View Details
                  </button>
                  {notice.documents && notice.documents.length > 0 && (
                    <button
                    className="pn-action-btn pn-action-btn-outline"
                    onClick={() => {
                      if (notice.documents && notice.documents.length > 0) {
                        window.open(notice.documents[0].url, '_blank');
                      } else {
                        alert("No documents available for this notice.");
                      }
                    }}
                    aria-label={`Download document for ${notice.title}`}
                  >
                    <Download size={12} /> Doc
                  </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="pn-no-results" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <AlertCircle size={36} className="pn-no-results-icon" />
                <div className="pn-no-results-title">No notices found</div>
                <div className="pn-no-results-text">
                  No {activeTab === 'archived' ? 'archived ' : ''}notices match your current criteria.
                </div>
                <button className="pn-reset-btn" onClick={resetFilters}>
                  <RefreshCw size={14} /> Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {filtered.length > 0 && (
            <div className="pn-pagination-row">
              <div className="pn-page-info">
                Page {page} of {totalPages} &middot; {filtered.length} total results
              </div>
              <div className="pn-pagination" role="navigation" aria-label="Pagination">
                <button
                  className="pn-page-btn"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  &laquo; Prev
                </button>
                {pageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="pn-page-dots" aria-hidden="true">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`pn-page-btn${page === p ? ' active' : ''}`}
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={page === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="pn-page-btn"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  Next &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* ──── Modal ──── */}
      {renderModal()}
    </div>
  );
};

export default PublicNotices;
