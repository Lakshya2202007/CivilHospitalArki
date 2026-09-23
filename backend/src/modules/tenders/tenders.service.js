const ApiError = require('../../utils/ApiError');
const repo = require('./tenders.repository');
const {
  TENDER_DEPARTMENTS,
  TENDER_TYPES,
  TENDER_LIFECYCLE,
  TENDER_DISPLAY_STATUSES,
  DOCUMENT_TYPES,
} = require('./tenders.schema');

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Derives the public status from the lifecycle the admin picked plus the
 * closing date. Mirrors deriveTenderStatus() in the original frontend data
 * module, so behaviour on the public page is unchanged.
 */
function deriveStatus(tender, now = new Date()) {
  if (tender.lifecycle === 'Awarded' || tender.lifecycle === 'Cancelled') {
    return tender.lifecycle;
  }

  const closing = new Date(tender.closingDate);
  if (Number.isNaN(closing.getTime())) return 'Active';

  const diffDays = (closing - now) / DAY_MS;
  if (diffDays < 0) return 'Closed';
  if (diffDays <= 3) return 'Closing Soon';
  return 'Active';
}

/** A tender is archived once its closing date is more than 6 months old. */
function isArchived(tender, now = new Date()) {
  const closing = new Date(tender.closingDate);
  if (Number.isNaN(closing.getTime())) return false;

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return closing < sixMonthsAgo;
}

/** Public table expects "15 Sep 2026"; Firestore holds ISO. */
function formatDisplayDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "₹10,00,000" -> 1000000, for value sorting. */
function parseValue(val) {
  const cleaned = String(val || '').replace(/[₹,\s]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function toPublic(tender, now = new Date()) {
  return {
    id: tender.tenderId,
    docId: tender.id,
    title: tender.title,
    description: tender.description || '',
    department: tender.department,
    type: tender.type,
    issueDate: tender.issueDate,
    closingDate: tender.closingDate,
    issueDateLabel: formatDisplayDate(tender.issueDate),
    closingDateLabel: formatDisplayDate(tender.closingDate),
    estimatedValue: tender.estimatedValue,
    status: deriveStatus(tender, now),
    archived: isArchived(tender, now),
    eligibility: tender.eligibility || '',
    contactInfo: tender.contactInfo || '',
    documents: Array.isArray(tender.documents) ? tender.documents : [],
  };
}

/** Rejects malformed document entries before they reach Firestore. */
function sanitizeDocuments(documents) {
  if (documents === undefined) return undefined;

  if (!Array.isArray(documents)) {
    throw ApiError.badRequest('Documents must be a list.');
  }
  if (documents.length > 20) {
    throw ApiError.badRequest('A tender can have at most 20 documents.');
  }

  return documents.map((doc, i) => {
    const label = `Document ${i + 1}`;
    if (!doc || typeof doc !== 'object') throw ApiError.badRequest(`${label} is malformed.`);

    const name = String(doc.name || '').trim();
    const url = String(doc.url || '').trim();
    const type = String(doc.type || 'notice').trim();

    if (!name) throw ApiError.badRequest(`${label} needs a name.`);
    if (!url) throw ApiError.badRequest(`${label} needs an uploaded file.`);
    if (!DOCUMENT_TYPES.includes(type)) {
      throw ApiError.badRequest(`${label} type must be one of: ${DOCUMENT_TYPES.join(', ')}.`);
    }

    return { name: name.slice(0, 200), url: url.slice(0, 500), type, size: String(doc.size || '') };
  });
}

function applyFilters(items, { search, department, type, status, tab }) {
  let data = items;

  // The public page splits current and archived into two tabs.
  if (tab === 'archived') data = data.filter((t) => t.archived);
  else if (tab === 'current') data = data.filter((t) => !t.archived);

  if (department && department !== 'All Departments' && department !== 'All') {
    data = data.filter((t) => t.department === department);
  }

  if (type && type !== 'All Types' && type !== 'All') {
    data = data.filter((t) => t.type === type);
  }

  if (status && status !== 'All') {
    data = data.filter((t) => t.status === status);
  }

  if (search && String(search).trim()) {
    const q = String(search).trim().toLowerCase();
    data = data.filter((t) =>
      [t.id, t.title, t.department, t.type, t.description]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }

  return data;
}

function applySort(items, sortBy = 'closingDate-asc') {
  const [field, dir] = String(sortBy).split('-');
  const allowed = ['closingDate', 'issueDate', 'estimatedValue'];
  const key = allowed.includes(field) ? field : 'closingDate';
  const sign = dir === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const [x, y] = key === 'estimatedValue'
      ? [parseValue(a.estimatedValue), parseValue(b.estimatedValue)]
      : [new Date(a[key]).getTime(), new Date(b[key]).getTime()];
    return (x - y) * sign;
  });
}

/** Counts for the summary tiles — computed over every published tender. */
function buildStats(items) {
  return {
    total: items.length,
    active: items.filter((t) => t.status === 'Active').length,
    closingSoon: items.filter((t) => t.status === 'Closing Soon').length,
    closed: items.filter((t) => ['Closed', 'Awarded', 'Cancelled'].includes(t.status)).length,
  };
}

async function listPublic(query = {}) {
  const now = new Date();
  const all = (await repo.findAll())
    .filter((t) => t.isPublished !== false)
    .map((t) => toPublic(t, now));

  const filtered = applySort(applyFilters(all, query), query.sortBy);

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 8));
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);

  return {
    data: filtered.slice((safePage - 1) * limit, safePage * limit),
    pagination: { page: safePage, limit, total: filtered.length, totalPages },
    // Stats describe the whole catalogue, not the current filter.
    stats: buildStats(all),
  };
}

/** Admin listing: everything, with the derived status shown for reference. */
async function listAll() {
  const now = new Date();
  return (await repo.findAll()).map((t) => ({
    ...t,
    derivedStatus: deriveStatus(t, now),
    archived: isArchived(t, now),
  }));
}

async function getById(id) {
  const tender = await repo.findById(id);
  if (!tender) throw ApiError.notFound('Tender not found.');
  return tender;
}

function validateDates({ issueDate, closingDate }) {
  if (issueDate && closingDate && new Date(closingDate) < new Date(issueDate)) {
    throw ApiError.badRequest('Closing date cannot be earlier than the issue date.');
  }
}

async function create(payload) {
  const clash = await repo.findByTenderId(payload.tenderId);
  if (clash) throw ApiError.badRequest(`Tender ID "${payload.tenderId}" is already in use.`);

  validateDates(payload);
  const documents = sanitizeDocuments(payload.documents) || [];
  return repo.create({ ...payload, documents });
}

async function update(id, changes) {
  const existing = await getById(id);

  if (changes.tenderId) {
    const clash = await repo.findByTenderId(changes.tenderId);
    if (clash && clash.id !== id) {
      throw ApiError.badRequest(`Tender ID "${changes.tenderId}" is already in use.`);
    }
  }

  validateDates({ ...existing, ...changes });

  const documents = sanitizeDocuments(changes.documents);
  return repo.update(id, documents === undefined ? changes : { ...changes, documents });
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
  return { message: 'Tender deleted.' };
}

/** Dropdown options, so the admin form can never offer a value the filters reject. */
function getMeta() {
  return {
    departments: TENDER_DEPARTMENTS,
    types: TENDER_TYPES,
    lifecycles: TENDER_LIFECYCLE,
    statuses: TENDER_DISPLAY_STATUSES,
    documentTypes: DOCUMENT_TYPES,
  };
}

module.exports = {
  listPublic, listAll, getById, create, update, remove, getMeta,
  deriveStatus, isArchived, toPublic,
};
