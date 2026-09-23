import React, { useState, useMemo, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  Search, ChevronRight, X,
  FileText, Download, Calendar, Clock, AlertCircle, RefreshCw,
  FileStack, CheckCircle2, Timer, Archive,
} from 'lucide-react';
import {
  ALL_TENDERS, // Fallback
  TENDER_STATUSES,
  TENDER_DEPARTMENTS,
  TENDER_TYPES,
  PROCUREMENT_ANNOUNCEMENTS, // Fallback
  ROWS_PER_PAGE,
  deriveTenderStatus,
} from '../../data/tendersData';
import './TendersQuotations.css';

/* ────────── Helpers ────────── */

/** Map a status string to a CSS class suffix */
const statusCssClass = (status) => {
  switch (status) {
    case 'Active': return 'tq-status-active';
    case 'Closing Soon': return 'tq-status-closing-soon';
    case 'Closed': return 'tq-status-closed';
    case 'Awarded': return 'tq-status-awarded';
    case 'Cancelled': return 'tq-status-cancelled';
    default: return '';
  }
};

/** Format ISO date string to readable format */
const formatDate = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Determine if a tender is "archived" (closing date older than 6 months) */
const isArchived = (tender) => {
  const closing = new Date(tender.closingDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return closing < sixMonthsAgo;
};

/* ────────── Sort Config ────────── */
const SORT_OPTIONS = [
  { value: 'closingDate-asc', label: 'Closing Date (earliest)' },
  { value: 'closingDate-desc', label: 'Closing Date (latest)' },
  { value: 'issueDate-asc', label: 'Issue Date (earliest)' },
  { value: 'issueDate-desc', label: 'Issue Date (latest)' },
  { value: 'estimatedValue-desc', label: 'Value (high to low)' },
  { value: 'estimatedValue-asc', label: 'Value (low to high)' },
];

/** Parse estimated value string like "₹10,00,000" to a number for sorting */
const parseValue = (val) => {
  const cleaned = val.replace(/[₹,\s]/g, '');
  return parseInt(cleaned, 10) || 0;
};

/* ────────── Component ────────── */
const TendersQuotations = () => {
  /* ── State ── */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'archived'
  const [sortBy, setSortBy] = useState('closingDate-asc');
  const [page, setPage] = useState(1);
  const [selectedTender, setSelectedTender] = useState(null);

  const [tendersData, setTendersData] = useState([]);
  const [announcementsData, setAnnouncementsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await fetch('/api/tenders?limit=100');
        const json = await res.json();
        if (json.success && json.data) {
          setTendersData(json.data);
        } else {
          setTendersData(ALL_TENDERS);
        }
      } catch (err) {
        console.error('Failed to fetch tenders:', err);
        setTendersData(ALL_TENDERS);
      }
    };

    const fetchNotices = async () => {
      try {
        const res = await fetch('/api/notices?limit=100');
        const json = await res.json();
        if (json.success && json.data) {
          setAnnouncementsData(json.data);
        } else {
          setAnnouncementsData(PROCUREMENT_ANNOUNCEMENTS);
        }
      } catch (err) {
        console.error('Failed to fetch notices:', err);
        setAnnouncementsData(PROCUREMENT_ANNOUNCEMENTS);
      }
    };

    const load = async () => {
      await Promise.all([fetchTenders(), fetchNotices()]);
      setIsLoading(false);
    };

    load();
  }, []);

  /* ── Enrich tenders with derived status ── */
  const enrichedTenders = useMemo(() =>
    tendersData.map(t => ({
      ...t,
      derivedStatus: deriveTenderStatus(t),
      archived: isArchived(t),
    })),
    [tendersData]
  );

  /* ── Stats ── */
  const stats = useMemo(() => {
    const all = enrichedTenders;
    return {
      total: all.length,
      active: all.filter(t => t.derivedStatus === 'Active').length,
      closingSoon: all.filter(t => t.derivedStatus === 'Closing Soon').length,
      closed: all.filter(t => ['Closed', 'Awarded', 'Cancelled'].includes(t.derivedStatus)).length,
    };
  }, [enrichedTenders]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let data = enrichedTenders;

    // Tab filter
    if (activeTab === 'current') {
      data = data.filter(t => !t.archived);
    } else {
      data = data.filter(t => t.archived);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(t =>
        (t.id && t.id.toLowerCase().includes(q)) ||
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.department && t.department.toLowerCase().includes(q)) ||
        (t.type && t.type.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      data = data.filter(t => t.derivedStatus === statusFilter);
    }

    // Department filter
    if (deptFilter !== 'All Departments') {
      data = data.filter(t => t.department === deptFilter);
    }

    // Type filter
    if (typeFilter !== 'All Types') {
      data = data.filter(t => t.type === typeFilter);
    }

    // Sort
    const [sortField, sortDir] = sortBy.split('-');
    data = [...data].sort((a, b) => {
      let valA, valB;
      if (sortField === 'estimatedValue') {
        valA = parseValue(a.estimatedValue);
        valB = parseValue(b.estimatedValue);
      } else {
        valA = new Date(a[sortField]);
        valB = new Date(b[sortField]);
      }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    return data;
  }, [enrichedTenders, search, statusFilter, deptFilter, typeFilter, activeTab, sortBy]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  /* ── Handlers (reset page on filter change) ── */
  const handleSearch = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleStatus = useCallback((v) => { setStatusFilter(v); setPage(1); }, []);
  const handleDept = useCallback((v) => { setDeptFilter(v); setPage(1); }, []);
  const handleType = useCallback((v) => { setTypeFilter(v); setPage(1); }, []);
  const handleTab = useCallback((tab) => { setActiveTab(tab); setPage(1); }, []);
  const handleSort = useCallback((v) => { setSortBy(v); setPage(1); }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('All');
    setDeptFilter('All Departments');
    setTypeFilter('All Types');
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
    <span className={`tq-status-badge ${statusCssClass(status)}`}>
      <span className="tq-status-dot" aria-hidden="true"></span>
      {status}
    </span>
  );

  /* ── Render: Tender Detail Modal ── */
  const renderModal = () => {
    if (!selectedTender) return null;
    const t = selectedTender;
    return (
      <div
        className="tq-modal-overlay"
        onClick={() => setSelectedTender(null)}
        role="dialog"
        aria-modal="true"
        aria-label={`Tender details: ${t.title}`}
      >
        <div className="tq-modal" onClick={(e) => e.stopPropagation()}>
          <button
            className="tq-modal-close"
            onClick={() => setSelectedTender(null)}
            aria-label="Close tender details"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="tq-modal-header">
            <div className="tq-modal-header-text">
              <div className="tq-modal-tender-id">{t.id}</div>
              <h2 className="tq-modal-title">{t.title}</h2>
              <StatusBadge status={t.derivedStatus} />
            </div>
          </div>

          {/* Body */}
          <div className="tq-modal-body">
            {/* Info Grid */}
            <div className="tq-modal-info-grid">
              <div className="tq-modal-info-item">
                <span className="tq-modal-label">Department</span>
                <span className="tq-modal-value">{t.department}</span>
              </div>
              <div className="tq-modal-info-item">
                <span className="tq-modal-label">Tender Type</span>
                <span className="tq-modal-value">{t.type}</span>
              </div>
              <div className="tq-modal-info-item">
                <span className="tq-modal-label">Estimated Value</span>
                <span className="tq-modal-value">{t.estimatedValue}</span>
              </div>
              <div className="tq-modal-info-item">
                <span className="tq-modal-label">Current Status</span>
                <span className="tq-modal-value">{t.derivedStatus}</span>
              </div>
            </div>

            {/* Important Dates */}
            <div className="tq-modal-dates-section">
              <div className="tq-modal-label" style={{ marginBottom: '10px' }}>Important Dates</div>
              <div className="tq-modal-dates-grid">
                <div className="tq-modal-date-item">
                  <Calendar size={16} className="tq-modal-date-icon" />
                  <div className="tq-modal-date-info">
                    <span className="tq-modal-date-label">Issue Date</span>
                    <span className="tq-modal-date-value">{formatDate(t.issueDate)}</span>
                  </div>
                </div>
                <div className="tq-modal-date-item">
                  <Clock size={16} className="tq-modal-date-icon" />
                  <div className="tq-modal-date-info">
                    <span className="tq-modal-date-label">Closing Date</span>
                    <span className="tq-modal-date-value">{formatDate(t.closingDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="tq-modal-desc-section">
              <div className="tq-modal-label">Description</div>
              <p className="tq-modal-desc">{t.description}</p>
            </div>

            {/* Eligibility */}
            {t.eligibility && (
              <div className="tq-modal-eligibility-section">
                <div className="tq-modal-label">Eligibility & Requirements</div>
                <p className="tq-modal-eligibility-text">{t.eligibility}</p>
              </div>
            )}

            {/* Contact */}
            {t.contactInfo && (
              <div className="tq-modal-contact-section">
                <div className="tq-modal-label">Contact / Office</div>
                <p className="tq-modal-contact-text">{t.contactInfo}</p>
              </div>
            )}

            {/* Documents */}
            {t.documents && t.documents.length > 0 && (
              <div className="tq-modal-docs-section">
                <div className="tq-modal-label">Documents</div>
                <ul className="tq-modal-docs-list">
                  {t.documents.map((doc, i) => (
                    <li key={i}>
                      <FileText size={16} color="#1e3a8a" />
                      <div className="tq-modal-doc-info">
                        <span className="tq-modal-doc-name">{doc.name}</span>
                        <span className="tq-modal-doc-size">{doc.size}</span>
                      </div>
                      <span className="tq-demo-label">Demo</span>
                      <a
                        className="tq-doc-btn"
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
    <div className="tq-page">
      <Header />

      {/* ──── Page Title / Breadcrumb ──── */}
      <section className="tq-title-section">
        <div className="container">
          <div className="tq-title-row">
            <div>
              <h1 className="tq-page-title">Tenders, Quotations &amp; Procurement</h1>
              <p className="tq-page-subtitle">Procurement Notices and Tender Information — Civil Hospital Arki</p>
            </div>
            <nav className="tq-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <ChevronRight size={14} aria-hidden="true" />
              <span>Tenders &amp; Quotations</span>
            </nav>
          </div>
        </div>
      </section>

      {/* ──── Stats Summary ──── */}
      <section className="tq-stats-section" aria-label="Tender statistics summary">
        <div className="container">
          <div className="tq-stats-row">
            <div className="tq-stat-card">
              <div className="tq-stat-icon total" aria-hidden="true"><FileStack size={20} /></div>
              <div className="tq-stat-info">
                <span className="tq-stat-number">{stats.total}</span>
                <span className="tq-stat-label">Total Tenders</span>
              </div>
            </div>
            <div className="tq-stat-card">
              <div className="tq-stat-icon active" aria-hidden="true"><CheckCircle2 size={20} /></div>
              <div className="tq-stat-info">
                <span className="tq-stat-number">{stats.active}</span>
                <span className="tq-stat-label">Active</span>
              </div>
            </div>
            <div className="tq-stat-card">
              <div className="tq-stat-icon closing" aria-hidden="true"><Timer size={20} /></div>
              <div className="tq-stat-info">
                <span className="tq-stat-number">{stats.closingSoon}</span>
                <span className="tq-stat-label">Closing Soon</span>
              </div>
            </div>
            <div className="tq-stat-card">
              <div className="tq-stat-icon closed" aria-hidden="true"><Archive size={20} /></div>
              <div className="tq-stat-info">
                <span className="tq-stat-number">{stats.closed}</span>
                <span className="tq-stat-label">Closed / Awarded</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Tabs ──── */}
      <section className="tq-tabs-section">
        <div className="container">
          <div className="tq-tabs" role="tablist" aria-label="Tender categories">
            <button
              role="tab"
              aria-selected={activeTab === 'current'}
              className={`tq-tab${activeTab === 'current' ? ' active' : ''}`}
              onClick={() => handleTab('current')}
              id="tab-current"
            >
              Current Tenders
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'archived'}
              className={`tq-tab${activeTab === 'archived' ? ' active' : ''}`}
              onClick={() => handleTab('archived')}
              id="tab-archived"
            >
              Archived Tenders
            </button>
          </div>
        </div>
      </section>

      {/* ──── Search & Filters ──── */}
      <section className="tq-filters-section" aria-label="Search and filter tenders">
        <div className="container">
          <div className="tq-filters-row">
            {/* Search */}
            <div className="tq-filter-group">
              <label htmlFor="tq-search" className="tq-filter-label">Search</label>
              <div className="tq-search-input-wrap">
                <input
                  id="tq-search"
                  type="text"
                  className="tq-search-input"
                  placeholder="Search by ID, title, department..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Search size={16} className="tq-search-icon" aria-hidden="true" />
              </div>
            </div>

            {/* Status */}
            <div className="tq-filter-group">
              <label htmlFor="tq-status" className="tq-filter-label">Status</label>
              <select
                id="tq-status"
                className="tq-select"
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value)}
              >
                {TENDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Department */}
            <div className="tq-filter-group">
              <label htmlFor="tq-dept" className="tq-filter-label">Department</label>
              <select
                id="tq-dept"
                className="tq-select"
                value={deptFilter}
                onChange={(e) => handleDept(e.target.value)}
              >
                {TENDER_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="tq-filter-group">
              <label htmlFor="tq-type" className="tq-filter-label">Type</label>
              <select
                id="tq-type"
                className="tq-select"
                value={typeFilter}
                onChange={(e) => handleType(e.target.value)}
              >
                {TENDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Reset */}
            <div className="tq-filter-group" style={{ flex: '0 0 auto', justifyContent: 'flex-end' }}>
              <span className="tq-filter-label">&nbsp;</span>
              <button
                className="tq-reset-btn"
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
      <section className="tq-table-section" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        <div className="container">
          {/* Results count & sort */}
          <div className="tq-table-header-row">
            <div className="tq-results-count">
              Showing <strong>{paged.length}</strong> of <strong>{filtered.length}</strong> {activeTab === 'archived' ? 'archived ' : ''}tenders
            </div>
            <div className="tq-sort-group">
              <label htmlFor="tq-sort">Sort by:</label>
              <select
                id="tq-sort"
                className="tq-sort-select"
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
          <div className="tq-table-container">
            <table className="tq-table" role="table">
              <thead>
                <tr>
                  <th scope="col">Tender ID</th>
                  <th scope="col">Title / Description</th>
                  <th scope="col">Department</th>
                  <th scope="col">Type</th>
                  <th scope="col">Issue Date</th>
                  <th scope="col">Closing Date</th>
                  <th scope="col">Est. Value</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="tq-no-results">
                      <div className="tq-no-results-text">Loading tenders...</div>
                    </td>
                  </tr>
                ) : paged.length > 0 ? paged.map((tender) => (
                  <tr key={tender.id}>
                    <td><span className="tq-tender-id">{tender.id}</span></td>
                    <td><span className="tq-tender-title" title={tender.title}>{tender.title}</span></td>
                    <td><span className="tq-dept-text">{tender.department}</span></td>
                    <td><span className="tq-type-badge">{tender.type}</span></td>
                    <td><span className="tq-date-text">{formatDate(tender.issueDate)}</span></td>
                    <td><span className="tq-date-text">{formatDate(tender.closingDate)}</span></td>
                    <td><span className="tq-value-text">{tender.estimatedValue}</span></td>
                    <td><StatusBadge status={tender.derivedStatus} /></td>
                    <td>
                      <div className="tq-actions-cell">
                        <button
                          className="tq-action-btn"
                          onClick={() => setSelectedTender(tender)}
                          aria-label={`View details for ${tender.title}`}
                        >
                          View Details
                        </button>
                        <button
                          className="tq-action-btn tq-action-btn-outline"
                          onClick={() => {
                            if (tender.documents && tender.documents.length > 0) {
                              window.open(tender.documents[0].url, '_blank');
                            } else {
                              alert("No documents available for this tender.");
                            }
                          }}
                          aria-label={`Download document for ${tender.title}`}
                        >
                          <Download size={12} /> Doc
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="tq-no-results">
                      <AlertCircle size={36} className="tq-no-results-icon" />
                      <div className="tq-no-results-title">No tenders found</div>
                      <div className="tq-no-results-text">
                        No {activeTab === 'archived' ? 'archived ' : ''}tenders match your current search and filter criteria.
                      </div>
                      <button className="tq-reset-btn" onClick={resetFilters}>
                        <RefreshCw size={14} /> Reset Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="tq-cards-container">
            {isLoading ? (
              <div className="tq-no-results" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div className="tq-no-results-text">Loading tenders...</div>
              </div>
            ) : paged.length > 0 ? paged.map((tender) => (
              <div key={tender.id} className="tq-card">
                <div className="tq-card-header">
                  <span className="tq-card-id">{tender.id}</span>
                  <StatusBadge status={tender.derivedStatus} />
                </div>
                <div className="tq-card-title">{tender.title}</div>
                <div className="tq-card-meta">
                  <div className="tq-card-meta-item">
                    <span className="tq-card-meta-label">Department</span>
                    <span className="tq-card-meta-value">{tender.department}</span>
                  </div>
                  <div className="tq-card-meta-item">
                    <span className="tq-card-meta-label">Type</span>
                    <span className="tq-card-meta-value">{tender.type}</span>
                  </div>
                  <div className="tq-card-meta-item">
                    <span className="tq-card-meta-label">Closing Date</span>
                    <span className="tq-card-meta-value">{formatDate(tender.closingDate)}</span>
                  </div>
                  <div className="tq-card-meta-item">
                    <span className="tq-card-meta-label">Est. Value</span>
                    <span className="tq-card-meta-value">{tender.estimatedValue}</span>
                  </div>
                </div>
                <div className="tq-card-footer">
                  <button
                    className="tq-action-btn"
                    onClick={() => setSelectedTender(tender)}
                    aria-label={`View details for ${tender.title}`}
                  >
                    View Details
                  </button>
                  <button
                    className="tq-action-btn tq-action-btn-outline"
                    onClick={() => {
                      if (tender.documents && tender.documents.length > 0) {
                        window.open(tender.documents[0].url, '_blank');
                      } else {
                        alert("No documents available for this tender.");
                      }
                    }}
                    aria-label={`Download document for ${tender.title}`}
                  >
                    <Download size={12} /> Doc
                  </button>
                </div>
              </div>
            )) : (
              <div className="tq-no-results" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <AlertCircle size={36} className="tq-no-results-icon" />
                <div className="tq-no-results-title">No tenders found</div>
                <div className="tq-no-results-text">
                  No {activeTab === 'archived' ? 'archived ' : ''}tenders match your current criteria.
                </div>
                <button className="tq-reset-btn" onClick={resetFilters}>
                  <RefreshCw size={14} /> Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {filtered.length > 0 && (
            <div className="tq-pagination-row">
              <div className="tq-page-info">
                Page {page} of {totalPages} &middot; {filtered.length} total results
              </div>
              <div className="tq-pagination" role="navigation" aria-label="Pagination">
                <button
                  className="tq-page-btn"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  &laquo; Prev
                </button>
                {pageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="tq-page-dots" aria-hidden="true">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`tq-page-btn${page === p ? ' active' : ''}`}
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={page === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="tq-page-btn"
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

      {/* ──── Procurement Announcements ──── */}
      <section className="tq-announcements-section" aria-label="Latest procurement announcements">
        <div className="container">
          <h2 className="tq-announcements-title">Latest Procurement Announcements</h2>
          <p className="tq-announcements-subtitle">Recent procurement updates and notices from Civil Hospital Arki</p>
          <div className="tq-announcements-grid">
            {isLoading ? (
              <p>Loading announcements...</p>
            ) : announcementsData.map((ann) => (
              <article key={ann.id} className="tq-announcement-card">
                <div className="tq-announcement-category">{ann.category}</div>
                <p className="tq-announcement-text">{ann.title}</p>
                <div className="tq-announcement-date">
                  <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {formatDate(ann.date || ann.createdAt)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* ──── Modal ──── */}
      {renderModal()}
    </div>
  );
};

export default TendersQuotations;
