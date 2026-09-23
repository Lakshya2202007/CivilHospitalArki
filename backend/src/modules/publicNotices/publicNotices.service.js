const ApiError = require('../../utils/ApiError');
const repo = require('./publicNotices.repository');
const {
  NOTICE_CATEGORIES,
  NOTICE_LIFECYCLE,
  NOTICE_DISPLAY_STATUSES,
} = require('./publicNotices.schema');

const DAY_MS = 24 * 60 * 60 * 1000;

/** A notice counts as "New" for this many days after its publish date. */
const NEW_WINDOW_DAYS = 7;

/** Archived once the deadline is more than this many months past. */
const ARCHIVE_AFTER_MONTHS = 6;

/**
 * Derives the public status from the lifecycle the admin picked plus the
 * dates. 'Auto' walks the timeline: not yet published -> New (scheduled),
 * recently published -> New, past deadline -> Closed, otherwise Active.
 */
function deriveStatus(notice, now = new Date()) {
  if (notice.lifecycle === 'Closed' || notice.lifecycle === 'Archived') {
    return notice.lifecycle;
  }

  const publish = new Date(notice.publishDate);
  const deadline = notice.deadlineDate ? new Date(notice.deadlineDate) : null;

  if (deadline && !Number.isNaN(deadline.getTime()) && deadline < now) {
    return 'Closed';
  }

  if (!Number.isNaN(publish.getTime())) {
    const ageDays = (now - publish) / DAY_MS;
    if (ageDays <= NEW_WINDOW_DAYS) return 'New';
  }

  return 'Active';
}

/**
 * A notice is archived once its deadline is more than six months old, or the
 * admin forced it. Notices with no deadline never auto-archive — a standing
 * circular stays current until someone retires it.
 */
function isArchived(notice, now = new Date()) {
  if (notice.lifecycle === 'Archived') return true;
  if (!notice.deadlineDate) return false;

  const deadline = new Date(notice.deadlineDate);
  if (Number.isNaN(deadline.getTime())) return false;

  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - ARCHIVE_AFTER_MONTHS);
  return deadline < cutoff;
}

/** Public table expects "15 Sep 2026"; Firestore holds ISO. */
function formatDisplayDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toPublic(notice, now = new Date()) {
  return {
    id: notice.noticeId,
    docId: notice.id,
    title: notice.title,
    category: notice.category,
    publishDate: notice.publishDate,
    deadlineDate: notice.deadlineDate || null,
    publishDateLabel: formatDisplayDate(notice.publishDate),
    deadlineDateLabel: formatDisplayDate(notice.deadlineDate),
    description: notice.description || '',
    eligibility: notice.eligibility || '',
    contactInfo: notice.contactInfo || '',
    status: deriveStatus(notice, now),
    archived: isArchived(notice, now),
    documents: Array.isArray(notice.documents) ? notice.documents : [],
  };
}

/** Rejects malformed document entries before they reach Firestore. */
function sanitizeDocuments(documents) {
  if (documents === undefined) return undefined;

  if (!Array.isArray(documents)) {
    throw ApiError.badRequest('Documents must be a list.');
  }
  if (documents.length > 20) {
    throw ApiError.badRequest('A notice can have at most 20 documents.');
  }

  return documents.map((doc, i) => {
    const label = `Document ${i + 1}`;
    if (!doc || typeof doc !== 'object') throw ApiError.badRequest(`${label} is malformed.`);

    const name = String(doc.name || '').trim();
    const url = String(doc.url || '').trim();

    if (!name) throw ApiError.badRequest(`${label} needs a name.`);
    if (!url) throw ApiError.badRequest(`${label} needs an uploaded file.`);

    return { name: name.slice(0, 200), url: url.slice(0, 500), size: String(doc.size || '') };
  });
}

function applyFilters(items, { search, category, status, tab }) {
  let data = items;

  // The public page splits current and archived into two tabs.
  if (tab === 'archived') data = data.filter((n) => n.archived);
  else if (tab === 'current') data = data.filter((n) => !n.archived);

  if (category && category !== 'All Categories' && category !== 'All') {
    data = data.filter((n) => n.category === category);
  }

  if (status && status !== 'All') {
    data = data.filter((n) => n.status === status);
  }

  if (search && String(search).trim()) {
    const q = String(search).trim().toLowerCase();
    data = data.filter((n) =>
      [n.id, n.title, n.category, n.description]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }

  return data;
}

function applySort(items, sortBy = 'publishDate-desc') {
  const [field, dir] = String(sortBy).split('-');
  const allowed = ['publishDate', 'deadlineDate'];
  const key = allowed.includes(field) ? field : 'publishDate';
  const sign = dir === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    // Notices without a deadline sort last regardless of direction.
    const x = a[key] ? new Date(a[key]).getTime() : null;
    const y = b[key] ? new Date(b[key]).getTime() : null;
    if (x === null && y === null) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    return (x - y) * sign;
  });
}

/** Counts for the summary tiles — computed over every published notice. */
function buildStats(items) {
  return {
    total: items.length,
    new: items.filter((n) => n.status === 'New').length,
    active: items.filter((n) => n.status === 'Active').length,
    archived: items.filter((n) => n.archived).length,
  };
}

async function listPublic(query = {}) {
  const now = new Date();
  const all = (await repo.findAll())
    .filter((n) => n.isPublished !== false)
    .map((n) => toPublic(n, now));

  const filtered = applySort(applyFilters(all, query), query.sortBy);

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 8));
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);

  return {
    data: filtered.slice((safePage - 1) * limit, safePage * limit),
    pagination: { page: safePage, limit, total: filtered.length, totalPages },
    // Stats describe the whole board, not the current filter.
    stats: buildStats(all),
  };
}

/** Admin listing: everything, with the derived status shown for reference. */
async function listAll() {
  const now = new Date();
  return (await repo.findAll()).map((n) => ({
    ...n,
    derivedStatus: deriveStatus(n, now),
    archived: isArchived(n, now),
  }));
}

async function getById(id) {
  const notice = await repo.findById(id);
  if (!notice) throw ApiError.notFound('Notice not found.');
  return notice;
}

function validateDates({ publishDate, deadlineDate }) {
  if (publishDate && deadlineDate && new Date(deadlineDate) < new Date(publishDate)) {
    throw ApiError.badRequest('Deadline date cannot be earlier than the publish date.');
  }
}

async function create(payload) {
  const clash = await repo.findByNoticeId(payload.noticeId);
  if (clash) throw ApiError.badRequest(`Notice ID "${payload.noticeId}" is already in use.`);

  validateDates(payload);
  const documents = sanitizeDocuments(payload.documents) || [];
  return repo.create({ ...payload, documents });
}

async function update(id, changes) {
  const existing = await getById(id);

  if (changes.noticeId) {
    const clash = await repo.findByNoticeId(changes.noticeId);
    if (clash && clash.id !== id) {
      throw ApiError.badRequest(`Notice ID "${changes.noticeId}" is already in use.`);
    }
  }

  validateDates({ ...existing, ...changes });

  const documents = sanitizeDocuments(changes.documents);
  return repo.update(id, documents === undefined ? changes : { ...changes, documents });
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
  return { message: 'Notice deleted.' };
}

/** Dropdown options, so the admin form can never offer a value the filters reject. */
function getMeta() {
  return {
    categories: NOTICE_CATEGORIES,
    lifecycles: NOTICE_LIFECYCLE,
    statuses: NOTICE_DISPLAY_STATUSES,
  };
}

module.exports = {
  listPublic, listAll, getById, create, update, remove, getMeta,
  deriveStatus, isArchived, toPublic,
};
