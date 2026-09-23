const ApiError = require('../../utils/ApiError');
const repo = require('./notices.repository');

function formatDisplayDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const toPublic = (n) => ({
  id: n.id,
  title: n.title,
  date: formatDisplayDate(n.noticeDate),
  noticeDate: n.noticeDate,
  attachmentUrl: n.attachmentUrl || '',
  attachmentName: n.attachmentName || '',
  hasAttachment: Boolean(n.attachmentUrl),
});

/** Public marquee: visible notices only. */
async function listPublic() {
  const all = await repo.findAll();
  return all.filter((n) => n.isVisible !== false).map(toPublic);
}

async function listAll() {
  return repo.findAll();
}

async function getById(id) {
  const notice = await repo.findById(id);
  if (!notice) throw ApiError.notFound('Notice not found.');
  return notice;
}

const create = (payload) => repo.create(payload);

async function update(id, changes) {
  await getById(id);
  return repo.update(id, changes);
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
  return { message: 'Notice deleted.' };
}

/** Convenience for the visibility switch in the admin table. */
async function toggleVisibility(id) {
  const notice = await getById(id);
  return repo.update(id, { isVisible: !(notice.isVisible !== false) });
}

module.exports = { listPublic, listAll, getById, create, update, remove, toggleVisibility };
