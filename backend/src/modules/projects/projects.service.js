const ApiError = require('../../utils/ApiError');
const repo = require('./projects.repository');
const { PROJECT_TYPES, PROJECT_STATUSES } = require('./projects.schema');

/** Public table shows "10 Mar 2023"; Firestore holds ISO. Format on the way out. */
function formatDisplayDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Shape a stored project into what the public UI renders. */
function toPublic(project) {
  return {
    id: project.projectId,
    docId: project.id,
    name: project.name,
    description: project.description || '',
    type: project.type,
    approvalDate: formatDisplayDate(project.approvalDate),
    estCompletion: formatDisplayDate(project.estCompletion),
    value: project.value,
    status: project.status,
    progress: project.progress ?? 0,
    detailedInformation: project.detailedInformation || '',
    planDocumentUrl: project.planDocumentUrl || '',
    planDocumentName: project.planDocumentName || '',
    hasPlanDocument: Boolean(project.planDocumentUrl),
  };
}

function applyFilters(items, { search, type, status }) {
  let data = items;

  if (type && type !== 'All') {
    data = data.filter((p) => p.type.toLowerCase() === String(type).toLowerCase());
  }

  if (status && status !== 'All') {
    const wanted = String(status).toUpperCase();
    data = data.filter((p) => p.status === wanted);
  }

  if (search && String(search).trim()) {
    const q = String(search).trim().toLowerCase();
    data = data.filter((p) =>
      [p.id, p.name, p.description, p.type, p.status]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }

  return data;
}

/** Public listing: published rows only, filtered and paginated. */
async function listPublic(query = {}) {
  const all = (await repo.findAll()).filter((p) => p.isPublished !== false).map(toPublic);
  const filtered = applyFilters(all, query);

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 7));
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);

  return {
    data: filtered.slice((safePage - 1) * limit, safePage * limit),
    pagination: { page: safePage, limit, total: filtered.length, totalPages },
  };
}

/** Admin listing: every record, including unpublished, with raw ISO dates for the form. */
async function listAll(query = {}) {
  const all = await repo.findAll();
  const filtered = applyFilters(
    all.map((p) => ({ ...p, id: p.projectId, docId: p.id })),
    query
  );
  return filtered.map((p) => ({ ...p, id: p.docId, projectId: p.projectId }));
}

async function getById(id) {
  const project = await repo.findById(id);
  if (!project) throw ApiError.notFound('Project not found.');
  return project;
}

async function create(payload) {
  const clash = await repo.findByProjectId(payload.projectId);
  if (clash) throw ApiError.badRequest(`Project ID "${payload.projectId}" is already in use.`);
  return repo.create(payload);
}

async function update(id, changes) {
  await getById(id);
  if (changes.projectId) {
    const clash = await repo.findByProjectId(changes.projectId);
    if (clash && clash.id !== id) {
      throw ApiError.badRequest(`Project ID "${changes.projectId}" is already in use.`);
    }
  }
  return repo.update(id, changes);
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
  return { message: 'Project deleted.' };
}

/** Dropdown options, so the admin form can never offer a value the filters reject. */
function getMeta() {
  return { types: PROJECT_TYPES, statuses: PROJECT_STATUSES };
}

module.exports = { listPublic, listAll, getById, create, update, remove, getMeta, toPublic };
