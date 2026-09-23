const ApiError = require('../../utils/ApiError');
const repo = require('./banners.repository');

/** Shown if the admin has not added any slide yet, so the hero is never blank. */
const FALLBACK_BANNER = {
  id: 'default',
  title: 'Civil Hospital Arki',
  subtitle:
    'Providing Transparent, Timely and Centralized Access to Hospital Services and information for all Citizens.',
  imageUrl: '/hero-bg.jpg',
  buttonText: '',
  buttonLink: '',
};

const toPublic = (b) => ({
  id: b.id,
  title: b.title,
  subtitle: b.subtitle || '',
  imageUrl: b.imageUrl || '/hero-bg.jpg',
  buttonText: b.buttonText || '',
  buttonLink: b.buttonLink || '',
});

async function listPublic() {
  const all = await repo.findAll();
  const visible = all.filter((b) => b.isVisible !== false).map(toPublic);
  return visible.length ? visible : [FALLBACK_BANNER];
}

async function listAll() {
  return repo.findAll();
}

async function getById(id) {
  const banner = await repo.findById(id);
  if (!banner) throw ApiError.notFound('Banner not found.');
  return banner;
}

const create = (payload) => repo.create(payload);

async function update(id, changes) {
  await getById(id);
  return repo.update(id, changes);
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
  return { message: 'Banner deleted.' };
}

module.exports = { listPublic, listAll, getById, create, update, remove, FALLBACK_BANNER };
