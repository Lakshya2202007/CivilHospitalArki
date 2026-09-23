/**
 * Single source of truth for Works & Developments options.
 *
 * These MUST stay in step with the filter values in the public UI
 * (frontend/src/pages/public/WorksDevelopments.jsx) — the frontend imports
 * them from the API via /api/projects/meta so the two cannot drift.
 */
const PROJECT_TYPES = [
  'Civil',
  'Medical',
  'IT',
  'Infrastructure',
  'Construction',
  'Maintenance',
  'Equipment / Facility Upgrade',
];

const PROJECT_STATUSES = ['PLANNED', 'IN PROGRESS', 'COMPLETED', 'ON HOLD'];

/** Create payload — every field in section 1.A of the mapping plan. */
const createSchema = {
  projectId: { type: 'string', required: true, max: 40, label: 'Project ID' },
  name: { type: 'string', required: true, max: 200, label: 'Project Name' },
  description: { type: 'string', max: 2000, default: '', label: 'Description' },
  type: { type: 'string', required: true, enum: PROJECT_TYPES, label: 'Project Type' },
  approvalDate: { type: 'date', required: true, label: 'Approval Date' },
  estCompletion: { type: 'date', required: true, label: 'Estimated Completion' },
  value: { type: 'string', required: true, max: 40, label: 'Value (Estimate)' },
  status: { type: 'string', required: true, enum: PROJECT_STATUSES, label: 'Status' },
  progress: { type: 'number', min: 0, max: 100, default: 0, label: 'Progress' },
  // "Download Plan" button appears on the public UI only when this is set.
  planDocumentUrl: { type: 'string', max: 500, default: '', label: 'Plan Document' },
  planDocumentName: { type: 'string', max: 200, default: '', label: 'Plan Document Name' },
  // Rich text shown in the "View Details" modal.
  detailedInformation: { type: 'string', max: 20000, default: '', label: 'Detailed Information' },
  isPublished: { type: 'boolean', default: true, label: 'Published' },
};

/** Update reuses the same rules; validatePartial relaxes the required checks. */
const updateSchema = createSchema;

module.exports = { PROJECT_TYPES, PROJECT_STATUSES, createSchema, updateSchema };
