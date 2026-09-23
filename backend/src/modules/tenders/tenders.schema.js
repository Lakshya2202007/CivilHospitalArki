/**
 * Single source of truth for Tenders & Quotations options.
 *
 * These MUST stay in step with the filter values in the public UI
 * (frontend/src/pages/public/TendersQuotations.jsx), which reads them from
 * /api/tenders/meta so the two cannot drift.
 */

const TENDER_DEPARTMENTS = [
  'Medical Equipment',
  'Pharmacy',
  'Information Technology',
  'Civil Works',
  'Electrical',
  'General Administration',
  'Radiology',
  'Laboratory',
  'Housekeeping & Sanitation',
];

const TENDER_TYPES = ['Tender', 'Quotation', 'Procurement Notice'];

/**
 * What the admin actually chooses. 'Open' means "let the dates decide" —
 * the service derives Active / Closing Soon / Closed from the closing date.
 * Awarded and Cancelled override that, because no date can imply them.
 */
const TENDER_LIFECYCLE = ['Open', 'Awarded', 'Cancelled'];

/** Statuses the public page can display, after derivation. */
const TENDER_DISPLAY_STATUSES = ['Active', 'Closing Soon', 'Closed', 'Awarded', 'Cancelled'];

/** Categories for the attached documents. */
const DOCUMENT_TYPES = ['notice', 'specs', 'terms', 'corrigendum'];

const createSchema = {
  tenderId: { type: 'string', required: true, max: 60, label: 'Tender ID' },
  title: { type: 'string', required: true, max: 250, label: 'Title' },
  description: { type: 'string', max: 4000, default: '', label: 'Description' },
  department: { type: 'string', required: true, enum: TENDER_DEPARTMENTS, label: 'Department' },
  type: { type: 'string', required: true, enum: TENDER_TYPES, label: 'Type' },
  issueDate: { type: 'date', required: true, label: 'Issue Date' },
  closingDate: { type: 'date', required: true, label: 'Closing Date' },
  estimatedValue: { type: 'string', required: true, max: 40, label: 'Estimated Value' },
  lifecycle: { type: 'string', enum: TENDER_LIFECYCLE, default: 'Open', label: 'Status' },
  eligibility: { type: 'string', max: 3000, default: '', label: 'Eligibility' },
  contactInfo: { type: 'string', max: 500, default: '', label: 'Contact Information' },
  // [{ name, type, url, size }] — validated in the service, since the generic
  // validator only handles scalars.
  documents: { type: 'any', default: [], label: 'Documents' },
  isPublished: { type: 'boolean', default: true, label: 'Published' },
};

const updateSchema = createSchema;

module.exports = {
  TENDER_DEPARTMENTS,
  TENDER_TYPES,
  TENDER_LIFECYCLE,
  TENDER_DISPLAY_STATUSES,
  DOCUMENT_TYPES,
  createSchema,
  updateSchema,
};
