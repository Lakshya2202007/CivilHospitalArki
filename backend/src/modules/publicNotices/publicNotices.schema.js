/**
 * Public Notices & Announcements — the citizen-facing notice board.
 *
 * Distinct from the `notices` module, which drives the homepage marquee and
 * carries only a title, one date and one attachment. This one backs the full
 * notices page: categories, publish/deadline dates, a detail modal and
 * multiple documents.
 *
 * Filter values MUST stay in step with the public UI
 * (frontend/src/pages/public/PublicNotices.jsx), which reads them from
 * /api/public-notices/meta so the two cannot drift.
 */

const NOTICE_CATEGORIES = [
  'Health Camps',
  'Vaccination Drives',
  'Recruitment',
  'Circulars',
  'General',
];

/**
 * What the admin actually chooses. 'Auto' means "let the dates decide" — the
 * service derives New / Active / Closed from publish and deadline dates.
 * Closed and Archived override that, because no date can imply them early.
 */
const NOTICE_LIFECYCLE = ['Auto', 'Closed', 'Archived'];

/** Statuses the public page can display, after derivation. */
const NOTICE_DISPLAY_STATUSES = ['New', 'Active', 'Closed', 'Archived'];

const createSchema = {
  noticeId: { type: 'string', required: true, max: 60, label: 'Notice ID' },
  title: { type: 'string', required: true, max: 300, label: 'Title' },
  category: { type: 'string', required: true, enum: NOTICE_CATEGORIES, label: 'Category' },
  publishDate: { type: 'date', required: true, label: 'Publish Date' },
  // Optional: a standing circular need not expire.
  deadlineDate: { type: 'date', label: 'Deadline / Event Date' },
  description: { type: 'string', max: 4000, default: '', label: 'Description' },
  eligibility: { type: 'string', max: 3000, default: '', label: 'Eligibility' },
  contactInfo: { type: 'string', max: 500, default: '', label: 'Contact Information' },
  lifecycle: { type: 'string', enum: NOTICE_LIFECYCLE, default: 'Auto', label: 'Status Override' },
  // [{ name, url, size }] — validated in the service, since the generic
  // validator only handles scalars.
  documents: { type: 'any', default: [], label: 'Documents' },
  isPublished: { type: 'boolean', default: true, label: 'Published' },
};

const updateSchema = createSchema;

module.exports = {
  NOTICE_CATEGORIES,
  NOTICE_LIFECYCLE,
  NOTICE_DISPLAY_STATUSES,
  createSchema,
  updateSchema,
};
